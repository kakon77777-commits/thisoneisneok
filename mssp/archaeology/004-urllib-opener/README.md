# 004 — CPython `urllib.request` 3.14.5

**專案：** CPython `Lib/urllib/request.py`　**授權：** PSF-2.0　**檢視版本：** 3.14.5
**判定：** `registry-confirmed-binding-unchecked`

```bash
python src/main.py          # 綁四個 handler，其中兩個是上游會靜靜接受的失敗
python src/island-test.py   # 孤島測試 ＋ 當場量上游 ＋ 證明修復會失敗
```

## 為什麼選它

因為它跟[考古 002](/html/mssp/archaeology/002-http-server.html) 在同一個標準庫裡，做同一件事，用相反的機制。

`http.server` 用繼承：新增一個動詞就是繼承整個 handler 再命名一個 `do_X`，於是沒有子集可以載入。`urllib.request` 用**註冊**：`build_opener(*handlers)` 收一串 handler，核心不知道有什麼能處理什麼，直到有人告訴它。

而今天的[範例 004](/html/mssp/004-router.html) 剛好在講 Router 該長什麼樣。所以這一則是拿真實世界的 Router 來對照——**它對的地方比我寫的還乾淨，錯的地方也比我預期的更安靜。**

## 原專案的結構地圖

數字由 `src/island-test.py` 第 2 節當場跑真模組量出來：

| 量到的 | 值 |
|---|---|
| `urllib/request.py` | 2,163 行 |
| `OpenerDirector` 公開方法 | **6** |
| `BaseHandler` 公開方法 | **3**（`handler_order` / `add_parent` / `close`） |
| 隨附的 `*Handler` 類別 | 18 |
| `add_handler` | 46 行 |
| `_call_chain` | 10 行 |
| 綁定機制 | 掃描 handler 的屬性名稱找 `*_open` / `*_error` / `*_request` / `*_response` |
| `add_handler` 的回傳值 | **`None`，在每一種情況下** |

**核心只有 6 個方法。** 對照 `BaseHTTPRequestHandler` 的 28 個。`BaseHandler` 只有 3 個，繼承它幾乎什麼都拿不到——它比較接近一個協定，不是一個要繼承的基底。這是對的，而且是這一則要保留的部分。

**handler 是傳進去的。** `build_opener(*handlers)` 讓呼叫端決定有哪些存在，而這正是 `http.server` 結構上做不到的事。同一個標準庫、同一個年代、相反的答案。

## MSSP 重切

註冊表原封不動。改的是**綁定會說出它綁到了什麼**。

漏處當場重現得出來：

```text
     good          schemes=['data']  handlers=1  add_handler returned None
     typo          schemes=[]        handlers=0  add_handler returned None
     wrong-scheme  schemes=['htp']   handlers=1  add_handler returned None
```

三件事：

**一、`data_opne` — 一個字母對調——註冊 0 個。** handler 完全惰性。沒有例外、沒有警告，而 `add_handler` 回傳 `None`，**跟成功那次一模一樣**。呼叫端沒有任何辦法分辨。

**二、`htp_open` 綁到 `htp`。** 一個不存在的協定，欣然接受。因為綁定是名稱驅動的，而**沒有一組真實協定可以拿來檢查那個名字**。

**三、完全沒有可辨識方法的 handler**，一樣是 0 個、一樣沉默。

結構上的說法：**能力用命名宣告，而命名沒有東西在檢查。** 名字同時是宣告與授權，於是打錯的名字是一個成功註冊的、不同的宣告。

重切版對應：

- **SMS `chain.py`** — `bind()` 回傳一個 `Binding`，說出綁到什麼、忽略了什麼、拒絕了什麼。並且對「近似拼錯」給出建議：`data_opne` → *did you mean `data_open`?*
- **SCL `policy.json`** — 這個系統認得哪些協定，以及哪個 handler 可以服務哪個。上游沒有這個清單，所以 `htp` 無從被否定。
- **DMS `report.py`** — 列出**綁到 0 個的 handler**。刻意構造一個這樣的 handler 沒有任何理由，所以它每一次都是錯誤，值得被列出來。

```text
    handlers/data      BOUND NOTHING
                         near-miss method `data_opne` - did you mean `data_open`?
    handlers/data      BOUND NOTHING
                         refused htp (unknown scheme; this system serves ['data', 'file'])
```

## 什麼不適合拆

**註冊表本身不要動。** 六個方法的核心、三個方法的 `BaseHandler`、handler 由呼叫端傳入——這是二十多年的設計，而且它通得過孤島測試：本則的 `handlers/data` 在沒有任何其他 handler 存在的情況下綁定並服務。

**命名慣例也不要換掉。** 我一開始想的是「改成顯式宣告 `serves = ['data']`」，但那會失去真正的好處：`http_open`、`https_open`、`http_error_302` 這組名字讓一個 18 個 handler 的模組**用讀的就知道誰做什麼**。顯式宣告會把那個資訊搬到另一個欄位，而讀者要多跳一次。

所以重切版**保留命名，加上檢查**——這兩件事從來不衝突，而上游只是沒有做第二件。

**`_call_chain` 只有 10 行，不要碰。** 它是整個機制的核心，短到可以一眼讀完，而它短是因為註冊表已經把難的部分做完了。

**上游改不掉的理由也很實在。** 讓 `add_handler` 對綁到 0 個的 handler 拋例外，會弄壞每一個「先傳一個空 handler 佔位、之後再補方法」的既有用法——而那種用法一定存在，因為二十年來沒有東西阻止它。這又是第九篇的相容壓力：成功造成表面，表面壓縮改動自由度。

## 這次沒有解決什麼

- **近似拼錯的偵測是一個便宜的啟發式，而且我知道它漏。** 它只抓字母重排（`_opne`、`_oepn`），抓不到 `data_opn`、`data_openn`、或大小寫錯誤。我刻意沒有寫得更聰明——一個會猜的檢查會開始誤報，而誤報的檢查會被關掉。**它抓到真實發生的那一類，然後說出來，其餘留給 SCL。**

- **`BOUND NOTHING` 我當成一定是錯誤，那句話沒有被證明。** 我的理由是「刻意構造一個綁不到東西的 handler 沒有理由」，而那是一個關於意圖的宣稱，不是關於程式的。一個測試用的空 handler 就是反例，而重切版會對它抱怨。

- **上游的 18 個 handler 我一個都沒讀。** 這一則講的是綁定機制，不是被綁的東西。`HTTPRedirectHandler`、`HTTPBasicAuthHandler` 這些各自有自己的結構問題，而我完全沒看。**判定寫 `registry-confirmed-binding-unchecked`，範圍就只到綁定。**

- **重切版沒有 `*_error` / `*_request` / `*_response` 三種鏈。** 上游的 `add_handler` 有 46 行，很大一部分在處理四種後綴與 `handler_order` 排序。我只做了 `*_open` 一種，所以「保留了註冊表」這句話，保留的是它最簡單的那一面。
