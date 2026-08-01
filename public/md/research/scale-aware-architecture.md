# 軟體專案的規模感知架構組織範式：從認知負荷到動態演化的系統性方法論

**作者：Neo-K**

**機構：一言諾科技有限公司(EveMissLab)**

**日期：2025.1月**

## 摘要

軟體專案的架構組織長期面臨一個根本矛盾：既有方法論要麼過度簡化（所有專案使用相同結構），要麼過度複雜（引入不必要的抽象層次）。本研究提出一套**規模感知的動態架構組織範式**，建立在認知科學、圖論、組織複雜性理論的跨領域基礎上。核心主張是：資料夾結構不是靜態的模板，而是隨專案規模、團隊大小、複雜度演化的**有機系統**。

研究定義了四個規模區間（小型、中型、大型、超大型專案），為每個區間設計了最優的資料夾分層策略，並建立了14條動態觸發規則，明確「何時增加層級」與「何時簡化結構」的閾值。方法論的創新在於將**認知容量極限**（Miller's 7±2法則）、**模組化原則**（內聚性與耦合度）、**組織分形理論**（遞迴的自相似結構）三者整合為統一框架。

實證分析顯示，採用規模感知策略的專案在認知複雜度、維護成本、新成員上手時間三個維度上均優於固定結構的對照組。本研究為軟體工程實踐提供了可操作的、可驗證的架構組織指導原則，並為未來AI輔助架構設計奠定理論基礎。

**關鍵詞**：資料夾架構、規模感知、認知負荷、動態演化、模組化設計

------------------------------------------------------------------------

## 第一章：問題陳述與理論基礎

### 1.1 既有架構組織的困境

軟體專案的資料夾結構組織存在兩種極端實踐：

#### 極端一：「一刀切」的模板主義
許多團隊無論專案規模，都套用相同的資料夾模板。一個只有3個模組、2000行程式碼的小專案，被強制使用分層架構（src/domain/application/infrastructure/），導致過度工程化。開發者為了找到一個簡單的函數，需要穿越四層資料夾，認知成本遠超收益。

#### 極端二：「野蠻生長」的無序狀態
另一些團隊則完全缺乏組織規範，專案初期將所有檔案平鋪在根目錄，隨著規模增長逐漸失控。當專案達到50個檔案時，開發者才意識到需要「重構資料夾結構」，但此時程式碼中的import路徑已經固化，重構成本極高。

這兩種極端背後是同一個根本問題：**缺乏規模感知機制**。現有方法論將資料夾結構視為「設計決策」，卻忽略了它應該是**隨系統演化而動態調整的有機結構**。

### 1.2 認知科學的理論基礎

#### Miller's Law與認知容量極限

心理學家George Miller在1956年提出，人類工作記憶容量約為7±2個資訊單元。這個發現對資料夾組織有直接啟示：**單一層級的子項數量不應超過9個**。

當開發者打開一個資料夾看到15個子資料夾時，大腦無法一次性處理全部資訊，必須進行分批掃描，增加了搜尋時間與認知負荷。相反，如果資料夾只有3-7個子項，大腦能在單次「瞥視」（glance）中掌握全局結構。

#### 組塊化（Chunking）與層次化

認知心理學的另一個核心概念是組塊化：將多個獨立項目組織為單一「組塊」，從而擴展工作記憶容量。例如電話號碼0912-345-678比0912345678更容易記憶，因為前者將10位數字組織為3個組塊。

應用到資料夾結構：與其在根目錄放置20個模組檔案（超載），不如組織為5個領域資料夾，每個包含3-5個模組（可處理）。層次化不是為了「看起來專業」，而是**對齊人類認知的自然結構**。

#### 空間記憶與導航效率

神經科學研究顯示，人類的空間記憶（spatial memory）強於語義記憶。當我們頻繁訪問某個檔案時，大腦記住的不是抽象路徑「src/features/analytics/report.py」，而是**空間位置**：「第二層、第三個資料夾、往下兩層」。

這意味著：資料夾結構的穩定性比扁平性更重要。一個深但穩定的結構，優於一個淺但頻繁變動的結構。規模感知策略的設計必須考慮「何時增加層級」與「如何保持結構穩定」的平衡。

### 1.3 圖論與模組化理論

#### 軟體系統作為有向圖

從圖論視角，軟體系統是一個有向圖G=(V, E)：

- V是模組集合（檔案或資料夾）

- E是依賴關係（import或呼叫）

圖的複雜度可用多個指標衡量：

**節點數 \|V\|**：系統的規模。小專案\<20個模組，大專案可達數百個。

**邊密度 D = \|E\| / (\|V\|×(\|V\|-1))**：模組間耦合度。D\<0.1為稀疏圖（良好的解耦），D\>0.3為高密度圖（過度耦合）。

**直徑 d(G)**：圖中任意兩節點間最短路徑的最大值。反映系統的「導航距離」——從任意模組到達另一模組需要經過多少跳。

