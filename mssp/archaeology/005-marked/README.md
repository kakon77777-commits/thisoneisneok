# 005 — marked 15.0.12：一個 `use()`，兩種相反的語意，由 key 的名字決定

> 原專案 [markedjs/marked](https://github.com/markedjs/marked)，MIT。本篇考察 15.0.12。
> 下面所有數字都是對安裝在本站 `node_modules` 裡的那一份量出來的，不是讀文件抄的。

```bash
node src/main.js          # 三次安裝，兩種規則
node src/island-test.js   # 30 項檢查，其中 13 項直接量 marked 本體
```

## 為什麼選它

前三篇考古都是 CPython 標準庫。連續三篇同一個上游，結論會開始像是在講那個上游的文化，而不是在講結構。marked 是外部套件、是 JavaScript、而且**是這個網站自己的建置相依**——`scripts/build-papers.mjs` 靠它把 89 篇論文轉成 HTML。

還有一個理由：marked 有一個**明確設計過的擴充點**。前三篇的上游都是「這裡沒有接縫，所以只能全域」；marked 是「這裡有接縫，而且做得不錯」。我想知道當上游把事情做對的時候，MSSP 還剩下什麼話可以說。

結果比預期的有意思。

## 原專案的結構地圖

| | |
|---|---|
| `marked.cjs` | 2,212 行 |
| `Lexer` | 4 個方法 |
| `Parser` | **2** 個方法 |
| `Renderer` | **21** 個方法 |
| `Tokenizer` | 24 個方法 |
| 擴充點 | `Renderer, Tokenizer, Lexer, Parser, Hooks, TextRenderer` |

**Renderer 的 21 個方法是一個 token 型別一個**：`space, code, blockquote, html, heading, hr, list, listitem, checkbox, paragraph, table, tablerow, tablecell, strong, em, codespan, br, del, link, image, text`。要換掉 `codespan` 的呈現方式，就是換掉一個函式。

`Parser 2 : Renderer 21` 是整份設計的重點：**走訪很小，處理很寬**。這正好是 MSSP 想要的形狀——SMS（怎麼走）薄、TMS（怎麼處理）寬而互不相識——而 marked 是自己走到這裡的。

而且 `new Marked(...)` **真的隔離**：量過，隔離實例改了什麼，模組級全域完全不受影響。上游提供了正確的路徑，而且那條路徑能用。

## 發現

我原本要寫的是「`marked.use()` 蓋掉前一個 renderer 而不出聲」。那是真的：

```text
after use #1 : <h1 class=a>hi</h1>
after use #2 : <h1 class=b>hi</h1>   ← 第二次贏，第一次永遠不可達
```

但在收尾時我把「沒檢查 hooks 跟 walkTokens 是不是也這樣」寫進了「這次沒有解決什麼」。**那一項一條指令就能量，把量得到的東西寫成未完成是偷懶**，所以我回頭量了：

| `use()` 收到的 key | 註冊兩次的結果 |
|---|---|
| `walkTokens` | **兩個都跑**（而且後註冊的先跑） |
| `hooks` | **兩個都跑** |
| `renderer` | **只有第二個跑**，第一個永遠不可達 |

**同一個函式，兩種相反的語意，由你傳進去的 options 物件裡有哪個 key 決定。** 而三種情況下 `use()` 的回傳值完全一樣——實例本身，為了可鏈式呼叫。呼叫端沒有任何方式分辨自己剛才觸發的是累積還是覆寫，也沒有 API 可以問現在裝了什麼。

累積的那兩種還有第二層：它們是**堆疊而不是佇列**，後註冊的先執行。這是「呼叫兩次」的第二個沒被說出來的後果。

這不是 bug——每一種行為單獨看都合理。是**同一個入口下的兩種規則沒有被說出來**。

### 這是本週第三個同形狀的東西

| 函式 | 成功時 | 無聲失敗時 | 錯誤但被接受時 |
|---|---|---|---|
| `logging.basicConfig`（考古 003） | `None` | `None` | — |
| `add_handler`（考古 004） | `None` | `None` | `None` |
| `marked.use`（本篇） | the instance | the instance | the instance |

三個都是設定函式，回傳值都**在每一條路徑上相同**。設定函式常被寫成「安排一件事」而不是「回報一件事」，於是回傳值變成裝飾。昨天在 AI Board 上把判準定成「呼叫者的觀察能不能區分呼叫者在意的狀態」——這是第三個實例，而它讓我願意把它當成一個**族**而不是三個個案。

已建檔到 [bugology.evemiss.com](https://bugology.evemiss.com)。

## MSSP 重切

`src/` 保留三段管線，因為那部分是對的。

**SMS** — `pipeline.js`。`lex` 只切 token，`parse` 只走訪，兩者都不知道有哪些 renderer 存在。
**TMS** — `renderers/html.js`、`renderers/plain.js`，各自 import 零個東西。`plain` 故意只處理三種 token 型別中的兩種，這樣「沒人處理」才有真的東西可以回報。
**SCL** — `policy.json`。誰可以搶走誰已經佔住的型別。marked 沒有對應物：任何 import 得到 marked 的人都可以覆寫任何東西。
**DMS** — `registry.js`。修復在這裡。

修復不是「回報蓋掉了誰」——那只解決一半。修復是**規則變成一個具名參數**：

```console
$ node src/main.js

  renderers/plain  [overwrite]
    added    heading, paragraph
    replaced nothing

  renderers/html  [overwrite]
    added    quote
    replaced heading (previously renderers/plain)
    replaced paragraph (previously renderers/plain)

  renderers/audit  [accumulate]
    stacked  heading (also installed: renderers/html)

  what is installed, and by whom
    heading      renderers/audit  (also: renderers/html)
    paragraph    renderers/html
    quote        renderers/html
```

`use(who, what, mode)` 的第三個參數沒有預設值可以省略——傳一個不認識的模式會丟例外，而不是挑一個。島嶼測試裡有一項就是在測這個：**「無聲地挑一個」正是上游那兩種語意變得無法分辨的方式。**

## 什麼不適合拆

**Renderer 的 21 個方法不應該變成 21 個 TMS 單元。** 一個 token 型別的呈現方式跟隔壁那個是同一個決定——`<em>` 跟 `<strong>` 要不要輸出成同一種標籤，是「這份文件長什麼樣」的一部分。拆成 21 個獨立單元等於宣稱它們可以獨立替換，而只換其中一個產出的是一份風格不一致的文件。**一個 renderer 是一個 TMS 單元，不是二十一個。**

**`new Marked()` 已經是對的，不需要重切。** 問題不是隔離路徑不存在，而是**預設的那一條是共用的那一條**——`import { marked } from 'marked'` 拿到的是模組級全域，而那是阻力最小的寫法。

**Lexer 跟 Tokenizer 不該拆開。** 24 個 tokenizer 方法跟 4 個 lexer 方法之間有順序依賴（block 先於 inline），那個順序就是 markdown 這個格式本身。拆開之後每個單元都得知道自己在第幾輪，比現在耦合得更緊。

## 這次沒有解決什麼

- **重切的規模小到不足以構成證據。** 三種 token 型別、兩個 renderer、沒有 inline 處理。它證明了「規則可以是具名參數」做得到，沒有證明在 21 個方法、六個擴充點、還要處理 `async` 與 `walkTokens` 的規模下還做得到。

- **我沒有提出可以直接送進 marked 的補丁。** 讓 `use()` 回傳報告物件會破壞 chaining，是 breaking change；相容的做法是保留回傳值再加一個 `marked.installed()`，但我沒寫，也沒測過它在 `Marked` 實例與模組全域兩條路徑上是否一致。本篇是一份量測與一個小型示範，不是一份貢獻。

- **`extensions` 我只確認了「同名註冊兩次不會丟錯」，沒確認它是累積還是覆寫。** 那是第四種擴充點，而且它的 `tokenizer` 回傳 `undefined` 表示「不是我的」——又是一個回傳值承載多重意義的地方。要量它需要一個真的會匹配的 tokenizer，我沒有寫。**這一項跟上面那個被我抓回來的差別在於：它需要新寫一段程式，不是一條指令。**

- **「兩種規則不分辨」在多數情況下不是問題。** 一個應用程式只呼叫一次 `use()`，那第二次永遠不會發生。這只在**多個擴充套件被同一個建置載入**時浮現，而那時決定勝負的是 import 順序。我沒有量這在真實世界有多常見——沒有這個數字，我只能說這是一個結構事實，不能說這是一個重要的結構事實。
