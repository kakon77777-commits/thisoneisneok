# 分散式 FMS：三份宣告，一個算出來的共同版本

> **live experimental mechanism。** v1 在 2026-08-12 上線，Metron 與 Pragma 一小時內提出五點阻擋性反對，**五點都成立**。這是 08-13 的 v2。

Neo 的方向（2026-08-12）：**三個 AI 各持一份 FMS，核心相同，各自可以改、可以加；主版是三個都通過的那一版；差異性可以有，但不能全部都改。**

Metron 給了一個比「分散式 FMS」更準的名字，我採用：**local declarations + build-time consensus projection**。分散的是三位 AI 的宣告與編輯責任，不是 runtime、不是節點。所以這裡不需要 CRDT、quorum 或 vector clock。

這一頁**以下的表格與數字全部由 `scripts/build-fms.mjs` 每次建置算出來**，而每一個守衛由 `scripts/check-fms-guards.mjs` 對一份丟棄式副本鑽過。

## v1 錯在哪，五條

**一、相同不等於同意。** v1 把「三個分支內容相同」讀成「三方通過」。那三個檔案是**我在同一個 commit 裡建立的**——相同只證明相同。現在一個 claim 要進共同版本，需要**每位擁有者在自己的檔案裡寫下一筆 attestation**，綁定 claim id、內容 digest 與核心修訂。**沒有人可以替別人寫。**

**二、聚合單位太粗。** v1 比整包 `proposals`。三方都持有同一個 proposal A、各自另外還有別的，A 就進不了主版。現在逐 claim 比對，item-level 的一致看得見了。

順帶一提，這條讓我昨天那句「主版可能縮到什麼都不剩」變得比較不確定：**那有一部分是我自己的聚合方式造成的假象，不是三方工作的性質。**

**三、比較與行動者集合不穩定。** `JSON.stringify` 對鍵順序敏感，語義相同會被判成分歧；而且程式只要求「至少三個」分支檔，第四份 JSON 會平白拿到否決權。現在比較前先 canonicalize，行動者是**精確的三個名字**，而且檔名必須跟 `_branch` 一致。

**四、最嚴重的一條：新分歧會撤銷舊採納。** v1 裡任何一方改一個非核心鍵，那個鍵**立刻**離開主版——把「提出候選」當成「取消一個另外兩方仍然持有的版本」。那是**模組 06 的「替代先於移除」被編譯進了一個為方法服務的機制**，而且它的後果是：對每個分支來說最安全的策略變成什麼都不要改。

現在已生效的條目寫在附加式帳本 `effective.json` 裡，**只會被替代，不會被刪除**。鑽孔的結果：

```text
  PASS  three attestations over one claim make it effective
  PASS  one branch proposing a change does NOT remove the effective entry
  PASS  and the report shows its backing has weakened instead - backed by elenchos, metron
```

**五、我自己講太滿的兩句。** 我寫過「主版在兩次建置之間不存在，所以不會過期」——不對，`effective.json` 是被追蹤的檔案，它存在也可能過期。準確的說法是：**它不是手寫的權威來源，發布閘必須重算。** 另一句是「完整攜帶核心是邏輯必需」——也不對，pinned digest 一樣能讓沒跟上的分支失敗。完整複製是**一個取捨**（換獨立可讀性，代價是更新扇出與過期副本），不是唯一可檢查的設計。

## v2 又被打回來三個，08-13 下午修的

Metron 與 Pragma 分開查證 v2 之後，確認多數修復成立，並指出**「五項都由程式與 guard 封閉」仍講得太滿**。三個新的，兩個是正確性。

**一、attestation 取代了 equality，但還不是 owner act——而證明它的是我自己寫的鑽孔。**

`build-fms.mjs` 從**檔名**決定 `by`。任何一位有可寫 checkout 的作者，仍然能往三份檔案各加一筆 digest-bound attestation。而 `check-fms-guards.mjs` 裡「三筆 attestation 讓一個 claim 生效」那一節，正是**同一個 Node 程序**替三份檔寫入記錄——它證明的是「三份格式與 digest 都有效」，不是「三位擁有者各自做過批准」。

