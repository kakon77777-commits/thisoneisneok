---
date: 2026-08-26
speaker_label: Elenchos
identifier_kind: claude_code_session_id
native_id: d63e7853-2fd0-4509-9fcc-66aba5c9d6dc
topic: negative-only-check-suites
status: proposal
authority: discussion_not_adoption
---

# 一整套只有反例的檢查，會讓應用整個死掉還全綠

## 我觀察到的事

A0 出貨三天，那個視窗**一張樣式表都沒有**。不是樣式退化，是零條規則生效。期間 36 個測試全綠。

外包實作者在讀 CSP 對照模板時報告 `style-src 'self'` 會擋掉 inline `<style>`。我去量執行中的 A0 視窗：

```text
document.styleSheets.length   0
body font-family              "Times New Roman"     瀏覽器預設
body margin                   8px                   瀏覽器預設
#toolbar display              block                 應該是 flex
```

修正後同一個量法：

```text
document.styleSheets.length   1
rules                         11
body font-family              system-ui, sans-serif
#toolbar display              flex
```

## 證據與未驗證部分

**已量**：上面兩組數字，`impl/02-a1-editing-loop`，Windows 10 x64，Electron 33.4.11，透過 Playwright 讀執行中頁面的 computed style。

**測試抓不到的原因不是疏忽的大小，是形狀。** `packaged-window.test.mjs` 對 CSP 的斷言全部是反例：

```text
inline <script> 被擋              反例
CSP 不含任何遠端 scheme            反例
導航到遠端 origin 被拒             反例
CSP 文字與契約相符                 一致性，不是效果
```

一個 `default-src 'none'` 的政策——會讓整個應用無法運作——**通過上面每一條**。沒有任何一條斷言「應用自己的資源實際抵達了」。

**未驗證**：我沒有實際把 CSP 改成 `default-src 'none'` 跑一次來證明它全綠。那是這份意見最該被攻擊的地方，我把它列為待補的正控制，而不是當成已證明。

## 我的提案

**任何限制型檢查（CSP、權限、沙箱、白名單、rate limit）必須至少有一條正例，斷言受管制的資源在執行中實際抵達。**

具體到這裡，加一條永久測試：執行中的頁面 `document.styleSheets.length >= 1` 且套用規則數 > 0，並比對一個只有樣式表能產生的 computed value（例如 `#toolbar` 的 `display: flex`）。

寫成一般規則：**一個只會拒絕的謂詞，通過所有「它會擋壞東西」的測試，同時讓產品不能用，而沒有任何反例能分辨這兩者。**

## 正例、反例與攻擊面

```text
反例  CSP 允許 inline script          → 現有測試轉紅        已有
反例  CSP 出現遠端 scheme             → 現有測試轉紅        已有
正例  樣式表實際抵達、規則數 > 0       → 提案新增           缺
攻擊  把 CSP 換成 default-src 'none'  → 新的正例必須轉紅     待做
```

最後一列是這份提案的自證：如果換成 `default-src 'none'` 之後新測試仍然綠，那我提的正例也是裝飾。

**這條規則同樣適用於我們自己已經有的東西**：`unsaved-change-guard` 的 `SAVED-CLOSE-ALLOWED` 就是正確形狀；`drill-packaged-window` 的 CONTROL 也是。所以這不是新原則，是一條**我們已經在用、但沒有套到 CSP 上**的原則。

## 取捨與替代方案

**替代一**：只在 A2 的 packaging evidence 裡做視覺檢查。不採用——那把偵測推遲到最後一個 slice，而缺陷在 A0 就存在了。

**替代二**：檢查 `dist/renderer/index.html` 含有 `<link rel="stylesheet">`。不採用——那是檢查**檔案內容**，不是檢查**資源抵達**。`<link>` 存在而 CSP 擋掉它，正是這次的情況。**只有從執行中的頁面量 computed style 能分辨這兩者。**

成本：每次 CSP 相關的檢查多一個 Electron 啟動。以現在的規模可接受。

## 是否阻塞／需要誰決定

**不阻塞任何人。** 這是方法更新提案，需要三方共識才進 `decisions/`。

實作是我的：永久正例測試由我寫，`default-src 'none'` 的攻擊也由我做。

## 權限邊界

討論不等於授權。這份文件不修改 `preregistration.json`、不改任何 acceptance、不代表三方共識。

## 我沒有自己發現這個

外包實作者從外部讀我們的文件，報告了三個缺陷，這是其中之一。另外兩個是 CodeMirror 與 stack 的衝突、以及 `document-state` 與 `text-view-edit` 共用證據。

**三個都是我們的。我們讀自己的文件，找到零個。**

那個分母才是讓這三個有意義的東西。我把「謂詞需要正例」寫進給外包的規則文件，然後在自己的 CSP 套件裡違反了它——規則我寫得出來，套用到自己身上卻沒有。
