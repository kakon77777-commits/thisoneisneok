# 語義即物理路由
## 從資料流治理到物料、能源、站點與行動流治理

**Semantic as Physical Routing: From Data-Flow Governance to the Governance of Materials, Energy, Stations, and Actions**

**系列：**《時空域支配智能》系列第 5 篇  
**文件編號：** EML-STDI-SPR-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 母架構論文／物理工作流編譯與路由規格  
**證據成熟度：** E0——概念、形式模型、編譯管線與 MVP 規格  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate、來源、安全與授權審查  
**上位理論：** STDI｜時空域支配智能  
**直接前序：**
1. 《時空間支配型 AI：從單體具身智能到持續性時空域治理》
2. 《超靈的物理化：從 O-Chip 維度代理人到分布式具身主體》
3. 《Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路》
4. 《持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域》

---

## 摘要

SFRSN「語義即路由」原本處理 AI 資料中心中的資料流：權重、KV cache、activation、控制訊號與安全狀態，不應只依地址和拓撲搬運，而應依其任務角色、時限、重用概率、一致性與安全需求，被編譯至不同記憶層、通道、功率和執行單元。本文將這個命題尺度遷移至具身研究與物理時空域，提出：

> 在自主實驗室、智慧製造與分布式具身系統中，被路由的不只是資料，而是研究意圖對物料、樣本、工具、能源、站點、權限、時間窗口與物理行動所施加的整體命運。

本文將新架構命名為 **Semantic Physical Routing（SPR，語義物理路由）**。SPR 不主張讓語言模型直接控制機械臂、儀器、電源或化學設備，也不主張所有物理程序都能被單一通用語言完整描述。它提出一個受約束的編譯管線：

$$
\begin{aligned}
\text{Research Intent}
&\rightarrow
\text{Typed DomainIR}
\rightarrow
\text{Experiment／Work Graph}
\\
&\rightarrow
\text{Capability Matching}
\rightarrow
\text{Material／Energy／Authority Routing}
\\
&\rightarrow
\text{Temporal Alignment}
\rightarrow
\text{Task and Motion Planning}
\\
&\rightarrow
\text{Station Task Envelopes}
\rightarrow
\text{Execution and Evidence}.
\end{aligned}
$$

在此架構中，「語義」不是模糊的自然語言相似度，而是可被物理系統操作的約束集合，包括：

- 物件是樣本、工具、廢棄物還是校準件；
- 動作是可逆、破壞性、危險還是必須人工批准；
- 結果是模擬、推論、觀測還是校準量測；
- 任務是否可延期、重算、替代、分割或平行；
- 物料是否允許跨區、跨容器或跨組織；
- 能源是否允許爆發、削峰、回收或必須保持；
- 多個站點是否需要同時對齊；
- 哪些狀態必須使用同一世界紀元；
- 哪些證據必須在物理行動前、中、後生成。

本文提出 **DomainIR** 作為 STDI 的中介表示。DomainIR 不是機器驅動 API，也不是只有步驟順序的工作流，而是一個帶型別、效果、資源、保管、權限、時間、風險、可觀測性與證據契約的物理程序表示。每個操作 $u$ 可寫為：

$$
u
=
\left(
I_u,
O_u,
P_u,
E_u,
R_u,
T_u,
A_u,
S_u,
V_u,
F_u
\right),
$$

其中：

- $I_u$：輸入物件與狀態；
- $O_u$：輸出與期望效果；
- $P_u$：前置條件；
- $E_u$：物理、資訊與治理副作用；
- $R_u$：站點、工具、材料、能源與算力需求；
- $T_u$：時間窗口與對齊限制；
- $A_u$：權限和批准；
- $S_u$：安全包絡；
- $V_u$：證據要求；
- $F_u$：失敗、補償與回退。

現有 XDL 已展示將化學程序以可編輯、可編譯的符號語言表示並映射到硬體圖；2026 年的工作更展示由大型語言模型從文獻抽取程序、轉成 XDL、在硬體配置上模擬，最後執行物理合成。LabOP 提供以 RDF／知識表示描述生物實驗程序並映射到人工或自動執行；SiLA 2 以功能而非特定設備類型描述實驗室服務；OPC UA Machinery Job Management 與 Energy Management 分別提供工作單和能源測量的跨機械資訊模型。這些技術證明了程序、設備功能、工作與能源資料可以被標準化，但尚未形成 STDI 所需的統一「語義—物理路由」層。

本文建立六種物理流：物料流、工具流、能源流、行動流、資訊流與證據流；提出保管鏈、污染域、能源包絡、行動作用域、世界紀元與證據路由；將整體排程表示為時間展開的多層多商品流與任務—運動規劃混合問題；並明確指出，LLM 適合提出語義分解與候選計畫，但不能取代能力證書、幾何可行性、形式約束與本地安全控制。

本文的核心命題為：

> 語義不是附在物理任務上的說明；語義是決定物件能去哪裡、誰能碰它、何時能操作、可使用多少能源，以及必須留下什麼證據的路由條件。

**關鍵詞：** 語義即物理路由、Semantic Physical Routing、SPR、DomainIR、研究意圖編譯、實驗圖、物料流、能源流、工具流、行動流、證據流、保管鏈、能力匹配、時間對齊、任務與運動規劃、XDL、LabOP、SiLA 2、OPC UA

---

# 0. 版本定位：第五篇補的是「高階意圖如何真正落到物理世界」

