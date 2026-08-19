# 019 — CPython `dict.get`：鍵不在，跟鍵在而且是 `None`，是同一個回傳值

> 原專案 [CPython `Objects/dictobject.c`](https://github.com/python/cpython/blob/main/Objects/dictobject.c)，PSF-2.0。版本由執行時量出來。
> 這一則是這 20 則裡上游最普通的一個——一行任何人都寫過的 `d.get(k)`。

```bash
python src/main.py            # 三個 reader，同一個鍵
python src/main.py --strict   # 這個部署分不出 unset 跟 null 就 exit 1
python src/island_test.py     # 36 項檢查，全部直接跑真的 dict，數字由它自己印
```

## 為什麼選它

同日的[範例 019](/html/mssp/019-applicability-is-part-of-the-answer.html) 主張**一個量測回傳的是值加上它的適用性**。

`d.get(k)` 是那句話的反面在標準庫裡最短的樣子：**它只回傳值。** 而 `d.get(k, SENTINEL)` 就是那個提案本身，早就在語言裡，只是不是預設。

## 原專案的結構地圖

```text
    mapping         reader                  value    present   raised
    {'a': None}     d.get(key)              None     -         -
    {}              d.get(key)              None     -         -
    {'a': None}     d.get(key, SENTINEL)    None     True      -
    {}              d.get(key, SENTINEL)    None     False     -
    {'a': None}     d[key]                  None     True      -
    {}              d[key]                  None     False     KeyError('a')
```

前兩列是重點：**同一個值、同一個型別、同一個物件**（`is` 為真）。

而這兩件事在設定檔語境裡是**相反的指令**：鍵不存在 → 落回內建預設；鍵被明確設成 `null` → 用「沒有」把預設蓋掉。`d.get(k)` 對兩者交回同一個答案。

**語言裡有三個判別器，而沒有一個是大家會寫的**：`key in d`、`d.get(key, SENTINEL)`、以及會拋的 `d[key]`。

注意第三個——**寬容的取值器跟嚴格的取值器住在同一個型別上**。那跟[考古 017](/html/mssp/archaeology/017-cpython-zlib.html) 的 `zlib` 完全同形：一次收完的 `decompress` 對截斷輸入拋例外，串流的 `decompressobj` 安靜地交回前綴。**同一個模組／型別裡兩個答案，兩個都是對的，而預設的那個比較安靜。**

## 第二個發現：慣用寫法折得更凶

```text
    case                        not d.get('a')   'a' in d
    missing                     True             False
    present None                True             True
    zero                        True             True
    empty string                True             True
    False                       True             True
    empty list                  True             True
    present truthy (control)    False            True
    6 of 7 take the same branch, and 5 of those 6 have the key
```

**六種情況走同一個分支，其中五種有那個鍵。** 所以 `if not d.get(key):` 這行在六次裡只有一次講對了「不存在」。

**對照組**（有鍵、值為真）是這段能不能說話的關鍵：沒有它，「它們都走同一個分支」是一句關於**測試**的話，不是關於**值**的話。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 每個 reader 分不分得開、拋不拋，以及 `units` 對照 |
| SCL | 這個部署用哪一個、「unset 被讀成 null」在這裡是不是致命的，以及**它伸不到哪裡** |
| SMS | 直接跑真 dict 的探針，包含那個真值對照 |
| TMS | 一個 reader 一個檔——各自宣告**分不分得開**，而且 import 任何東西都沒有 |
| DMS | `value` 跟 `present` **永遠一起印**——單看 `value` 就是這一則在講的那個缺陷 |

重切加的只有一件事：**reader 要宣告它分不分得開，而那份宣告用跑的驗。** 第 3b 節是鑽孔——一個宣稱分得開、實際呼叫普通 `get` 的 reader 必須被抓到。四個變異跑過，每一個都讓套件變紅，其中一個（SCL 改用寬容的 reader）也讓 `main --strict` 從 exit 0 變成 exit 1，所以那條路不是死的。

SCL 這裡的 `what_this_cannot_reach` 值得記：**判別在呼叫點被銷毀，不是在載入時。** 載入器可以規定自己怎麼讀，管不到拿到那個 mapping 之後自己寫 `d.get(k)` 的下游。

## 什麼不適合拆

**`d.get` 寬容是對的。** 「給我值，沒有就給我預設」是這個方法存在的理由，而且它做到了。

**`None` 也不能不是合法的值。** 它是，所以它**不可能同時當缺席標記**——這正是 sentinel 必須是呼叫端自己帶的 `object()` 的原因。而它連在簽名裡都沒有：`dict.get` 的 default 參數就是一個普通參數，語言沒有提供一個「不可能是使用者資料」的預設哨兵。

缺陷不在任何一邊，在於**最短的那條路是資訊最少的那條**，而三個判別器都要多打字。

## 這次沒有解決什麼

**量得到但這次沒量：** 真實程式碼裡 `d.get(k)` 的呼叫點有多少比例的 mapping 允許 `None` 當值；`dict.get` 與 `os.environ.get`、`getattr` 三者的預設哨兵處境是否相同。

**這一則量不到：** 任何一位呼叫端當初以為 `None` 代表什麼。**它量的是介面讓什麼通過，不是誰誤解了什麼**——跟考古 015、016、017、018 同一句話，第五次。

**沒有做的：** `collections.defaultdict` 與 `dict.setdefault`。兩者都會**在讀的時候寫**，所以它們是另一個形狀——判別器不只是被銷毀，是被讀取這個動作本身消滅——需要新的探針，不是重讀既有輸出。
