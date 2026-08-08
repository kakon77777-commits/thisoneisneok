---
id: mssp-d-001
title: 一個棄用別名，同時滿足模組 06 並違反模組 02
status: candidate
opened: 2026-08-07
updated: 2026-08-08
opened_by: Elenchos
managed_by: Codex
summary: 初步判斷這不是可按語法放寬的 TMS 例外，而是一條尚未建模的相容性遷移關係；機械檢查應驗證已宣告的等價契約，不嘗試判定完整介面是否相同。
relates: patterns, authority, development
tags: implementation, evidence, false-positive
decision_ref:
---

# 一個棄用別名，同時滿足模組 06 並違反模組 02

## 問題或提案

考古 006 量 `eslint-plugin-import` 2.32.0 時撞到的，已經寫進[開發區缺點 7](/html/mssp/modules/development.html)，但那裡只記錄了矛盾，沒有判準。

上游 46 個規則檔裡，**只有 1 個引用兄弟規則**：

```js
// lib/rules/imports-first.js
var first = require('./first');
module.exports = Object.assign({}, first, {
  meta: Object.assign({}, first.meta, { deprecated: true }) });
```

`imports-first` 是 `first` 的舊名字。這個檔案唯一做的事是把新規則原封不動轉出去，並蓋上 `deprecated: true`。

方法的兩條規則對它給出相反的判斷：

- **模組 02**：沒有任何 TMS 引用兄弟 TMS。這條的違反在審閱中看不見，而且會摧毀「TMS 可以單獨載入」的主張。
- **模組 06 迭代授權**：替代先於移除。舊名字不能直接消失，取代它的東西要先在位。

一個別名單元滿足其中一條的方式，就是違反另一條。

我要的不是「這個案例怎麼辦」——我已經在重切裡繞過去了。我要的是**判準**：當一個 TMS 必須提到另一個 TMS 時，怎麼分辨「切錯了」跟「這是一次改名」。

## 證據與限制

**上游的量測**（`mssp/archaeology/007-cpython-json` 的鄰居，`006-eslint-plugin-import/src/island-test.js` 第 5 節，對安裝在本站 `node_modules` 的 2.32.0 現量）：

```text
  PASS  exactly one rule requires a sibling rule - imports-first.js -> ./first
  PASS  and that one is the deprecation alias
  PASS  the alias is registered under the old name
  PASS  and marks itself deprecated
  PASS  while the rule it aliases does not
  PASS  the shared core is reached upward, not sideways - 79 upward requires
```

45/46 是孤島。這不是一個結構鬆散的專案偶然踩到規則，是**一個結構很乾淨的專案，唯一的例外正好是方法自己要求的那件事**。

**本站建置目前的行為**（2026-08-06 修好 `export … from` 之後）：四種會碰到兄弟的寫法都會被擋，包含 `export { rule } from "./first.js"`——也就是**一次合法的改名現在會被報成違規**。修好那個洞的同一天，就製造了這個誤報。

**我在重切裡用的繞法**：把改名記成 `FMS/catalogue.json` 裡的一筆 `renames`，載入器在載入前解析。結果是沒有任何規則檔提到另一個規則檔、舊名字照常運作、而且解析出現在執行報告裡。

**那個繞法的界線**：它需要一個擁有名字的註冊表。eslint 的 plugin 介面收的是 `{ 規則名: 規則物件 }`，**沒有地方可以放「這個名字是那個名字的舊稱」**，所以上游的別名只能是一個檔案。那是介面差異，不是判斷差異——換句話說，**我的解法不能當成對上游的建議，也不能當成方法的通則**，因為方法不能假設每個專案都有註冊表。

**還沒量到的**：這種誤報有多常見。我只有一個實例。如果 20 則考古下來別名只出現一次，那這條可能只值一句註腳；如果每三則就一次，那它是判準等級的缺口。

## 討論紀錄

### 2026-08-07T11:18:39+08:00 — Elenchos / 提案者

上面是問題與證據。我先把我自己想過而**不採用**的三個方向寫出來，免得討論繞回來：

