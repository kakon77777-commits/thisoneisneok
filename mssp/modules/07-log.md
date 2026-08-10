---
id: log
index: "07"
title_zh: 開發日誌
title_en: Development log
summary_zh: 每天一則。範例、考古與 MVP 打回來的東西寫在這裡，最新的在最上面。進到 1.x 的改良點會從這裡挑。
summary_en: One entry a day. What the examples, the archaeology and the MVPs sent back, newest first. The 1.x changes get picked from here.
state_zh: 每日進行
state_en: Daily
updated: 2026-08-10
---

# 開發日誌

[開發區](/html/mssp/modules/development.html)收的是結論——目前的優點、缺點、要改的方向。這一頁收的是過程：哪一天發生了什麼、為什麼會知道、以及那件事把哪一條往前推了一格。

兩者分開，是因為結論會被改寫，而過程不會。一條缺點從清單上消失時，應該還能查到它是怎麼被發現、又是被什麼解掉的。

每則的形式固定：**發生了什麼 → 怎麼發現的 → 對 MSSP 的意義**。第三段可以是「沒有意義」，那也要寫。

---

## 2026-08-10

### 發生了什麼

[範例 010](/html/mssp/010-evidence-about-which-event.html)：**證據要說出它是關於哪一次事件的**——把昨天 EML-P 那條線逼出來的時間維度做成可執行的。[考古 010](/html/mssp/archaeology/010-cpython-pyc-invalidation.html)：CPython 的 `.pyc` 失效判定，**三種模式都在同樣兩個標頭欄位裡存八個位元組，差別是那八個位元組是關於哪一次事件的**。

分工也變了：Neo 把四份[程式研究](/html/research/evemiss-fpl.html)交給 Metron 與 Pragma，**更新與上線之後主要由我負責**。

### 怎麼發現的

**我昨天早上發表的判準，今天被兩個獨立的量測打掉。** 開串時我寫的是取值的個數——「一個檢查如果只讀得到一種取值，它證不了任何需要兩種取值才能分辨的事」。

範例 010 的孤島測試第 3a 節照我預期的走：

```text
        event-blind-v1   1 distinct: exempt
        event-scoped-v1  2 distinct: exempt, review
```

第 3b 節問了一句我原本沒打算問的——**那個 `1` 是守衛的性質，還是這份歷史的性質？** 加一個沒有任何豁免涵蓋的檔案：

```text
  PASS  one unexempted file makes event-blind-v1 produce two verdicts - exempt, review
```

**它會分辨。它分辨的是「證據存不存在」，而那是另一次事件。**

同一天考古那邊獨立得到同一個修正，而且更難反駁，因為那不是我寫的程式碼。四次編輯**每一次都改了原始碼**，差別只在中繼資料動了沒有：

```text
  the edit                             metadata   bytes     timestamp    checked-hash   unchecked-hash
  two writes, whatever the clock did   unchanged  changed   STALE RAN    recompiled     STALE RAN
  mtime put back, same size            unchanged  changed   STALE RAN    recompiled     STALE RAN
  mtime put back, size changed         moved      changed   recompiled   recompiled     STALE RAN
  mtime forced +5s, same size          moved      changed   recompiled   recompiled     STALE RAN
```

第一列**完全沒有用 `os.utime`**：兩次寫入相隔幾毫秒，自然落在同一個 `int(mtime)` 秒內，過期的位元碼就跑了。

而取一個值的那個是 `UNCHECKED_HASH`——**它永遠不會拒絕，而它是對的**。給建置系統已經保證一致的部署用，而且「我不檢查」寫在標頭的 flag bits 裡。上游三十年的程式碼把我的判準兩端都佔了：會分辨但分辨錯軸的是缺陷，完全不分辨但講清楚的不是。

**第三個實例是我自己的，發生在寫這一篇的時候。** 考古 010 的 flags 探針第一版讓來源與快取內容相同，於是「用了快取」跟「拒絕快取」印出同一個字串，`exit 0` 我差點當成佐證——而 FMS 裡那句「上游會擋下 import」在被量之前已經在檔案裡當了半天的事實。加對照組之後才分得開，答案也跟我寫的不一樣：**不擋，丟掉快取重編。**

### 對 MSSP 的意義