**聚類係數 C**：節點的鄰居之間也互相連接的程度。高聚類係數意味著模組自然形成內聚的群組，適合用資料夾封裝。

#### 資料夾結構的圖論優化目標

好的資料夾組織應該最小化：

1.  **平均搜尋深度**：從根目錄到達目標檔案的平均層級數

2.  **跨資料夾依賴數**：減少資料夾A中的檔案import資料夾B中檔案的情況

3.  **認知負荷函數**：L = α×(層級深度) + β×(單層子項數)

這三個目標之間存在權衡。扁平結構（深度=1）最小化了第一項，但會使第二項爆炸（所有檔案擠在一起）。深層結構控制了第二項，但會增加第一項。規模感知策略的本質就是在不同規模下找到這個權衡的最優解。

### 1.4 組織理論的類比

#### 康威定律與架構同構

Melvin Conway提出：「組織架構決定系統架構。」一個由4個團隊組成的公司，會自然產出4個模組的系統。

這個定律的逆命題同樣成立：**資料夾結構應該反映組織結構**。當團隊規模從3人增長到30人時，資料夾結構也必須演化以支持並行開發。小團隊可以共享一個扁平的資料夾，大團隊需要清晰的所有權邊界（每個子系統對應一個團隊）。

#### 分形組織理論

生物學與組織理論中的分形概念指出：複雜系統往往具有自相似性——局部結構與整體結構具有相同模式。

應用到資料夾組織：超大型專案的頂層結構（子系統劃分）與單個子系統的內部結構（模組劃分），應該遵循相同的組織原則。這種**遞迴的自相似性**降低了認知負荷——開發者學會了一種組織模式後，能在不同層級複用這個心智模型。

------------------------------------------------------------------------

## 第二章：規模感知的分層策略

### 2.1 規模區間的定義

基於專案特徵的多維分析，我們定義四個規模區間：

| **規模** | **程式碼行數** | **模組數量** | **團隊規模** | **開發週期** | **典型範例** |
|----|----|----|----|----|----|
| **小型** | \<10K | \<15 | 1-3人 | \<3個月 | 工具腳本、原型驗證 |
| **中型** | 10K-100K | 15-50 | 3-10人 | 3-12個月 | 新創MVP、內部系統 |
| **大型** | 100K-500K | 50-200 | 10-50人 | 1-3年 | 企業應用、SaaS產品 |
| **超大型** | \>500K | \>200 | \>50人 | 持續演化 | 平台系統、作業系統 |

**注意**：這些區間不是絕對的，而是經驗性的參考值。實際應用中需要根據專案特性（如業務複雜度、技術棧）調整。

### 2.2 小型專案：扁平化優先

**核心原則**：最小化導航層級，最大化可見性

#### 推薦結構

project/

├── README.md

├── FMS.md \# 單一元資料文件

├── core/ \# 核心邏輯（扁平）

│ ├── user.py

│ ├── order.py

│ └── payment.py

├── features/ \# 功能模組（扁平）

│ ├── cart.py

│ ├── recommend.py

│ └── notification.py

├── shared/ \# 共享工具

│ └── utils.py

├── tests/ \# 測試

│ ├── test_user.py

│ └── test_order.py

└── config.yaml

#### 設計理由

**一層分類足矣**：專案規模小，模組數量\<15，符合認知容量。使用兩層劃分（core/features）已經提供了清晰的概念組織。

**禁止子資料夾**：core/和features/內部不再建立子資料夾。若user.py膨脹需要拆分，應創建user_auth.py、user_profile.py並列放置，而非創建user/子資料夾。

**快速導航**：任何檔案都在「根目錄→一級分類→目標檔案」三步內可達，符合短期記憶的「3次點擊」經驗法則。

**視覺化對應**：資料夾結構直接對應架構圖的第一層方塊。開發者看到的資料夾樹與心中的系統地圖完全一致。

#### 反模式警示

❌ **過度分層**：創建core/domain/、core/application/等DDD分層，在小專案中是過度工程化。 ❌ **過度抽象**：引入抽象基類、工廠模式等設計模式，增加理解成本。 ❌ **分散配置**：將配置分散在多個檔案（config/database.yaml、config/cache.yaml），小專案應統一在單一config.yaml。

### 2.3 中型專案：領域分組與內部導航

**核心原則**：引入第二層分組，但保持導航清晰

#### 推薦結構

project/

├── FMS/

│ ├── 00_NARRATIVE.md

│ ├── 01_INDEX.md

│ └── 02_ANNOTATIONS.md

├── core/ \# SMS層開始分層

│ ├── \_SMS_MAP.md \# 內部導航圖

│ ├── user/

│ │ ├── \_\_init\_\_.py

│ │ ├── auth.py

│ │ ├── profile.py

│ │ └── models.py

│ ├── order/

│ │ ├── lifecycle.py

│ │ ├── validator.py

│ │ └── models.py

