# 009 — CPython `warnings` 3.14.5：我量的那個通道，是被我的儀器改變過的

> 原專案 [CPython `Lib/warnings.py`](https://github.com/python/cpython/blob/main/Lib/warnings.py)，PSF-2.0。本篇考察 3.14.5。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py          # 同一份程式碼，兩個觀察器，不同的數字
python src/island_test.py   # 25 項檢查，其中 11 項直接量 CPython 本體
```

## 為什麼選它

[考古 008](/html/mssp/archaeology/008-cpython-logging-warn.html) 昨天透過 `warnings` 通道量 `logging` 的棄用別名，回報：

> `warnings` 不同，舊名字多發一個 `DeprecationWarning`。

那句話成立，**但只成立一次**。

```text
  PASS  five calls from one site emit ONE warning - 1 of 5 — the channel remembers
  PASS  the same five calls, each wrapped, emit FIVE - 5 of 5 — catch_warnings mutates the filters
  PASS  so the instrument changed the channel it was measuring - 1 vs 5 from identical code
```

`warnings` 有記憶：`__warningregistry__`，鍵是 `(text, category, lineno)`。同一個呼叫點的同一則警告發過一次之後就不再發。**而我的觀察器每次都看得到，是因為 `catch_warnings` 為了隔離自己而變動 filter 清單**，那會讓 `_filters_version` 遞增，於是每一份版本號不匹配的 registry 都被丟棄。

隔離是它的目的，重設是它的副作用，而那個副作用**恰好回復了我正在觀察的那個行為**。

## 原專案的結構地圖

| | |
|---|---|
| `warnings.py`（你 import 的那個） | **99 行** |
| `_py_warnings.py`（純 Python 實作） | **869 行** |
| `_warnings` | C 內建 |
| 門面轉出的名字 | 47 個（9 個公開） |
| `warnings.warn.__module__` | **`_warnings`** |
| `warnings.filters is _warnings.filters` | **True** |

**你讀的那個檔案不是會跑的那個。** 99 行裡幾乎全是 `from _py_warnings import (...)`，而實際執行 `warn()` 的是 C。這是[考古 007](/html/mssp/archaeology/007-cpython-json.html) 那個 `json`/`_json` 形狀再一次，多了一層：中間還有一個純 Python 實作。

最後一列最重要：**`warnings.filters` 跟 `_warnings.filters` 是同一個物件**。觀察這個通道的方式，就是變動這個通道本身。觀察與被觀察在這裡不是兩個東西。

記憶的失效機制在 `_py_warnings.py` 裡三行就看得完：

```python
_filters_version = 1
_wm._filters_version += 1                              # _filters_mutated()
if registry.get('version', 0) != _wm._filters_version: # 版本不合就整份丟掉
```

## MSSP 重切

`src/` 把兩件事變成結構的一部分。

**通道的記憶是一個欄位，不是一個模組全域。** `SMS/channel.py` 的 `Channel` 帶 `delivered`、`attempted` 與 `_seen`，而 `clear_memory(actor, may_clear)` 是一個**有行為者的操作**，會被 SCL 拒絕。上游的等價物是一個沒有人會去看的 `__warningregistry__`，以及一個不知道自己會清掉它的 context manager。

**每個觀察器必須宣告自己會不會擾動通道。** `FMS` 記著，`TMS` 的模組上有 `PERTURBS`，而孤島測試第 1 節要求兩者一致——一個宣告自己被動而實際會重設的觀察器會被擋下。

```console
$ python src/main.py

  ok  passive    delivered 1   perturbs the channel: False
        cost   a notice already delivered is invisible to it
  !!  resetting  delivered 5   perturbs the channel: True
        cost   it reports a frequency no caller experiences

  attempts made by the code : 10
  notices actually delivered: 6
  suppressed by the memory  : 4
```

**同一份程式碼，1 對 5。** 兩個數字都是對的，它們回答的是不同的問題——「程式試了幾次」與「有沒有人聽到」——而一份不指名觀察器的報告，會讓讀者把其中一個當成另一個。

## 什麼不適合拆

**once-per-site 不該被改掉。** 一個每次呼叫都吼的棄用通知會在第一天被關掉，而關掉之後它一次都不會再響。**記憶正是這個通道有用的原因**，本篇的發現是關於量它的方式，不是關於它。

**99 行的門面不該被合併掉。** 它讓 `import warnings` 在 C 實作存在時拿到 C 的、不存在時拿到 Python 的，而呼叫端一個字都不用改。那跟考古 007 的結論一致：**上游提供的隔離路徑是對的**，代價只在你想問「我剛才跑的是哪一個」時才出現。

**`catch_warnings` 不該為了不擾動而放棄隔離。** 它必須換掉 filter 清單，否則它就不是隔離。**問題不在它做了什麼，在於它沒有說**——一個回報「我會重設這個通道的記憶」的 context manager，會讓昨天那個量測在第一次跑的時候就露餡。

## 這次沒有解決什麼

依[改良點 8](/html/mssp/modules/development.html)，每一項要說出把它變成量測需要多少。

- **我已經回頭改了考古 008 的觀察器盲點清單，但沒有重做它的量測。** *（需要新寫東西：一個被動觀察器，而被動觀察 `logging.warn` 需要一個乾淨的子行程，因為記憶是行程級的。）* 那份 `permit` 現在的措辭「one DeprecationWarning naming the replacement」在被動觀察下應該是「第一次呼叫時一則，之後零則」。**契約沒有錯，它只是對「是什麼讓這件事看得見」保持沉默。**

- **我沒有量這件事影響到多少既有的量測。** *（需要新寫東西：掃過九則考古與九個範例，找出所有用 `catch_warnings`、`caplog`、`assertWarns` 之類會重設狀態的觀察。）* 這是一整類的問題而不是一個實例，而我只確認了一個。

- **重切的通道沒有 filter 語言。** *（需要新寫程式。）* 上游的 registry 之所以複雜，是因為 filter 可以按模組、按行號、按類別匹配，而我的 `_seen` 是一個集合。所以我示範了「記憶可以是顯式的」，沒有示範在真實的過濾規則下它還一樣簡單。

- **「觀察器擾動」這件事我只做了一個布林。** *（需要一條判準。）* 真實情況是程度問題——一個讀取快取的觀察器擾動了時序但沒擾動結果。**一個布林在這裡可能跟一個計數在別處一樣粗**，而那正是[範例 009](/html/mssp/009-witness-continuity.html) 今天從 Pragma 那裡學到的教訓，我在同一天又犯了一次比較輕的版本。
