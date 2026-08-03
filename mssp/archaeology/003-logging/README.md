# 003 — CPython `logging` 3.14.5

**專案：** CPython `Lib/logging/__init__.py`　**授權：** PSF-2.0　**檢視版本：** 3.14.5
**判定：** `boundary-confirmed-one-leak`

```bash
node src/main.js          # 重切版：每一次設定都說出它做了什麼
node src/island-test.js   # 孤島測試 ＋ 當場量上游的失敗 ＋ 證明檢查會失敗
```

## 為什麼選它

因為前兩則考古都在找一條**缺少**的縫（[001 commander](/html/mssp/archaeology/001-commander.html) 的決策與效果、[002 http.server](/html/mssp/archaeology/002-http-server.html) 的繼承擋住子集），而一個只會找缺陷的方法，講不出它認為什麼是對的。

`logging` 是反例：**它的四個軸切得很對**，而且是二十多年前切的。這一則大部分在說它為什麼對。漏處只有一個，但那一個剛好是今天範例在講的同一件事——一次什麼都沒做的呼叫，跟一次成功的呼叫，長得一模一樣。

## 原專案的結構地圖

數字由 `src/island-test.js` 第 3 節在執行時實際跑 Python 量出來，不是抄的：

| 量到的 | 值 |
|---|---|
| `logging/__init__.py` | 2,326 行 |
| `Logger` 公開方法 | 23 |
| `Handler` 公開方法 | 14 |
| `Formatter` 公開方法 | 9 |
| `Filter` 公開方法 | **1** |
| `basicConfig` | 119 行 |

**四個軸是真的獨立的**，而且可以逐條檢查：

- `Handler` 持有一個 `Formatter`；`Formatter` 完全不認識 `Handler`。單向。
- `Filter` 是**一個方法的協定**。它不是一個要繼承的基底類別，是一個形狀。
- `Logger` 與 `Handler` 都繼承 `Filterer`——過濾是兩者共有的關切，被提上去成為共用基底，而不是各寫一份。
- `propagate` 在 `Logger` 上，不在 `Handler` 上。**路由是 logger 的事，不是目的地的事。**

中間那個讓四軸成立的東西是 `LogRecord`：**事件是一個值**。發生了什麼、要送到哪、怎麼讀、要不要送——四件事各自看著同一個值，誰都不必知道其他三個做了什麼決定。

這就是為什麼 `StreamHandler` 收一個 stream 當參數。跟 [002](/html/mssp/archaeology/002-http-server.html) 裡那個把 `sys.stderr` 寫死在函式裡的 `log_message` 對照著看——同一個標準庫，同一個年代，一個把目的地當參數，一個把目的地寫進程式碼。

## MSSP 重切

**四個軸原封不動。** 重切版只改一件事：**設定會說出它做了什麼。**

漏處是這個，而且可以當場重現：

```console
$ python -c "import logging; logging.info('x'); print(len(logging.root.handlers))"
1
```

`logging.info()` 在 root 沒有 handler 時**會替你呼叫 `basicConfig()`**。所以第一個記錄一行的模組就決定了全域設定。之後：

```text
root handlers 0 -> 1 after one logging.info()
basicConfig(format=...) returned None, formatter changed: false
```

你的 `basicConfig(format=...)` **完全不做事**。沒有例外、沒有警告、沒有回傳值，你要的格式被安靜地丟掉。

結構上的原因不是那個 `if len(root.handlers) == 0` 的守衛。是**便利層一次跨過全部四個軸**——它在你只想記一行的時候，順手決定了門檻、sink、格式與目的地，而且是在一個全域上。

重切版對應的三處：