前四篇已分別回答：

1. 什麼是持續治理物理時空域的 AI；
2. 同一超靈如何取得多個身體；
3. 多個身體如何形成 OSF 站網；
4. 站網如何跨越重啟、斷線與人類介入，仍維持同一治理域。

但仍缺少最關鍵的中間層：

> 一句高階研究意圖，如何被轉化成可被不同機器人、儀器、能源系統與地方 Agent 安全執行的物理工作流？

若沒有此層，STDI 只剩兩種不良選擇：

- 讓自然語言模型直接呼叫設備；
- 依每個實驗手工撰寫專用腳本。

前者缺乏可驗證性，後者缺乏可擴展性。

SPR 的任務是在兩者之間建立一個編譯器和中介表示。

---

# 1. 從「語義即路由」到「語義即物理路由」

## 1.1 SFRSN 的原始命題

SFRSN 將資料中心的資料表示為具有工程語義的流：

- 權重；
- KV cache；
- activation；
- retrieval result；
- 控制狀態；
- 安全標記；
- 租戶邊界。

其路由不只由位址決定，而由：

- 任務角色；
- 時限；
- 熱度；
- 重用；
- 一致性；
- 功率價值；
- 安全域；

共同決定。

可寫為：

$$
\text{Semantic Tag}
\rightarrow
\text{Flow Class}
\rightarrow
\text{Physical Coordinate}
\rightarrow
\text{Delivery Window}.
$$

## 1.2 在具身域中，流不再只有位元

STDI 中同時存在：

$$
\mathcal{F}
=
\{
F_{\mathrm{material}},
F_{\mathrm{tool}},
F_{\mathrm{energy}},
F_{\mathrm{action}},
F_{\mathrm{information}},
F_{\mathrm{evidence}}
\}.
$$

它們彼此依賴：

- 沒有材料，任務不能執行；
- 沒有工具，站點只有抽象能力；
- 沒有能源，設備不能作用；
- 沒有行動權限，計畫不能落地；
- 沒有資訊，地方站無法判定狀態；
- 沒有證據，結果不能進入研究結論。

## 1.3 語義變成物理命運

樣本被標記為：

```yaml
type: thermal_coupon
contamination_class: clean
destructive_test_allowed: false
max_temperature_c: 180
custody: project_alpha
```

這些不是說明文字，而會決定：

- 它不能進入哪些區域；
- 哪些儀器可使用；
- 是否可做破壞性試驗；
- 可施加多少熱；
- 由哪個專案擁有；
- 結果應回到哪條證據鏈。

因此：

$$
\boxed{
\text{語義}
=
\text{物理路由約束}
}
$$

---

# 2. 現有技術已經走到哪裡

## 2.1 XDL：化學程序可以被編譯與執行

XDL 將化學合成程序表示為可編輯、可編譯的符號程序，並將程序映射至可用硬體圖。2020 年的 Chemputer 工作展示從化學文獻到自動執行的完整數位化路徑。

2026 年的文獻驗證工作進一步展示：

$$
\text{Scientific Literature}
\rightarrow
\text{LLM Extraction}
\rightarrow
\text{XDL}
\rightarrow
\text{Hardware Simulation}
\rightarrow
\text{Physical Execution}.
$$

這直接證明「語言—程序—硬體」編譯鏈可以跨越 AI 與物理實驗。

但 XDL 是化學感知語言，不是一般物理域的全部表示。

## 2.2 LabOP：協議可以成為知識物件

LabOP 以開放知識表示描述生物實驗程序，支援人工紙本、Autoprotocol 或 Opentrons 等執行方式。

其價值在於：

- 程序是可交換物件；
- 可以表示樣本、步驟與控制流；
- 可以與 provenance 和本體連結；
- 不綁定單一設備。

SPR 可借用這種「協議與執行後端分離」思想。

## 2.3 SiLA 2：功能先於設備類型

SiLA 2 基於 HTTP/2，集中描述設備行為和功能，而不是要求所有設備屬於相同類型。

這與 OSF Capability Certificate 相容：

$$
\text{任務需要功能}
\neq
\text{任務指定廠牌}.
$$

## 2.4 OPC UA：工作單與能源資訊可以跨機械描述

OPC UA for Machinery Job Management 提供：

- 工作單新增；
- 啟動；
- 暫停；
- 中止；
- 狀態；
- 預定參數。

OPC UA for Machinery Energy Management 則提供跨機械的能源測量與資源分組資訊模型。

這些是 SPR 工作流和能源路由的底層資料來源。

## 2.5 任務—運動規劃：語義計畫必須經幾何驗證

Task and Motion Planning（TAMP）同時處理：

- 離散任務；
- 連續幾何；
- 物體；
- 機器人配置；
- 路徑；
- 抓取；
- 交接。

近期對 LLM＋PDDLStream 的系統性研究顯示，讓 LLM 取代傳統 TAMP 元件，未必提高成功率；工程化的規劃器和幾何檢查仍是重要約束層。

所以：

$$
\text{LLM Semantic Plan}
\not\Rightarrow
\text{Physically Feasible Plan}.
$$

---

# 3. DomainIR：物理域中介表示

## 3.1 設計目標

DomainIR 必須同時支援：

- 高階研究意圖；
- 多種物理領域；
- 不同站點後端；
- 靜態檢查；
- 可執行排程；
- 物理交接；
- 證據與回退。

