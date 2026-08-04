---
id: log
index: "07"
title_zh: 開發日誌
title_en: Development log
summary_zh: 每天一則。範例、考古與 MVP 打回來的東西寫在這裡，最新的在最上面。進到 1.x 的改良點會從這裡挑。
summary_en: One entry a day. What the examples, the archaeology and the MVPs sent back, newest first. The 1.x changes get picked from here.
state_zh: 每日進行
state_en: Daily
updated: 2026-08-04
---

# 開發日誌

[開發區](/html/mssp/modules/development.html)收的是結論——目前的優點、缺點、要改的方向。這一頁收的是過程：哪一天發生了什麼、為什麼會知道、以及那件事把哪一條往前推了一格。

兩者分開，是因為結論會被改寫，而過程不會。一條缺點從清單上消失時，應該還能查到它是怎麼被發現、又是被什麼解掉的。

每則的形式固定：**發生了什麼 → 怎麼發現的 → 對 MSSP 的意義**。第三段可以是「沒有意義」，那也要寫。

---

## 2026-08-04

### 一、範例 004：Router 回傳名字，不回傳模組

[004 Router](/html/mssp/004-router.html)。這是[開發區缺點 3](/html/mssp/modules/development.html) 自己寫著「排在範例路線的第一位」的那一條——論文定義了 $R(q,u,\tau,p)$，但沒有實作模式、沒有規模指引、也沒有說路由本身要怎麼測。

決定只有一個：**Route 命名一個能力，不持有它。**

聽起來像偏好，直到你試著替路由器寫孤島測試。一個回傳模組的路由器，必須 import 每一個候選才有辦法回傳任何一個——於是測路由邏輯要載入全部、路由器持有全部的參照（那就是「不是子集」的定義）、而 TMS 存在的按需載入被那個本該促成它的東西打敗。

回傳識別碼在呼叫端多一行，換到的是這個——孤島測試第 1 節**把整個 `TMS/` 目錄從磁碟上改名**再跑：

```text
  PASS  routes with the TMS directory removed from disk - chose 'handlers/markdown'
  PASS  names a capability that has no file and never will
  PASS  no TMS module was imported by routing - imported: []
```

路由器對 `handlers/does-not-exist` 做了正確的決定，而那個檔案從來不存在。

第二個決定：**權限被拒就結束這個決定，不往下一條規則掉。** 往下掉看起來無害，但它讓呼叫者可以**因為被拒絕一個更match的規則而拿到另一個能力**——那會把權限變成偏好。

### 二、缺點 3 補了三分之二，第三個沒有

| 原本缺什麼 | 現況 |
|---|---|
| 路由本身要怎麼測 | **補上了** |
| 規則式路由在什麼規模上不夠用 | **變得可量了**——從未觸發的規則、沒有規則接住的請求 |
| 換成模型式路由的判準 | **仍然沒有** |

那兩個數字不是錯誤。年輕的規則集有接不住的請求因為它年輕；老的規則集累積從未觸發的規則因為世界變了。**重要的是方向，而沒有數字就沒有方向。**

### 三、考古 004：註冊表是對的，綁定靠命名，於是打錯字的 handler 完全惰性

[004 CPython urllib.request 3.14.5](/html/mssp/archaeology/004-urllib-opener.html)。選它是因為它跟[考古 002](/html/mssp/archaeology/002-http-server.html) 在同一個標準庫裡做同一件事，用相反的機制：`http.server` 用繼承，`urllib.request` 用註冊。

對的部分很乾淨：`OpenerDirector` **只有 6 個方法**、`BaseHandler` **只有 3 個**、handler 由 `build_opener(*handlers)` 傳入。核心不知道什麼能處理什麼，直到有人告訴它——**那正是 `http.server` 結構上做不到的事，而且比我今天寫的還小。**

漏處當場量得出來：

```text
     good          schemes=['data']  handlers=1  add_handler returned None
     typo          schemes=[]        handlers=0  add_handler returned None
     wrong-scheme  schemes=['htp']   handlers=1  add_handler returned None
```

`data_opne`——**一個字母對調**——註冊 0 個。handler 完全惰性，沒有例外、沒有警告，而 `add_handler` 回傳 `None`，**跟成功那次一模一樣**。`htp_open` 則替一個不存在的協定成功註冊，因為沒有一組真實協定可以拿來檢查那個名字。