- **SCL** — 設定共用 sink 是一個**權限**，記錄不是。`lib/worker` 可以記錄，不能設定。上游任何 import 了 logging 的模組都可以設定，所以先記錄的先贏。
- **DMS `registry.js`** — `configure()` 回傳 `{applied, why, installedBy}`。第二次呼叫回 `applied:false` 並說出是誰先設的，而不是靜靜返回。想覆蓋要明講 `replace()`，那也會回報。
- **SMS `pipeline.js`** — 一次 emit 回傳「有沒有送到、沒送到是為什麼」。上游一次 log 呼叫回 `None`，於是「送到了」「被過濾掉」「低於門檻」「根本沒有 handler」在呼叫端全部是同一個觀察。

```console
  4. a second configuration attempt — the upstream silent no-op
     applied=false  why="already configured by app/main; pass replace: true to override"

  6. status: the question upstream cannot be asked
     {"configured":true,"reachable":true,"sinks":["sinks/collect"],"installedBy":"app/main"}
```

## 什麼不適合拆

**那四個軸不要動。** 這是本則最重要的結論。它們是一個經過二十多年、被幾乎所有 Python 程式用過的邊界，而且每一條都通得過身分測試：拿掉 Handler，事件無處可去；拿掉 Formatter，事件沒有形狀；拿掉 Filter，只是少一個可選能力——**所以 Filter 是 TMS，另外兩個不是**，而 `logging` 的結構恰好就是這樣：`Filter` 是一個方法的協定，可有可無。

**`Filterer` 這個共用基底也不要拆。** 它只有三個方法，而它存在的理由是 Logger 與 Handler 真的共用同一件事。把它拆成兩份重複實作，會讓「過濾語義一致」從「同一個類別看得到」變成兩個檔案之間的口頭約定。

**便利層本身不是錯誤。** `logging.info("x")` 一行可用，是 Python 使用者三十年來的入門經驗，而那個便利有真實價值。上游的取捨是清楚的：**讓完全不設定的人也能拿到輸出**。用 Neo 的說法，這是一個補償——它補的是「正確設定 logging 需要理解四個軸」這個缺口，而它確實補上了。

問題不在補償存在，在於**補償的副作用是不可見的**。如果 `logging.info()` 在隱式設定時印一行 `logging: auto-configured root handler`，同一個便利、同一行程式碼、同一個入門經驗，而那個著名的困惑就不存在了。

**改不了的原因也很實在。** 現在改變 `basicConfig` 的沉默行為，會讓每一個依賴「重複呼叫是安全的無操作」的程式庫開始噴東西。這是 Neo 第九篇講的：成功造成相容壓力，相容壓力壓縮演化自由度。上游知道，而且文件裡確實寫了 `basicConfig` 的行為——**寫在文件裡，不在回傳值裡**，而人讀的是回傳值。

## 這次沒有解決什麼

- **重切版不是 logging。** 沒有階層、沒有 propagate、沒有 thread safety、沒有 `%`-style 格式、四個等級。上游 2,326 行有很大一部分在處理這些，它們不會因為換結構就消失。這裡沒付那個代價，所以不能宣稱贏了。

- **「回報而不是沉默」也有代價，而我沒量。** 每次設定都回一個物件，代表呼叫端要嘛檢查它、要嘛忽略它。**被忽略的回傳值跟 `None` 一樣沉默**——差別只是現在有東西可以檢查。我沒有做的是讓忽略變得困難（例如未檢查就丟例外），因為那會讓便利層無法存在，而上面剛說過便利層有價值。這個取捨我留著沒解。

- **`Filter` 是 TMS 這個判斷，我只驗了身分測試那一半。** 我沒有驗孤島測試：一個真正的 `Filter` 實作能不能在只載入最小核心、其他一切缺席的情況下被練起來。在重切版裡可以，因為 filter 是傳進去的；在上游我沒試，因為那要先建出 Logger 與 Handler。**沒試就是沒試。**

- **最後一項是這一則自己的限制。** 判定寫 `boundary-confirmed-one-leak`，而「只有一個漏處」是我在 2,326 行裡找到的一個，不是我證明只有一個。前兩則考古我找的是我預期會有的東西；這一則我一開始就預期會確認邊界，那個預期本身會讓人少看幾個地方。
