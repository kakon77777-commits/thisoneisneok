# 010 — CPython `.pyc` 失效判定 3.14.5：八個位元組的證據，以及它們是關於哪一次事件的

> 原專案 [CPython `Lib/importlib/_bootstrap_external.py`](https://github.com/python/cpython/blob/main/Lib/importlib/_bootstrap_external.py)，PSF-2.0。本篇考察 3.14.5，1,562 行。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py            # 四次編輯 × 三種模式，以及重切與真直譯器的逐格比對
python src/main.py --strict   # 重切跟直譯器不一致就 exit 1
python src/island_test.py     # 25 項檢查，其中 12 項直接跑 CPython 本體
```

## 為什麼選它

[`mssp-d-003`](/html/mssp/discussions/mssp-d-003.html) 目前最弱的一環寫在串裡：**每一個實例都是我自己的程式碼。**

所以這次去別人的裡面找。三十年歷史、每一次 Python import 都會走的熱路徑，而 CPython 在 [PEP 552](https://peps.python.org/pep-0552/) 加了替代機制，理由看起來正是那串在講的事。

**四次編輯，每一次都改了原始碼。** 差別只在檔案的**中繼資料**動了沒有：

```text
  the edit                             metadata   bytes     timestamp    checked-hash   unchecked-hash
  two writes, whatever the clock did   unchanged  changed   STALE RAN    recompiled     STALE RAN
  mtime put back, same size            unchanged  changed   STALE RAN    recompiled     STALE RAN
  mtime put back, size changed         moved      changed   recompiled   recompiled     STALE RAN
  mtime forced +5s, same size          moved      changed   recompiled   recompiled     STALE RAN
```

第一列**完全沒有用 `os.utime`**。兩次寫入相隔幾毫秒，自然落在同一個 `int(st_mtime)` 秒裡，過期的位元碼就跑了。這不是刻意佈置的情境，是一次快速存檔的樣子。

## 原專案的結構地圖

| | |
|---|---|
| `_bootstrap_external.py` | **1,562 行** |
| `_validate_timestamp_pyc` | 26 行 |
| `_validate_hash_pyc` | **22 行** |
| 標頭 | 16 位元組 = magic(4) flags(4) field2(4) field3(4) |
| 每種模式存的證據 | **8 位元組，同樣兩個欄位** |
| 預設模式 | `TIMESTAMP` |

上面六個數字都由 `main.py` 對正在跑的直譯器**重新量一次**再跟 FMS 比對。一份沒有人回頭讀的量測檔，就是一份跟自己比對的宣告——那正是這一則在講的東西。

```text
    TIMESTAMP       flags=0  about the file's metadata
                    reads source mtime, low 32 bits, source size
    UNCHECKED_HASH  flags=1  about the file's bytes, as of whenever the cache was written
                    reads nothing at import time
    CHECKED_HASH    flags=3  about the file's bytes
                    reads an 8-byte hash of the source bytes
```

**三種模式存的證據一樣多。差別是它是關於哪一次事件的證據。** 答一個嚴格更難的問題的那個驗證器，比另一個**少四行**——成本不在比較，在於得有人去讀原始檔算出雜湊。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 標頭配置、flag 意義，以及 `main.py` 會重新量的六個數字 |
| SCL | 這個部署寫哪一種模式，以及重切是否必須與上游一致 |
| SMS | 標頭、flags→驗證器的解析、驗證，以及跑真直譯器的探針 |
| TMS | 一種驗證器一個檔——純資料進、布林出、不 import 任何東西 |
| DMS | 那張表、比對結果，以及看不到的部分 |

唯一的結構改動是把驗證器從 1,562 行的模組裡拉出來，變成三個十幾行的檔案。**這個宣稱值多少，由比對說了算**，所以比對每次執行都跑：

```text
    12 of 12 cells agree - the lifted validator decides what the import system decided
```

孤島測試第 3b 節**故意把重切弄壞**，要求比對抓到——一個從來沒被看著失敗過的比對是主張不是檢查（[改良點 6](/html/mssp/modules/development.html)）：

```text
  PASS  swapping timestamp's comparison for the hash one breaks cells - 2 of 4 timestamp cells disagree once the rule is wrong
```

第 4 節更強：這個重切寫出來的標頭跟 `py_compile` 寫的**逐位元組相同**，三種模式都是。同樣八個位元組的兩個獨立產生者。

## 什麼不適合拆

**`UNCHECKED_HASH` 那個「永遠不會拒絕」不能修。**

它四次編輯四次都讓過期的位元碼跑了，取一個值，不可能有別的結果。而**它是對的**：給建置系統已經保證 `.pyc` 一致的部署用，在那種環境裡每次 import 都去讀原始檔什麼都買不到。雜湊照樣寫進標頭，讓 import 系統之外的工具事後可以查。

讓它合法的不是它會拒絕，是**那個「我不檢查」寫在標頭自己的 flag bits 裡**，任何東西都讀得到。

這跟同日[範例 010](/html/mssp/010-evidence-about-which-event.html) 從另一個方向到達的結論是同一個形狀——無條件的豁免是允許的，代價是具名擁有者與到期日。**上游早了八年。**

**預設模式也不適合改。** 每次 import 都讀原始檔是真的成本，PEP 552 加了替代機制之後仍然把 timestamp 留成預設。這一則沒有秤過那個取捨。

## 這次沒有解決什麼

**它改寫了我自己的判準，而不是印證它。**

`mssp-d-003` 開串時我寫的是取值的個數。這裡取兩個值的是 `TIMESTAMP`：

| | 取幾個值 | 關於哪一次事件 | 是不是缺陷 |
|---|---|---|---|
| `TIMESTAMP` | **2** | 檔案的中繼資料 | **是** |
| `CHECKED_HASH` | 1（這四列都拒絕） | 檔案的位元組 | 否 |
| `UNCHECKED_HASH` | **1** | 快取寫入當時的位元組 | **否** |

**取一個值的那個是唯一沒問題的。** 所以要改的不是精度是軸：不是「讀得到幾種取值」，是「它讀到的值是關於哪一次事件的」。

**而我在寫這一則的時候犯了同一個缺陷。** flags 探針第一版把 `flags=0b100` 寫進標頭、import、回報 `exit 0`，我差點把它當成 FMS 裡「上游會擋下 import」那句話的佐證。那個探針的來源檔跟快取內容一致，**於是「用了快取」與「拒絕快取」印出同一個字串**。加上對照組之後：

```text
    flags=0 (timestamp, stale cache)       exit 0  ran AAA   cache used, stale code ran
    flags=0b100 (bits nothing defines)     exit 0  ran BBB   cache rejected, source recompiled
```

答案跟我宣告的不一樣：**不擋，丟掉快取重編。** 那句話在被量之前，已經在 FMS 裡當了半天的事實。現在那一欄寫的是量到的，而解釋為什麼的註解就放在探針自己裡面。

**量得到但這次沒量：** 一次真實的編輯在日常工作裡多常落在同一個 `mtime` 秒內；checked-hash 在大型 import 圖上的實際牆鐘成本。

**這一則量不到：** 上游的預設是不是錯的——它沒有秤過讀檔成本。以及野外的發生率——**重現一次失敗，跟這件事多常發生，是兩回事。**
