# 002 — CPython `http.server` 3.14.5

**專案：** CPython `Lib/http/server.py`　**授權：** PSF-2.0　**檢視版本：** 3.14.5
**判定：** `seam-confirmed-by-ecosystem`

```bash
python src/main.py          # 重切版對幾個原始請求跑一遍，全程沒有 socket
python src/island-test.py   # 單獨載入一個處理器，並量上游取得一個動詞的代價
```

## 為什麼選它

因為它是幾乎每個 Python 開發者都讀過、而且大多數人都繼承過的那個檔案。`python -m http.server` 是內建的，`SimpleHTTPRequestHandler` 是新手寫的第一個伺服器，而擴充它的方法在文件裡寫得很清楚：**繼承，然後定義 `do_GET`**。

那個「很清楚」正是這次要看的東西。它不是一個被忽略的角落，它是被推薦的做法。

上一則考古（[001 commander](/html/mssp/archaeology/001-commander.html)）看的是「決策」與「效果」焊在一起。這一則看的是更前面一步的問題：**當擴充點是繼承，就不存在可以單獨載入的子集**——連要不要拆的討論都還沒開始，就已經沒有東西可拆了。

## 原專案的結構地圖

以下數字由 `src/island-test.py` 第 4 節在執行時從真正的模組讀出，不是抄來的：

| 量到的 | 值 |
|---|---|
| `http/server.py` | 1,441 行 |
| `BaseHTTPRequestHandler` 方法數 | 28 |
| `SimpleHTTPRequestHandler` 方法數 | 11 |
| `SimpleHTTPRequestHandler` MRO 深度 | 5（`→ BaseHTTPRequestHandler → StreamRequestHandler → BaseRequestHandler → object`） |
| `handle_one_request` | 36 行 |
| `parse_request` | 116 行 |
| `log_message` | 25 行 |
| 分派機制 | `getattr(self, mname)` |

三個地方值得逐一看。

**`handle_one_request`，36 行，五件事。** 它從 `self.rfile` 讀、呼叫解析、用 `getattr` 找方法、往 `self.wfile` 寫、並呼叫 `self.log_*`。讀取、解析、分派、回應、記錄——同一個方法。要測其中任何一件，就要有前面全部。

**`parse_request`，116 行，會送回應。** 輸入不合法時它呼叫 `self.send_error(...)`。所以「解析一個請求」與「回答一個請求」是同一個操作，而兩者都需要一條連線。**解析是知識，送出是效果**——這條縫跟 001 是同一族，但表現方式不同：commander 是終止行程，這裡是解析器自己握著 socket。

**`log_message`，25 行，寫死 `sys.stderr`。** 不是寫到「伺服器被給定的某個串流」，是函式裡直接寫著 `sys.stderr`。要換地方，就得繼承請求處理器——**跟新增一個動詞是同一種變更**。「我想把 log 放別的地方」和「我想支援新的 HTTP 方法」在這個結構裡是同一件事。

**而最上層的那件事：`getattr(self, 'do_' + command)`。** 處理器的集合，就是實例上的屬性集合。這有兩個後果：

1. 沒有辦法把「一組不同的處理器」交給分派器——因為沒有地方可以交。
2. **一個類別只能有一個 `GET` 處理器**，因為動詞就是屬性名。健康檢查與檔案服務都要回答 `GET`，那它們不能各自是一個處理器；其中一個必須變成另一個方法裡的分支，或者靠繼承順序決定誰贏。

## MSSP 重切

`src/` 是同一件事的重切版，刻意做到**沒有任何 socket**。

**SMS `message.py`** — `parse(bytes) -> Request | Response`。輸入不合法時**回傳**那個 400，而不是送出它。拒絕成為一個值，於是一個沒有連線的呼叫者（例如測試）得到跟有連線的呼叫者一樣的答案。

**SMS `dispatch.py`** — 處理器是登錄表裡的值，分派器被告知有哪些存在。比對用的是方法**加上**目標，這是與上游的真正差別：`getattr(self, 'do_GET')` 只可能找到一個東西。

> 這裡我自己踩了一次。`dispatch` 的第一版只比對方法，於是健康檢查回答了每一個 `GET`，檔案處理器一次都沒跑到——包括那個專門用來測試它會拒絕離開根目錄的請求。**我用意外的方式重現了上游的限制**，而 `main.py` 那條「沒有 200」的斷言照樣通過，因為它從來沒被執行到。斷言改成必須看到 403，而不只是沒看到 200。

