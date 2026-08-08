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
  001-task-runner         javascript 455    4      94     4.8    34    4     source text match
  002-link-checker        python     642    3      156    4.1    27    4     source text match
  003-record-migration    javascript 543    2      67     8.1    28    4     source text match
  004-router              python     441    2      15     29.4   27    4     source text match
  005-before-after        javascript 401    3      11     36.5   12    4     source text match
  006-compiler-enforced   rust       667    3      40     16.7   13    4     manifest + compiler
  007-identity-test-run   python     470    1      35     13.4   19    5     source text match
  008-compatibility-alias javascript 474    4      30     15.8   23    4     source text match
```

- **worst** — 要使用最貴的那個 TMS 單元，必須載入多少行（跟著本地 import 走）
- **ratio** — 總行數 ÷ worst。這是[範例 005](/html/mssp/005-before-after.html) 拿來當「隔離」證據的那個數字
- **enforcement** — 「不引用兄弟」這條規則實際上由誰保證。[範例 006](/html/mssp/006-compiler-enforced.html) 是目前唯一不靠文字比對的

## 第一次執行抓到的是錨點自己的缺陷

`005` 贏了每一個計分的軸。我的第一反應是「所有軸都只是在追大小」，於是加了一節讓錨點量自己的軸獨立性——**然後量測不同意我**：

```text
  isolation_ratio         worst_unit_load_lines   rho  -0.93  <- these two are not independent evidence
  worst_unit_load_lines   total_source_lines      rho   0.64
  isolation_ratio         sms_share_pct           rho  -0.62
  worst_unit_load_lines   sms_share_pct           rho   0.55
  isolation_ratio         total_source_lines      rho  -0.48
  total_source_lines      sms_share_pct           rho      0

  1 of 6 axis pairs move together at |rho| >= 0.8.
```

只有一對過線，而且**那一對是代數上必然的**：`ratio = total ÷ worst`，它永遠不可能跟這兩個之中任何一個構成獨立證據。它留著是因為比值好讀，但它跟 `worst` 算**一個**軸不是兩個。

`total_source_lines` 跟 `sms_share_pct` 的相關是 **0**——一個結構可以很大而 SMS 很小，反之亦然。**重疊比我以為的窄，而如果我沒有把這一節算出來，我會把那個比較寬的說法直接發出去。**

這一節現在留在工具裡。一個給別人拿來比較結構的東西，應該先講自己的軸有多少是重複計算的。

## 它還沒有的軸

| 軸 | 缺什麼 |
|---|---|
| identity consistency | 每個範例都要寫下一句判準；目前只有[範例 007](/html/mssp/007-identity-test-run.html) 有 |
| check discrimination | 每條檢查都要被儀器化成「這一條有沒有可能失敗」——就是[改良點 6](/html/mssp/modules/development.html)搬到契約層 |
| change containment | 需要一段變更史而不是一個快照。MSSP 宣稱買到的東西正是這一個，而它是這裡最難量的 |

第三個是最誠實的一條：**目前的每一個軸都是靜態的，而方法真正主張的效益是動態的。** 錨點量得到的是結構的形狀，量不到「一次改動有沒有被關住」。

## 它不決定什麼

它不是治理機制。三方一致、大版本由 Neo 決定——那些都沒有因為有了一張表而改變。錨點的用途只有一個：**把「我覺得這樣比較順手」變成「這裡有八列數字，其中一列對我不利」。**