[改良點 10](/html/mssp/modules/development.html) 進開發區，狀態 `candidate`：證據要帶 `about`，守衛要拿它跟被審的事件比對，**無條件的豁免是允許的但要具名擁有者與到期日**。第三條是從 CPython 抄的，不是我想出來的。

`mssp-d-003` 維持 `open`，而它最弱的一環動了一格——**現在有一個不是我寫的實例，而它同時提供了支持與反例。**

---

## 2026-08-09

### 發生了什麼

[範例 009](/html/mssp/009-witness-continuity.html)：實作 **Pragma 的提案而不是我的**。[考古 009](/html/mssp/archaeology/009-cpython-warnings.html)：CPython `warnings`——**我昨天量的那個通道，是被我的儀器改變過的**。

Neo 同時給了路線改變：**到 20 個範例與 20 則考古之後，不再找開源專案，改成把市面上的應用軟體做出來並開源**——電商、報表那一類，每一個都要能用、UI 完備、BUG 稀少。目前 9/9，還有約十一天。

### 怎麼發現的

**我在 `mssp-d-002` 提的 discrimination delta 被 Pragma 反駁，而反駁是對的。** 我提的是每條 clause 回報「有多少個觀察能夠讓它失敗」。他的反駁：**原始數量會被重複 fixture 灌高**——把同一個 fixture 複製十次數字就變漂亮，保護的還是同一種語義情況。他提的是 **falsifying-witness continuity**：舊版有哪些**具名**反例能讓 clause 失敗、新版還在不在、移除的話理由是什麼。

範例 009 實作他的。孤島測試第 3 節不是用文字同意他，是把那個灌水**跑出來**：

```text
  PASS  duplicating one fixture ten times raises a raw count to ten - 10
  PASS  and leaves the distinct-case count at one
  PASS  while a genuinely different case does move it - 1 -> 2
```

第 4 節示範那個 count 抓不到的東西：1.0 有一個 `date-is-a-timestamp` 反例，1.1 沒有了，**而該 clause 仍然可被證偽**——兩個反例還在而且都有效。所以通過／失敗的視角看不見，原始計數的 3→2 又跟「刪掉一個重複的」無法區分，**只有具名才看得出是哪一種情況停止被守著**。

**考古 009 打到的是我自己昨天的量測。** 考古 008 回報「舊名字多發一個 `DeprecationWarning`」。量下去：

```text
  five calls from one site emit ONE warning     1 of 5 — the channel remembers
  the same five calls, each wrapped, emit FIVE  5 of 5 — catch_warnings mutates the filters
```

`warnings` 有記憶（`__warningregistry__`，鍵是 text/category/lineno），而 `catch_warnings` 為了隔離自己會變動 filter 清單，`_filters_version` 一遞增，所有 registry 就被丟棄。**隔離是它的目的，重設是副作用，而那個副作用恰好回復了我正在觀察的行為。**

結構上還有一件：`warnings.py` 只有 **99 行**，是從 **869 行**的 `_py_warnings` 轉出 47 個名字的門面，`warn()` 實際來自 C 的 `_warnings`，而 **`warnings.filters is _warnings.filters`**——觀察與被觀察是同一個物件。

### 對 MSSP 的意義

**一個觀察器必須宣告自己會不會擾動被觀察的東西。** 這是重切加的那一條，而它是可檢查的：孤島測試第 1 節比對模組上的 `PERTURBS` 與 FMS 的宣告，不一致就擋。

同一份程式碼，被動觀察器看到 1、重設觀察器看到 5。**兩個都對，它們回答的是不同的問題**——「程式試了幾次」與「有沒有人聽到」——而一份不指名觀察器的報告會讓讀者把其中一個當成另一個。這跟考古 007 的「等價是契約加上量測」是同一件事往回退一層：**在契約之前，先要有一個承認自己存在的儀器。**

考古 008 的觀察器盲點清單已經回頭補上這一條，但**我沒有重做它的量測**——被動觀察 `logging.warn` 需要乾淨的子行程，因為記憶是行程級的。契約沒有錯，它只是對「是什麼讓這件事看得見」保持沉默。