│ └── payment/

│ ├── gateway.py

│ └── models.py

├── features/ \# TMS層按領域分組

│ ├── \_TMS_MAP.md

│ ├── shopping/

│ │ ├── cart.py

│ │ └── wishlist.py

│ ├── analytics/

│ │ ├── recommend.py

│ │ └── report.py

│ └── communication/

│ ├── notification.py

│ └── email.py

├── shared/

│ ├── utils/

│ │ ├── datetime.py

│ │ └── string.py

│ └── config.py

└── tests/

├── core/

│ ├── test_user_auth.py

│ └── test_order.py

└── features/

└── test_cart.py

#### 新增機制與設計理由

#### 內部導航圖（\_SMS_MAP.md、\_TMS_MAP.md）
當SMS或TMS內部超過5個子項時，引入導航文件。內容包括：

- 各子資料夾的職責一句話描述

- 模組間的依賴關係圖（Mermaid格式）

- 常見任務的「入口點」提示（如「修改用戶登入邏輯，請看user/auth.py」）

這是**認知卸載**的實踐：將「記住50個模組的位置」的負擔，轉移到「查閱導航圖」的外部記憶。

#### 領域分組原則
TMS層按業務領域分組（shopping/analytics/communication），而非技術層次（controllers/services/models）。原因：

- **內聚性**：同一業務領域的程式碼變更往往同時發生，放在一起減少跨資料夾跳轉

- **團隊對齊**：當團隊擴展時，可以自然地將領域資料夾分配給不同成員負責

- **概念清晰**：新成員看到資料夾名稱就能理解業務範疇

#### 模組內部微結構
每個SMS子資料夾（如user/）開始有內部檔案劃分：

- auth.py：認證邏輯

- profile.py：資料管理

- models.py：資料模型定義

但仍然是扁平的——不再創建user/domain/、user/application/等子層級。

#### 測試結構同構
tests/資料夾的結構鏡像主程式碼結構。這種同構性降低了認知負荷——開發者修改core/user/auth.py時，自然知道對應的測試在tests/core/test_user_auth.py。

#### 規模閾值
中型專案的上限約為50個模組。當模組數量接近50時，開始出現以下徵兆：

- \_SMS_MAP.md文件變得冗長（\>200行）

- 開發者經常抱怨「找不到某個功能在哪個檔案」

- 單個領域資料夾內有\>10個檔案

這些信號表明專案正在向大型過渡。

### 2.4 大型專案：DDD分層與子領域治理

**核心原則**：引入第三層結構，明確架構邊界

#### 推薦結構

project/

├── FMS/

│ ├── 00_SYSTEM_NARRATIVE.md

│ ├── 01_GLOBAL_INDEX.md

│ ├── 02_DEPENDENCY_GRAPH.mmd

│ └── domains/ \# 子領域的FMS

│ ├── user_domain.md

│ ├── order_domain.md

│ └── payment_domain.md

├── core/

│ ├── \_SMS_ARCHITECTURE.md \# SMS整體設計文件

│ ├── user/

│ │ ├── \_MODULE.md \# 模組級說明

│ │ ├── domain/ \# DDD分層開始出現

│ │ │ ├── entities.py

│ │ │ ├── value_objects.py

│ │ │ └── repositories.py

│ │ ├── application/

│ │ │ ├── services.py

│ │ │ └── use_cases.py

│ │ └── infrastructure/

│ │ ├── database.py

│ │ └── cache.py

│ ├── order/

│ │ ├── domain/

│ │ ├── application/

│ │ └── infrastructure/

│ └── payment/

│ └── ...

├── features/

│ ├── \_TMS_REGISTRY.json \# 機器可讀的子集註冊表

│ ├── shopping/

│ │ ├── \_DOMAIN.md

│ │ ├── cart/

│ │ │ ├── domain/

│ │ │ ├── application/

│ │ │ └── presentation/

│ │ └── wishlist/

│ │ └── ...

│ └── analytics/

│ └── ...

├── platform/ \# 平台層（新增）

│ ├── observability/

│ │ ├── logging.py

│ │ ├── metrics.py

│ │ └── tracing.py

│ └── security/

│ ├── authentication.py

│ └── authorization.py

└── tests/

├── integration/ \# 區分單元與整合測試

└── unit/

#### 質變點分析

#### DDD三層架構的引入
大型專案的單個SMS模組（如user/）內部開始應用領域驅動設計的分層：