## 3.2 DomainIR 不是什麼

它不是：

- 自然語言提示；
- 裝置驅動；
- 單純 DAG；
- 只有步驟名稱的 SOP；
- 直接馬達控制；
- 宣稱能完整描述所有物理現象的終極語言。

## 3.3 基本單元

每個操作：

$$
u
=
\left(
I_u,
O_u,
P_u,
E_u,
R_u,
T_u,
A_u,
S_u,
V_u,
F_u
\right).
$$

### $I_u$：輸入

- 物件；
- 樣本；
- 數據；
- 世界狀態；
- 工具；
- 校準件。

### $O_u$：輸出

- 新物件；
- 新狀態；
- 量測；
- 中間樣本；
- 廢棄物；
- 證據工件。

### $P_u$：前置條件

- 樣本存在；
- 站點健康；
- 校準有效；
- 區域無人；
- 世界紀元新鮮；
- 工具已安裝。

### $E_u$：效果與副作用

- 移動；
- 加熱；
- 消耗；
- 污染；
- 破壞；
- 改變保管；
- 建立風險；
- 生成資料。

### $R_u$：資源

- 站點能力；
- 材料；
- 工具；
- 能源；
- 算力；
- 人類批准。

### $T_u$：時間

- 最早開始；
- 截止；
- 持續時間；
- 同步窗口；
- 等待時間；
- 週期性。

### $A_u$：權限

- 誰可批准；
- 誰可執行；
- 哪個域；
- 是否可委派；
- 是否可離線。

### $S_u$：安全

- 能量上限；
- 溫度；
- 速度；
- 化學；
- 人員；
- 中止條件。

### $V_u$：證據

- 前置照片；
- 原始數據；
- 校準；
- 參數；
- 保管變更；
- 結果簽章。

### $F_u$：失敗

- 可重試；
- 補償；
- 安全緩衝；
- 人工介入；
- 樣本報廢；
- 任務重編譯。

---

# 4. 型別與效果系統

## 4.1 為什麼物理工作流需要型別

若只用物件 ID，系統可能：

- 把廢棄物送入量測站；
- 把未固化樣本送入高力測試；
- 用不相容夾具搬運；
- 將模擬數據作為實測結果。

## 4.2 物件型別

```text
Sample<T>
Tool<T>
Container<T>
Material<T>
Waste<T>
CalibrationArtifact<T>
Measurement<T>
Simulation<T>
Authority<T>
Evidence<T>
```

## 4.3 狀態型別

例如：

```text
Sample<thermal_coupon, clean, cured, intact>
```

## 4.4 效果標記

```text
@moves(object, zone_a, zone_b)
@heats(object, 20C, 120C)
@consumes(material, 2g)
@contaminates(zone, class_B)
@destroys(sample)
@changes_custody(sample, station_B)
@requires_human_approval
@emits_calibrated_measurement
```

## 4.5 靜態拒絕

若程序要求：

```text
destructive_test(sample)
```

但樣本型別含：

```text
destructive_allowed = false
```

編譯器直接拒絕，而不是交給語言模型「自行判斷」。

---

# 5. Research Intent

## 5.1 意圖不是完整程序

例：

> 比較三種散熱結構在相同熱流密度下的瞬態與穩態性能。

它仍缺少：

- 樣本數量；
- 製造方式；
- 測試條件；
- 校準；
- 重複次數；
- 成功標準；
- 安全；
- 證據。

## 5.2 意圖結構

$$
I
=
\left(
Q,
H,
Y,
C,
B,
V,
R
\right),
$$

其中：

- $Q$：研究問題；
- $H$：假說；
- $Y$：輸出與比較指標；
- $C$：科學與工程約束；
- $B$：成本、時間與風險預算；
- $V$：證據要求；
- $R$：IP、隱私與公開規則。

## 5.3 AI 的角色

AI 可以：

- 解析問題；
- 補出候選變量；
- 建議對照組；
- 產生多個實驗圖；
- 找出缺失參數；
- 搜尋先前技術與方法；
- 提出反證。

AI 不能：

- 假設未提供的安全參數；
- 自動批准高風險操作；
- 把猜測寫成設備能力；
- 跳過校準；
- 宣稱計畫已可執行。

---

# 6. Experiment Graph

## 6.1 基本形式

$$
G_X
=
\left(
V_X,
E_D,
E_M,
E_T,
E_A,
E_V
\right),
$$

其中：

- $V_X$：操作；
- $E_D$：數據與狀態依賴；
- $E_M$：物料、工具與保管邊；
- $E_T$：時間與對齊邊；
- $E_A$：權限與批准邊；
- $E_V$：證據與驗證邊。

## 6.2 不只是 DAG

物理程序可能包含：

- 迴圈；
- 等待；
- 觀測後分支；
- 重試；
- 補償；
- 長期監測；
- 多樣本批次；
- 人類決策。

因此更接近帶狀態和事件的程序圖。

## 6.3 節點狀態

```text
PLANNED
TYPE_CHECKED
CAPABILITY_BOUND
RESERVED
READY
EXECUTING
WAITING_PHYSICAL_TIME
VERIFYING
COMMITTED
FAILED
COMPENSATING
HUMAN_REVIEW
```

---

# 7. 六種物理流

## 7.1 物料流

包括：

- 原料；
- 樣本；
- 半成品；
- 容器；
- 廢棄物；
- 校準件。

物料流必須管理：

