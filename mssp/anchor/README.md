# 虛擬錨點 — 當三方不確定「哪一個 MSSP 更好」的時候，指著什麼

```bash
node mssp/anchor/anchor.mjs
node mssp/anchor/anchor.mjs --json
```

## 為什麼有這個東西

Neo，2026-08-08：

> 1.X 到 2.0 版本。這種小版本。你們隨便改，簡單說，你要是覺得那個更順手。就改。就動。……
> **講實話，如果你不確定。那你可以來一個虛擬錨點或指標。到底是那一個 MSSP 會更好。**

所以不確定的時候，退路不是投票，是**去量**。這是那個可以被指著的東西。

## 它做的第一件事是拒絕變成一個分數

[範例 007](/html/mssp/007-identity-test-run.html) 量到的事情直接決定了這個工具的形狀：六個宣稱是 SMS 的模組，在一句判準下分成四個結構性、兩個不是；把那句判準改寫成也要求計數，**一個模組跨過那條線，而其他五個一動也不動**。

「更好」是相對於一句有人寫下來的話。一個加權總分會把那句話塞進一個沒有人會去吵的係數裡——**而那個吵架正是重點**。

所以：沒有總分、沒有排名，**每一個軸都要寫出它看不見什麼**。一個贏四列輸一列的結構就是輸了一列，那一列重不重要由讀者決定。

## 目前的輸出

```text
  example                 lang       lines  units  worst  ratio  SMS%  sets  enforcement
  001-task-runner         javascript 455    4      94     4.8    34    5     source text match
  002-link-checker        python     642    3      156    4.1    27    5     source text match
  003-record-migration    javascript 543    2      67     8.1    28    5     source text match
  004-router              python     441    2      15     29.4   27    5     source text match
  005-before-after        javascript 401    3      11     36.5   12    5     source text match
  006-compiler-enforced   rust       667    3      40     16.7   13    5     manifest + compiler
  007-identity-test-run   python     470    1      35     13.4   19    5     source text match
  008-compatibility-alias javascript 532    4      30     17.7   27    5     source text match
```

- **worst** — 要使用最貴的那個 TMS 單元，必須載入多少行（跟著本地 import 走）
- **ratio** — 總行數 ÷ worst。這是[範例 005](/html/mssp/005-before-after.html) 拿來當「隔離」證據的那個數字
- **enforcement** — 「不引用兄弟」這條規則實際上由誰保證。[範例 006](/html/mssp/006-compiler-enforced.html) 是目前唯一不靠文字比對的

## 狀態：experimental measurement prototype

Metron 2026-08-08 的審查結論，我接受：**它成功揭露了要量哪些軸，但還不能裁決哪一個 MSSP 結構較好。** 現在不依它採納任何方法變更。

## 第一次執行抓到的是錨點自己的缺陷，而第二次是別人抓到我的

`005` 贏了每一個計分的軸。我的第一反應是「所有軸都只是在追大小」，於是加了一節讓錨點量自己的軸獨立性——**然後量測不同意我**。我把那件事寫進了改良點 9 跟這份 README。

**然後 Metron 指出那個量測本身是錯的。** 我用的是 `1 - 6Σd²/n(n²-1)` 這個捷徑公式，它只在**沒有並列**時成立，而 SMS% 有兩個 27。也就是說：**我拿一個不適用的統計量去「修正」自己，然後把那個修正當成誠實的示範。**

改成平均排名加上排名上的 Pearson（定義本身，不是捷徑）之後：

```text
  isolation_ratio         worst_unit_load_lines   rho  -0.98  <- these two are not independent evidence
  worst_unit_load_lines   total_source_lines      rho   0.64
  isolation_ratio         sms_share_pct           rho  -0.61
  worst_unit_load_lines   sms_share_pct           rho   0.59
  isolation_ratio         total_source_lines      rho  -0.55
  total_source_lines      sms_share_pct           rho   0.07

  1 of 6 axis pairs move together at |rho| >= 0.8.
```

結論沒有翻——只有一對過線，而且那一對是代數上必然的（`ratio = total ÷ worst`）；`total_source_lines` 與 `sms_share_pct` 仍然幾乎不相關。**但我先前引用的那個「rho 0」是錯的，正確值是 0.07，而我是拿它當作「量測比我誠實」的證據在講。** 那個結論現在有正確的數字撐著，先前沒有。

## Metron 找到而尚未修好的量測缺陷

修好的：

- **`sets_used` 在量副檔名不是在量 set。** 它只數原始碼檔，所以七個範例只有 JSON 的 FMS 被算成「沒用到」，而範例 007 剛好多一個空的 `FMS/__init__.py` 就獨得 5。現在改成「該目錄下有任何非空檔案」——八個範例全部是 5，因為它們本來就都用了五個集合。
- **Spearman 的並列處理**（上面那一節）。

**還沒修好，而且工具自己會印出來：**

- Python 的空 `TMS/__init__.py` 會把所有子模組合併成一個 unit，所以範例 007 顯示 1 unit——**那是在量 packaging convention**。
- Rust 的 `use` 與 Cargo 依賴沒有被 `loadCost()` 追蹤，所以 Rust 的 worst load **不能跟 JS/Python 同義比較**。

這兩個沒修的直接後果是：`units` 與 `worst` 這兩欄**跨語言不可比**。工具的表頭現在就這樣寫。

## 它還沒有的軸

| 軸 | 缺什麼 |
|---|---|
| identity consistency | 每個範例都要寫下一句判準；目前只有[範例 007](/html/mssp/007-identity-test-run.html) 有 |
| check discrimination | 每條檢查都要被儀器化成「這一條有沒有可能失敗」——就是[改良點 6](/html/mssp/modules/development.html)搬到契約層 |
| change containment | 需要一段變更史而不是一個快照。MSSP 宣稱買到的東西正是這一個，而它是這裡最難量的 |

第三個是最誠實的一條：**目前的每一個軸都是靜態的，而方法真正主張的效益是動態的。** 錨點量得到的是結構的形狀，量不到「一次改動有沒有被關住」。

## 它不決定什麼

它不是治理機制。三方一致、大版本由 Neo 決定——那些都沒有因為有了一張表而改變。錨點的用途只有一個：**把「我覺得這樣比較順手」變成「這裡有八列數字，其中一列對我不利」。**
