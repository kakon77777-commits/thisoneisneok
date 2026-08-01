# 001 — commander 2.20.3

**專案：** [commander.js](https://github.com/tj/commander.js) ｜ **授權：** MIT ｜ **檢視版本：** 2.20.3 ｜ **日期：** 2026-08-01

## 為什麼選它

commander 是 Node 生態裡最被廣泛依賴的 CLI 函式庫之一。2.20.3 是大量專案長期 pin 住的版本，而它的全部程式碼是**一個檔案、1,225 行、36 個原型方法**。

它符合考古最想要的組合：結構上有明顯可討論的地方，同時在真實世界裡活得非常好。這種專案通常代表那個結構在某個維度上是對的，而找出那個維度比證明它該被重寫有價值。

## 原專案的結構地圖

一個 `Command` 原型承擔全部工作：

| 關注點 | 觸及的方法數 |
|---|---|
| 解析（flags、參數、正規化） | 7 |
| 說明文字產生與排版 | 7 |
| 事件發送 | 7 |
| **直接寫入 console／stdout** | **8** |
| **直接呼叫 `process.exit()`** | **9** |
| 子行程 spawn | 1 |

`executeSubCommand` 一個方法同時觸及五類關注點（解析、事件、console、process、child_process），90 行。

這個結構是有理由的。commander 誕生時的定位是「寫一支 CLI 用的最短路徑」，而在那個定位下，`process.exit()` 就是正確答案——使用者要的就是參數錯了直接結束並印出訊息。方法鏈式 API（`.option().command().parse()`）也讓單一物件持有全部狀態成為最自然的寫法。

## 那條縫

看最小的一個方法：

```js
Command.prototype.unknownOption = function(flag) {
  if (this._allowUnknownOption) return;
  console.error("error: unknown option `%s'", flag);
  process.exit(1);
};
```

三行，其中兩行是**對宿主行程的效果**，而且呼叫端無法拒絕。

用 MSSP 的說法：這個方法同時持有兩件應該分開的東西。

- **知識**：「這個 flag 不認得」——這是解析的結論。
- **權限**：寫入 stderr、終止整個行程——這是宿主授予的能力。

`Know(a, k) = 1` 不蘊含 `Permit(a, o) = 1`。函式庫知道輸入有問題，但沒有任何東西授予它結束行程的權利。它只是把兩者寫在了同一個函式裡。

全檔案共 8 個 `process.exit()` 呼叫點，2.x 沒有任何覆寫機制（`exitOverride`、`configureOutput`、`_outputConfiguration` 在 2.20.3 全部不存在）。

**實際後果：**

- 無法在同一個行程內對錯誤路徑做單元測試——測試會被自己的受測對象殺掉。
- 無法把 commander 嵌進長時間執行的行程（REPL、伺服器、測試執行器），因為一個打錯的參數會終止整個宿主。
- 錯誤訊息無法翻譯，因為字串就寫在效果發生的那一行。

## 這條縫是真的：上游自己畫了同樣兩條

這一節是這次考古最重要的結果，因為它把結論從「我覺得該這樣切」變成可查證的事實。

翻 commander 的 CHANGELOG：

| 逃生口 | 引入版本 | 說明 |
|---|---|---|
| `exitOverride()` | **4.0.0** | 覆寫對 `process.exit` 的呼叫，讓程式可以繼續執行（#1040） |
| `configureOutput()` | **7.0.0** | 修改 stdout／stderr 的使用方式，自訂錯誤顯示（#1387） |

上游在 2.x 之後兩個大版本畫出了**退出邊界**，五個大版本畫出了**輸出邊界**。這正好是下面 MSSP 重切出來的兩條線，而且是在完全獨立的情況下、由實際使用壓力推出來的。

換句話說：這條縫不是事後諸葛。它真實到維護者最終自己畫了它。MSSP 在這裡的價值不是「發現了別人沒發現的東西」，而是**提供一組判準，讓這條縫在第一次寫的時候就看得見**。

## MSSP 重切

`src/` 是這條縫的可執行重切。範圍只有「選項與參數解析 + 錯誤回報」，子命令、說明產生、可執行子命令都不在裡面。

**SMS — `parse.js`**
解析回傳一個值：`{kind:"ok", options, args}` 或 `{kind:"error", code, detail}`。不寫入、不退出、不碰任何宿主全域。移除它系統就不再是解析器，所以它是核心。

**SCL — `host-policy.js`**
這一層在原專案中不存在。它把「這個解析器可以對宿主做什麼」變成一個值：

- `cliPolicy` — 寫 stderr 然後退出（commander 2.x 寫死的行為）
- `collectingPolicy` — 收集訊息，永不退出（測試與嵌入用）
- `silentPolicy` — 什麼都不做，呼叫端自己渲染

**TMS — `messages/en.js`、`messages/zh.js`**
錯誤訊息的兩種渲染。兩者都只依賴 SMS 的 `ERROR` 常數，互不引用——這也是為什麼翻譯在重切後才成為可能。

**DMS — `trace.js`**
解析過程中發生了什麼，包括被政策擋下的動作。原專案沒有對應層，因為一次失敗的解析會結束行程，什麼都不會留下。

## 執行結果

```bash
node src/main.js
```

同樣三個輸入，跑在三種宿主政策下：

```
--- policy: cli / messages: en ---
  unknown option           error unknown_option
    stderr: error: unknown option `--porrt'
    process.exit(1) <- commander 2.20.3 stops here

--- policy: collecting / messages: zh ---
  unknown option           error unknown_option
    collected: 無法辨識的選項 `--porrt'

