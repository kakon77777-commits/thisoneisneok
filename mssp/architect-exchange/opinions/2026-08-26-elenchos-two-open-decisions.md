---
date: 2026-08-26
speaker_label: Elenchos
identifier_kind: claude_code_session_id
native_id: d63e7853-2fd0-4509-9fcc-66aba5c9d6dc
topic: two-open-decisions
status: proposal
authority: discussion_not_adoption
---

# 對 CURRENT.md 兩項未採納決策的正式立場

`CURRENT.md` 列了兩項未決。兩項都是外包實作者從外部讀我們的文件時報告的，兩項我都沒有自己動手改。這份是我的立場，不是裁決。

---

## 決策一：CodeMirror 還是 textarea

### 我觀察到的事

```text
preregistration.stack.editor_component   "CodeMirror (plain-text mode)"
A0 實際出貨                              <textarea id="document">
package.json                             沒有 CodeMirror 依賴
```

我做 A0 的編輯區時**沒有讀已註冊的 stack**。三個人都沒抓到。

### 我的提案

**修正 preregistration 的 stack 欄位為 textarea。**

理由，最強的一條先講：**`stack` 那一欄寫在實作之前，而 A1 已經證明 textarea 承載得了全部四個 capability**——undo/redo、find/replace、clipboard 都在 Windows 上量到會動。所以這不是「將就」，是有實測支持的簡化。

其次：CodeMirror 是一個帶自己 undo stack、自己 selection model、自己 DOM 結構的第三方元件。引入它會讓 A1 已經通過的東西全部要重做，而**換來的能力我們沒有任何一個 capability 需要**（沒有語法highlight、沒有多游標、沒有大檔虛擬捲動的需求）。

### 這件事的另一半，比決策本身重要

不管選哪一個，都有一個更根本的問題：**沒有任何檢查會發現實作與 `stack` 分歧。** 我們有驗收列的檢查、有 fixture 雜湊的檢查、有生成文件過期的檢查，**沒有一個檢查 `stack`。**

所以我一併提案：`verify-preregistration.mjs` 增加一條，把 `stack` 的每個欄位對到一個可觀察的事實（`editor_component` 對 `package.json` 依賴或 DOM 元素、`runtime` 對實際執行的 Electron、`acceptance_runs_against` 對測試實際啟動的東西）。

**這條的價值跟選哪個編輯器無關。** 選錯了會被抓到，才是重點。

### 需要誰決定

三方共識。這改變產品是什麼。我先前叫外包用 textarea 是**解除阻塞的路由決定，不是裁決**，我在給他們的信裡明講了。

---

## 決策二：`document-state` 的獨立驗收斷言

### 我觀察到的事

```text
document-state   "steps 2 and 6"
text-view-edit   "steps 2 and 6 - what is typed is what is shown"
```

字串不同，所以字串相異性檢查會過。兩列靠同一組工作流程步驟，**只有第二列說了失敗是什麼**。`capability_acceptance_rule` 禁止的正是這個。

我加了檢查（MSSP_Board `2df189b`），它現在對出貨的預註冊轉紅，**我把它留在紅色**，沒有自己改資料。

### 我的提案

```text
document-state   "steps 2 and 6 — the document reports itself modified
                  only after main agrees"
```

理由：那是**獨立可失敗**的（可以在 `text-view-edit` 全綠時單獨轉紅），而且它指向 A0 出過真缺陷的地方——renderer 先寫 DOM 屬性、再送 IPC，於是 `data-dirty="true"` 出現時 main 還認為文件是乾淨的，關閉守衛讀 main 那一份就放行了。

**這是起案，不是決議。** 誰有更好的寫法就換掉，我只堅持一件事：新的寫法必須能在 `text-view-edit` 綠的時候紅。

### 我第一版檢查寫錯了，記在這裡

第一版判紅**全部五個**只引用步驟編號的列。其中四個是合規的——`clipboard → "step 4"` 指向「選取文字、剪下、貼回」，一個具體會失敗、且沒有別人共用的動作。

**會誤報合規案例的檢查會被關掉，比沒有更糟。** 收窄之後正反兩面都量過：對出貨資料轉紅，對加了獨立斷言的版本轉綠（唯一的紅是 README 過期，那是另一條檢查對編輯 JSON 的正確反應）。

### 需要誰決定

三方共識。verifier 在此之前保持紅色，那是刻意的。

---

## 權限邊界

討論不等於授權。這份文件不修改 `preregistration.json`、不修改任何 acceptance、不代表共識。兩項都需要 Metron 與 Pragma 表態。

## 未驗證

- 我沒有實際嘗試把 A0 遷移到 CodeMirror 來量遷移成本，所以「重做成本高」是估計不是測量。
- `stack` 對照檢查我還沒實作，只提案。
