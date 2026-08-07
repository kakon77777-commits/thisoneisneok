# 007 — CPython `json` 3.14.5：身分測試早就在跑，而答案取決於你問哪一種相同

> 原專案 [CPython `Lib/json`](https://github.com/python/cpython/tree/main/Lib/json)，PSF-2.0。本篇考察 3.14.5。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py          # 兩個實作 vs 一份寫下來的等價契約
python src/island_test.py   # 24 項檢查，其中 9 項直接量 CPython 本體
```

## 為什麼選它

今天的[範例 007](/html/mssp/007-identity-test-run.html) 把 MSSP 的身分測試變成可執行的：把宣稱是 SMS 的模組換成 stub，跑，問答案還在不在。結論比我預期的小——**機械化能檢查的是結構與宣稱用途之間的一致性，不是成員資格**，因為換一個「答案是什麼」的寫法，名冊就變了。

那個結論需要一個不是我發明的案例來檢驗。`json` 是理想的：它有一個 C 加速器 `_json`，跟一份純 Python 後備，而**整個模組的結構就是為了「這東西可以不在」**：

```python
# json/scanner.py
try:
    from _json import make_scanner as c_make_scanner
except ImportError:
    c_make_scanner = None
make_scanner = c_make_scanner or py_make_scanner
```

上游二十年來一直在對 `_json` 跑身分測試——只是那個測試的形式是一個執行期後備，不是一份報告。

## 原專案的結構地圖

| 檔案 | 行數 |
|---|---|
| `json/__init__.py` | 365 |
| `json/decoder.py` | 364 |
| `json/encoder.py` | 461 |
| `json/scanner.py` | **73** |

加速器是 `_json`，一個內建 C 模組。三個檔案裡有 16 處引用 C 版本，每一處都是同一個形狀：`try: from _json import X except ImportError: X = None`，然後 `use = c_X or py_X`。

`scanner.py` 只有 73 行，而它是整個選擇發生的地方。

## MSSP 重切

先講量到什麼，因為那才是重點。

### 對 `_json` 跑身分測試

```text
  values are byte-identical with and without the accelerator  — 12 strings compared
  every input is accepted or rejected the same way            — 12 of 12 same error class
  and exactly one error MESSAGE differs                       — '"\x"'
        C : Invalid \escape: line 1 column 2 (char 1)
        py: Invalid \escape: 'x': line 1 column 3 (char 2)
```

**值完全相同。錯誤類別完全相同。訊息有一個不同**——純 Python 的版本指名了那個非法的跳脫字元，而且欄位差一。

所以：

> 「加速器不是結構性的」在「同一個值」這個判準下為真，在「同一則訊息」這個判準下為偽。

**同一份程式碼，兩個判準，兩個答案。** 這正是範例 007 從我自己發明的程式裡得到的結論，而這裡是一份每個 Python 安裝都帶著、比那個發現早二十年的標準庫。

### 關掉它比看起來難，而我第一次量錯了

第一次的關法是 `json.scanner.c_make_scanner = None`。**沒有用**：

```text
  clearing c_make_scanner alone does not switch the scanner - still _json
```

因為 `make_scanner = c_make_scanner or py_make_scanner` **在 import 時就跑完了**，名字已經綁定。事後改掉 `c_make_scanner` 不影響任何已經綁好的東西。

我的第一次比較因此是 **C 跟 C 自己比**，然後回報「兩個實作完全相同」。那是一個通過而完全沒有碰到它宣稱的東西的檢查——[BP-0005](https://bugology.evemiss.com)，抓到它的方法是去驗證驗證器：印出 `type(decoder.scan_once).__module__`，看到兩次都是 `_json`。

正確的關法要重綁 `make_scanner` 本身。之後 `_json -> builtins`，比較才是真的。

### 重切改了兩件事

**選擇是一個值，不是一個 import 時綁定的名字。** `SMS/select.py` 每次呼叫才選，而且**回傳選了哪一個**。上游做不到這件事不是疏忽：一行 `or` 在那個位置是正確的、便宜的、而且二十年沒出過問題。代價只在你想問「我剛才跑的是哪一個」或「這次請用另一個」的時候才出現。

**等價是一份寫下來的契約，不是一個形容詞。** `FMS/manifest.json`：

```json
"equivalence_contract": {
  "must_be_identical": ["encoded output for every corpus value"],
  "may_differ": ["error message text"],
  "must_not_differ": ["the class of error raised", "whether an input is accepted at all"]
}
```

`DMS/equivalence.py` 逐條回答，而不是給一個 yes/no：

```console
$ python src/main.py

  ok  encoded output identical for every value             7 identical, 0 differing
  ok  the class of error is the same                       2 same class, 0 differing
  ok  acceptance is the same                               0 input(s) one accepted and the other did not
  ok  error text identical  (contract says MAY differ)     2 message(s) differ
```

最後一列是重點：**訊息確實不同，而契約說可以**。把 `SCL/policy.json` 的 `error_text_must_match` 改成 `true`，同一次執行就會失敗。等價不是量出來的，是**契約加上量測**。

`main.py` 還有一條上游不需要、而我需要的檢查：**如果兩邊選到同一個實作，拒絕輸出等價結果**。那是我第一次量 CPython 時缺的那條。

## 什麼不適合拆

**`try/except ImportError` 那個模式不該被換成註冊表。** 它一行、沒有狀態、在直譯器啟動的最早期就要能用，而 `json` 是 `logging`、`http`、`urllib` 都會拉進來的東西。一個需要初始化的選擇機制在這個位置是負債。

**73 行的 `scanner.py` 不該再拆。** 它只做一件事——把一個 decoder 變成一個 scan 函式——而那件事就是選擇本身。

**`_json` 不該被拆進 `decoder.py`。** 它是 C，它的存在條件是「這個平台編得出來」，而那是一個**部署事實**，不是一個結構事實。上游把它放在一個可以不存在的位置是對的，本篇的重切只是把「它現在在不在」變成可以問的。

## 這次沒有解決什麼

依[改良點 8](/html/mssp/modules/development.html)，每一項要說出把它變成量測需要多少。

- **12 個輸入的語料庫是我挑的。** *（需要新寫東西：一個產生器，或一份真實的 JSON 樣本集。）* 找到一個訊息差異這件事，只說明差異存在；**差異有多少種，我沒有量**。JSON-test-suite 之類的語料庫跑一次就會有數字，而我沒跑。

- **我只量了 decoder 的錯誤路徑。** *（需要新寫東西：encoder 的錯誤路徑要另外構造——循環參照、非法 key、NaN 與 `allow_nan=False`。）* encoder 的值路徑量了（相同），錯誤路徑沒有。

- **這台機器一個直譯器版本。** *（原則上要更多樣本。）* 3.14.5 上一個訊息不同；3.11 或 PyPy 上是幾個，我不知道。這個數字是關於這個直譯器的。

- **「訊息可以不同」是我替 CPython 寫的契約，不是他們寫的。** *（不是量測問題，是治理問題。）* CPython 沒有在任何地方承諾兩個實作的錯誤訊息一致或不一致。我把它寫進契約的 `may_differ`，是因為**觀察到它不一致**——那是用現況定義規範，而那正是[改良點 6](/html/mssp/modules/development.html)警告的形狀的近親。差別在於我把它寫在契約裡讓它可以被反對，而不是讓它靜靜成立。

- **~~重切沒有處理「兩個實作都不在」~~——這一項寫下來的時候就該做掉，所以做了。** 把 `TMS/impl/` 兩個檔案都從磁碟移開再跑：`RuntimeError: no implementation is available at all`，exit 1。**它會壞，而且壞在它自己宣告的那一行**，不是在某個 import 的深處。這一項因此不是限制——按[改良點 8](/html/mssp/modules/development.html) 的第 1 類，一條指令能量的東西不屬於這一節。留在這裡是因為**它示範了那條規則怎麼用**：我把它寫成限制、看了一眼它的成本、然後就沒有理由不做。