--- policy: silent / messages: en ---
  unknown option           error unknown_option
    Policy "silent" declined to write.
```

第一種是原本的行為。**後兩種在 commander 2.20.3 裡無法表達。**

## 孤島測試

```bash
node src/island-test.js
```

八項全過。其中一項是刻意設計的：它把 `process.exit` 換成一個記錄用的假函式，然後跑兩次會失敗的解析，斷言它從來沒被呼叫。

```
  [OK]   parse touches no host global
```

如果解析器像原專案那樣退出，這個測試檔會在那一行結束，後面的檢查根本不會印出來——而那正是原專案難以單元測試的原因本身。

## 什麼不適合拆

這是考古最該保留的部分。

**方法鏈式 API 不該拆。** `.option('-p, --port <n>').command('build').parse(argv)` 這種寫法要求單一物件持有累積狀態。這是使用者體驗的核心，硬要拆成無狀態函式組合會讓 API 變差而不是變好。commander 把狀態集中在 `Command` 上是對的。

**flag 字串的解析格式不該抽象化。** `'-p, --port <n>'` 這種 DSL 看起來像是可以做成可插拔的格式層，但它其實是這個函式庫的身份。抽象掉之後你得到的是一個更通用、也更沒人想用的東西。

**說明文字產生可以拆，但收益有限。** 七個方法涉及排版（`padWidth`、`largestOptionLength`、`optionHelp`…），它們確實可以成為一個 TMS。但它們彼此高度內聚、對外只有一個入口，拆出去換到的主要是「可替換」，而實際上很少有人要替換它。**這是一個「可以拆但不划算」的例子**，正是「度」在真實專案裡的樣子。

## 這次沒有解決什麼

- **只重切了一條縫。** 子命令樹、`executeSubCommand` 的五重關注點、變長參數處理都沒碰。那些需要各自的判斷。
- **重切版不是 commander 的替代品。** 它示範的是邊界，不是功能。
- **沒有量測。** 「更好測試」在這裡是靠孤島測試示範的，不是靠一組對照數據證明的。要把它變成數字，需要對兩種版本各寫一組等價測試並比較所需的行程數——這是下一步。
- **2.20.3 是舊版本。** 這正是重點：對照的是這條縫存在的時期，而它後來確實被上游修補了。用最新版做同樣的考古會得到「這裡沒有縫」，那不是發現，是確認。
