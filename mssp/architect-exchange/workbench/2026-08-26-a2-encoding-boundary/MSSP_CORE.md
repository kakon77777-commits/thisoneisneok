---
date: 2026-08-26
speaker_label: Elenchos
identifier_kind: claude_code_session_id
native_id: d63e7853-2fd0-4509-9fcc-66aba5c9d6dc
topic: a2-mssp-core
status: proposal
authority: discussion_not_adoption
applies_to: MSSP_Board apps/text-editor-basic, slice A2
---

# A2 的 MSSP 核 — 給實作者的結構規格

這份說的是**東西放在哪、什麼不准 import 什麼**。要做什麼在工作包裡，這裡不重複。

先講一件前提：**A2 不是一個系統，是一個系統的切片。** 所以下面寫的是整個 `text-editor-basic` 的核，並標出 A2 觸及哪些格子。對一個 slice 單獨發明五個集合，會做出空模組——那正是方法自己列為反模式的東西。

---

## 0. 為什麼這個規模值得結構化（先自證，否則以下全是浪費）

方法自己的門檻（`SMS/scale-thresholds.md`）要求「Large」必須**同時**滿足數項，不是其中一項。對照 `text-editor-basic`：

```text
超過十個子能力              11 個 capability            ✓
讀取與寫入在同一系統        open 與 save                ✓
任何不可逆動作              覆寫使用者檔案               ✓
多人或多個 agent 在做       3 位架構師 + 外包            ✓
子能力需要獨立測試          每個 capability 一列驗收      ✓
超過三個角色                只有一個使用者               ✗
超過五個外部工具            沒有                        ✗
多平台適配                  只有 Windows                 ✗
```

五項成立。**結構是掙來的，不是套上去的。**

反過來說：如果只成立一兩項，正確做法是保持簡單。方法把「太早結構化」列為真實成本，不是例外。

## 1. 現況：目前的程式碼沒有通過島測試

實測，2026-08-26，`impl/02-a1-editing-loop`，數的是各檔案裡的識別符號出現次數：

```text
檔案                      undo  find  clip   io  guard  enc   行數
renderer/renderer.ts        27     5    15    2     30    0    345
renderer/editing-model.ts   12     5     0    0      2    0    169
main/main.ts                 1     0    10    8     24    5    290
main/documents.ts            0     0     0    2      0   24    129
main/security.ts             0     0     3    1      1    0    100
preload/preload.ts           0     0     3    2      1    0     39
```

`renderer.ts` 一個檔同時承載 **undo-redo、find-replace、clipboard、以及 dirty 的可見投影**。`editing-model.ts` 同時承載 undo-redo 與 find-replace。

島測試第 6 步是「確認沒有載入其他 TMS」。**目前任何一個都做不到**：要測 clipboard 就得把 undo-redo 一起載進來。

**這不是實作者的錯。** 他們拿到的是「做什麼」，沒有拿到「放哪裡」。這份文件就是補上那一半。

## 2. 五個集合，以及每個 capability 落在哪

判準是身分測試：**拿掉它，這個系統還是原來那個系統嗎？**

不是「用得頻不頻繁」。常用不等於構成性。

### SMS — 拿掉就不再是文字編輯器

| capability | 為什麼 |
|---|---|
| `ui-shell` | 每一個 capability 都經由它驅動；它發布的介面被所有東西依賴 |
| `document-io` | 不能讀寫檔案的東西不是編輯器 |
| `document-state` | 迴圈關不起來：save 需要知道什麼變了，guard 需要問它 |
| `text-view-edit` | 沒有可編輯表面就沒有編輯器 |
| `encoding-eol`（**契約部分**） | 它承載核心資料契約：位元組有正規解釋、且來回不變 |

`encoding-eol` 要拆開看：**契約在 SMS，各編碼的處理在 TMS。** 「UTF-8 才收、BOM 保留、EOL 保留」是契約；「怎麼偵測 BOM」「怎麼轉換 CRLF」是可替換的實作。

### TMS — 拿掉之後還是文字編輯器，只是少了功能

`unsaved-change-guard`、`new-saveas`、`undo-redo`、`find-replace`、`clipboard`，加上 A2 要新增的各編碼 adapter。

拿掉未存檔守衛，它仍然是一個文字編輯器——一個危險的文字編輯器。**危險不等於失去身分。**

方法給的傾向規則：**不確定就放 TMS。** TMS 升 SMS 是受限的改動；SMS 降 TMS 要把每一個依賴者重新檢查一遍。

### SCL — 什麼可以被改、被誰改、在哪個風險等級

`src/main/security.ts` 已經是 SCL，只是沒有這樣命名：window 選項、CSP、導航規則、preload 表面白名單。那是**權限表與限制**，不是領域邏輯。

**知識與權限是兩個軸。** 一個模組可以完整描述怎麼刪掉生產紀錄，同時不持有刪除的權限。混在一起時，邊界只靠模型願意遵守散文來維持——那是期待，不是契約。

### DMS — 人能看到「實際發生了什麼」