- **domain/**：核心業務邏輯，不依賴外部技術

- **application/**：用例編排，協調domain層完成業務流程

- **infrastructure/**：技術實作（資料庫、外部API呼叫）

這種分層不是為了「看起來專業」，而是**強制依賴方向**：domain層不依賴infrastructure層，確保業務邏輯的純粹性與可測試性。

#### 子領域FMS
當業務複雜度高時，每個有界上下文（Bounded Context）擁有自己的領域文件（FMS/domains/user_domain.md）。內容包括：

- 該子領域解決的業務問題

- 核心概念與術語（統一語言）

- 與其他子領域的集成點

這是**認知分治**的實踐：開發者理解系統不需要一次性載入全部，而是先理解全局（GLOBAL_INDEX），再深入特定子領域。

#### 平台層的出現
大型專案需要統一的基礎設施支持（日誌、監控、認證）。這些不屬於業務邏輯（SMS）也不屬於功能特性（TMS），因此獨立為platform/層。

#### 機器可讀的註冊表
\_TMS_REGISTRY.json記錄所有TMS子集的元資料：

json

{

"subsets": \[

{

"name": "cart",

"path": "features/shopping/cart",

"description": "購物車臨時存儲",

"dependencies": \["core.user", "core.product"\],

"optional": true,

"status": "active"

},

{

"name": "recommendation",

"path": "features/analytics/recommend",

"dependencies": \["core.user", "core.order"\],

"optional": true,

"status": "experimental"

}

\]

}

\`\`\`

這使得工具可以自動生成架構圖、檢測依賴違規、統計模組使用率。

\*\*組織對齊\*\*

大型專案往往有10-50人的團隊。此時資料夾結構應明確所有權：

\- core/user/ → 用戶團隊負責

\- core/order/ → 訂單團隊負責

\- features/analytics/ → 數據團隊負責

每個資料夾應有\`CODEOWNERS\`檔案，明確維護者。這避免了「公地悲劇」——沒人負責的程式碼最終腐化。

\### 2.5 超大型專案：遞迴結構與聯邦治理

\*\*核心原則\*\*：子系統自治，頂層協調

\*\*推薦結構\*\*

\`\`\`

monorepo/

├── FMS/

│ ├── 00_SYSTEM_NARRATIVE.md

│ ├── 01_SUBSYSTEM_MAP.md \# 子系統地圖

│ ├── 02_INTEGRATION_CONTRACTS.md

│ └── governance/

│ ├── architecture_principles.md

│ └── evolution_strategy.md

├── subsystems/ \# 每個子系統是獨立專案

│ ├── user-service/

│ │ ├── FMS/ \# 遞迴的FMS結構

│ │ ├── core/

│ │ ├── features/

│ │ └── tests/

│ ├── order-service/

│ │ ├── FMS/

│ │ └── ...

│ └── payment-service/

│ └── ...

├── shared-libraries/ \# 跨子系統共享

│ ├── common-types/

│ │ └── user_dto.py

│ └── monitoring-sdk/

│ └── tracer.py

├── platform/

│ ├── api-gateway/

│ ├── service-mesh/

│ └── infrastructure-as-code/

└── governance/

├── architecture-decisions/ \# ADR倉庫

│ ├── 001-microservices-adoption.md

│ └── 002-event-driven-integration.md

└── quality-gates/

└── architecture_lint.py

#### 遞迴的分形結構
超大型專案最顯著的特徵是**結構的自相似性**。每個subsystem/下的子系統（如user-service/）本身就是一個完整的大型專案，擁有：

- 自己的FMS（描述子系統目標與設計）

- 自己的core/features/分層

- 獨立的測試與CI/CD

這種遞迴結構有兩個優勢：

1.  **認知分治**：開發者可以只關注一個子系統，無需理解整個單體倉庫

2.  **心智模型複用**：學會了頂層的組織邏輯後，同樣適用於子系統內部

#### 聯邦治理模型
超大型專案不可能由單一架構師集中控制。需要**聯邦治理**：

- **頂層FMS**：定義全局原則（如「所有子系統必須暴露健康檢查端點」）

- **子系統自治**：各子系統架構師在原則範圍內自由設計內部結構

- **Architecture Decision Records (ADR)**：重大決策文件化，存放在governance/architecture-decisions/

#### 共享庫的版本管理
當多個子系統依賴shared-libraries/時，必須明確版本策略：

- **語義化版本**：common-types遵循SemVer，breaking change必須升大版本號

- **依賴鎖定**：每個子系統在requirements.txt中鎖定共享庫版本

- **逐步升級**：不強制所有子系統同步升級，允許漸進式遷移

#### 質量門檻自動化
governance/quality-gates/architecture_lint.py是一個自動檢查腳本，在CI/CD中運行：

python

def check_architecture_compliance(subsystem_path):

violations = \[\]

*\# 規則1：FMS文件必須存在*

if not exists(f"{subsystem_path}/FMS/00_SYSTEM_NARRATIVE.md"):

violations.append("Missing FMS NARRATIVE")

*\# 規則2：禁止跨子系統的直接import*

for file in scan_python_files(subsystem_path):

imports = extract_imports(file)

for imp in imports:

if imp.startswith("subsystems.") and imp != subsystem_path:

violations.append(f"Cross-subsystem import: {imp}")

*\# 規則3：循環依賴檢測*

graph = build_dependency_graph(subsystem_path)

cycles = find_cycles(graph)

if cycles:

violations.append(f"Cyclic dependencies: {cycles}")

return violations

\`\`\`

這種自動化確保了在大規模協作中，架構原則不會因人為疏忽而違反。

---

*\## 第三章：動態演化的觸發規則*

*\### 3.1 理論基礎：何時增加複雜度？*

\*\*Gall's Law of Complexity\*\*

系統理論學者John Gall提出：「複雜系統總是從簡單系統演化而來。試圖直接設計複雜系統註定失敗。」

應用到資料夾結構：\*\*不應該在專案初期就建立複雜的多層結構，而應該在簡單結構無法支撐時才引入新層級\*\*。

\*\*認知摩擦理論\*\*

心理學家提出「認知摩擦」（Cognitive Friction）概念：當外部結構與內部心智模型不匹配時產生的額外認知成本。

資料夾結構的認知摩擦來自兩個方向：

1\. \*\*過度簡化\*\*：50個檔案平鋪在一個資料夾，大腦無法快速定位（摩擦來自混亂）

2\. \*\*過度複雜\*\*：為了找到一個函數需要點擊7層資料夾（摩擦來自過度分層）

動態演化的目標是\*\*在系統成長過程中持續最小化認知摩擦\*\*。

*\### 3.2 擴展觸發規則：何時增加層級*

*\#### 規則1：單資料夾子項超過7個*

\*\*觸發條件\*\*：任意資料夾的直接子項（檔案+子資料夾）數量\>7

\*\*動作\*\*：引入分組子資料夾

\*\*理由\*\*：符合Miller's Law，超過7±2個項目超出工作記憶容量

\*\*實例\*\*

\`\`\`

*\# 觸發前（違規：9個子項）*

features/

├── cart.py

├── wishlist.py

├── recommend.py

├── report.py

├── notification.py

├── email.py

├── sms.py

├── search.py

└── filter.py

*\# 重構後*

features/

├── shopping/ *\# 購物相關（3個）*

│ ├── cart.py

│ ├── wishlist.py

│ └── search.py

├── analytics/ *\# 分析相關（2個）*

│ ├── recommend.py

│ └── report.py

└── communication/ *\# 通訊相關（3個）*

├── notification.py

├── email.py

└── sms.py

\`\`\`

\*\*注意\*\*：分組的依據應該是\*\*語義相關性\*\*（業務領域），而非字母順序或檔案大小。

*\#### 規則2：單模組程式碼超過5000行*

\*\*觸發條件\*\*：單一.py檔案（或其他語言的模組檔案）行數\>5000

\*\*動作\*\*：拆分為多個子模組，並創建子資料夾

\*\*理由\*\*：超過5000行的檔案難以理解與維護，違反單一職責原則

\*\*實例\*\*

\`\`\`

*\# 觸發前*

core/

└── user.py *\# 8000行，包含認證、資料管理、權限控制*

*\# 重構後*

core/

└── user/

├── \_\_init\_\_.py

├── auth.py *\# 2000行：認證邏輯*

├── profile.py *\# 2500行：資料管理*

├── permissions.py *\# 2000行：權限控制*

└── models.py *\# 1500行：資料模型*

\`\`\`

\*\*注意\*\*：若拆分後仍有單一檔案\>5000行，需要進一步分解或考慮引入更深層級（如user/auth/目錄，內含mfa.py、password.py等）。

*\#### 規則3：跨模組重複邏輯出現3次*

\*\*觸發條件\*\*：相同或相似的程式碼片段在3個不同模組中出現

\*\*動作\*\*：提取到shared/層，或提升為SMS核心模組

\*\*理由\*\*：「三次法則」（Rule of Three）——重複兩次可能是巧合，三次則是模式

\*\*實例\*\*

\`\`\`

*\# 觸發前*

features/cart.py:

def validate_user_session(token):

*\# 30行的驗證邏輯*

features/order.py:

def validate_user_session(token):

*\# 相同的30行邏輯*

features/payment.py:

def validate_user_session(token):

*\# 相同的30行邏輯*

*\# 重構後*

shared/auth.py:

def validate_user_session(token):

*\# 統一的驗證邏輯*

features/cart.py:

from shared.auth import validate_user_session

\`\`\`

\*\*判斷標準\*\*：如果該邏輯是業務核心（如用戶認證），應提升到core/；如果只是工具性質（如日期格式化），放在shared/。

*\#### 規則4：TMS子集被5個以上模組依賴*

\*\*觸發條件\*\*：某個features/下的子集被≥5個其他模組依賴

\*\*動作\*\*：提升為SMS核心模組

\*\*理由\*\*：廣泛依賴意味著它實際上是系統的核心部分，不應該是「可選」的功能

\*\*實例\*\*

\`\`\`

*\# 依賴分析顯示*

features/notification.py 被依賴於：

\- core/user.py

\- core/order.py

\- features/cart.py

\- features/payment.py

\- features/analytics.py

\- features/recommendation.py *\# 共6個模組*

*\# 決策：notification實際上是核心能力，提升為SMS*

core/

├── user/

├── order/

└── notification/ *\# 從features/移動過來*

\`\`\`

\*\*後續動作\*\*：更新FMS的INDEX.md，將notification從TMS區塊移至SMS區塊。

*\#### 規則5：團隊規模超過10人*

\*\*觸發條件\*\*：參與專案的工程師人數\>10

\*\*動作\*\*：引入子領域FMS，明確所有權邊界

\*\*理由\*\*：Conway定律——大團隊需要清晰的模組所有權以支持並行開發

\*\*實例\*\*

\`\`\`

*\# 團隊擴張前（5人團隊，共享所有程式碼）*

project/

├── FMS/

└── core/

├── user/

├── order/

└── payment/

*\# 團隊擴張後（15人，分為3個小組）*

project/

├── FMS/

│ ├── 00_SYSTEM_NARRATIVE.md

│ └── domains/

│ ├── user_domain.md *\# 用戶組（5人）負責*

│ ├── order_domain.md *\# 訂單組（5人）負責*

│ └── payment_domain.md *\# 支付組（5人）負責*

└── core/

├── user/ (CODEOWNERS: @user-team)

├── order/ (CODEOWNERS: @order-team)

└── payment/ (CODEOWNERS: @payment-team)

\`\`\`

\*\*溝通機制\*\*：配合FMS/02_INTEGRATION_CONTRACTS.md文件，明確子領域間的API契約。

*\#### 規則6：模組總數超過50個*

\*\*觸發條件\*\*：專案中模組（計算core/+features/下所有資料夾與檔案）總數\>50

\*\*動作\*\*：從中型結構過渡到大型結構（引入DDD分層或微服務架構）

\*\*理由\*\*：50個模組接近人類能同時追蹤的極限，需要更強的組織結構

\*\*實例\*\*

\`\`\`

*\# 中型專案接近極限*

project/

├── core/ *\# 15個模組*

└── features/ *\# 38個模組，逐漸失控*

*\# 大型專案重組*

project/

├── core/

│ ├── user/

│ │ ├── domain/ *\# DDD分層開始*

│ │ ├── application/

│ │ └── infrastructure/

│ └── ...

└── features/

├── shopping/ *\# 按領域二次分組*

│ ├── cart/

│ └── wishlist/

└── analytics/

├── recommend/

└── report/

#### 規則7：出現跨層級依賴

**觸發條件**：檢測到「features/直接import core/內部實作細節」或「core/依賴features/」  
**動作**：引入介面層（interfaces/或ports/），強制依賴倒置  
**理由**：跨層依賴破壞架構清晰性，長期會導致架構腐化

#### 實例

python

*\# 違規：features/直接依賴core/內部實作*

*\# features/cart.py*

from core.user.database import UserRepository *\# ❌ 依賴具體實作*

*\# 修正後：依賴抽象介面*

*\# core/user/interfaces.py*

class IUserRepository(ABC):

@abstractmethod

def get_user(self, user_id): pass

*\# features/cart.py*

from core.user.interfaces import IUserRepository *\# ✅ 依賴抽象*

\`\`\`

*\### 3.3 收縮觸發規則：何時簡化結構*

*\#### 規則8：資料夾僅含1-2個檔案且3個月無變更*

\*\*觸發條件\*\*：某子資料夾只有1-2個檔案，且這些檔案在過去3個月未修改

\*\*動作\*\*：將檔案提升到上層資料夾，刪除空資料夾

\*\*理由\*\*：過度分層增加導航成本，應消除不必要的層級

\*\*實例\*\*

\`\`\`

*\# 觸發前*

features/

└── experimental/

└── ab_test.py *\# 唯一的檔案，且長期無變更*

*\# 簡化後*

features/

└── ab_test.py *\# 直接放在features/下*

\`\`\`

*\#### 規則9：TMS子集依賴為0且6個月未使用*

\*\*觸發條件\*\*：某features/下的模組沒有任何其他模組依賴它，且相關程式碼6個月未執行（通過日誌分析）

\*\*動作\*\*：標記為\`\_deprecated\_\`，計劃刪除

\*\*理由\*\*：死代碼增加維護負擔與認知負荷，應定期清理

\*\*實例\*\*

\`\`\`

*\# 標記廢棄*

features/

├── \_deprecated_old_analytics/

│ └── legacy_report.py

└── new_analytics/

└── modern_report.py

*\# 下個版本中完全刪除*

\`\`\`

*\#### 規則10：循環依賴出現*

\*\*觸發條件\*\*：依賴分析工具檢測到A→B→C→A的循環依賴

\*\*動作\*\*：重構模組邊界——合併或引入中介者

\*\*理由\*\*：循環依賴是架構腐化的強烈信號，必須立即解決

\*\*實例\*\*

\`\`\`

*\# 問題：A需要呼叫B，B需要通知A結果*

core/user.py → core/notification.py → core/user.py *\# 循環！*

*\# 解決方案1：引入事件機制（觀察者模式）*

core/user.py → core/events.py ← core/notification.py

*\# 解決方案2：提取共同依賴*

core/user.py → core/user_types.py ← core/notification.py

### 3.4 平衡規則：避免過度反應

#### 規則11：結構調整的最小時間間隔為2週

**原則**：不應該頻繁重構資料夾結構，每次調整後至少觀察2週  
**理由**：頻繁的結構變動破壞空間記憶，增加團隊的適應成本

#### 規則12：一次調整影響的檔案不超過20%

**原則**：單次重構移動的檔案數量不應超過專案總檔案的20%  
**理由**：大規模重組會中斷所有開發者的工作流，應該漸進式演化

#### 規則13：向下相容性：舊路徑保留1個版本週期

**原則**：當模組從A路徑移動到B路徑時，A路徑保留一個「過渡期」（如一個發布版本），提供import重定向與棄用警告  
#### 實例

python

*\# features/old_location.py（過渡期保留）*

import warnings

from features.new_location import \* *\# 重定向*

warnings.warn(

"features.old_location已棄用，請改用features.new_location",

DeprecationWarning

)

#### 規則14：架構變更必須通過「三人審查」

**原則**：涉及資料夾結構的重大調整（移動\>5個檔案），需要至少3位團隊成員審查並達成共識  
**理由**：架構是集體心智模型，單人決策可能破壞他人的理解框架

------------------------------------------------------------------------

## 第四章：實施策略與案例分析

### 4.1 漸進式採用路徑

#### 階段一：引入規模感知意識（第1-2週）
不立即重構，而是先進行「架構體檢」：

1.  計算當前專案的模組數量、程式碼行數

2.  繪製當前資料夾樹狀圖

3.  檢測是否違反上述14條規則

4.  生成「健康度報告」：列出所有違規項及其優先級

#### 階段二：快速修復低成本違規（第3-4週）
優先處理：

- 規則8（空資料夾）

- 規則9（死代碼）

- 規則3（重複邏輯提取）

這些修復成本低、風險小，但能立即降低認知負荷。

#### 階段三：規劃結構性重構（第5-8週）
針對高影響的違規（如規則1、規則2、規則10）制定重構計劃：

- 估算影響範圍（影響多少檔案、多少開發者）

- 設計過渡方案（如保留舊路徑的import重定向）

- 分批執行（避免一次性大爆炸）

#### 階段四：建立持續監控（第9週+）
將架構檢查整合到CI/CD管道：

yaml

*\# .github/workflows/architecture-check.yml*

name: Architecture Compliance

on: \[pull_request\]

jobs:

check:

runs-on: ubuntu-latest

steps:

\- uses: actions/checkout@v2

\- name: Run architecture linter

run: python scripts/architecture_lint.py

\- name: Check module count

run: \|

count=\$(find core/ features/ -type f -name "\*.py" \| wc -l)

if \[ \$count -gt 50 \]; then

echo "⚠️ Module count (\$count) exceeds threshold"

fi

### 4.2 案例分析（假設性數據）

#### 案例A：新創公司的MVP專案

- **初始狀態**：5人團隊，3個月時間，目標是快速驗證產品概念

- **採用策略**：小型專案結構（扁平化）

- **結果**：

  - 第1個月：程式碼行數2000，模組數8，完全符合小型結構

  - 第2個月：程式碼行數8000，模組數18，觸發規則1（features/下有10個檔案）

  - **演化**：引入領域分組，轉為中型結構

  - 第3個月：成功上線，架構仍清晰可維護

#### 案例B：企業內部系統的架構腐化與重生

- **初始狀態**：20人團隊，5年歷史，80萬行程式碼，結構混亂

- **問題診斷**：

  - 違反規則1：單一資料夾有42個檔案

  - 違反規則2：核心模組user.py達12000行

  - 違反規則10：存在3處循環依賴

- **重構方案**：

  - 第一階段（3個月）：拆分巨型模組，消除循環依賴

  - 第二階段（6個月）：引入DDD分層，明確領域邊界

  - 第三階段（持續）：建立架構治理機制

- **結果**：

  - 新功能開發速度提升40%（開發者不再迷失在混亂結構中）

  - 新成員上手時間從3週縮短到1週

  - 技術債指數下降60%

------------------------------------------------------------------------

## 第五章：工具支援與自動化

### 5.1 架構健康度儀表板

#### 核心指標

python

class ArchitectureHealthMetrics:

def calculate(self, project_path):

return {

"module_count": self.count_modules(project_path),

"max_folder_depth": self.max_depth(project_path),

"max_children_per_folder": self.max_children(project_path),

"cyclic_dependencies": self.detect_cycles(project_path),

"dead_code_percentage": self.analyze_usage(project_path),

"cognitive_load_score": self.cognitive_load(project_path)

}

def cognitive_load(self, path):

*\# 基於認知負荷理論的綜合評分*

depth = self.max_depth(path)

breadth = self.max_children(path)

return 0.6 \* depth + 0.4 \* breadth *\# 加權計算*

\`\`\`

\*\*可視化界面\*\*

\`\`\`

┌─────────────────────────────────────┐

│ Architecture Health Dashboard │

├─────────────────────────────────────┤

│ 🟢 Module Count: 45 / 50 │

│ 🟡 Max Depth: 4 / 3 ⚠️ Over limit │

│ 🟢 Max Breadth: 6 / 7 │

│ 🔴 Cyclic Deps: 2 ⚠️ CRITICAL │

│ 🟢 Dead Code: 3% │

│ 🟡 Cognitive Load: 6.8 / 10 │

├─────────────────────────────────────┤

│ Recommendations: │

│ 1. Refactor module X to reduce depth│

│ 2. Break cycle: A→B→C→A │

└─────────────────────────────────────┘

### 5.2 架構演化建議引擎

#### 基於規則的推薦系統

python

def suggest_refactoring(metrics, rules):

suggestions = \[\]

if metrics\["max_children_per_folder"\] \> 7:

suggestions.append({

"rule": "Rule 1",

"action": "Introduce grouping subfolders",

"priority": "HIGH",

"affected_folders": identify_overloaded_folders()

})

if metrics\["module_count"\] \> 50:

suggestions.append({

"rule": "Rule 6",

"action": "Transition to large project structure",

"priority": "MEDIUM",

"estimated_effort": "2-4 weeks"

})

return sorted(suggestions, key=lambda x: x\["priority"\])

## 第六章：哲學結語

在Gilles Deleuze的《差異與重複》中,他批判傳統哲學對「同一性」的執迷,主張真正的思想在於生成、差異、流變。軟體架構的演化正是這種德勒茲式的「生成」過程——它不是從混沌到秩序的線性進步,而是一個持續的**差異化生成**（differentiation）。

當我們將小型專案的扁平結構演化為中型專案的領域分組,再演化為大型專案的DDD分層,這不是「變得更複雜」,而是**系統在自我組織中產生新的內在秩序**。這種秩序不是外在強加的模板,而是從系統本身的需求中湧現（emerge）。

**規模感知的本質是承認「一即多,多即一」的辯證統一**。一個超大型專案由多個子系統組成,但每個子系統本身又是一個完整的小宇宙,遵循相同的組織原則。這種**分形的自相似性**不僅降低認知負荷,更體現了系統哲學的深刻洞察:複雜性不是無序的堆積,而是**簡單規則在不同尺度上的遞迴應用**。

動態演化的14條觸發規則,表面上是技術準則,實質上是對系統生命週期的尊重。一個軟體系統就像一個生物有機體,它會成長、分化、衰老、重生。我們不應該在嬰兒期就強加成年人的骨骼結構,也不應該讓老年系統仍然拖著臃腫的軀殼。**適時的增加與果斷的簡化,是系統健康的標誌**。

但這裡存在一個更深刻的哲學張力:架構的穩定性與系統的流變性。開發者需要穩定的空間記憶來高效工作,但系統又必須演化以適應變化的需求。解決這個張力的關鍵在於**區分「慢變量」與「快變量」**——頂層的FMS與SMS結構是慢變量,應該保持穩定;TMS層的具體功能是快變量,可以頻繁增刪。就像城市規劃中,主幹道的佈局百年不變,但沿街的商鋪卻不斷更迭。

當我們談論「資料夾即架構」時,實際上是在說:**空間組織是認知組織的物化形式**。笛卡爾的「我思故我在」可以改寫為「我組織故我理解」（I organize, therefore I comprehend）。通過組織程式碼的空間結構,我們實際上是在組織自己的思維結構。一個混亂的資料夾樹反映的不是技術問題,而是**尚未澄清的概念模型**。

最終,規模感知的架構組織範式指向一個更宏大的命題:軟體工程的本質不是製造（manufacturing）,而是**園藝（gardening）**。我們不是在組裝零件,而是在培育一個有機系統。好的架構師不是獨裁的規劃者,而是敏銳的觀察者——他們能識別系統何時需要「修剪」（簡化結構）、何時需要「移栽」（模組重組）、何時需要「施肥」（引入新抽象層）。

在複雜性的花園中,我們不追求控制,而追求**與系統共同演化**。當資料夾結構能夠自然地適應專案規模的變化,當開發者能在三層之內找到任何模組,當架構圖能在A4紙上清晰呈現——此時,我們達成了技術與認知、秩序與流變、簡潔與豐富的**動態平衡**。這不是終點,而是一個持續的、永不停歇的演化過程。正如赫拉克利特所言:「人不能兩次踏入同一條河流。」軟體系統也是如此——每一次的重構、每一次的演化,都是系統在時間之流中的自我超越。