**SCL `policy.json` / `policy.py`** — 哪個處理器可以回答哪個方法、哪個可以讀檔案系統。`confine()` 對應上游的 `translate_path`：上游那個是**子類別可以覆寫的方法**，所以限制成立是因為子類別選擇不覆寫；這裡它是處理器必須呼叫、而且換不掉的函式。

**TMS `handlers/health.py`（20 行）與 `handlers/static_file.py`** — 各自是一個單元。健康檢查沒有持有任何連線的參照，`island-test.py` 用它一個就跑起來。

**DMS `access_log.py`** — sink 是參數。孤島測試傳 `list.append` 進去，不必攔截任何串流。

執行結果：

```console
$ python src/main.py
  -> GET /health HTTP/1.1        HTTP/1.1 200 OK
  -> GET /index.html HTTP/1.1    HTTP/1.1 200 OK
  -> GET /../secrets.txt HTTP/1.1  HTTP/1.1 403 Forbidden
  -> POST /health HTTP/1.1       HTTP/1.1 405 Method Not Allowed
  -> nonsense                    HTTP/1.1 400 Bad Request

  confinement demonstrated: the file handler refused a path outside its root
```

孤島測試第 1 節：`handlers/health` 在**沒有其他處理器、沒有 socket、沒有 server 物件、沒有 client address** 的情況下回答 200。上游做同一件事的最小形態，是那 1,441 行加上一個方法。

## 什麼不適合拆

**繼承在這裡不是疏忽，是 1999 年的正確答案。** `socketserver` 的框架是模板方法模式，而模板方法在當年是把「協定處理」與「應用邏輯」分開的標準工具。要換成登錄表，就要有辦法把處理器集合傳進去——那需要標準庫在 API 上做一次破壞性變更，去換一個大多數使用者感受不到的好處。**不划算，而且上游知道。**

**`BaseHTTPRequestHandler` 的 28 個方法裡，大部分該留在一起。** `send_response` / `send_header` / `end_headers` / `flush_headers` 是同一個狀態機的四個階段——它們共享「header 送出前後」這個不可見的順序約束。把它們拆成四個模組，只會讓那個約束從「同一個類別裡看得到」變成「四個檔案之間的口頭協定」。這正是拆分不等於解耦的樣子。

**`log_message` 寫死 `sys.stderr` 的代價，比看起來小。** 它是為了讓 `python -m http.server` 一行就能用而付的。標準庫的預設值要對「完全不設定」的使用者正確，而不是對「會注入 sink」的使用者正確。這是必要複雜度的一種：**便利本身就是需求。**

**生態系已經自己回答過這個問題了。** WSGI（PEP 333, 2003）與後來的 ASGI 就是把「請求」變成一個值、把應用變成一個可呼叫物件——正是這裡重切的方向。所以判定是 `seam-confirmed-by-ecosystem`：這條縫不需要我來論證它存在，Python 世界二十多年來所有正經的 web 伺服器都不繼承 `BaseHTTPRequestHandler`。`http.server` 的文件自己也寫著它不建議用於正式環境。

**結論不是「標準庫做錯了」。** 是：*一個為了零設定而生的模組，其擴充機制必然把整體綁給每一個擴充者*，而那個代價在它自己的用途裡是合理的。搬到別的用途才不合理——而那正是生態系另外長出 WSGI 的原因。

## 這次沒有解決什麼

- **重切版不是伺服器。** 它沒有 socket、沒有連線管理、沒有 keep-alive、沒有分塊傳輸、沒有併發。上游那 1,441 行有很大一部分在處理這些，而它們不會因為換一種結構就消失——只會換一個位置。這裡沒有付那個代價，所以也不能宣稱贏了。

- **`matches()` 讓我可以有兩個 GET 處理器，也讓順序變成語義。** `static_file.matches()` 回傳 `True`，意思是「其他人不要的都我來」，於是登錄表的排列順序決定行為。上游用屬性名，至少是明確的；我用順序，是另一種隱式約定。這是換掉，不是解掉。

- **沒有量效能。** 每個請求多一次登錄表線性掃描與一次 policy 查表。在這個規模上看不出來，在真實負載下我沒有數字，所以不說。

- **`parse` 只做到能講清楚那條縫的程度。** 上游的 `parse_request` 有 116 行是因為 HTTP 的邊界情況真的有那麼多——版本協商、`Expect: 100-continue`、header 折行、控制字元表。**重切版比較短，主要是因為它做得比較少**，不是因為它切得比較好。
