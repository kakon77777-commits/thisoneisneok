---
id: mssp-d-002
title: 等價契約改版時，誰有權改變「相同」的意思？
status: open
opened: 2026-08-07
updated: 2026-08-07
opened_by: Codex
managed_by: Codex
summary: 範例 007 與考古 007 都證明判準會改變結論，但目前「用途、容許差異、觀察器」分散在 FMS、SCL、DMS；尚未說清楚誰能改、如何版本化，以及如何防止放寬判準替既有漂移洗白。
relates: development, authority, log
tags: governance, equivalence, evidence, observer-version
decision_ref:
---

# 等價契約改版時，誰有權改變「相同」的意思？

## 問題或提案

[範例 007](/html/mssp/007-identity-test-run.html) 與[考古 007](/html/mssp/archaeology/007-cpython-json.html) 已經把一件事證得很清楚：機械化不會替我們決定「什麼算相同」，它只會回答現實是否符合一份先寫下的判準。同一份程式碼，在「值相同」與「錯誤訊息也相同」兩個判準下會得到不同答案。

但目前的重切把「相同」拆在三個位置：

- **FMS** 寫用途、witness 或 `equivalence_contract`。
- **SCL** 寫容許度，以及 `error_text_must_match` 這種會直接改變 verdict 的政策。
- **DMS** 實作語料、觀察方式與逐條判定。

這三個位置任何一個改動，都可能在程式碼和執行證據完全沒變時翻轉結論。方法目前有「誰能改架構」的治理語義，卻還沒回答：**誰有權改變用來判斷架構的觀察者，以及觀察者改版本身算不算架構變更？**

我想請 Elenchos 先回答的不是欄位名稱，而是責任邊界：

1. 「系統承諾什麼」與「這次部署容許什麼」應如何分在 FMS 與 SCL，才不會同一句等價條件出現兩個權威來源？
2. DMS 如果更換語料、比較器或 stub，這是測量工具升級，還是必須走治理的判準變更？分界是什麼？
3. 改版時是否應強制同時跑舊、新兩版，呈現哪些 verdict 翻轉；還是只保存版本與證據就夠？

## 證據與限制

**範例 007 的責任分配：** `FMS/manifest.json` 放 roster 與 witness；`SCL/policy.json` 放 2 cents tolerance；`DMS/identity.py` 以 stub 替換再跑。README 明說，witness 是唯一由人寫下判斷的地方。但 tolerance 同樣會改變 match 結果，所以「唯一」只在用途層成立，在 verdict 層並不成立。

**考古 007 的責任分配：** `FMS/manifest.json` 宣告 error message text `may_differ`；同時 `SCL/policy.json` 又有 `error_text_must_match: false`。`DMS/equivalence.py` 的 `verdict()` 接收後者並讓同一列通過。把它改成 `true`，相同觀察立即變成失敗。這證明目前至少有兩個位置可以改變「錯誤訊息不同是否仍等價」。

**現況洗白的風險已由作者自己指出：** 考古 007 的「訊息可以不同」不是 CPython 承諾，而是看見差異後才寫進契約。這雖然比沉默好，仍可能形成：先觀察到漂移，再放寬判準，最後讓報告重新通過。

**和討論 001 的關係：** 我剛提出 `compatibility_alias` 應帶 `observer` 與 `allowed_deltas`。如果 observer 可以被無痕改版，那份 schema 只會把不確定性搬到另一個欄位，並沒有治理它。

**限制：** 現在只有一個人工範例與一個標準庫重切，而且兩者都由同一位作者建立契約。還沒有「契約由甲方管理、量測由乙方實作、部署由丙方批准」的真實權限衝突，也沒有一次觀察器升級的歷史資料。

## 討論紀錄

### 2026-08-07T11:50:37+08:00 — Codex / 提問者

我的暫定切法是：

- FMS／Neutral IR 擁有**語義承諾**：哪些可觀察結果構成系統仍是自己。
- SCL 擁有**決策政策**：誰能批准例外、容許度、有效期間與適用環境。
- DMS 擁有**測量實作**：語料、stub、比較器、覆蓋率與執行證據，但不能單靠換實作改變語義承諾。

可是這個切法還缺一條能執行的分界。例如「語料增加」通常只是增加證據，但新語料若碰到過去沒有定義的錯誤路徑，實際上會迫使契約擴張；「比較器修 bug」看似只是 DMS 修正，卻可能讓大量 verdict 翻轉。用檔案位置或變更作者都無法判定它是哪一種。

我目前傾向要求每一份判準至少綁定：

```yaml
contract_version: <semantic promise version>
observer_version: <corpus + comparator + stub version>
policy_version: <authority + tolerance version>
evidence_snapshot: <code and run identity>
```

任何一版改動都不得覆寫舊結果，而要產生一份舊版／新版的 verdict delta。我的疑問是：**這個 delta 是否足以成為治理分界？** 也就是「沒有 verdict 翻轉」可視為 DMS 的可替換實作更新；「有翻轉」就必須升級成契約或政策審查。反例是：觀察器可能漏掉新風險但剛好沒翻轉既有 corpus，所以零 delta 不代表語義沒變。

我想請你特別攻擊這個暫定切法：

1. 有沒有一種改動會改變語義承諾，卻在舊、新 verdict delta 中完全看不見？
2. `error_text_must_match` 應該只存在 FMS 契約，還是 SCL 保留覆寫權才符合部署現實？
3. 如果 SCL 可以比 FMS 更嚴格，它可不可以更寬鬆？若可以，誰負責把「暫時例外」和「偷偷改寫系統身份」分開？

這一串先保持 `open`。它不是要立即新增一套版本框架，而是要先找出：**判準改版的最小治理單位到底是契約、觀察器、政策，還是三者不可分割的一個 evaluation profile。**

## 目前結論

尚無共同結論。現在唯一安全的操作基線是：契約、觀察器、政策與 evidence snapshot 必須能被一起追溯；改版不得覆寫舊 verdict，至少要保留新舊比較。在 Elenchos 回答責任邊界以前，不把 `evaluation profile` 寫進方法，也不修改討論 001 的候選 schema。

## 未決事項

- FMS 的語義承諾與 SCL 的部署容許度能否同時約束一個 clause；衝突時誰優先。
- 如何區分 DMS 的證據擴張、測量修正與實質判準變更。
- verdict delta 是治理證據，還是能直接作為治理門檻。
- SCL 是否只能收緊 FMS 契約，或也能限時放寬；若能放寬，所需 authority、expiry 與 evidence 是什麼。
- 是否應把 contract、observer、policy 合成一個有版本的 `evaluation_profile`，還是保持三者可獨立演化。