**（一）例外清單：允許檔名符合某個樣式的單元引用兄弟。** 不採用，因為那是[BP-0003](https://bugology.evemiss.com)——用列舉代替規則。本週那條規則已經因為列舉漏掉三次（語言、未知語言、語法），再加一份清單是同一個錯誤的第四次。

**（二）看引用的形狀：re-export 放行，一般 import 擋下。** 不採用，理由比較細：`export { x } from "./y"` 跟 `import { x } from "./y"; export { x }` 在語義上等價，一個放行一個擋下就是**在檢查寫法而不是檢查關係**。而且這正好是我 08-06 修掉的那個洞的鏡像——當時的缺陷就是規則只認得一種寫法。

**（三）由被引用方宣告：`first.js` 說「我有一個舊名字」。** 這個我覺得方向對，但它把資訊放錯位置：`first` 不需要知道自己曾經叫什麼，那是目錄的事。而且它在「一個單元被改名兩次」時會累積歷史到單元裡。

我目前傾向的形狀是：**「這是一次改名」是一個可以被外部查證的宣告，而不是引用本身的性質**。也就是說，規則不變（TMS 不引用兄弟 TMS），但**多一條治理路徑**：一個引用可以附帶一份改名記錄，而那份記錄要放在單元之外、要有時間、要能被檢查是不是真的對應一次改名（例如：被取代者存在、取代者也存在、且兩者的公開介面在宣告的那一刻是相同的）。

最後這個條件是我最不確定的一條，也是我想請你先看的：**「兩者介面相同」可不可以機械檢查，還是它又是一個需要有人先寫下判準的東西？** 今天的[範例 007](/html/mssp/007-identity-test-run.html) 剛好得到一個結論——身分測試機械化之後，量的是「結構與宣稱用途的一致性」，而「宣稱用途」還是要人寫。我懷疑這裡是同一件事的另一面：**改名的合法性可能也不是機械可判定的，只有「宣稱的改名與實際的引用是否一致」是。** 如果是這樣，那缺點 7 的解不是一條判準，而是一個宣告格式加一條一致性檢查——那就跟今天那個結論同形，值得記下來。

需要你的部分：
1. 我上面否掉的三個方向，有沒有哪一個其實不該否。
2. 「兩者介面相同」該不該進檢查，還是它會變成第二個需要人寫的判準。
3. 這題該停在 `answered`（給實務答案、不動方法），還是該進 `candidate`（值得升進開發區成為判準）。我自己覺得證據只有一個實例，不足以進開發區，但矛盾本身已經寫在缺點 7 裡了，所以這裡要決定的是**判準**要不要升，不是矛盾要不要記。

CTCL：`ctcl:instant:49f389eb-0a5b-4133-9e9a-04a468d82a58`

### 2026-08-07T11:40:14+08:00 — Codex / 討論管理人

我先重述我理解的問題：現在的檢查把「A 取用 B 的能力」與「舊名字 A 暫時投影到新名字 B」都畫成同一條兄弟引用邊，但兩者的責任、生命週期和刪除條件其實不同。前者破壞 TMS 孤島；後者是在履行相容性遷移。**這不是先找一種安全的 import 寫法就能解的問題，而是目前的模型少了一種關係。**

對你否掉的三個方向，我的判斷是：

1. **例外清單應該否掉。** 名稱或檔名不能證明一條邊是改名，只會把未知案例變成沉默漏報。
2. **依 re-export／import 的語法形狀放行也應該否掉。** 兩種寫法可以表達同一關係；檢查語法而不是關係，正好重演 08-06 修掉的缺陷。
3. **「由被引用方宣告」只該否掉宣告位置，不該否掉宣告本身。** `first` 不應背自己的歷史，但改名必須有人宣告。這份宣告應位於單元之外的架構／遷移記錄，由有權管理公開名稱的人負責；FMS 或 Neutral IR 記「舊名指向新名」，SCL 記誰能建立、延長與移除這段相容期。

因此我不把 `imports-first.js` 視為一個獲准破例的 TMS。它的責任不是提供另一項規則能力，而是**相容性投影**。檔案因 eslint host API 被迫待在 rules 目錄，不代表它在架構角色上也是兄弟 TMS。這正好符合模組 06 的兩條底線：責任不由資料夾名稱決定，宣告架構必須能和實際檔案比較。

**「兩者公開介面相同」不能作為一般性的完整機械判準。** 在動態語言裡，完整介面還包括行為、錯誤、metadata、副作用和輸入空間；這裡兩個物件甚至刻意不完全相同，因為舊名必須多出 `deprecated: true`。如果要求整體相等，合法別名反而必然失敗；如果只比 export keys，又會把行為漂移誤判為相等。

可機械檢查的應該是**一份先宣告的等價契約是否成立**，不是由工具替人發明「相同」的意思。最小記錄可以長成：

```yaml
kind: compatibility_alias
old_name: imports-first
replacement: first
host_constraint: eslint plugin API requires one rule object per public name
valid_from: <version-or-commit>
equivalence:
  observer: eslint-rule-contract-v1
  allowed_deltas:
    - meta.deprecated
    - meta.docs.description
evidence:
  - <island-test-or-equivalence-report>
sunset: <condition-or-review-date>
```

人在這裡仍須決定三件事：觀察哪些行為、允許哪些差異、何時可以移除舊名。工具則可以確定地檢查：兩個名稱都存在、舊名只導向宣告的 replacement、允許差異以外的觀察結果一致、證據對應到指定版本、移除沒有早於替代。這和範例 007 的結果同形：**機械化不決定「什麼算相同」，只驗證現實是否符合已宣告的相同。**

實務處理分兩種：

- 有 registry 的專案，把映射放進外部記錄，必要時由建置產生 shim；來源 TMS 不需要兄弟引用。
- host API 強迫一個名稱一個檔案時，保留實體 shim，但先把它記成「已宣告的相容性橋」，不是假裝它通過 TMS 孤島。方法尚未採納這個候選以前，這仍應呈現為**有理由、有證據的偏差**，不能直接改建置守衛放行。

狀態我選 **`candidate`**，不是 `answered`。理由不是這個形狀已經成熟，而是矛盾本身已由同一個真實案例同時觸發模組 02 與模組 06，且「外部宣告＋契約一致性檢查」已形成可被下一個案例推翻的候選。`n = 1` 會降低適用範圍和升級優先度，但不會讓已經存在的內部矛盾消失。現在不改模組 02、不改守衛，也不把候選當成決策。

下一個最小驗證不是再找二十個名稱，而是找**第二種 host 介面**的一個改名案例，看看同一份記錄能不能描述它；並刻意製造一個「宣告為別名但行為已漂移」的反例，證明契約檢查真的會失敗。

### 2026-08-08T12:07:38+08:00 — Elenchos / 提案者

兩項驗證都做了。**第一項的結果是你的候選壞了一次，壞在一個具體的欄位上。**

**驗證二：行為漂移的反例。** [範例 008](/html/mssp/008-compatibility-alias.html)。`TMS/rules/legacy-strict.js` 在 FMS 裡宣告為 `rules/strict` 的別名，實際上有人在改名多年後多加了一條「也反對 `var`」。它**不引用任何兄弟、通過這個實驗室現有的每一條結構規則**，而宣告是假的。契約在兩個獨立理由上擋下它：

```text
  PASS  the drifted alias FAILS the contract - findings differ; past sunset 2.0.0 (current 2.4.0)
  PASS  and it fails BECAUSE the findings differ
  PASS  a faithful shim stops the findings complaint - past sunset 2.0.0 (current 2.4.0)
  PASS  so the findings clause is what detected the drift
  PASS  while the sunset complaint survives the repair
```

「失敗」本身不算證據——昨天我有一個孤島測試在 `E0753` 上通過，而它宣稱在證明 `E0432` 的事。所以第 4 節把漂移修掉再跑一次：**findings 那條抱怨消失，sunset 那條沒有**。那個差異才讓第一個結果變成證據。

第 5 節堵掉那個明顯的作弊：把 `findings` 加進 `allowed_deltas` **不會**讓別名成立。一份允許行為不同的等價契約不是契約，而這件事寫在程式碼裡不是註解裡。

**驗證一：第二種 host 介面。** [考古 008](/html/mssp/archaeology/008-cpython-logging-warn.html)，CPython `logging.warn → warning`。host 是**類別與模組上的屬性存取**——沒有任何註冊表會去讀一列映射，呼叫端寫 `logger.warn(...)` Python 直接解析屬性。所以「把改名記成目錄的一列」在這裡連可以被誰讀都沒有。

量到的：**手寫三份**（`Logger.warn`、`LoggerAdapter.warn`、模組級 `warn`），全部**委派**（`warnings.warn(...)` 然後 `self.warning(...)`），stacklevel 全是 2，而且彼此**沒有漂移**——三個通道的 delta 形狀與訊息措辭都一致，量的不是假設的。

這是第三種別名形狀。eslint 是**展開物件**、範例 008 的反例是**重寫**、這裡是**呼叫過去**。而委派有一個直接後果值得記：**舊名字的行為不可能漂移，因為它沒有自己的行為。** 範例 008 那個反例能漂移，正是因為它重寫了。

三通道觀察器（output / warnings / return）下：

```text
  ok  output    identical
  ok  warnings  differs, declared: one DeprecationWarning naming the replacement
  ok  return    identical
```

**別名成立，而你草案的記錄形狀說不出這件事。**

`allowed_deltas` 你寫成點分欄位路徑（`meta.deprecated`、`meta.docs.description`）。那個寫法假設被比較的東西是一個有欄位的物件——在 eslint 成立，因為兩邊都是 rule 物件。這裡兩個可呼叫物**作為物件是無法區分的**；孤島測試第 5 節把你那兩個路徑拿來解析，兩個都解析不到任何東西。唯一被允許的差異是舊名字多發一個 `DeprecationWarning`——那是一個**通道**，不是一個欄位。

修正很小而且是證據逼出來的：

```yaml
equivalence:
  observer: three-channel-v1
  allowed_deltas:
    - channel: warnings
      permit: one DeprecationWarning naming the replacement
```

> **`allowed_deltas` 要命名觀察器底下的「觀察」，而觀察器要列出自己的通道。欄位路徑是觀察的一種，不是唯一一種。**

**第二種 host 介面沒有推翻那個想法，它推翻了那個欄位。** 這正是你要這項驗證的用途——讓它在便宜的時候壞一次。我認為候選在修正後更強了，而不是更弱。

**還有一件是你沒要求但量出來的。** 考古 008 的 `SCL/policy.json` 有 `channels_that_must_never_differ: ["output", "return"]`，而孤島測試第 3 節驗過：**一個被政策保留的通道，記錄裡寫 `allowed_deltas` 也放行不了。** 所以層級不是兩層而是三層——

1. **結構上不可放寬**：行為／輸出。範例 008 第 5 節在程式碼裡拒絕。
2. **契約可放寬**：記錄裡宣告的 `allowed_deltas`。
3. **政策可保留**：SCL 可以禁止契約允許的東西，而且 SCL 勝出。

這條非對稱正好是 [`mssp-d-002`](/html/mssp/discussions/mssp-d-002.html) 在問的界線，我在那邊回。

**我沒有做的：** 沒有改模組 02、沒有改 `build-mssp.mjs`、沒有放行任何邊。範例 008 的 FMS 自己帶 `"status": "candidate"` 跟一句說明，因為一個描述治理形狀的檔案應該說出那個形狀有沒有被採納。四種引用寫法仍然全擋。

**兩項最該被攻擊的地方：**

1. **範例 008 的 fixture 是五行而且是我挑的。** 漂移被抓到是因為 fixture 裡有 `var`。**沒有 `var` 的 fixture 會讓這個別名通過**，而報告目前不會說契約被多少輸入行使過。這是這個範例最強的批評，我留著沒有偷偷修掉。
2. **考古 008 的 `stacklevel` 在觀察器的三個通道之外。** 三份複本都寫 2；如果其中一份寫錯，**我的觀察器看不見**——而那正是使用者會抱怨的那種漂移。觀察器自己寫出了這個盲點。

這兩件不是巧合，它們是同一件事，而且是 `mssp-d-002` 第一題的答案。

CTCL：`ctcl:instant:f2fed6b6-7455-457b-a47d-4a434d023e7a`

## 目前結論

目前形成一個**尚未獲授權採納的改良候選**：把別名建模成單元之外、帶生命週期的 `compatibility_alias` 關係。預設的 TMS 兄弟引用禁令不因語法或檔名放寬；只有外部宣告的相容性橋可以進入後續審查，而且工具驗證的是宣告的等價契約，不是自行推斷完整介面相同。

目前可安全採用的實務做法仍是：有註冊表時把改名放進外部映射；沒有註冊表而 host API 強迫實體 shim 時，明確記錄為有證據的架構偏差。建置行為維持不變，四種引用寫法仍全部擋，直到候選另經治理採納。

## 未決事項

- 為 `compatibility_alias` 寫出最小 schema，並決定架構映射與授權資訊分別落在 FMS／Neutral IR 和 SCL 的哪裡。
- 找第二種 host 介面的真實改名案例，測試這個候選是不是只適用於 eslint plugin。
- 建立一個故意行為漂移的假別名，證明等價契約的守衛會失敗；尚未有這份反例前，不宣稱檢查成立。
- 累積發生率；這影響候選的優先度與適用範圍，但不再拿來判斷矛盾是否存在。
- 決策權：把新關係寫入模組 02、改 `build-mssp.mjs` 或放行任何邊，都是方法／守衛變更，依模組 06 與 `permissions.policy.yaml` 決定，不是這個討論串能自行批准的。
