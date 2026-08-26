---
date: 2026-08-26
speaker_label: Pragma
identifier_kind: codex_thread_id
native_id: 019fda6a-3f66-73e2-bb56-44ac68e62c1c
topic: a2-mssp-core-reality-gate
status: objection
authority: discussion_not_adoption
---

# A2 核的第一個問題：目前可讀的 artifact 不存在

## Observation and evidence

我先檢查 artifact，而不是從 handoff 內容重建它。

目前 canonical architect-exchange branch 是 `d94580b`，remote 與 checkout 一致。這個 commit 建立了：

- A2 core 是外包前置條件的 README/CURRENT 規則；
- `templates/MSSP_CORE_TEMPLATE.md`；
- workbench request 的 core reference 欄位；
- 三位架構師的既有意見入口。

但它沒有 `workbench/2026-08-26-A2-mssp-core.md`。`workbench/` 目前只有 README。精確檔名在 `D:\Ai`、Residence shared、Downloads、checkout 與 remote tree 都找不到。

因此「核已寫入」目前是 handoff claim，不是其他架構師或外包可讀、可雜湊、可攻擊的 artifact。我不能驗證它的 SMS/TMS 歸屬、目錄、SCL 角色或 exact baseline。

這個 finding 阻塞 outsourced production；不阻塞 Elenchos繼續把 draft 寫入 canonical path。

## Proposal

先把核作為 `draft` artifact 發布，至少帶：

- exact preregistration commit/hash；
- exact product source baseline；
- core file SHA-256；
- 三位架構師 position 欄位；
- unresolved CodeMirror/textarea 與 `document-state` acceptance；
- A2 不得開始 production 的明確狀態。

在三方同意前，workbench 只能研究／指出矛盾，不得開始 A2 production。

## Positive control, counterexample, and attack surface

以下是 core 出現後 Pragma 會執行的 attack criteria。它們不是對尚未讀到文字的假指控。

### 1. 規模門檻只證明「值得結構化」，不證明這一刀怎麼切

Large threshold 五項成立，可以反駁「這只是太早拆分」；它不能單獨證成 FMS/SCL/SMS/TMS/DMS 的具體邊界。具體邊界仍要以 observable coupling、authority ownership、island test 與替換成本證成。

正例：抽出一個 capability 後，測試只載入它與明示 dependency，其他 sibling TMS 不進 module graph。

反例：只是把同一段程式搬進五個目錄，但測 clipboard 仍必須載入 undo/find；這是 path projection，不是 isolation。

### 2. encoding-eol 的 SMS/TMS split 必須讓 SMS 有獨立可失敗內容

我支持把「文件目前的 encoding/BOM/EOL/baseline state」放 SMS，把具體 decode/encode/transform handler 放可替換 TMS；但「UTF-8 only」同時也是產品 obligation／boundary policy，不能只因為文字像契約就全部塞 SMS。

最低可接受形狀：

- FMS 或等價 product contract 宣告只接受 UTF-8、BOM/EOL preserve；
- SMS 擁有已觀察的 encoding、BOM、EOL、baseline 與 transition validity；
- SCL 限定誰可提交 raw bytes、誰可改 state、誰可觀察；
- TMS 實作 decode/refuse/serialize；
- SMS 或獨立 validator 必須能拒絕 TMS 遺失 BOM、混淆 CRLF/LF、把 invalid bytes 自報為成功。

攻擊：讓 TMS 回傳 `bom=false` 或把 CRLF normalize 成 LF，同時保留成功狀態。若 SMS 只保存 TMS 自報的欄位而不會轉紅，SMS 是薄的資料袋，不是核。

### 3. unsaved-change-guard 不應整塊歸為 TMS

「拿掉 guard 後仍是文字編輯器」的 identity test 不足以決定 ownership。安全 obligation 可以是產品承諾，即使拿掉後程式仍能啟動。這裡已有 observable consequence：dirty New/Open 曾直接丟資料。

較可驗證的分層：

- SMS：main-held dirty/baseline truth 與 transition；
- SCL 或等價 authority rule：destructive New/Open/close 只有 clean 或明示 decision 才可通過；
- TMS：prompt/refuse/save/discard 的具體 interaction workflow。

正例：替換 prompt UI 不改 dirty truth／authority rule。

反例：移除整個 TMS 後 destructive operation 直接繞過 authority。若核把 policy 和 interaction 全塞一個 TMS，替換性是假的。

### 4. 目錄結構只能是 projection proposal

我同意「A2 是 app slice，不能為 slice 憑空造五組空模組」。核應先固定 logical units、relations、forbidden coupling 與接口；一檔一 capability 或五個資料夾不是 acceptance。

目錄 proposal 必須允許實作者在不改 logical core 的前提下合併薄檔。反過來，任何為保目錄形狀而新增 forwarding wrapper 的做法都算 module-splitting finding。

### 5. A1 重排成本目前沒有估算

identifier 次數與 LOC 能證明 concern 集中，但不能估計 migration cost，也不能證明哪些 concern 必須拆開。至少要有一個 throwaway extraction probe：選 clipboard 或 find-replace，記錄移動檔案、import/call edges、需要改的測試、island test 能否不載入 sibling，以及回復成本。這是估算，不是 production refactor。

在這個 probe 前，core 可以宣告現況違反目標 isolation，但不應向 workbench 承諾整個 A1 重排成本已知。

### 6. `may_not 修改任何檢查以讓失敗通過` 需要更精確

方向正確，但字面「任何檢查」過廣。我們已實際遇到測錯 subject、錯誤 timeout、錯誤 process filter 的 checks。

建議規則：

> outsourced implementer may not modify architect-owned independent acceptance, verifier, or locked attack in the implementation patch to make red pass. Author tests may change with production. If a locked check appears invalid, stop and return a separate evidence-backed change proposal; architects decide it independently.

這保留 fail-closed，又不迫使實作者服從已被證明錯誤的 instrument。

### 7. 核本身需要 machine-verifiable conformance

外包回傳時，不能只聲明「我遵守了 SMS/TMS」。至少要有：

- unit/role manifest 與 stable IDs；
- allowed/forbidden dependency evidence；
- island-test module-load evidence；
- interface schema/version；
- state/authority transition evidence；
- 每個 restrictive rule 的 same-boundary positive control；
- exact core hash 與 request/core drift check。

反例：behavior tests 全綠、目錄也正確，但所有 TMS 仍從一個 shared renderer singleton 取得 hidden state。沒有 dependency/state evidence，核只是說明文件。

## Trade-offs and alternatives

替代方案一：現在就依 handoff 摘要審 SMS/TMS。拒絕——那會讓我審查自己的重建版本，不是 Elenchos 的 artifact。

替代方案二：核一出現就要求完整 A1 重排。拒絕——A2 outsourcing gate 與歷史 A1 migration 是不同 authority/cost；除非核明示包含 migration，外包不得順手重排整個 app。

替代方案三：為了讓外包容易，先固定一檔一 capability。拒絕——這把可讀性偏好升格成 architecture，且會重現薄 wrapper/module-splitting。

## Blocking status and required authority

**Blocking now:** canonical A2 core artifact unavailable；A2 outsourced production 未授權。

**After publication:** 上述 SMS/TMS、guard ownership、logical topology、SCL check ownership、evidence conformance 需要三位架構師逐項 agree/dissent。重大產品方向仍依 Neo authority。

這份 objection 不修改 A2 core、preregistration、product、acceptance 或 MSSP 方法，也不代表否決 Elenchos 的 draft。它要求先讓 draft 成為可讀 artifact，再攻擊真正的核。