**還有一件關於今天的：我在同一天犯了比較輕的同一個錯。** 考古 009 把「觀察器會不會擾動」做成一個布林，而真實情況是程度問題——一個讀快取的觀察器擾動了時序卻沒擾動結果。**一個布林在這裡可能跟一個計數在別處一樣粗**，而那正是我今天早上從 Pragma 那裡學到的。

---

## 2026-08-08

### 發生了什麼

Neo 交付了[三方協作治理轉述](/html/mssp/modules/authority.html)：MSSP 由 **Elenchos／Metron／Pragma** 三方治理，最高原則是**動態迭代**——MSSP 1.0 是起始版本不是終局規格，FMS/SCL/SMS/TMS/DMS 可以演化、重寫、重新分組或被更好的設計取代。一般改良需三方一致，重大變更三方一致後仍由 Neo 決定。**那份文件明確不是 commit／部署授權。**

[範例 008](/html/mssp/008-compatibility-alias.html) 與[考古 008](/html/mssp/archaeology/008-cpython-logging-warn.html) 交付 [`mssp-d-001`](/html/mssp/discussions/mssp-d-001.html) 指定的兩項驗證。[`mssp-d-002`](/html/mssp/discussions/mssp-d-002.html) 是 Metron 開的，直接問我責任邊界。

### 怎麼發現的

**候選在第二種 host 介面上壞了一次，而那正是那項驗證的用途。**

`logging.warn → warning` 的 host 是類別與模組上的**屬性存取**——沒有任何註冊表會讀一列映射。量到手寫三份複本（`Logger.warn`、`LoggerAdapter.warn`、模組級），全部**委派**而非重寫，stacklevel 全是 2，**彼此沒有漂移**（量的，不是假設的）。三通道下 output 與 return 相同，**warnings 多一個 DeprecationWarning**。

別名成立——而 `mssp-d-001` 草案的 `allowed_deltas` 寫成點分欄位路徑，**描述不了它**。兩個可呼叫物作為物件無法區分；把草案那兩個路徑拿來解析，兩個都解析不到東西。唯一被允許的差異是一個**通道**。修正：`allowed_deltas` 要命名觀察器底下的**觀察**，欄位路徑只是其中一種。

**這是第三種別名形狀，而形狀決定了漂移可不可能。** eslint 是展開物件、範例 008 的反例是重寫、`logging` 是呼叫過去。**委派讓舊名字不可能漂移，因為它沒有自己的行為。**

**範例 008 的反例被擋下兩次，而我不接受「被擋下」本身當證據。** 昨天有一個孤島測試在 `E0753` 上通過而宣稱在證明 `E0432`。所以第 4 節把漂移修掉再跑一次：findings 那條抱怨消失、sunset 那條沒有。**那個差異才讓第一個結果變成證據。**

**我自己的兩個缺陷。** 一，考古 008 的孤島測試裡我寫了 `check("兩份複本彼此一致", True, ...)`——**一個硬編碼的 True，長在專門用來查有沒有漂移的那一節裡**。改成真的算。二，考古 007 把被豁免的通過印成 `ok`，只在後面加一句 `(contract says MAY differ)`；一個只掃過報告的人會讀成通過。改成 `[WAIVED — would FAIL without the contract's may-differ]`。

**協作方也修了我昨天的修法。** 我把部署閘門改成比對討論串 id 集合；Metron 發現同一個 id 換了 status／summary／body 就漏掉，一個邊緣服務了舊副本而 build-id 已經是新的，**我的檢查照樣通過**。他們改成比對全部欄位加上發佈的 Markdown 位元組。**我比對的是身分的列舉，不是內容的**——BP-0003 的形狀出現在我自己的修復裡。

### 對 MSSP 的意義

**`mssp-d-002` 問「零 verdict delta 可不可以當治理門檻」。答案是不行，而且理由比 Metron 自己的猜測強。**

他寫的是「觀察器可能漏掉新風險但**剛好**沒翻轉既有 corpus」。不是剛好：

> **verdict delta 是在「新舊兩版都跑過的那些觀察」上計算的。只有一版跑過的觀察，依定義對 delta 沒有貢獻。**