**能力用命名宣告，而命名沒有東西在檢查。** 名字同時是宣告與授權，於是打錯的名字是一個成功註冊的、不同的宣告。

重切版**保留命名慣例**——`http_open`、`https_open` 這組名字讓一個 18 個 handler 的模組用讀的就知道誰做什麼，換成顯式欄位會失去那個——只是加上檢查。兩件事從來不衝突，上游只是沒做第二件。

### 四、今天三個失敗裡有兩個是我的測試前提錯了

孤島測試第一次跑，三個 FAIL：

- 第 2 節挑了一個**policy 本來就允許**的 actor，所以「被拒絕不會往下掉」根本沒被測到；
- 第 5 節的 grep 檢查 `router.py` 有沒有 `TMS` 字串——而它讀到的是 docstring 裡「it imports nothing from TMS」那句話。**一個檢查在讀自己的文件。**

兩個都是測試錯，不是程式錯。修法：第 2 節換成一個真的沒有權限的 actor，並且**加測反方向**（那個 actor 用自己的請求仍然拿得到它有權的能力——否則整節可以靠「全部拒絕」通過）；第 5 節只解析 import 行。

這跟[改良點 6](/html/mssp/modules/development.html) 是鄰居但不是同一件事。改良點 6 講的是**檢查不會失敗**；這兩個是**檢查在測錯的東西**。前者沉默，後者會叫，只是叫錯地方。兩者共通的是：**測試的前提沒有被任何東西檢查。**

---

### 今天推進了什麼

| 項目 | 狀態 |
|---|---|
| 範例 | 003 → **004**（Router 回傳識別碼，孤島測試把 TMS 目錄刪掉） |
| 考古 | 003 → **004**（urllib：註冊表確認，綁定未檢查） |
| 開發區缺點 3 | 三缺口補二，第三個照實留著 |

## 2026-08-03

### 一、昨天加的改良點 6，今天一小時內就付了

昨天升上去的[改良點 6](/html/mssp/modules/development.html)說：檢查本身要先被看著失敗一次。今天第一件事就是拿它去問一條既有的檢查——**「沒有任何 TMS 引用兄弟 TMS」對 Python 範例到底有沒有跑？**

`build-mssp.mjs` 那段的註解自己寫著：

> 這是唯一一條違反時在審閱中看不見、而且會摧毀「TMS 可以單獨載入」這個主張的規則。

而它的檔案過濾是 `/\.(js|mjs|ts)$/`。[範例 002](/html/mssp/002-link-checker.html) 是 Python。

**實測**：在 002 的一個 Python TMS 裡加上 `from TMS.checkers.http import HttpChecker`，建置**綠燈通過**。相對形式 `from .http import ...` 也一樣。考古的建置有自己一份同樣的檢查，考古 002 也是 Python，一樣沒跑。

兩邊都修了：JS 與 Python 兩種 import 形式、點分與相對兩種寫法都解析，`__init__.py` 加進單元根的判定。四個方向都驗過——乾淨的樹通過、Python 點分違規擋下、Python 相對違規擋下、JS 違規擋下。