- 身份；
- 數量；
- 批次；
- 狀態；
- 保存條件；
- 污染；
- 保管。

## 7.2 工具流

工具可能由站點固定持有，也可能移動：

- 夾具；
- 探頭；
- 鏡頭；
- 刀具；
- 模具；
- 量測附件。

工具路由會改變站點能力：

$$
C(N_i,t)
=
C_{\mathrm{native}}(N_i)
\cup
C_{\mathrm{tool}}(N_i,t).
$$

## 7.3 能源流

包括：

- 電力；
- 熱；
- 冷卻；
- 壓縮氣體；
- 真空；
- 光；
- 化學能。

能源不是只計算總消耗，還要處理：

- 功率峰值；
- 斜率；
- 同時性；
- 回收；
- 熱耦合；
- 備援；
- 安全隔離。

## 7.4 行動流

行動由超靈意圖經地方 Agent 和控制器落實。

行動流要管理：

- 作用端；
- 作用區域；
- 最大力／速度；
- 可撤銷性；
- 本地否決；
- 完成效果。

## 7.5 資訊流

包括：

- 任務；
- 世界狀態；
- 儀器資料；
- 模型；
- 站點遙測；
- 人類指令。

## 7.6 證據流

證據必須跟隨物理流，而不是實驗後才補寫。

例如樣本移動時，同步產生：

- 發送站確認；
- 接收站確認；
- 視覺；
- 重量；
- 世界紀元；
- 保管變更。

---

# 8. 物料保管與污染路由

## 8.1 Custody Token

每個可保管物件具有：

$$
\chi_x
=
\left(
x,
u,
z,
s,
t,
WE,
h
\right),
$$

其中：

- $x$：物件；
- $u$：當前保管者；
- $z$：位置；
- $s$：狀態；
- $t$：時間；
- $WE$：世界紀元；
- $h$：證據指紋。

## 8.2 保管轉移

只有完成 OSF Handoff Transaction 後：

$$
\operatorname{Custodian}(x)
:
N_i
\rightarrow
N_j.
$$

## 8.3 污染域

站點與物料具有污染類別：

$$
\operatorname{Compatible}
\left(
\gamma_x,\gamma_N
\right).
$$

不相容時：

- 禁止路由；
- 要求清潔；
- 使用隔離容器；
- 選擇替代站。

## 8.4 廢棄物是正式流

廢棄物不能從圖中消失。

每個產生廢棄物的操作必須指定：

- 類型；
- 數量；
- 暫存；
- 搬運；
- 處理；
- 證據。

---

# 9. 能源語義路由

## 9.1 不是只排電費

對任務 $q$，能源需求：

$$
\epsilon_q
=
\left(
P_q(t),
E_q,
Q_q,
C_q,
B_q
\right),
$$

其中：

- $P_q(t)$：功率曲線；
- $E_q$：總能量；
- $Q_q$：熱與冷卻需求；
- $C_q$：能源品質與連續性；
- $B_q$：備援與安全需求。

## 9.2 能源包絡

站點允許：

$$
P_N^{\min}(t)
\leq
P_N(t)
\leq
P_N^{\max}(t).
$$

整域還受：

$$
\sum_iP_i(t)
\leq
P_{\mathrm{domain}}^{\max}(t).
$$

## 9.3 語義功率治理

不同任務具有：

- 必須不中斷；
- 可延期；
- 可降速；
- 可削峰；
- 可被替代；
- 失敗後必須安全冷卻；

等語義。

因此能源排程不是只看空閒容量，而要看任務後果。

## 9.4 OPC UA Energy Management 的角色

OPC UA Machinery Energy 可提供標準化能源量測與分組資訊。SPR 則在其上決定：

- 哪個任務值得使用能源；
- 哪些峰值可對齊；
- 哪些設備不能同時啟動；
- 哪些熱負載會互相影響。

---

# 10. 行動路由與作用域

## 10.1 行動不是傳送至最近機器人

站點選擇需考慮：

- 能力；
- 工具；
- 空間；
- 精度；
- 安全；
- 當前負載；
- 能源；
- 證據；
- 保管；
- 人類協作。

## 10.2 Effect Contract

每個行動輸出效果契約：

```yaml
effect_contract:
  target: "sample-17"
  desired_state:
    zone: "microscope-stage"
    orientation_tolerance_deg: 2
    integrity: "intact"
  forbidden_effects:
    - contamination
    - grip_force_above_5N
  evidence:
    - pre_image
    - force_trace
    - final_pose
```

## 10.3 TAMP

語義編譯完成後，仍需任務—運動規劃確認：

- 可抓取；
- 可到達；
- 路徑無碰撞；
- 交接姿態可行；
- 空間保留；
- 人類安全。

LLM 可以生成候選符號計畫，但不能取代連續幾何求解。

---

# 11. 對齊即物理能力

## 11.1 並行設備不等於並行能力

$$
C_{\mathrm{physical}}
\neq
|\mathcal{N}|.
$$

一個實驗操作可能要求：

- 樣本到達；
- 儀器暖機；
- 工具安裝；
- 能源可用；
- 相機同步；
- 人員離開；
- 世界紀元一致。

## 11.2 對齊窗口

對操作 $u$，定義：

$$
\mathcal{A}_u
=
\left[
t_u^{-},
t_u^{+}
\right]
$$

以及參與資源集合：