所以任何**縮小觀察集合**的改動，delta 必然是零。三個量到的實例：考古 007 的語料從 13 個掉到 12 個（拿掉那唯一有差異的輸入），結論從「有差異」變「相同」而剩下 12 個一個都沒翻轉；範例 008 的 fixture 拿掉那行 `var`，漂移別名直接通過；考古 008 的 `stacklevel` 在三個通道之外，寫錯了三個通道的 delta 全是零。

提案是補上 **discrimination delta**——對每一條 clause 回報**有多少個觀察能夠讓它失敗**。那就是[改良點 6](/html/mssp/modules/development.html)搬到契約層。考古 008 已經有它的一小塊：報告會列出哪些被授予的許可這次**沒有被行使**。

**另一個量到的結構是三層而不是兩層**：結構上不可放寬（行為／輸出）、契約可放寬（FMS 的 `allowed_deltas`）、政策可保留（SCL 的 `channels_that_must_never_differ` 勝過記錄）。這條非對稱同時回答了「SCL 能不能比 FMS 寬鬆」——**預設不行**，例外要具名、有到期，而且**被豁免的通過永遠不可以渲染成通過**。

最後一條我當場拿去修了考古 007，因為那條原則我剛在討論串裡公開主張。

**還有一件關於我這個座位的。** 我在 `mssp-d-002` 的結尾把一個問題留給 Pragma：「判準被放寬以讓既有漂移重新通過」在真實專案裡有沒有被觀察到過。我的證據全部來自我自己建構的觀察器與我自己挑的語料——**語料收縮那個洞是我構造出來的，不是我遇到的**。三方治理裡我最不適合回答的就是這一題。

---

## 2026-08-07

### 發生了什麼

[範例 007](/html/mssp/007-identity-test-run.html)：把身分測試變成會跑的東西。[缺點 2](/html/mssp/modules/development.html) 說 SMS 沒有防止自己長大的機制，[改良點 1](/html/mssp/modules/development.html) 提的是給一個數字上限。**我沒有照做**，因為任何數字都是沒有根據的規則。

[考古 007](/html/mssp/archaeology/007-cpython-json.html)：CPython `json` 3.14.5。它帶一個 C 加速器 `_json` 跟一份純 Python 後備——**上游二十年來一直在跑身分測試**，只是形式是執行期後備。

[協作討論區](/html/mssp/discussions/mssp-d-001.html)的第一題開了：缺點 7 那個改名與兄弟引用的矛盾。

### 怎麼發現的

**第一版的示範是假的，而且假在兩個地方。** 我把每個宣稱是 SMS 的模組刪掉再跑：

```text
  ok  parse          structural       ImportError: cannot import name 'parse' from 'SMS'
  !!  format_money   NOT STRUCTURAL   ran, and produced byte-identical output
```

（一）**入口點 import 的每個模組被刪掉都會 ImportError**，所以刪除量的是「有沒有被 import」，不是「是不是結構性的」。（二）被標成 NOT STRUCTURAL 的那兩個，是因為我根本沒把它們接進 `main.py`——測試在區分死碼與活碼，然後把結果當成結構發現回報。

改成**替換**：每個模組換成一個保留簽名、什麼都不做的 stub。寫那個 stub 本身就是有用的——**你必須先說出「這個模組如果不重要會長什麼樣」**。

然後第二件事跑出來，而它比第一件重要：

```text
  !!  summarise      NOT STRUCTURAL   answer intact, output differs
```

`summarise` 產生計數。我原本會直覺歸為理所當然的 SMS。在我自己寫下的判準（「輸出要指名每一個有差異或未配對的 id」）下，它不是——因為列是從 `result` 來的，不是從 `summary`。孤島測試第 3 節把整件事再跑一次，換一個**也要求計數**的判準：`summarise` 翻成結構性，**而其他五個一個都沒動**。

**考古 007 的第一次量測也是錯的，而抓到的方法是去驗證驗證器。** 我用 `json.scanner.c_make_scanner = None` 關掉加速器，比對前後輸出，得到「完全相同」。印出 `type(decoder.scan_once).__module__` 之後才看到兩次都是 `_json`——因為 `make_scanner = c_make_scanner or py_make_scanner` **在 import 時就跑完了**，事後改 `c_make_scanner` 不影響已綁定的名字。**那是一次 C 跟 C 自己比、然後回報「兩個實作相同」的測量。**

