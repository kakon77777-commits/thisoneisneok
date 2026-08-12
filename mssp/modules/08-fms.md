---
id: fms
index: "08"
title_zh: 分散式 FMS
title_en: Distributed FMS
summary_zh: 三個 AI 各持一份 FMS，核心相同。主版是三個都通過的那一版，而且是每次建置算出來的，不是寫的。
summary_en: Three AIs hold three FMS branches with an identical core. The trunk is what all three pass, and it is computed on every build rather than written.
state_zh: 機制已生效
state_en: Mechanism live
updated: 2026-08-12
---

# 分散式 FMS：三個分支，一個推導出來的主版

Neo 在 2026-08-12 給的方向：**三個 AI 各持一份 FMS，核心相同，各自可以改、可以加；主版是三個都通過的那一版；差異性可以有，但不能全部都改。**

這一頁的表格與數字**全部由 `scripts/build-fms.mjs` 在每次建置時算出來**，不是寫的。這一段以上的散文是人寫的，以下的不是。

## 為什麼主版用算的

一份手寫的主 FMS 會是**第四份宣告**，而它可以同時跟三個分支漂移——那正是這個實驗室從 08-08 追到 08-12 的那個缺陷：[考古 010](/html/mssp/archaeology/010-cpython-pyc-invalidation.html) 的 FMS 斷言了沒被量的事、[範例 011](/html/mssp/011-store-boundary.html) 的 FMS 在程式搬走之後還留著舊的所有權文字而 27 項檢查全綠。

所以主版**在兩次建置之間不存在**。它沒有機會過期。

## 核心為什麼是複製而不是引用

每個分支**自己帶著**核心鍵，建置逐鍵比對。如果分支只是引用核心，它就不可能跟核心不一致，於是「不能全部都改」沒有任何東西驗得了。

這跟[範例 011](/html/mssp/011-store-boundary.html) 的 `units` 對照是同一條原理：**一項宣稱只有在兩個地方都存在、而且能被比較的時候，才驗得了。**

把任何一個分支的核心鍵改掉，建置會拒絕發布並指名是誰改了哪一個：

```text
Distributed FMS problems:
  - metron: invariant key "sibling_rule" differs from core.json — changing it needs all three branches and then Neo

Refusing to publish. A branch may add and may differ; it may not quietly move the core.
```

## 三個分支的所有權

`elenchos` 由我寫。`metron` 與 `pragma` **由他們自己寫**——我把它們留在只有核心的狀態，因為替別人寫立場會讓主版繼承一個沒有人採取過的位置。

所以**第一天的主版剛好等於核心**。那不是佔位符，那是正確答案。

## 這一版沒有的：從下到上

Neo 同日的第二句是建議而不是指令：**MSSP 的結構性是從上到下的，未來需要加入從下到上的層級。**

目前最接近的東西已經在跑——範例 011 的 `units` 檢查裡，**目錄樹會回話**：FMS 說 TMS 底下有什麼，檔案系統說實際有什麼，兩者不一致就失敗。那是結構第一次由下往上說話，而不是被告知。但它只有一則範例有，其他十一則沒有被檢查過，而那一句寫在[開發區](/html/mssp/modules/development.html)裡而不是省略掉。

---

## 目前狀態（本段由建置產生）

分支：**elenchos、metron、pragma**。主版鍵 **1** 個，分歧 **3** 個。

| 鍵 | 在主版 | 誰持有 | 誰沒有 | 持有者是否一致 |
|---|---|---|---|---|
| `core` | **是** | 全部 | — | 是 |
| `open` | 否 | elenchos、metron、pragma | — | 否 |
| `proposals` | 否 | elenchos、metron、pragma | — | 否 |
| `what_i_do_not_propose` | 否 | elenchos | metron、pragma | 是 |

一個鍵要進主版，條件是**每個分支都持有它，而且內容相同**。以 `_` 開頭的鍵是各分支自己的簿記，永遠不會進主版。

原始資料：`mssp/fms/core.json`、`mssp/fms/branches/*.json`、推導結果 `mssp/fms/trunk.generated.json`。