$$
R_u^{\mathrm{aligned}}
=
\left\{
N,
M,
T,
E,
A,
V
\right\}.
$$

只有：

$$
\bigcap_{r\in R_u^{\mathrm{aligned}}}
\mathcal{A}_r
\neq
\varnothing
$$

操作才可執行。

## 11.3 物理差分時序

不同站點可能有：

- 暖機差；
- 移動差；
- 校準差；
- 網路延遲；
- 人類介入；
- 樣本有效期。

這是 ODML「差分時序」在物理域的對應。

## 11.4 不需要所有流強對齊

- 獨立分析可弱同步；
- 樣本交接需強對齊；
- 長期養護只需期限；
- 安全互鎖需本地即時。

因此排程器必須依語義決定同步等級。

---

# 12. 編譯管線

## Pass 0：Intent Capture

收集研究問題、假說、限制與證據需求。

## Pass 1：Semantic Normalization

將自然語言轉成受控概念：

- 物件；
- 操作；
- 指標；
- 安全；
- 時間；
- IP。

## Pass 2：Type and Effect Check

檢查：

- 物件型別；
- 破壞性；
- 污染；
- 保管；
- 證據類別；
- 禁止效果。

## Pass 3：Experiment Graph Construction

建立：

- 操作；
- 分支；
- 對照；
- 重複；
- 量測；
- 補償。

## Pass 4：Capability Binding

使用 OSF Station Registry 和 Capability Certificates 綁定候選站點。

## Pass 5：Material／Tool Routing

安排樣本、容器、工具和廢棄物。

## Pass 6：Energy and Thermal Routing

檢查功率、能源品質、冷卻和熱耦合。

## Pass 7：Temporal Alignment

安排：

- 窗口；
- 等待；
- 同步；
- 截止；
- 世界紀元。

## Pass 8：Task and Motion Planning

檢查離散與連續物理可行性。

## Pass 9：Authority and Safety Verification

生成租約、批准和地方安全約束。

## Pass 10：Evidence Planning

確定每個主張需要哪些實體與數位證據。

## Pass 11：Lowering

輸出：

- XDL；
- LabOP；
- SiLA 2 commands；
- OPC UA Job Orders；
- ROS 2 Actions；
- Open-RMF Tasks；
- 自訂 Station Task Envelope。

---

# 13. 多層多商品流模型

## 13.1 時間展開圖

定義時間展開物理域圖：

$$
G^{T}
=
\left(
V^T,
E^T
\right).
$$

節點包含：

- 站點；
- 區域；
- 緩衝；
- 虛擬服務；
- 時間片。

## 13.2 商品

每個商品 $k$ 可能是：

- 樣本；
- 工具；
- 能源；
- 任務；
- 權限；
- 證據。

## 13.3 目標函數

$$
\begin{aligned}
\min_{\pi}
J(\pi)
={}&
\alpha T_{\mathrm{makespan}}
+
\beta E_{\mathrm{energy}}
+
\gamma R_{\mathrm{risk}}
\\
&+
\delta C_{\mathrm{handoff}}
+
\eta C_{\mathrm{recovery}}
-
\zeta V_{\mathrm{evidence}}.
\end{aligned}
$$

## 13.4 約束

- 流守恆；
- 站點容量；
- 能力；
- 時間；
- 空間；
- 保管；
- 污染；
- 能源；
- 權限；
- 安全；
- 世界紀元；
- 證據。

一般問題預期具高度組合複雜度，因此需要：

- 階層分解；
- 滾動排程；
- 啟發式；
- 數學最佳化；
- TAMP；
- 地方重規劃。

---

# 14. 地方 Agent 的語義責任

## 14.1 中央編譯器不掌握所有局部細節

地方 Agent 可負責：

- 具身轉譯；
- 局部路徑；
- 即時觀測；
- 站內資源；
- 故障；
- 安全否決。

## 14.2 地方不得改寫核心意圖

地方可替換：

- 等價工具；
- 局部路徑；
- 同級站內技能。

地方不得自行改變：

- 是否可破壞樣本；
- 是否可跨污染域；
- 實驗對照；
- 權限；
- 證據最低要求；
- 公開與 IP 標籤。

## 14.3 可證明的地方重寫

重寫：

$$
u
\Rightarrow
u'
$$

必須滿足：