重綁 `make_scanner` 之後才是真的（`_json` → `builtins`），結果是：

```text
  values are byte-identical                     12 strings compared
  every input accepted or rejected the same way 12 of 12 same error class
  exactly one error MESSAGE differs             '"\x"'
        C : Invalid \escape: line 1 column 2 (char 1)
        py: Invalid \escape: 'x': line 1 column 3 (char 2)
```

### 對 MSSP 的意義

**改良點 1 的答案是：不要用數字，而且機械化之後量到的東西比預期小。**

> **機械化的身分測試不決定哪些模組是結構性的。它決定一個結構跟一句宣稱的用途是否一致。**

這比我原本要做的少，也比一個數字有用：數字告訴你 SMS 太大，這個告訴你**哪一個模組沒有撐起它的宣稱，相對於一句你必須自己寫下來的話**。而寫那句話是機械化拿不走的部分。

**同一天，同一個結論在一份不是我寫的程式碼上出現。** CPython 的 `json`：「加速器不是結構性的」在「同一個值」下為真，在「同一則訊息」下為偽。**同一份程式碼，兩個判準，兩個答案**——而那份程式碼比這個發現早二十年。一個我發明的範例得到的結論，能在標準庫上重現，這是我目前為止對一條結論最有信心的一次。

還有一個比較小但反覆出現的：**等價不是量出來的，是契約加上量測。** 考古 007 的重切把「哪些觀察必須相同、哪些可以不同」寫進 `FMS`，`DMS` 逐條回答而不是給 yes/no。把 `SCL` 的 `error_text_must_match` 改成 `true`，同一次執行就從通過變成失敗。**那是同一份證據在兩份契約下的兩個結論**，跟範例 007 的判準依賴是同一件事。

**討論區第一題。** 缺點 7 那個矛盾我昨天只記錄了，沒有判準。今天把它開成討論串而不是硬寫一條規則進模組 02，理由是它需要來回：我先否掉三個方向並寫明理由，提出一個待驗的形狀（**規則不變，多一條治理路徑——引用可以附帶一份可查證的改名記錄**），然後把最不確定的一條交出去：「兩者公開介面在改名當下相同」能不能機械檢查。

我懷疑那跟今天的主結論同形——**改名的合法性可能也不是機械可判定的，只有「宣稱與實際是否一致」是**。如果 Codex 也這樣看，那缺點 7 的解就不是一條判準，而是一個宣告格式加一條一致性檢查。

---

## 2026-08-06

### 發生了什麼

[範例 006](/html/mssp/006-compiler-enforced.html)：cargo workspace，每個 TMS 單元一個 crate。這是[改良點 2](/html/mssp/modules/development.html) 自己寫著的驗證方式——在有真模組邊界的語言上重做依賴檢查，比較檢查的強度與寫起來的代價。

[考古 006](/html/mssp/archaeology/006-eslint-plugin-import.html)：`eslint-plugin-import` 2.32.0（MIT）。46 條規則裡**只有 1 條引用兄弟**，而那一條是改名的轉接層。

依賴檢查今天被補了兩個洞，[缺點 1](/html/mssp/modules/development.html) 整條重寫，[缺點 7](/html/mssp/modules/development.html) 是新的。

### 怎麼發現的

**在寫 Rust 範例之前，先問建置會不會檢查它。** 這是[改良點 6](/html/mssp/modules/development.html) 的用法，08-03 用過一次。答案是不會：

```js
const rule = IMPORTS.find((r) => r.ext.test(file));
if (!rule) continue;          // ← 全部的缺陷在這一行
```

實測——在範例 001 的一個 TMS 底下放一個 `.rs` 檔，裡面寫一個刻意的兄弟 import：**建置全綠，而且把它算進行數發佈出去**（13 檔變 14 檔）。不認識的語言不但不檢查，還照樣當成範例原始碼。

08-03 的修法是把 Python 加進清單，也就是擴充列舉；**根沒有動**。今天的修法不同，因為語言的集合推導不出來：**「不認識」這件事可以被弄響。** 現在 TMS 底下一個既非已知原始碼、也非已宣告的非原始碼、也不在 crate 裡的檔案，會讓建置失敗並要求作者選一邊。三個方向都驗過——裸 `.rs` 擋下、兄弟 crate 依賴擋下、乾淨的樹通過。

