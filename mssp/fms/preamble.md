# 分散式 FMS：三個分支，一個推導出來的主版

> **live experimental mechanism。** Metron 與 Pragma 在 2026-08-12 審過並提出五點阻擋性反對，五點都成立；在 approval 語義修好之前，**他們不把 `branches/metron.json` 與 `branches/pragma.json` 當成自己的正式立場**，那兩個檔是我建機制時的初始化檔。

Neo 在 2026-08-12 給的方向：**三個 AI 各持一份 FMS，核心相同，各自可以改、可以加；主版是三個都通過的那一版；差異性可以有，但不能全部都改。**

這一頁的表格與數字**全部由 `scripts/build-fms.mjs` 在每次建置時算出來**，不是寫的。這一段以上的散文是人寫的，以下的不是。

## 為什麼主版用算的

一份手寫的主 FMS 會是**第四份宣告**，而它可以同時跟三個分支漂移——那正是這個實驗室從 08-08 追到 08-12 的那個缺陷：[考古 010](/html/mssp/archaeology/010-cpython-pyc-invalidation.html) 的 FMS 斷言了沒被量的事、[範例 011](/html/mssp/011-store-boundary.html) 的 FMS 在程式搬走之後還留著舊的所有權文字而 27 項檢查全綠。

所以主版**不是一份手寫的權威來源**，而發布閘必須重算它。

**這一句我原本寫成「主版在兩次建置之間不存在，它沒有機會過期」，那是錯的**，Metron 指出來：`trunk.generated.json` 是被追蹤的檔案，它存在於兩次建置之間，而且在重建之前可能過期。正確的說法是上面那一句——權威在計算，不在那個檔案。

## 核心為什麼是複製而不是引用

每個分支**自己帶著**核心鍵，建置逐鍵比對。如果分支只是引用核心，它就不可能跟核心不一致，於是「不能全部都改」沒有任何東西驗得了。

這跟[範例 011](/html/mssp/011-store-boundary.html) 的 `units` 對照是同一條原理：一項宣稱只有在兩個地方都存在、而且能被比較的時候，才驗得了。

**但我原本把「完整複製」寫成邏輯必需，那也太滿了。** Metron 指出：分支攜帶一份 pinned core digest／revision acknowledgement 一樣能讓沒跟上的分支失敗。所以完整複製是**一個取捨**——換到獨立可讀性，代價是更新扇出與過期副本的風險——不是唯一可檢查的設計。

把任何一個分支的核心鍵改掉，建置會拒絕發布並指名是誰改了哪一個：

```text
Distributed FMS problems:
  - metron: invariant key "sibling_rule" differs from core.json — changing it needs all three branches and then Neo

Refusing to publish. A branch may add and may differ; it may not quietly move the core.
```

## 三個分支的所有權

`elenchos` 由我寫。`metron` 與 `pragma` **由他們自己寫**——我把它們留在只有核心的狀態，因為替別人寫立場會讓主版繼承一個沒有人採取過的位置。

所以**第一天的主版剛好等於核心**。那不是佔位符。

而且 Metron 與 Pragma 已經指出這裡有一個更深的洞：**內容相同不等於擁有者批准。** `metron.json` 與 `pragma.json` 是我在同一個 commit 裡建立的，三個檔案相同只證明三個檔案相同。目前的機制會把「相同」讀成「三方通過」，那是錯的，而修法是把 `consensus_candidates`（逐項相同的候選）、`attestations`（每位擁有者對具名 claim 的明示接受）與 `effective_trunk`（只由有效 attestation 推導）分開。**尚未實作。**

## 這一版沒有的：從下到上

Neo 同日的第二句是建議而不是指令：**MSSP 的結構性是從上到下的，未來需要加入從下到上的層級。**

目前最接近的東西已經在跑——範例 011 的 `units` 檢查裡，**目錄樹會回話**：FMS 說 TMS 底下有什麼，檔案系統說實際有什麼，兩者不一致就失敗。那是結構第一次由下往上說話，而不是被告知。但它只有一則範例有，其他十一則沒有被檢查過，而那一句寫在[開發區](/html/mssp/modules/development.html)裡而不是省略掉。
