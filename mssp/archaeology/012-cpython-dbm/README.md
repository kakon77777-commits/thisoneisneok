# 012 — CPython `dbm` 3.14.5：兩種都叫做「支援併發」的保證

> 原專案 [CPython `Lib/dbm/`](https://github.com/python/cpython/tree/main/Lib/dbm)，PSF-2.0。本篇考察 3.14.5。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py            # 兩種失敗並排，每個後端一列
python src/main.py --strict   # 宣告與行為不一致就 exit 1
python src/island_test.py     # 18 項檢查，全部直接跑 CPython 本體
```

## 為什麼選它

昨天量了 `shelve`，**卻沒有問它底下是什麼**。今天問了，第一個答案就跟我以為的不一樣：

```text
   shelve on this machine picks: dbm.sqlite3
   backends available here:      dbm.dumb, dbm.sqlite3
   unavailable, so untested:     dbm.gnu, dbm.ndbm
```

`dbm.sqlite3` 是 3.13 之後的預設後備，不是我原本假設的 `dbm.dumb`。同日的[範例 012](/html/mssp/012-two-writers.html) 把[範例 011](/html/mssp/011-store-boundary.html) 自己寫下的限制拿去弄壞——一個行程一個寫入者——所以這裡去問上游同一個問題。

## 原專案的結構地圖

用**同一份寫死的排程**（兩個 handle 輪流走 read／modify／write）量兩個後端：

```text
  backend        schedule        two +1 from 0   lost   40 distinct keys   missing
  dbm.dumb       interleaved     1               1      21 of 41           20
  dbm.dumb       one-at-a-time   2               -      n/a                -
  dbm.sqlite3    interleaved     1               1      41 of 41           -
  dbm.sqlite3    one-at-a-time   2               -      n/a                -
```

**兩個都掉更新。只有一個會壞索引。**

那是兩種不同的保證，而兩者都被說成「支援併發存取」。`dbm.sqlite3` 有真正的鎖，它守住了每一個鍵——然後兩次遞增仍然結束在 1。

> **遺失更新發生在兩個各自完全原子的操作「之間」。** 任何份量的鎖都不會處理它。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 保證的詞彙、兩種失敗，以及三則考古合起來的那個刻度 |
| SCL | 這個部署跑哪一個排程，以及宣告是否必須符合行為 |
| SMS | 保證／需求對照表、排程解析，與跑真後端的探針 |
| TMS | **一個排程一個檔**——各自宣告它能揭露哪些失敗，且不取用兄弟集合 |
| DMS | 兩種失敗並排、每個模組把缺口寫在哪裡，以及看不到的部分 |

**排程被做成單元，是這一則的結構主張。** 一個排程決定了哪些失敗看得見，所以它應該像其他單元一樣宣告自己能做什麼——而那份宣告用跑的驗：

```text
    ok  interleaved     declares ['lost-update', 'torn-index'], revealed ['lost-update']
    ok  one-at-a-time   declares [], revealed nothing
```

第 2b 節是鑽孔：一個實際上循序、卻宣告自己能揭露遺失更新的排程，必須被抓到。

重切多出來的那張表，`dbm.open()` 給不了：

```text
    read-modify-write    on dbm.dumb       unmet: serialised-transaction
    read-modify-write    on dbm.sqlite3    unmet: serialised-transaction
    write-distinct-keys  on dbm.dumb       unmet: index-integrity
    write-distinct-keys  on dbm.sqlite3    satisfied
```

呼叫端拿到的是一個 dict 介面，**沒有任何辦法問它保證什麼**。

## 什麼不適合拆

**`dbm.dumb` 沒有壞，不要「修」它。** 它是最後的後備，純 Python、沒有外部相依，而且它把自己的缺口寫下來了——寫在 docstring 的 TO DO 清單裡：

```text
- support concurrent access (currently, if two processes take turns making
  updates, they can mess up the index)
```

**而這一則第二個發現就在這裡：會說出自己缺口的，是缺口比較大的那一個。**

```text
    dbm.dumb        319 lines   docstring TO DO
    dbm.sqlite3     144 lines   nowhere
```

守住完整性的那個，關於併發**一個字都沒說**。

這補完了一個橫跨三天、同一個標準庫的刻度——**同樣一件事「寫在哪裡」的三個位置**：

| 考古 | 模式／缺口寫在哪 | 誰讀得到 |
|---|---|---|
| [010 `.pyc`](/html/mssp/archaeology/010-cpython-pyc-invalidation.html) | 標頭的 **flag bits** | 任何東西 |
| [011 `shelve`](/html/mssp/archaeology/011-cpython-shelve.html) | `open()` 的**呼叫端** | 只有開檔的人 |
| 012 `dbm.dumb` | docstring 裡的 **TO DO** | 讀原始碼的人 |
| 012 `dbm.sqlite3` | **沒有寫** | 沒有人 |

同一個組織、同一個標準庫、三個相鄰的模組。這不是在指責誰——是量到「宣告一個模式」這件事在真實程式碼裡的實際分布，而[改良點 11](/html/mssp/modules/development.html) 主張的正是那件事該被要求。

## 這次沒有解決什麼

**量得到但這次沒量：** 這些後端在真實排程器下的行為（這裡的排程是寫死的）；`dbm.sqlite3` 的鎖在吞吐上的代價。

**這一則量不到：** 野外的發生率——重現一次遺失更新，跟兩個寫入者實際多常相遇，是兩回事。

**以及這台機器沒有的後端。** `dbm.gnu` 與 `dbm.ndbm` 在這裡裝不起來，所以關於它們的任何陳述都會是猜的——它們被印成 `unavailable, so untested`，而不是被假設成安全。這一格是刻意的：**一個沒被量到的東西，在表格裡看起來跟一個量到沒問題的東西太像了。**
