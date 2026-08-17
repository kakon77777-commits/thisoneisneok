# 017 — CPython `zlib`：半個串流跟一個完整串流，解出來是同一串位元組

> 原專案 [CPython `Modules/zlibmodule.c`](https://github.com/python/cpython/blob/main/Modules/zlibmodule.c)，PSF-2.0。版本由執行時量出來。
> 這一則不需要網路：把一個合法串流切一半就是了——連線中斷產生的正是這個。

```bash
python src/main.py            # 兩個 reader，同一份截斷串流
python src/main.py --strict   # 這個部署讀到沒到 eof 的串流就 exit 1
python src/island_test.py     # 37 項檢查，全部直接跑真的 zlib，數字由它自己印
```

## 為什麼選它

同日的[範例 017](/html/mssp/017-finished-is-not-complete.html) 主張**跑完了跟拿到全部了是兩件事**，而且第二件從單元外面看不到。

`zlib` 是這句話在標準庫裡最利的一個實例——因為它把**兩種答案放在同一個模組裡**，而且兩種都是對的。

## 原專案的結構地圖

同一份截斷輸入，兩個 reader：

```text
    stream        reader           bytes   eof     raised
    truncated     zlib.decompress  -       -       Error -5 while decompressing data: incomplete or truncated stream
    truncated     decompressobj    218     False
    complete      zlib.decompress  660     -
    complete      decompressobj    660     True
```

**一個拒絕，一個交回一段前綴然後什麼都不說。**

而**對照組**才是這一則能不能說話的關鍵——一個**完整**的串流，它的 payload 恰好就是上面那 218 bytes：

```text
    truncated stream -> 218 bytes  eof = False
    complete  stream -> 218 bytes  eof = True
    byte-identical   : True
    told apart by any returned value: False
    told apart by .eof              : True
```

**位元組完全相同。** 沒有任何回傳值分得開它們，唯一分得開的是 `.eof`。

沒有這個對照組，「截斷讀回來 218 bytes」不構成任何主張——它可能只是比較短而已。

## 第二個發現：判別器在物件上，資料在回傳值上

`.eof` 是 decompressor 的屬性，bytes 是回傳值。所以**一個「解壓縮然後回傳 bytes」的函式，在它的呼叫端看到東西之前就已經把判別器丟掉了**：

```python
def load(blob):
    return zlib.decompressobj().decompress(blob)   # eof 隨著這個物件一起消失
```

這正是[範例 016](/html/mssp/016-partial-and-complete.html) 說「**outcome 必須跟著紀錄走**」的那句話，在上游的樣子。那一則是自己造的例子，這一則是標準庫。

## 第三個發現：截斷切在紀錄中間

```text
    whole records the caller collects: 19
    and one trailing fragment:         b'record-01'
    the fragment is well formed enough to be mistaken for a record
```

`record-01` 以 `record-` 開頭、看起來像一筆、而且比一筆短。呼叫端寫 `data.split(b"\n")` 的時候，它就在那裡。

第四、`max_length` 的**刻意**部分讀取，跟**意外**截斷落在同一個狀態：兩邊 `eof` 都是 `False`。`eof` 說的是「還沒完」，不說「為什麼還沒完」。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 每個 reader 會不會拋、會不會回報完整性，以及 `units` 對照 |
| SCL | 這個部署用哪一個，以及「沒到 eof」在這裡是不是致命的 |
| SMS | 直接跑真 zlib 的探針，包含那個對照串流 |
| TMS | 一個 reader 一個檔——各自宣告**會拋什麼**與**回報什麼**，而且 import 任何東西都沒有 |
| DMS | 呼叫端拿到什麼、還能問什麼，以及答案住在哪裡 |

重切加的只有一件事：**reader 要宣告它回不回報完整性，而那份宣告用跑的驗。** 第 3b 節是鑽孔——一個宣稱回報完整性、實際只回傳 bytes 的 reader 必須被抓到。五個變異跑過，每一個都讓套件變紅，包含「對照組自己也是截斷的」。

## 什麼不適合拆

**`decompressobj` 不拋是對的。** 「還沒讀完」是它兩次呼叫之間的**正常狀態**——一個對每個尚未結束的串流都拋例外的串流解壓器沒有辦法用。第 6 節把這件事量出來：餵四分之一進去照樣不拋，之後餵完照樣結束。

**`zlib.decompress` 拋也是對的。** 它一次收完整份，「不完整」對它就是錯誤。

缺陷不在任何一邊的行為，在於**兩邊的結果沒有共同的形狀**：一邊是例外、一邊是 bytes 加一個留在物件上的旗標，而那個旗標**沒有跟著資料走**。呼叫端要正確，得知道自己走的是哪一條路——而那正是 MSSP 說契約應該講的事。

## 這次沒有解決什麼

**量得到但這次沒量：** 真實程式碼裡用 `decompressobj` 之後真的去讀 `.eof` 的比例；`gzip`／`tarfile`／`http.client` 這些上層包裝有沒有把這個判別器往上傳。

**這一則量不到：** 任何一位呼叫端當初以為短結果代表什麼。**它量的是介面讓什麼通過，不是誰誤解了什麼**——跟考古 015、016 同一句話。

**沒有做的：** `gzip.GzipFile` 與 `zlib.decompressobj` 的對照。gzip 帶著長度與 CRC 的 trailer，所以它**有能力**在截斷時抱怨，而那是不同的一則——需要新的探針，不是重讀既有輸出。