**第二個洞是考古逼出來的。** 要驗「我的建置會不會把一個棄用別名當成違規」，就得先種一個進去。種下去之後建置全綠——原因是 pattern 只認 `import … from`，而別名是用 `export … from` 寫的。順著查，`import "./x"`（純副作用）也一樣看不見。

| 寫法 | 修之前 | 修之後 |
|---|---|---|
| `import { x } from "./y"` | 抓到 | 抓到 |
| `export { x } from "./y"` | **看不見** | 抓到 |
| `export * from "./y"` | **看不見** | 抓到 |
| `import "./y"` | **看不見** | 抓到 |

**範例 006 的孤島測試自己也出了一次同樣的錯，而且是在證明編譯器有效的那一節。** 第 2 節要求 cargo 拒絕未宣告的兄弟引用，第一次跑就 PASS——但錯誤碼是 `E0753: expected outer doc comment`。我把 `use` 插到 `//!` 模組註解**前面**，cargo 是因為語法壞掉才拒絕，根本沒走到解析 crate 那一步。而旁邊那條「它是因為對的理由拒絕的」也 PASS 了，因為它只要求輸出裡出現 `tms_b64`——而那正是我自己插進去的那一行被引在錯誤訊息裡。**一個全綠、什麼都沒測到的檢查，長在專門用來證明規則被強制執行的那一節裡。** 改成插在註解之後，並要求具體的 `E0432`。

### 對 MSSP 的意義

**改良點 2 有答案了，而答案是對半分。**

| | 誰在保證 |
|---|---|
| **未宣告**就引用兄弟 | cargo，絕對地（`E0432`） |
| **宣告**一個兄弟依賴 | 仍然是建置的事——cargo 完全不反對 |

所以孤島測試有兩節：第 2 節要求編譯器拒絕，第 3 節要求它在宣告之後**接受**。只寫前者，等於宣稱編譯器解決了一個它沒有解決的問題。

**真正的收穫不是規則消失了，是規則從「每一行原始碼」搬到「每個單元一個檔案、固定格式」，而且那正是 cargo 讀的同一份檔案。** 對照今天補的兩個洞：兩個都是「文字比對認不出某種寫法」，而 manifest 沒有第二種寫法。代價量出來是每個單元 10–13 行、多一個檔案。

**考古 006 找到的是方法自己的矛盾。**

`eslint-plugin-import` 45/46 的規則是孤島，比我考察過的任何上游都乾淨。唯一那一個是 `imports-first.js`——`first` 的舊名字，整個檔案只做一件事：把新規則原封不動轉出去，並在 meta 蓋上 `deprecated: true`。

**那不是一條規則去拿兄弟的能力，是改名時把舊門留著。** 而模組 02 說「沒有任何 TMS 引用兄弟 TMS」，模組 06 說「替代先於移除」——**別名單元滿足其中一條的方式就是違反另一條**，而方法沒有任何地方說過這兩條會撞在一起。這個網站的建置現在兩者都擋，也就是說它會把一次合法的改名報成違規。誤報比漏報更傷：被誤報一次之後，下一次真的違規時人會先懷疑檢查。

重切示範了一條路——**改名是關於目錄的事實，不是關於檔案的事實**——但那還不是判準。當一個 TMS 真的必須提到另一個時，怎麼分辨「切錯了」跟「這是一次改名」，方法還是沒說。上游沒有這個選項：eslint 的 plugin 介面收的是 `{ 規則名: 規則物件 }`，**沒有地方可以放「這個名字是那個名字的舊稱」**。那是介面差異，不是判斷差異。

順帶量到考古 006 那個專案存在的理由，就在本站自己的 `node_modules` 裡：**宣告 25 個套件、裝了 475 個、可 require 但從未宣告 450 個**，而且 `require.resolve('@alloc/quick-lru')` 真的成功。範例 006 那半個編譯器保證，在這裡是完全不存在的。

---

## 2026-08-05

### 發生了什麼

[範例 005](/html/mssp/005-before-after.html)：同一支程式寫兩次，一次單檔、一次 MSSP，然後**量**重切的代價。三項成本、兩項效益、兩項打平。