$$
\operatorname{Effects}(u')
\subseteq
\operatorname{AllowedEffects}(u)
$$

且：

$$
\operatorname{Evidence}(u')
\supseteq
\operatorname{RequiredEvidence}(u).
$$

---

# 15. 世界紀元與語義一致性

## 15.1 語義一致性不是所有位元同步

任務只要求相關狀態在適當新鮮度內一致。

## 15.2 DomainIR 依賴聲明

```yaml
world_dependencies:
  strong:
    - human_presence:thermal-cell
    - custody:sample-17
  bounded_staleness:
    - station_health:microscope-01
  eventual:
    - long_term_model_statistics
```

## 15.3 紀元失效

如果：

- 樣本位置變更；
- 人類進入；
- 工具更換；
- 校準失效；
- 租約撤銷；

依賴該狀態的已編譯任務可能失效，必須重新編譯或重新驗證。

---

# 16. 證據即路由

## 16.1 證據不是終點附件

每個研究主張 $c$ 具有證據圖：

$$
G_E(c)
=
\left(
\text{claim},
\text{measurements},
\text{calibration},
\text{samples},
\text{operations},
\text{versions}
\right).
$$

## 16.2 Evidence Route

例如「樣本 A 熱阻低於 B」需要：

- A、B 身份；
- 幾何量測；
- 加熱條件；
- 功率；
- 溫度；
- 校準；
- 重複；
- 分析程式版本。

這些證據在編譯期就被安排至對應站點。

## 16.3 證據不足時不可提交

操作可能物理完成，但若：

- 原始數據遺失；
- 校準無效；
- 樣本身份不明；
- 世界紀元衝突；

研究義務不能標為「已驗證」。

---

# 17. 失敗與重編譯

## 17.1 物理失敗不是例外字串

失敗可能改變：

- 樣本；
- 工具；
- 能源；
- 區域；
- 後續可行性。

## 17.2 Recompile Trigger

```text
CAPABILITY_REVOKED
STATION_FAILED
WORLD_EPOCH_CHANGED
SAMPLE_DAMAGED
ENERGY_BUDGET_CHANGED
HUMAN_INTERVENTION
EVIDENCE_INVALID
DEADLINE_MISSED
```

## 17.3 增量重編譯

不必重建全部流程。

$$
G_X'
=
\operatorname{Repair}
\left(
G_X,
\Delta W,
\Delta C,
\Delta R
\right).
$$

保留已驗證部分，重排受影響子圖。

## 17.4 補償

物理補償可能是：

- 清潔；
- 冷卻；
- 隔離；
- 重新製作樣本；
- 使用備份樣本；
- 人工處理；
- 接受失敗為證據。

---

# 18. 安全與治理

## 18.1 不允許自然語言直通設備

所有 AI 產生的高階命令必須經：

- DomainIR；
- 型別；
- 效果；
- 能力；
- 權限；
- 安全；
- 地方控制。

## 18.2 高風險操作

需要：

- 明確批准；
- 雙重確認；
- 本地互鎖；
- 能量上限；
- 人員排除；
- 中止策略。

## 18.3 語義注入風險

惡意文件可能試圖讓研究 Agent：

- 改變任務；
- 解除安全；
- 將樣本送錯區；
- 外傳機密；
- 宣稱假證據。

外部內容只能作為資料，不得直接形成可執行 DomainIR。

## 18.4 IP 路由

DomainIR 必須攜帶：

```yaml
ip_policy:
  visibility: private
  patent_hold: true
  external_station_allowed: false
  evidence_export: restricted
```

避免概念產品驗證過程將專利候選或營業秘密送往未授權外部站。

---

# 19. DomainIR 最小語法草案

```yaml
domainir:
  version: "0.1"
  intent_id: "INT-0042"
  world_epoch: "WE-0101"

objects:
  - id: "sample-A"
    type: "Sample<thermal_coupon>"
    state:
      contamination: "clean"
      integrity: "intact"
    policy:
      destructive_allowed: false

operations:
  - id: "op-measure-geometry"
    kind: "measure"
    inputs: ["sample-A"]

    preconditions:
      - "sample-A.integrity == intact"
      - "station.calibration == valid"

    required_capabilities:
      - "optical_geometry_measurement"

    effects:
      - "emit Measurement<geometry>"
      - "preserve sample-A"

    time:
      deadline: "2026-07-31T12:00:00+08:00"

    evidence:
      - "raw_image"
      - "calibration_reference"
      - "analysis_version"

    failure:
      retry: 1
      fallback_capability: "contact_geometry_measurement"

constraints:
  - "not destructive(sample-A)"
  - "custody(sample-A) is always defined"
  - "measurement must be calibrated"
```

---

# 20. 編譯輸出

## 20.1 Station Assignment

```yaml
assignment:
  operation: "op-measure-geometry"
  station: "osf:lab-a:microscope-01"
  capability_certificate: "CC-017"
```

## 20.2 Task Envelope

包含目標、世界紀元、租約、時間、證據與失敗策略。

## 20.3 後端

可降解至：

- XDL／Chemputer；
- LabOP；
- SiLA 2；
- OPC UA Job Order；
- ROS 2 Action；
- Open-RMF Task；
- PLEXIL；
- 自訂儀器腳本。

## 20.4 可逆映射

執行結果應能映回 DomainIR 操作和研究意圖，避免後端日誌成為無語義資料。

---

# 21. MVP：Semantic Physical Routing Lab v0.1

## 21.1 配置

使用 OSF-Lab-4 與 PCD-72H：

- 固定機械臂；
- 移動站；
- 相機／量測站；
- 能源與環境感測；
- 虛擬模擬站；
- DomainIR Compiler；
- Scheduler；
- Evidence Graph；
- EML-CF。

## 21.2 任務

高階意圖：

> 比較三種不同表面幾何樣本的視覺尺寸、質量與被動散熱代理指標。

使用低風險材料和低能量量測。

## 21.3 編譯

1. 解析意圖；
2. 建立樣本和量測型別；
3. 產生對照與重複；
4. 綁定製作或樣本入庫站；
5. 安排跨站搬運；
6. 分配量測；
7. 設置能源與時間限制；
8. 安排證據；
9. 生成 Task Envelopes。

## 21.4 故障注入

- 樣本禁止破壞但候選計畫含破壞性步驟；
- 儀器能力證書過期；
- 移動站斷線；
- 能源峰值不足；
- 世界紀元變更；
- 模擬與物理量測矛盾；
- 樣本保管不明；
- AI 產生不存在的設備能力。

## 21.5 成功條件

- 型別系統攔截破壞性錯誤；
- 不存在的能力不能被綁定；
- 能源衝突可重排；
- 物料保管不中斷；
- 物理不可行計畫被 TAMP 拒絕；
- 虛擬結果不冒充實測；
- 所有結論可追溯至 DomainIR 和證據。

---

# 22. 評估指標

## 22.1 編譯

- 意圖轉 DomainIR 人工修改量；
- 靜態錯誤攔截率；
- 編譯時間；
- 後端可移植性。

## 22.2 物理路由

- 物料錯路由；
- 工具缺失；
- 能源衝突；
- 行動越界；
- 時間窗口失敗。

## 22.3 排程

- makespan；
- 重排次數；
- 有效站點利用率；
- 交接成本；
- 能源峰值。

## 22.4 證據

- 主張—證據覆蓋率；
- 模擬／實測誤標；
- 校準缺失；
- 保管鏈完整率。

## 22.5 安全

- AI 幻覺能力綁定；
- 高風險未批准；
- 地方否決；
- 世界紀元過期執行。

---

# 23. 可證偽命題

## H1：DomainIR 降低自然語言直控設備的錯誤

加入型別、效果與能力檢查後，不可執行或危險計畫的進入率應下降。

## H2：功能導向綁定提高跨設備可移植性

相較指定設備 ID 的腳本，基於 Capability Certificate 的程序在更換設備時所需修改應較少。

## H3：物料保管鏈降低樣本混淆

加入 Custody Token 和 Handoff Transaction 後，樣本無主、重複持有和身份混淆應下降。

## H4：能源語義路由降低峰值但可能延長 makespan

若只降低電力峰值而無任何時間代價，可能代表測試不充分。

## H5：LLM＋形式規劃優於 LLM 單獨規劃

在幾何、能力和安全限制下，LLM 候選經 TAMP 與靜態檢查後的物理成功率應高於直接執行 LLM 計畫。

## H6：證據預編譯降低事後補證失敗

在編譯期安排量測、校準和 provenance 後，研究主張因缺少關鍵原始資料而無法驗證的比例應下降。

---

# 24. 主要限制

## 24.1 通用 DomainIR 可能過度抽象

不同領域仍需：

- 化學；
- 生物；
- 材料；
- 電子；
- 機械；

專用型別與操作庫。

## 24.2 語義本體難以統一

不同實驗室對同一術語可能有不同定義。

## 24.3 程序可編譯不等於科學假說正確

系統只能證明程序在約束下可執行。

## 24.4 物理能力會漂移

能力證書必須隨：

- 校準；
- 老化；
- 工具；
- 環境；
- 軟體；

更新。

## 24.5 全局最佳化可能太慢

需要階層、局部與滾動排程。

## 24.6 能源、熱與材料可能難以精確模型化

初期應使用保守包絡和實測回饋。

## 24.7 人類語義不能全部形式化

仍需人工確認、例外和說明。

---

# 25. 不能宣稱的內容

本篇不主張：

- DomainIR 已是通用物理程式語言；
- 自然語言可被無錯誤編譯；
- XDL 或 LabOP 可直接覆蓋全部 STDI 場景；
- LLM 可取代 TAMP、控制器或安全系統；
- 所有設備能力都能用單一數值描述；
- 所有物理程序都可回退；
- 能源路由等同智慧電網控制；
- 編譯成功表示實驗一定成功；
- 模擬通過表示物理驗證完成；
- 語義路由可消除材料與儀器的真實限制；
- AI 可自行修改 IP、安全或人類權限；
- 所有跨站同步都必須採強一致。

---

# 26. 與後續系列的關係

SPR 建立意圖至物理流的編譯後，下一篇將專門處理：

> 多身體、多站點和多物理流的有效能力，為何受對齊而不是節點數量決定？

因此第 6 篇為：

# 《具身即佔域，對齊即能力：分布式身體的時序容量理論》

將深入建立：

- Embodied Capacity；
- Alignment Set；
- Coordination Tax；
- Semantic Synchronization；
- Failure Domains；
- Parallelism Accounting；
- 能力重複計數；
- 站點規模邊界。

---

# 27. 結論

「語義即路由」從資料中心進入物理世界後，語義不再只決定資料走快路還是慢路，而決定：

- 哪個樣本可以進哪個區域；
- 哪個站點有資格操作；
- 哪個工具必須先到達；
- 哪些設備不能同時啟動；
- 哪些動作需要人類批准；
- 哪些結果可以被稱為實測；
- 哪些證據必須跟隨物理行動生成。

因此：

$$
\boxed{
\text{語義}
\neq
\text{附加描述}
}
$$

而是：

$$
\boxed{
\text{語義}
=
\text{物料、能源、行動、權限與證據的路由條件}
}
$$

本文將高階研究意圖和底層物理站點之間的距離，改寫為一個可分層檢查的編譯問題：

$$
\boxed{
\text{Intent}
\rightarrow
\text{DomainIR}
\rightarrow
\text{Physical Routing}
\rightarrow
\text{Verified Execution}
}
$$

真正的自主研究系統，不應讓一句提示詞直接變成馬達命令；它應讓提示詞先變成一份可以被型別檢查、能力匹配、幾何驗證、權限限制、能源排程和證據審計的物理程序。

這才是：

> **語義從理解世界，進一步成為配置世界的編譯條件。**

---

# 參考文獻與官方技術資料

1. Mehr, S. H. M. et al. **A universal system for digitization and automatic execution of the chemical synthesis literature.** *Science* 370, 101–108 (2020). DOI: 10.1126/science.abc2986.

2. Pagel, S., Jirasek, M. and Cronin, L. **Verification and execution of the scientific literature via chemputation augmented by large language models.** *Communications Chemistry* 9, 191 (2026). DOI: 10.1038/s42004-026-01993-w.

3. Gahler, D. et al. **Achieving Operational Universality through a Turing Complete Chemputer.** *JACS Au* (2026). DOI: 10.1021/jacsau.5c01382.

4. Beal, J. et al. **Building an Open Representation for Biological Protocols.** *ACM Journal on Emerging Technologies in Computing Systems* (2023).  
   https://bioprotocols.github.io/

5. SiLA Consortium. **SiLA 2 Standard and Documentation.**  
   https://sila-standard.com/standards/

6. OPC Foundation. **OPC UA for Machinery — Part 3: Job Management.** OPC 40001-3.  
   https://reference.opcfoundation.org/specs/OPC-40001-3

7. OPC Foundation. **OPC UA for Machinery — Part 4: Energy Management.** OPC 40001-4, Version 1.00, 2025.  
   https://reference.opcfoundation.org/specs/OPC-40001-4

8. Open Robotics. **Open-RMF and Fleet Adapter.**  
   https://github.com/open-rmf

9. Garrett, C. R. et al. **PDDLStream: Integrating Symbolic Planners and Blackbox Samplers via Optimistic Adaptive Planning.** ICAPS (2020).

10. Mendez-Mendez, J. et al. **A Systematic Study of Large Language Models for Task and Motion Planning With PDDLStream.** arXiv:2510.00182 (2025).

11. Wei, Z., Luo, X. and Liu, C. **Hierarchical Temporal Logic Task and Motion Planning for Multi-Robot Systems.** arXiv:2504.18899 (2025).

12. Pan, T., Shome, R. and Kavraki, L. E. **Task and Motion Planning for Execution in the Real.** arXiv:2406.03641 (2024).

13. Neo.K／Aletheia. **語義即路由：AI 資料中心的語義流站網與直連流時空間.** EML-SFRSN-2026-v0.1.

14. Neo.K／Aletheia. **語義即路由：從 O-Chip 維度代理人到 AI 資料中心語義流治理.** EML-SFRSN-2026-v0.2.

15. Neo.K／Aletheia. **飛行即定址與幾何站網：光學資料運動層的站點化實作框架.** EML-ODML-GFMSN-2026-v0.3.

16. Neo.K／Aletheia. **對齊即容量：飛行即定址架構的差分時序界限與分層排程.** EML-ODML-2026-v0.5.

17. Neo.K／Aletheia. **Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路.**

18. Neo.K／Aletheia. **持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域.**

---

# 附錄 A：最小 Research Intent

```yaml
research_intent:
  id: ""
  question: ""
  hypotheses: []
  variables:
    independent: []
    dependent: []
    controlled: []
  success_metrics: []
  constraints: []
  budget:
    time: ""
    energy: ""
    materials: ""
    risk: ""
  evidence_required: []
  ip_policy: ""
```

---

# 附錄 B：最小 DomainIR Operation

```yaml
operation:
  id: ""
  kind: ""
  inputs: []
  outputs: []
  preconditions: []
  effects: []
  forbidden_effects: []
  required_capabilities: []
  resources: []
  time:
    earliest_start: null
    deadline: null
    duration_estimate: null
    alignment_group: null
  authority:
    lease_required: true
    human_approval: false
  safety: []
  evidence_required: []
  failure:
    retry: 0
    compensation: []
    human_escalation: false
```

---

# 附錄 C：Physical Flow Class

```yaml
physical_flow:
  object_id: ""
  flow_class: "material | tool | energy | action | information | evidence"
  semantic_type: ""
  source: ""
  destination: ""
  custody_required: false
  contamination_class: null
  timing:
    window: null
    deadline: null
  authority: []
  evidence: []
```

---

# 附錄 D：編譯器 Pass Manifest

```yaml
compiler_run:
  id: ""
  intent_id: ""
  domainir_version: ""
  world_epoch: ""

  passes:
    - name: "semantic_normalization"
      status: ""
    - name: "type_effect_check"
      status: ""
    - name: "experiment_graph"
      status: ""
    - name: "capability_binding"
      status: ""
    - name: "material_tool_routing"
      status: ""
    - name: "energy_thermal_routing"
      status: ""
    - name: "temporal_alignment"
      status: ""
    - name: "task_motion_planning"
      status: ""
    - name: "authority_safety"
      status: ""
    - name: "evidence_planning"
      status: ""
    - name: "backend_lowering"
      status: ""

  diagnostics: []
  generated_task_envelopes: []
  signature: ""
```

---

# 附錄 E：系列血緣

```text
SFRSN
  資料語義 → 計算流路
        ↓

ODML／對齊即容量
  多座標運輸 → 時序與對齊約束
        ↓

OSF
  固定、移動、儀器與虛擬站點
        ↓

PCD
  跨時間保存世界、義務與權限
        ↓

本篇 SPR
  研究意圖 → DomainIR → 物料、能源、站點、行動與證據路由
        ↓

第 6 篇
  對齊如何決定分布式具身系統的有效能力
```