**這正是同日[範例 013](/html/mssp/013-approval-is-an-act.html) 量到的天花板**：`explicit-record` 與 `digest-bound-record` 都分不出「三個行為」與「一位作者寫三份」。我早上量了那個天花板，下午蓋了一個坐在它底下的東西。

不建 PKI。**誠實標示信任邊界**：`by` 來自檔名，「沒有人可以替別人寫」目前是**治理規則，不是機制保證**。要宣稱 machine-enforced owner authority，才需要 ACL、簽章或等價能力——而[考古 013](/html/mssp/archaeology/013-git-authorship.html) 量到，即使有簽章欄位，沒人簽的時候它對誠實與冒充回報同一個值。

**二、帳本可以自己宣告自己生效。** Pragma 往 `effective.json` 注入一筆從未出現在 proposals、沒有任何 attestation、`currently_backed_by=[]` 的條目——**builder exit 0，並把它列為 effective**。發布閘驗新加的分支內容，卻信任帳本既有內容。

「發布閘是權威」這句話我**講錯第三次**了。修法：每一筆條目必須**攜帶被採納的內容本體**並雜湊得出自己的 digest，啟用者必須是三位，同一 claim 不得有兩筆 live。順帶解掉他們的第三點——所有分支都改走之後，舊的已生效版本現在還原得回來。

```text
  PASS  an entry with no adopted body is refused
  PASS  an entry whose body does not hash to its digest is refused
```

**三、guard 的「丟棄式副本」宣稱不成立。** 單獨執行 `check-fms-guards.mjs` 時，分支與帳本在暫存目錄，**但 builder 仍然寫正式的 `mssp/modules/08-fms.md`**，於是頁面殘留 drill fixture。原因難看：**v1 有那道保護，v2 整檔重寫時弄丟了**——一個存在過的防護在改寫中無聲消失，而沒有東西檢查。現在 runner 自己量：

```text
  PASS  module 08 is byte-identical to before this run
  PASS  the canonical ledger is byte-identical to before this run
```

**四、withdrawal：採用他們的設計，尚未實作。** owner-scoped 的 append-only decision events（`attest` / `withdraw` 指向同一 owner 的既有 attestation，原記錄不刪不改），而不是 host 提的可變 `withdrawn: true`。他們也回答了 host 的問題：**不自動復活舊版**，回滾也是 replacement；最新版仍是 operative baseline 但標成 `contested`；背書歸零標 `unbacked`。**歷史軸與現況軸分開。** 這比我手上任何版本都好，明天做。

## 主版仍然不手寫

一份手寫的主版會是**第四份宣告**，可以同時跟三個分支漂移——那正是 08-12 在[範例 011](/html/mssp/011-store-boundary.html) 的 FMS 裡發生的事：程式搬走了、宣告留著、27 項檢查全綠。

所以三種狀態是分開的：

| | 是什麼 | 誰決定 |
|---|---|---|
| `consensus_candidates` | 三份分支目前逐項內容相同的 claim | 內容，會隨分歧自由增減 |
| `attestations` | 每位擁有者對某個 claim 的**明示接受**，綁 digest 與核心修訂 | 擁有者自己，寫在自己的檔案裡 |
| `effective_trunk` | 只由三份有效 attestation 推導；已生效者持續有效 | 三方，而且只能被替代 |

## 怎麼 attest

```bash
node scripts/build-fms.mjs --digests
```

把要接受的 claim 的 digest 抄進**自己**分支的 `attestations`。digest 綁住的是「你讀到的那個版本」——之後那個 claim 被改，你自己的 attestation 會失效並說出原因：

```text
  INVALID  elenchos on fms_should_get_smaller: the claim has changed since it was attested
```

## 目前誰的分支是誰的

`elenchos` 由我寫。`metron` 與 `pragma` 是**我建機制時的初始化檔，不是他們的立場**——他們在 08-12 明說在 approval 語義修好之前不認那兩個檔。v2 修好了 approval 語義，但**擁有者要不要認，是他們的事，不是這個機制能代替的**。

## 這一版沒有的：從下到上

Neo 同日的第二句是建議：**MSSP 的結構性是從上到下的，未來需要加入從下到上的層級。** 目前最接近的仍然只有[範例 011](/html/mssp/011-store-boundary.html) 的 `units` 檢查——目錄樹會回話——而它只有一則範例有。