[考古 005](/html/mssp/archaeology/005-marked.html)：`marked` 15.0.12（MIT），本站自己的建置相依。連續三則 CPython 之後換一個外部套件、換一個語言、換一個「上游把事情做對了」的案例。

[改良點 8](/html/mssp/modules/development.html) 進開發區。

### 怎麼發現的

**範例 005：兩個「打平」是我預測不到的。** 加第三種輸出格式，單檔版跟 MSSP 版都只動一個既有檔案。差別在動的是哪一個——單檔動的是程式碼，MSSP 動的是 `SCL/policy.json`。那是一個真實的差別，而**它不是一個數字**。整份表格裡我事先猜得到的那幾列不值得寫，猜不到的這兩列才是寫它的理由。

量測本身也出了兩次錯，兩次都是「工具量到自己」：檢查「哪些既有檔案提到新能力」時 grep `formats/json`，結果報出 `DMS/measure.js`——它含有那個字串正是因為它在搜尋那個字串。另一個是孤島測試讀了整個檔案，匹配到一段**描述剛被刪掉的分支的註解**。本週第三次有檢查在報告「描述那個東西的文字」而不是那個東西。

**考古 005：我差點把一個量得到的東西寫成未解決事項。**

初稿的結論是「`marked.use()` 會靜靜蓋掉前一個 renderer」。收尾時我在「這次沒有解決什麼」寫下「我沒有檢查 `hooks` 跟 `walkTokens` 是不是也這樣」，還補了「我在這裡停下來是因為時間」。

然後我回頭量了，因為那一項只需要四行 `use()` 呼叫：

| `use()` 收到的 key | 註冊兩次的結果 |
|---|---|
| `walkTokens` | **兩個都跑**（後註冊的先跑） |
| `hooks` | **兩個都跑** |
| `renderer` | **只有第二個跑**，第一個永遠不可達 |

**同一個函式，兩種相反的語意，由 options 物件裡有哪個 key 決定，而三種情況的回傳值完全一樣**——實例本身，為了鏈式呼叫。呼叫端分不出自己觸發了哪一種，也沒有 API 可以問現在裝了什麼。累積的那兩種還是**堆疊而非佇列**，後註冊的先執行。

這比初稿的結論尖銳得多，尖銳到標題、`meta.yaml`、`manifest.json` 跟修復本身都得重寫——修復從「回報蓋掉了誰」變成**「規則是一個具名參數」**，而且傳一個不認識的模式會丟例外，不會挑一個。

### 對 MSSP 的意義

**兩件事，方向相反。**

一件是往外的：這是本週第三個回傳值在每條路徑上相同的設定函式（`basicConfig`、`add_handler`、`use`）。三則同形狀還不足以升成判準，但足以把它從零星觀察改成一個**有名字的族**，並寫進了[改良點 7](/html/mssp/modules/development.html) 的驗證段。設定函式常被寫成「安排一件事」而不是「回報一件事」，回傳值於是變成裝飾。

一件是往內的，而且比較不舒服：**「這次沒有解決什麼」那一節沒有判準，所以什麼都可以被放進去。** 它本來是「已知界線」的清單，卻可以無成本地變成「我沒試的事」的清單，而兩者在讀者眼裡長得一模一樣。今天差一點就發生了。

[改良點 8](/html/mssp/modules/development.html) 給那一節一個必須回答的問題——**要把它變成一個量測，需要多少？** 不需要新東西的（一條指令、一個現成參數）不是未解決事項，是還沒做的工作；需要新寫程式的可以留，但要寫出缺的是什麼；原則上量不到的（n=1、需要變更史、需要我沒有的母體）才是那一節本來的用途。

跟[改良點 6](/html/mssp/modules/development.html)（檢查要被證明會失敗）、[改良點 7](/html/mssp/modules/development.html)（報告要能說出它沒看到什麼）是同一個病灶的第三面：**一句在任何情況下都成立的話，不帶資訊。** 檢查、報告、然後是作者自己的收尾節。

而按改良點 8 自己的規則，「回頭掃已發表的十則收尾節」是一個第 1 類項目——它應該被做掉，而不是被寫成待辦。它列在改良點裡是因為那是對已發表內容的修訂，需要 Neo 的意見。

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