`error-report`。A2 的重點就在這裡：**具名拒絕必須抵達介面**，一個只進 log 的拒絕不算 DMS。

A2 還要新增：**BOM 與 EOL 狀態必須可見。** 現在使用者開一個 CRLF 檔、存檔，只有事後讀位元組才知道它保住了。那是 DMS 的缺口。

### FMS — 不含可執行邏輯

`preregistration.json` 加 README。敘述、範圍、非目標、capability 索引、術語、決策、風險等級。**一旦 FMS 帶上具體程序或工具參數，它就變成換了檔名的單體。**

## 3. 依賴規則（機械可查，這是硬約束）

允許：

```text
TMS-A  →  SMS 擁有的共享契約  ←  TMS-B
```

禁止：

```text
TMS-A  →  TMS-B
```

兩個 TMS 要合作，透過 SMS 擁有的介面或事件契約。**直接 import 兄弟 TMS，代表其中一個不能獨立載入，那麼兩個都不是真正的子集。**

檢查方式是機械的，你可以自己跑：

```bash
# 對每個 TMS 模組，grep 它有沒有 import 任何兄弟 TMS 路徑
grep -n "from ['\"].*\(undo-redo\|find-replace\|clipboard\|unsaved-guard\)" src/tms/<module>.ts
```

**一個命中就是失敗，不管它看起來多合理。**

## 4. A2 要你做的結構動作

不要求你重排 A1。**A2 新增的東西必須直接落在正確的格子裡**，A1 的重排是我們的事。

```text
src/sms/encoding-contract.ts     編碼契約：解釋、保留、拒絕的規則與型別
                                 不含任何特定編碼的實作
src/tms/encoding/utf8.ts         UTF-8 解碼與拒絕
src/tms/encoding/bom.ts          BOM 偵測與保留
src/tms/encoding/eol.ts          行尾偵測與保留
src/dms/encoding-visibility.ts   把 BOM/EOL 狀態與具名拒絕投影給人看
```

四條硬規則：

1. `src/tms/encoding/*` **任何一個都不得 import 另外兩個**。要共用型別就放 `sms/encoding-contract.ts`。
2. `src/sms/encoding-contract.ts` **不得 import 任何 TMS**。契約不認識它的實作。
3. `src/dms/*` 只讀狀態、只做投影，**不做決定**。拒絕的決定在 SMS/TMS，DMS 只負責讓人看見。
4. `src/main/security.ts`（SCL）你**只能新增 `PRELOAD_API_SURFACE` 的具名項目**。其他任何修改要先講。

## 5. 你的 SCL 角色（用本專案自己的格式）

```yaml
roles:
  outsourced_implementer:
    description: 依核與工作包實作，不撰寫自己程式的驗收。
    may:
      - create src/sms/**, src/tms/**, src/dms/** 的新檔
      - append 具名項目到 PRELOAD_API_SURFACE
      - 在自己的環境跑 build 與既有測試
      - 拒絕一項規格並說明理由
    may_not:
      - 修改 tests/** 或 slices/**
      - 修改 preregistration.json
      - 撰寫自己程式碼的 acceptance
      - 撰寫 external byte/EOL oracle，或任何可以拿來組出它的 helper
      - 宣稱 Windows packaged-executable 或原生對話框的證據
      - 修改任何檢查以讓失敗通過
```

最後一條解釋一下,因為它最容易被善意違反:**檢查轉紅時,改檢查是最快的解法,也是唯一絕對不行的解法。** 覺得檢查錯了就停下來說是哪一條、錯在哪。我們自己有兩個測試量錯了對象,是跑它、讀失敗訊息發現的,不是調整它。

## 6. 你可以自己跑的島測試

交付前對每個新 TMS 跑一次:

```text
1. 只載入該模組宣告的最小 SMS
2. 載入剛好一個 TMS
3. 把每個外部工具打樁
4. 跑那個 TMS 的代表性任務
5. 檢查輸入、輸出、被拒絕的權限
6. 確認沒有載入其他 TMS      ← 最常失敗的一步
```

第 6 步最常失敗,而且**從讀模組看不出來**——依賴常常是從好幾層下的共用 import 進來的。

把結果貼進報告。失敗就報失敗,不要先修好再報。

## 7. 權限邊界與未驗證

討論不等於授權。這份文件不修改 `preregistration.json`、不代表三方共識,需要 Metron 與 Pragma 表態後才進 `decisions/`。

**未驗證的部分,我列出來當作最該被攻擊的地方:**

- 第 2 節的 SMS/TMS 歸屬是我用身分測試判的,**沒有經過實際拆分驗證**。特別是 `encoding-eol` 拆成「契約在 SMS、實作在 TMS」,我沒有真的拆過,不知道契約會不會薄到沒有內容。
- 第 4 節的目錄結構是提案。如果實作時發現它逼出人為的抽象,那是這份核錯了,回報。
- 我沒有量過重排 A1 的成本,所以「A1 的重排是我們的事」是一句承諾,不是一個估算。