**這跟昨天的 BC-0007 是同一個型態**（[BP-0003 用列舉代替規則](https://bugology.evemiss.com)）：檢查建立在一份手維護的清單上——那裡是網址清單，這裡是副檔名清單——而清單外的東西不會產生訊號，它的沉默跟通過長得一樣。

**值得記下的是發現方式。** 不是有人回報、不是測試變紅。是拿一條剛寫進方法的規則，去問一條已經在跑的檢查。改良點 6 的驗證方式那一欄寫的是「對現有範例回頭補這一節」——照著做，一小時內找到一個活的洞。

### 二、範例 003：DMS 的工作是讓「成功」變成可以查證的

[003 記錄遷移](/html/mssp/003-record-migration.html)。一句話的問題：

```text
5 records migrated, 0 errors
```

這句話對「五筆都正確遷移」是真的，對「沒有任何轉換命中、什麼都沒改」也是真的，對「跑到第二筆就提早返回」也是真的，對「輸入是空的」還是真的。**它在每一種情況下都為真，也在每一種情況下都沒用。**

所以帳本回答那句話回答不了的三件事：

**收支要平。** 每筆記錄必須在四種結果裡剛好出現一次。「0 錯誤」是關於一個桶子的主張，它完全沒說迴圈有沒有走過它拿到的全部東西。這條放在 **SMS 不是 DMS**——一份自己計算自己正確性的報告是在改自己的考卷。

**看得到一筆嗎。** 每種結果印兩筆前後對照，**包含沒改動的那些**，附上理由。「unchanged 2 筆」是一個主張；「unchanged，因為只有一個詞，拆開會是猜測」是一個讀者可以不同意的決定。

**什麼沒發生。** 這是這個範例存在的理由：

```text
    transforms/split-name      invoked   4, changed   3, declined   1
    transforms/normalise-phone NEVER INVOKED
                                 declined 5 record(s); reads phone
                                 this run says nothing about whether it works
```

測試資料裡一筆電話號碼都沒有。那個轉換載入了、是正確的、從來沒被碰到。**它不是錯誤也不是成功，是證據的缺席**，而報告必須分得出這三者。

### 三、考古 003：先找對的東西，再找漏的

[003 CPython logging 3.14.5](/html/mssp/archaeology/003-logging.html)。前兩則考古都在找**缺少**的縫，而一個只會找缺陷的方法講不出它認為什麼是對的。

`logging` 的四個軸切得很對，二十多年前切的：`Handler` 持有 `Formatter`、`Formatter` 不認識 `Handler`（單向）；`Filter` 是**一個方法**的協定，不是要繼承的基底；`Logger` 與 `Handler` 都繼承 `Filterer`，因為過濾真的是兩者共有的關切；`propagate` 在 `Logger` 上不在 `Handler` 上——**路由是 logger 的事，不是目的地的事**。

跟[考古 002](/html/mssp/archaeology/002-http-server.html) 對照著看很有意思：同一個標準庫、同一個年代，`StreamHandler` 把目的地當參數收，而 `BaseHTTPRequestHandler.log_message` 把 `sys.stderr` 寫進函式裡。

漏處只有一個，當場量得出來：

```text
root handlers 0 -> 1 after one logging.info()
basicConfig(format=...) returned None, formatter changed: false
```

`logging.info()` 在 root 沒有 handler 時**會替你呼叫 `basicConfig()`**。之後你自己的 `basicConfig(format=...)` 完全不做事，沒有例外、沒有警告、沒有回傳值。

結構上的原因不是那個守衛，是**便利層一次跨過全部四個軸**——它在你只想記一行的時候順手決定了門檻、sink、格式與目的地，而且是在全域上。

我也寫了為什麼它改不掉：現在讓 `basicConfig` 不再沉默，會弄壞每一個依賴「重複呼叫是安全無操作」的程式庫。那是第九篇講的相容壓力。**便利層不是錯誤，補償的副作用不可見才是。**

---

### 今天推進了什麼

| 項目 | 狀態 |
|---|---|
| 兄弟 TMS 檢查對 Python | **本來完全沒跑**——已修，四個方向驗過 |
| 範例 | 002 → **003**（DMS 讓成功可查證） |
| 考古 | 002 → **003**（logging：邊界確認 ＋ 一個漏處） |
| 開發區 | 新增改良點 7：DMS 需要契約，不只是一句描述 |

## 2026-08-02

### 一、範例 002：把一個 TMS 升成 SMS，代價落在別人身上

[002 連結檢查器](/html/mssp/002-link-checker.html)。節流原本是 `TMS/pacing`——它聽起來就是可選的：那是禮貌，測試時會關掉，而「檢查連結」聽起來不需要禮貌。

它是被建置擋下來才被注意到的：`TMS/checkers/http` 引用了 `TMS/pacing`，兄弟 TMS 互相引用不合法。**最省事的修法是把 pacing 搬進 SMS 讓檢查通過**——而那個修法碰巧是對的，這跟「是對的」不是同一件事。

真正該問的是身分測試。拿掉它再看：

```text
5 checked, 3 failed, 3 left without a verdict
loop closed: False
```

三條連結根本沒拿到判定。**慢的連結檢查器還是連結檢查器；漏掉連結的不是。** 迴圈關不起來，所以節流是核心。

有意思的是升上去之後壞了什麼。最整齊的寫法是 `SMS/pipeline` 每條連結呼叫一次 `pace()`，一個呼叫點、每個檢查器都不用記得——**它也把等待記在剛好排在下一個的能力頭上**。`checkers/anchor` 從頭到尾只讀記憶體裡的字串，卻開始為一個它碰都沒碰的主機付延遲。沒有任何東西失敗，報告一模一樣，只有一個數字變了。

這就是方法自己點名的陷阱：**everything becomes SMS**。升上核心的能力不會停在需要它的那個模組。

修法是 `pace()` 由「即將開連線的那個能力」自己呼叫。而因為「anchor 不該為此付錢」正是那種會悄悄停止成立的意圖，它被寫進 `SCL/policy.json` 的 `pace-requires-network`，每次執行結束檢查。孤島測試第 4 節**刻意蓋出錯的形狀，要求那條規則擋下來**。

### 二、我自己的範例裡有一個不會失敗的守衛

第一版跑起來很漂亮：報告整齊、SCL 通過、退出碼 0。

**節流一次都沒有觸發。** min_gap 是 2，而時鐘每條連結才走 1 格，連結又剛好分散在不同主機之間——所以間隔永遠夠大。整個示範是空轉的，而輸出完全看不出來。

更糟的是第二個：`make_transport(paced=...)` 讓 transport 自己知道有沒有節流。所以「有節流」與「沒節流」兩次執行的差別，是**我告訴它們要有差別**。那是循環論證，不是證據。

兩個都修了：transport 現在讀同一個時鐘、依它觀察到的間隔回答，而測試頁面改成同一主機的連續連結。現在 `checkers/http` 等了 3 次、`checkers/anchor` 0 次，拿掉節流會真的產生 429。

**這條進 1.x 候選：**方法目前說「主張要能被機器驗證」。它沒有說**驗證本身要被證明會失敗**。今天在三個不同的地方踩到同一件事（見下方第四項），該寫進方法。

### 三、考古 002：當擴充點是繼承，就沒有子集可以載入

[002 CPython http.server 3.14.5](/html/mssp/archaeology/002-http-server.html)。選它是因為它不是被忽略的角落——**繼承 `BaseHTTPRequestHandler` 然後定義 `do_GET` 是官方文件推薦的做法**。

量到的（由孤島測試在執行時從真模組讀出，不是抄的）：模組 1,441 行、`BaseHTTPRequestHandler` 28 個方法、`SimpleHTTPRequestHandler` 的 MRO 五層深、`handle_one_request` 36 行同時做讀取／解析／分派／回應／記錄、`parse_request` 116 行而且會 `send_error`、`log_message` 25 行寫死 `sys.stderr`。

最上層的那件事是 `getattr(self, 'do_' + command)`。處理器的集合就是實例的屬性集合，於是**沒有地方可以把一組不同的處理器交進去**，而且**一個類別只能有一個 GET 處理器**。

重切後 `handlers/health` 在沒有 socket、沒有 server 物件、沒有 client address 的情況下單獨回答 200。上游做同一件事的最小形態，是那 1,441 行加上一個方法。

判定寫 `seam-confirmed-by-ecosystem` 而不是「標準庫做錯了」：WSGI 從 2003 年就把請求變成值，二十多年來所有正經的 Python web 伺服器都不繼承它，`http.server` 自己的文件也寫著不建議用於正式環境。**一個為零設定而生的模組，其擴充機制必然把整體綁給每個擴充者——在它自己的用途裡，那個代價是合理的。**

### 四、同一個形狀，今天第三次

考古的 `dispatch` 第一版只比對 HTTP 方法。兩個處理器都宣告 `GET`，所以健康檢查回答了每一個請求，**檔案處理器一次都沒跑到**——包括那個專門用來測「它會拒絕離開根目錄」的請求。而 `main.py` 裡那條斷言寫的是「不可以有 200」，於是它在被檢查的東西從未執行的情況下，通過了。

我用意外的方式重現了上游的限制，然後用一條不可能失敗的斷言確認了它沒問題。

斷言改成**必須看到 403**，而不只是沒看到 200。

三次的共同形狀：**斷言寫成「壞事沒發生」，而壞事沒發生的最常見原因是那段路徑根本沒被走到。** 寫成「好事發生了，而且是以正確的方式」，同一個缺陷就擋得住。

### 五、建置把位元碼當成範例程式碼發佈

002 是第一個 Python 範例，於是暴露了一個一直都在的漏洞：`build-mssp.mjs` 與 `build-archaeology.mjs` 的 `walk()` 收所有檔案。`python src/main.py` 會產生 `__pycache__`，而**建置的 `runnable` 檢查自己就會執行它**——所以位元碼保證存在。

結果：範例被報成 963 行 20 個檔案（實際 730 行 12 個檔案），176 行位元碼被當成程式碼統計，而且 `.pyc` 被當成結構的一部分publish 給讀者看。

兩個建置都加了排除，並確認：磁碟上有 6 個 `.pyc` 時，計數仍然不變。

依照現在的常規，這個缺陷也送進 [Bugology](https://bugology.evemiss.com)。

---

## 2026-08-01

### 一、十二篇論文到了，它們替已經在做的事命名

《表觀完好系統》系列十二篇進到[論文區](/papers)（語料庫來到 89 篇）。這一系列不是新方向，而是把這個網站已經在做的幾件事講清楚了：

- **P3 宣告架構 ≠ 有效架構**，正是[架構透視器](/html/research/github-architecture-scope.html)那次修正轉的那個彎。
- **P4 $Q_s \neq F_v$**（結構品質不推出生存適應度），正是[考古](/html/mssp/modules/archaeology.html)那節「什麼不適合拆」在講的事。
- **P7 複雜度轉移**說明了為什麼考古的判斷不能只看「拆完比較乾淨」。

論文之外還有一份〈SSD / Dynamic MSSP 工程規格〉，已收為[迭代授權](/html/mssp/modules/authority.html)。它做的事是本來缺的：**寫下 MSSP 自己可以被改到什麼程度**。

### 二、早上那個修正方向對，形狀錯

架構透視器原本把「穩定度分類」印在 MSSP 的標籤下——一個宣告了 `src/TMS/` 的專案，只要那些模組中心性高，就會被報成 SMS。這是真缺陷，早上修掉了，修法是：**有宣告時宣告優先，推論當 fallback**。

讀完第 11 篇才看出這個形狀有問題。規格 §43 講得很直白：

> Observed 不等於 Effective。Observed 是事實，Effective 是推論。Observation → Evidence → Interpretation 不可省略。

「宣告優先、推論當 fallback」是把兩層壓成一層，然後在有宣告時把量測整個丟掉。也就是說，一個宣告 `TMS/`、實際上已經被當成承重結構在用的專案，工具會照著宣告回答——正是第 11 篇開頭那句：

> 如果 MSSP 仍回答「它在 YAML 裡寫 TMS，所以它就是 TMS」，那 MSSP 只是另一份過時文件。

**已改。** 兩層並存：每個模組除了宣告角色，另外印出量到的 `observed:`（被依賴數、依賴數、中心性、不穩定度、churn）；兩者不一致時產生治理事件，而嚴重度必須配得上證據：

| 嚴重度 | 什麼情況 | 證據性質 |
|---|---|---|
| `ERROR` | `dependency.sms_to_tms`、`dependency.tms_to_tms` | 直接讀依賴圖。**不帶 confidence 欄位**——沒有東西可以不確定 |
| `ADVISORY` | 宣告 TMS，但被依賴的廣度不亞於本專案最被依賴的宣告 SMS | 計數是真證據，但計數不是 runtime |
| `OBSERVATION` | 宣告 SMS，卻沒有任何東西依賴它 | 單獨看有歧義——入口點本來就沒有內部被依賴者 |

**不重新分類任何東西。** 宣告角色維持原樣，直到有權者去動它。單一快照也證明不了偏離「持續」了多久，所以不管數字多懸殊，角色假說一律不高於 ADVISORY。報告另外寫明哪些證據類別拿不到（`runtime_trace`、`incident`、`human_assertion`），以及權限模型**根本沒有建模**——是「沒查」，不是「查過沒問題」。

順帶補上了兄弟規則看不到的那一格：依賴圖只保留 `target != source` 的邊，而集合底下再一層的目錄（`TMS/reporters/` 裡的 text 與 json）會塌成單一 component，所以那裡的兄弟 import 在圖上完全不存在。原始 import 還留在檔案紀錄上，把它折回路徑片段跟同 component 的其他檔案比對就找得回來。

**兩個方向都驗過。** 蓋一個刻意違反每條規則的專案，三種嚴重度全部觸發；換成 FPL 編譯出來的專案（它的編譯器根本不讓這些違規寫出來），只剩一則 OBSERVATION，落在入口點上——剛好命中規則裡寫著的那條反證。

### 三、FPL 的位置比原本以為的小，也更清楚

原本記下的 1.x 候選是「MSSP 的規則可以是型別規則」。第 11 篇 §8＋§21 講得更精確：那是**三層判斷器的第一層（Deterministic Validator）**，原則是「能 deterministic 判定的，AI 介入 = 0」。

所以問題不是「規則可不可以是型別規則」，而是**哪些可以**：import 圖、環、重複、名稱解析——FPL 那八條全部在這一層。而論文真正在乎的問題（這個 TMS 是不是已經活成 SMS？）在第二、三層，**FPL 結構上答不了**，因為它只看得到宣告。

同時暴露一件事：規格 §57-F 那條驗收（拿掉 MSSP Profile，核心仍要能跑）**FPL 現在過不了**——五個集合的名字在 `src/` 裡出現 87 次，其中 45 次在型別檢查器裡。那八條規則檢查的不是架構治理，是五個特定字串。§39 允許 FPL 帶 MSSP 味道（它是 authoring surface），但 §26 要求 IR 不能是 taxonomy 的序列化。**待辦：把 role vocabulary 變成資料，而不是 kernel 裡的字面量。**

### 四、一個沒有任何守衛看得見的缺陷

論文頁的章節標題用 `# 1.`、`# 2.` 編號，而頁面本身已經另外輸出過一個 `<h1>` 標題。結果是一頁上有 78 個 H1，全部 54px；而 `摘要` 是 H2、26px——**階層是反的**。PDF 那邊更糟：算繪器對 `# ` 開頭的行直接 `continue`，於是那些章節標題**一個都沒印出來**。

規模：**89 篇裡有 81 篇**，兩種格式都中，共 2,433 個標題。從論文上線那天就是這樣。

九道部署守衛全部沒看見，因為它們量的是公式數、殘留分隔符、可達性、位元組數——**沒有一道量的是「這頁讀起來對不對」**。發現它只是因為去看了一頁。

這件事跟[開發區缺點 4](/html/mssp/modules/development.html)是同一族：可量的東西會被量，不可量的東西會被當成沒問題。修法是本文標題整層降一級（頁面標題保持唯一的 H1），PDF 則把第一個 `# ` 當標題略過、之後的都當章節印出來。

驗證用了兩個互相獨立的量測：HTML 那邊「多餘 H1 數」歸零；PDF 那邊 **81 個檔案變大、8 個不變**——而那 8 個正是 HTML 調查裡本來就沒有多餘 H1 的同 8 篇。兩邊指向同一組論文。

### 五、突變測試抓到一個測試自己的洞

新的治理事件寫完後，把新程式碼刻意弄壞四次，看測試會不會叫：

- `sibling_unit_imports` 永遠回空 → **抓到**
- `governance_events` 什麼都不發 → **抓到**
- ERROR 事件也帶 confidence → **抓到**
- **`observed:` 整塊不輸出 → 25 個測試全過**

第四個是這次新增的那一層。所有測試都在斷言「事件」，而事件不需要被展示它的輸入就能存在。補了一條測試之後四個都會被抓到。

**這條進 1.x 候選：**方法目前只說「主張要能被機器檢查」，沒說「檢查本身要被證明會失敗」。[開發區優點 2](/html/mssp/modules/development.html)講的是前者。後者是這個網站三次踩到同一件事之後學到的，該寫進方法。

---

### 今天推進了什麼

| 項目 | 狀態 |
|---|---|
| 論文語料庫 | 77 → **89 篇**，5 個系列 |
| 架構透視器 | 宣告／觀察兩層並存 ＋ 治理事件，26 個測試 |
| 論文標題階層 | 81 篇 × 2 種格式修復 |
| MSSP 迭代授權 | 收錄生效 |
| FPL profile 化 | **未開始**——§57-F 目前過不了 |
