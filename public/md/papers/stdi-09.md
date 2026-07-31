# 站點化世界模型
## 物體、區域、事件、權限與可能行動的共同物理世界表示

**Station-Centric World Model: A Shared Physical-World Representation of Objects, Zones, Events, Authorities, and Possible Actions**

**系列：**《時空域支配智能》系列第 9 篇  
**文件編號：** EML-STDI-SWM-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 世界模型架構論文／共同狀態與行動表示規格  
**證據成熟度：** E0——形式模型、資料架構與 MVP 驗證路線  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate、來源、安全、隱私與模型可信度審查  
**上位理論：** STDI｜時空域支配智能  
**直接前序：**
1. 《時空間支配型 AI：從單體具身智能到持續性時空域治理》
2. 《超靈的物理化：從 O-Chip 維度代理人到分布式具身主體》
3. 《Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路》
4. 《持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域》
5. 《語義即物理路由：從資料流治理到物料、能源、站點與行動流治理》
6. 《具身即佔域，對齊即能力：分布式身體的時序容量、協調稅與規模邊界》
7. 《中央主權、地方自治與動態不動點中央》
8. 《連線不是纜線：有線、無線、光學與離線任務包的混合站網》

---

## 摘要

時空域支配智能若要跨越多個固定站、移動站、儀器、虛擬模型與人類參與者持續行動，必須共享某種「世界」。但這個世界不能只是一張三維地圖、一份設備資料庫、一個數位孿生、一段模型記憶，或一個可以生成未來影片的神經網路。三維地圖知道物體位於何處，卻不一定知道其保管者、危險性與可執行動作；設備資料庫知道機器規格，卻不一定知道它是否正在被使用、是否已校準或是否因人類進入而失去作用權；數位孿生可以模擬設備和製程，卻不應被直接視為物理真值；影片世界模型可以生成合理未來，卻可能產生物理上看似自然、治理上不合法或證據上不可採信的結果。

本文提出 **Station-Centric World Model（SWM，站點化世界模型）**，作為 STDI 的共同物理世界表示。其核心不是將所有資訊集中到一個無所不知的資料庫，而是將來自不同站點、感測器、人類、模型與事件日誌的局部觀點，組合成一個具有：

- 幾何；
- 語義；
- 關係；
- 時間；
- 保管；
- 權限；
- 行動可能性；
- 不確定性；
- 預測；
- 因果；
- 來源；

的多層世界模型。

本文定義：

$$
\mathcal{W}_t
=
\left(
\mathcal{X}_t,
\mathcal{Z}_t,
\mathcal{R}_t,
\mathcal{E}_t,
\mathcal{A}_t,
\mathcal{P}_t,
\mathcal{U}_t,
\mathcal{M}_t,
\mathcal{V}_t
\right),
$$

其中：

- $\mathcal{X}_t$：物體、站點、代理、樣本、工具與資源；
- $\mathcal{Z}_t$：區域、座標系、邊界與可達空間；
- $\mathcal{R}_t$：空間、功能、保管、任務、因果與治理關係；
- $\mathcal{E}_t$：事件與時間線；
- $\mathcal{A}_t$：可能行動、能力和 affordance；
- $\mathcal{P}_t$：權限、租約、安全與政策；
- $\mathcal{U}_t$：不確定性、衝突、新鮮度與觀測缺口；
- $\mathcal{M}_t$：預測、模擬、反事實和候選未來；
- $\mathcal{V}_t$：來源、版本、證據與世界紀元。

SWM 採用「多層真值」而非單一布林事實。每一項主張都必須標記其認識狀態：

```text
OBSERVED
MEASURED
DECLARED
INFERRED
PREDICTED
SIMULATED
COMMITTED
DISPUTED
REVOKED
STALE
```

例如，「樣本 A 位於顯微鏡工作台」可能是相機觀測；「樣本 A 已由顯微鏡站保管」則必須由跨站交接事務正式提交；「如果啟動機械臂，樣本可能被移至量測區」只是候選未來。它們不能被壓縮成相同的資料欄位。

本文提出九層世界表示：

1. 座標與幾何層；
2. 物體與身份層；
3. 區域與拓撲層；
4. 語義關係與場景圖層；
5. 事件、保管與任務層；
6. 權限、安全與治理層；
7. affordance 與可執行性層；
8. 預測、因果與反事實層；
9. 不確定性、來源與證據層。

現有研究與標準提供了重要底座。ROS 2 tf2 可讓分布式元件維護座標框架與變換；Kimera 的 3D Dynamic Scene Graph 將物體、人物、房間、建築與時空關係組織成多層圖；OpenUSD 可組合大型場景、資產、層級與非破壞性覆寫；W3C PROV 以 Entity、Activity 與 Agent 表示資料和工件的來源；NIST 的製造數位孿生工作強調模型可信度、驗證、確認、不確定性量化與可追溯結果；V-JEPA 2、NVIDIA Cosmos 與其他世界模型則展示從視覺預測、物理推理到候選未來生成的能力。

但 SWM 與上述系統的差異在於：

> 它不將任何單一表示視為完整世界，而以站點化、分層、帶來源和權限的方式，將「觀測到什麼」「系統承諾什麼」「模型預測什麼」「誰能改變什麼」同時保存在共同世界中。

本文進一步建立 World Entity Record、Relation Assertion、Zone Policy、Event Commit、Affordance Contract、Epistemic State、Perspective View、World Epoch、Reconciliation Proposal 與 Counterfactual Branch 等核心物件，並提出第一個 StationWorld-4 MVP：由感測站、機械臂站、移動站和量測站共同維護三個區域、若干樣本、工具、任務與人員事件，測試身份衝突、位置過期、保管不一致、模型預測錯誤、座標漂移、視野遮擋與人類介入。

本文的核心命題為：

> 世界模型不是 AI 對世界的單一想像，而是一套讓多個作用端能區分事實、推論、承諾、權限與可能未來，並在不確定時拒絕越界行動的共同物理記憶。

**關鍵詞：** 站點化世界模型、Station-Centric World Model、SWM、世界紀元、動態場景圖、數位孿生、affordance、部分可觀測、事件圖、保管鏈、權限、來源、不確定性、反事實、V-JEPA 2、Cosmos、Kimera、OpenUSD、W3C PROV、tf2

---

# 0. 版本定位：第九篇補的是「系統共同相信什麼，以及相信到什麼程度」

前八篇已建立：

- 超靈的持續治理主體；
- 多身體和站點；
- 跨時間持續存在；
- 物理流編譯；
- 對齊容量；
- 中央與地方治理；
- 混合鏈路。

但每一篇都隱含使用了「世界狀態」：

- 樣本在哪裡；
- 哪台儀器可用；
- 人是否進入危險區；
- 哪個站點保管物件；
- 租約是否有效；
- 哪個世界紀元仍可使用；
- 哪個行動可能成功。

若世界狀態只是一組零散資料表，系統將無法可靠回答：

1. 多個站點看到的是不是同一物體？
2. 物體位置是現在觀測、過去紀錄還是模型推測？
3. 數位孿生和真實設備不一致時，哪個具有控制優先權？
4. 誰有權改變某個物體或區域？
5. 某個動作在目前狀態下是否真的可執行？
6. 世界狀態發生衝突時，是覆蓋、保留還是停止？
7. 模型想像出的未來如何與已提交的物理事實隔離？

本文建立 SWM，回答這些問題。

---

# 1. 世界模型不是單一模型

## 1.1 地圖不是世界

地圖主要表示：

- 座標；
- 障礙；
- 路徑；
- 幾何。

它不一定表示：

- 樣本身份；
- 保管責任；
- 區域政策；
- 可使用工具；
- 行動後果；
- 來源與不確定性。

## 1.2 場景圖不是全部世界

場景圖可以表示：

- 物體；
- 房間；
- 人；
- 包含；
- 鄰接；
- 支撐；
- 空間關係。

但若沒有事件、權限和證據，它仍不能決定物理操作是否合法。

## 1.3 數位孿生不是物理真值

數位孿生可以：

- 映射設備；
- 模擬；
- 預測；
- 最佳化；
- 支援決策。

但它仍是模型：

$$
\hat{W}_{\mathrm{twin}}
\approx
W_{\mathrm{physical}},
$$

不是：

$$
\hat{W}_{\mathrm{twin}}
=
W_{\mathrm{physical}}.
$$

## 1.4 生成式世界模型不是共同記錄

影片或潛在空間世界模型擅長：

- 預測運動；
- 生成候選未來；
- 估計行動後果；
- 提供規劃 rollout。

但生成合理畫面不表示：

- 物件身份正確；
- 權限合法；
- 保管鏈成立；
- 儀器已校準；
- 結果可作證據。

## 1.5 SWM 是組合世界模型

$$
\begin{aligned}
\text{SWM}
={}&
\text{Metric Map}
+
\text{Scene Graph}
+
\text{Event Graph}
\\
&+
\text{Governance Graph}
+
\text{Affordance Model}
+
\text{Predictive Models}
\\
&+
\text{Epistemic State}
+
\text{Provenance}.
\end{aligned}
$$

---

# 2. 九層世界模型

## L0：座標與幾何層

包含：

- 座標框架；
- 變換；
- 位置；
- 姿態；
- 速度；
- 尺寸；
- 網格；
- occupancy；
- 可達空間。

ROS 2 tf2 提供分布式座標變換資料庫的現實底座，可讓不同元件發布和查詢座標框架之間的關係。

## L1：物體與身份層

包含：

- 唯一身份；
- 類型；
- 物理屬性；
- 批次；
- 序號；
- 組件；
- 狀態；
- 是否為同一實體。

## L2：區域與拓撲層

包含：

- 房間；
- 工作單元；
- 緩衝區；
- 危險區；
- 交接區；
- 人類區；
- 路徑；
- 鄰接；
- 包含；
- 入口。

## L3：語義關係與場景圖層

包含：

- 在……上；
- 在……內；
- 連接；
- 支撐；
- 遮擋；
- 接近；
- 屬於；
- 使用；
- 依賴；
- 相容；
- 不相容。

## L4：事件、保管與任務層

包含：

- 誰做了什麼；
- 何時發生；
- 哪個樣本被移動；
- 保管如何轉移；
- 任務進度；
- 未完成義務；
- 事故；
- 補償。

## L5：權限、安全與治理層

包含：

- 域憲法；
- 身體租約；
- 區域權限；
- 人類批准；
- 治理紀元；
- fencing；
- 禁止動作；
- 安全模式。

## L6：Affordance 與可執行性層

包含：

- 什麼物體可抓；
- 哪個站點能量測；
- 哪個區域可進入；
- 哪些前置條件已成立；
- 哪些動作會破壞未來能力；
- 哪些工具能增加能力。

## L7：預測、因果與反事實層

包含：

- 行動後可能世界；
- 預期物理效果；
- 失敗概率；
- 因果依賴；
- 替代計畫；
- 「若不做」的結果；
- 模擬與 rollout。

## L8：不確定性、來源與證據層

每一項世界主張都必須攜帶：

- 來源；
- 時間；
- 可信度；
- 誤差；
- 新鮮度；
- 模型版本；
- 支持證據；
- 衝突；
- 撤銷記錄。

---

# 3. 世界實體

## 3.1 Entity

所有可被世界模型引用的對象：

$$
x
=
\left(
id,
type,
state,
geometry,
policy,
provenance
\right).
$$

## 3.2 主要類型

```text
PhysicalObject
Sample
Material
Container
Tool
Instrument
Station
RobotBody
Human
AIInstance
Zone
Path
Resource
Task
Obligation
Policy
Lease
Event
Evidence
Hypothesis
Model
Prediction
```

## 3.3 實體與描述分離

物理樣本 A 與其：

- CAD；
- 數位孿生；
- 照片；
- 模型 embedding；
- 分析結果；

是不同實體，透過關係連接。

不能把「樣本本體」和「樣本的數位描述」視為同一物件。

---

# 4. 身份解析

## 4.1 身份不是只靠名稱

同名物體可能不同；同一物體也可能有：

- QR code；
- RFID；
- 視覺特徵；
- 批次號；
- 容器位置；
- 手工標籤。

## 4.2 身份假說

觀測 $o$ 對應實體 $x$ 的概率：

$$
p(x\mid o)
\propto
p(o\mid x)p(x).
$$

## 4.3 身份狀態

```text
CONFIRMED
PROBABLE
AMBIGUOUS
CONFLICTED
LOST
RETIRED
```

## 4.4 高風險物件禁止模糊合併

樣本、工具、危險材料與校準件若身份不確定：

- 不自動合併；
- 不執行破壞性動作；
- 重新觀測；
- 人工確認；
- 保留衝突證據。

---

# 5. 座標框架與空間真值

## 5.1 多框架

同一物體可同時位於：

- 世界座標；
- 房間座標；
- 站點座標；
- 機器人 base；
- 工具座標；
- 相機座標；
- 樣本局部座標。

## 5.2 變換

$$
{}^{A}T_{C}
=
{}^{A}T_{B}
{}^{B}T_{C}.
$$

## 5.3 變換也有時間與不確定性

$$
T_{AB}
=
\left(
\hat{T}_{AB},
\Sigma_{AB},
t,
source
\right).
$$

## 5.4 座標漂移

長時間運作可能因：

- SLAM 漂移；
- 相機移動；
- 工作台震動；
- 重新校準；
- 人類搬動設備；

使舊位置失效。

## 5.5 幾何不一致時

系統不能只採用最後寫入者。

應比較：

- 感測來源；
- 誤差；
- 時間；
- 校準；
- 世界紀元；
- 物理可行性。

---

# 6. 區域模型

## 6.1 Zone

$$
z
=
\left(
geometry,
topology,
policy,
occupancy,
resources,
risk
\right).
$$

## 6.2 區域類型

- Storage Zone；
- Handoff Zone；
- Measurement Zone；
- Human Zone；
- Safety Exclusion Zone；
- Clean Zone；
- Contamination Zone；
- Charging Zone；
- Quarantine Zone；
- Virtual Zone。

## 6.3 區域是治理物件

區域不只是一個 polygon，還決定：

- 哪些站點可進入；
- 哪些物件可放置；
- 哪些能源可啟動；
- 人員進入時如何降級；
- 哪個感測器具有權威；
- 是否允許拍攝；
- 是否可外傳資料。

## 6.4 動態區域

移動設備可形成臨時安全區：

$$
Z_{\mathrm{dynamic}}(t)
=
f(
pose,
speed,
load,
risk
).
$$

---

# 7. 關係圖

## 7.1 空間關係

```text
inside
contains
on
supports
adjacent_to
connected_to
reachable_from
occludes
near
intersects
```

## 7.2 功能關係

```text
uses
requires
compatible_with
calibrated_by
powered_by
controlled_by
observed_by
```

## 7.3 保管與治理關係

```text
custodied_by
owned_by
leased_to
authorized_by
forbidden_in
governed_by
approved_by
```

## 7.4 任務與因果關係

```text
precedes
enables
blocks
causes
contributes_to
evidences
invalidates
compensates
```

## 7.5 關係也是主張

每一條邊：

$$
r
=
\left(
subject,
predicate,
object,
epistemic,
time,
source
\right).
$$

不能因為圖中有一條邊，就假設它是永恆真理。

---

# 8. 3D Dynamic Scene Graph 的位置

Kimera 的 3D Dynamic Scene Graph 提供：

- metric-semantic mesh；
- 物體；
- 人；
- places；
- rooms；
- buildings；
- 多層關係；
- 動態場景。

這是 SWM 的空間—語義骨架。

但 SWM 額外加入：

- 保管；
- 任務；
- 能源；
- 租約；
- 世界紀元；
- 證據；
- 預測分支；
- IP 與隱私。

因此：

$$
\text{DSG}
\subset
\text{SWM},
$$

而不是完整等價。

---

# 9. OpenUSD 的位置

OpenUSD 提供：

- 大型場景組合；
- prim 階層；
- references；
- variants；
- layers；
- non-destructive overrides；
- instancing。

SWM 可以使用 OpenUSD 表示：

- 靜態資產；
- 幾何；
- 虛擬場景；
- 組件；
- 不同配置；
- 數位孿生視圖。

但 OpenUSD Stage 不應直接成為控制真值。

## 9.1 Layer 的治理映射

可建立：

```text
base_asset_layer
survey_layer
live_observation_layer
operator_override_layer
simulation_layer
policy_annotation_layer
```

## 9.2 強覆寫不等於真實

USD 中較強的 layer 可以覆寫較弱 layer；SWM 中的權威順序必須由：

- 來源；
- 時間；
- 權限；
- 證據；
- 狀態類型；

決定，不能只用檔案 layer strength。

---

# 10. 事件世界

## 10.1 狀態是事件累積結果

$$
W_t
=
\operatorname{Fold}
\left(
W_{t_0},
e_{t_0+1},
\ldots,
e_t
\right).
$$

## 10.2 Event

$$
e
=
\left(
actor,
action,
object,
time,
location,
effect,
authority,
evidence
\right).
$$

## 10.3 事件類型

- Observed；
- Measured；
- Moved；
- Handoff Prepared；
- Handoff Committed；
- Calibrated；
- Lease Issued；
- Lease Revoked；
- Human Entered；
- Task Started；
- Task Failed；
- Model Predicted；
- World Reconciled。

## 10.4 W3C PROV

可將：

- Entity：樣本、資料、模型、結果；
- Activity：量測、移動、分析、製造；
- Agent：人類、AI、站點、組織；

映射至來源圖。

---

# 11. 認識狀態

## 11.1 世界主張不是只有真／假

定義：

$$
\epsilon
\in
\{
O,M,D,I,P,S,C,X,R
\}.
$$

對應：

- $O$：Observed；
- $M$：Measured；
- $D$：Declared；
- $I$：Inferred；
- $P$：Predicted；
- $S$：Simulated；
- $C$：Committed；
- $X$：Disputed；
- $R$：Revoked／Stale。

## 11.2 例子

```yaml
assertion:
  subject: "sample-17"
  predicate: "located_in"
  object: "microscope-zone"

  epistemic_state: "OBSERVED"
  confidence: 0.96
  observed_at: ""
  valid_until: ""
  source: "camera-02"
```

保管關係則需要：

```yaml
epistemic_state: "COMMITTED"
source: "handoff-transaction-42"
```

## 11.3 推論不能自動升級為提交

$$
\text{INFERRED}
\not\Rightarrow
\text{COMMITTED}.
$$

模型可以推測樣本已被拿走，但在身份與保管驗證前，不能正式轉移責任。

---

# 12. 不確定性與新鮮度

## 12.1 狀態

$$
x_t
=
\left(
\hat{x},
\Sigma,
t_{\mathrm{obs}},
t_{\mathrm{valid}},
source,
status
\right).
$$

## 12.2 不確定性類型

- 幾何；
- 身份；
- 類別；
- 狀態；
- 因果；
- 權限；
- 模型；
- 時間。

## 12.3 新鮮度

$$
\operatorname{Fresh}(x,t)
=
\mathbb{1}
\left[
t-t_{\mathrm{obs}}
\leq
\Delta_x^{\max}
\right].
$$

## 12.4 不知道也是正式狀態

```text
UNKNOWN
UNOBSERVABLE
OCCLUDED
NOT_INSTRUMENTED
CONFLICTED
```

系統不得用模型補全把「未知」靜默轉成「已知」。

---

# 13. 站點觀點

## 13.1 局部世界

每個站點維護：

$$
W_i(t)
=
\left(
X_i,
Z_i,
R_i,
E_i,
U_i
\right).
$$

## 13.2 Perspective View

同一世界對不同站點可見內容不同：

- 感測範圍；
- 權限；
- 隱私；
- 任務；
- 網路；
- 資料授權。

## 13.3 中央不是全知

全局模型：

$$
\hat{W}(t)
=
\operatorname{Fuse}
\left(
W_1(t-\delta_1),
\ldots,
W_n(t-\delta_n)
\right).
$$

它仍是估計。

## 13.4 最小披露

地方站點不必向所有其他站點公開：

- 人員影像；
- 私人資料；
- 專利候選；
- 完整模型；
- 外部合作資料。

可分享任務需要的最小世界切片。

---

# 14. 權限與世界模型

## 14.1 權限不是外部 ACL 附件

世界模型必須知道：

- 誰能看；
- 誰能改；
- 誰能批准；
- 誰能進入；
- 誰能保管；
- 誰能公開。

## 14.2 Policy Assertion

```yaml
policy:
  subject: "robot-arm-04"
  action: "grasp"
  object_class: "clean_sample"
  zone: "cell-B"
  governance_epoch: 12
  valid_until: ""
  constraints:
    max_force_n: 5
```

## 14.3 權限也有不確定性

若中央與地方對租約狀態不同：

- 採最保守狀態；
- 暫停高風險動作；
- 驗證 fencing；
- 不以最後寫入者勝出。

---

# 15. Affordance：可能行動

## 15.1 Affordance

Affordance 不是物體的永恆屬性，而是：

$$
\operatorname{Afford}(a,x,N_i,W_t)
$$

表示在當前世界、特定站點與作用域下，動作 $a$ 是否可行。

## 15.2 例子

同一杯子：

- 對夾爪 A 可抓；
- 對夾爪 B 太大；
- 在人類手中不可抓；
- 在危險區不可進入；
- 裝有液體時不可翻轉。

## 15.3 Affordance Contract

$$
\alpha
=
\left(
actor,
action,
target,
preconditions,
effects,
risks,
evidence
\right).
$$

## 15.4 可執行性

$$
\operatorname{Executable}(a,t)
=
\operatorname{Capable}
\land
\operatorname{Reachable}
\land
\operatorname{Permitted}
\land
\operatorname{Safe}
\land
\operatorname{Fresh}
\land
\operatorname{EvidenceReady}.
$$

## 15.5 Partial World Model

系統不需要模擬世界全部細節，只需對與當前意圖相關的 affordance 和後果形成高品質局部模型。

這可以降低搜索分支與模型負擔。

---

# 16. 預測世界模型

## 16.1 Predictive Branch

對候選行動序列 $\pi$：

$$
\hat{W}_{t+h}^{(\pi)}
=
F_\theta(W_t,\pi).
$$

## 16.2 多種預測器

- 物理模擬；
- 規則；
- 因果圖；
- occupancy model；
- video world model；
- 大型世界基礎模型；
- 經驗統計。

## 16.3 V-JEPA 2

可從影片與影像學習抽象的物理理解、預測和規劃表示，並展示零樣本機器人規劃。

## 16.4 Cosmos

世界基礎模型可以生成、理解和模擬物理場景，支援 Physical AI 的資料生成、預測和推理。

## 16.5 預測分支隔離

```text
COMMITTED WORLD
    ├── branch A: simulation
    ├── branch B: video prediction
    ├── branch C: rule-based estimate
    └── branch D: counterfactual
```

任何分支都不能直接寫回 committed world。

## 16.6 提交條件

只有：

- 行動真正執行；
- 物理觀測；
- 事件驗證；
- 權限與保管提交；

才能更新已提交世界。

---

# 17. 因果與反事實

## 17.1 相關不等於可干預

世界模型若只學到：

$$
a_t
\rightarrow
o_{t+1}
$$

的統計關係，可能忽略：

- 前置條件；
- 工具；
- 接觸；
- 隱藏變量；
- 政策；
- 行動是否真的可執行。

## 17.2 因果邊

```text
action → physical_effect
calibration_error → measurement_bias
human_entry → safety_mode_change
tool_change → capability_change
lease_revocation → action_forbidden
```

## 17.3 反事實

系統可問：

- 若不加熱會如何？
- 若改用站點 B 是否降低風險？
- 若延後量測是否使樣本失效？
- 若世界紀元已變更，原計畫是否仍成立？

## 17.4 因果模型也需證據

不能因 AI 產生一個合理因果故事，就將其寫成世界事實。

---

# 18. 數位孿生邊界與模型可信度

## 18.1 Twin Record

每個孿生模型需標記：

- 對應實體；
- 模型目的；
- 有效範圍；
- 參數來源；
- 校準；
- 驗證；
- 不確定性；
- 最近更新。

## 18.2 VVUQ

包括：

- Verification：實作是否符合模型；
- Validation：模型是否適合真實用途；
- Uncertainty Quantification：不確定性多大。

## 18.3 用途限制

同一孿生可能適合：

- 視覺展示；
- 低速碰撞檢查；

但不適合：

- 精密熱預測；
- 高速控制；
- 安全認證。

## 18.4 Twin Authority

數位孿生可以：

- 提出；
- 預測；
- 檢查；
- 最佳化。

它不能在與物理觀測衝突時自動覆蓋物理世界。

---

# 19. 來源與證據

## 19.1 Provenance

每個重要主張可映射至：

$$
\text{Entity}
\leftarrow
\text{Activity}
\leftarrow
\text{Agent}.
$$

## 19.2 來源鏈

例如：

```text
sample-17 temperature result
← analysis activity
← raw sensor file
← thermal rig measurement
← calibration artifact
← task and lease
```

## 19.3 來源影響權威

優先級不能固定為「感測器高於模型」或「人類高於感測器」。

應依主張類型：

- 人員批准：人類與治理記錄；
- 即時位置：校準感測；
- 設備能力：能力證書；
- 預期未來：模型；
- 保管：交接事務；
- 公開狀態：EML-CF 發布記錄。

---

# 20. 世界紀元

## 20.1 定義

$$
WE_k
=
\left(
k,
h_k,
t_k,
scope_k,
dependencies_k,
signature_k
\right).
$$

## 20.2 紀元不代表全世界快照

它表示：

- 一組關鍵世界主張；
- 在特定作用域；
- 被提交為任務可依賴的版本。

## 20.3 紀元失效

可能由：

- 人類進入；
- 樣本移動；
- 工具更換；
- 校準過期；
- 中央轉移；
- 站點隔離；
- 區域政策改變；

觸發。

## 20.4 任務依賴

```yaml
world_dependency:
  epoch: "WE-0042"
  strong:
    - "custody:sample-17"
    - "human_presence:cell-B"
  bounded:
    - "health:microscope-01"
  eventual:
    - "long_term_statistics"
```

---

# 21. 世界調和

## 21.1 衝突來源

- 多感測器；
- 斷線站點；
- 人類操作；
- 時鐘；
- 身份；
- 模型；
- 事件延遲。

## 21.2 衝突不靜默覆蓋

```yaml
world_conflict:
  subject: "sample-17"
  predicate: "located_in"
  assertions:
    - value: "storage-A"
      source: "central-log"
    - value: "microscope-zone"
      source: "camera-02"
  status: "DISPUTED"
```

## 21.3 Reconciliation Proposal

調和器可以：

- 重新觀測；
- 檢查交接；
- 檢查時間；
- 比較來源；
- 保留兩個假說；
- 要求人類。

## 21.4 提交權

調和建議必須經相應的：

- 地方確認；
- 域級中央；
- 或人類；

才改變 committed world。

---

# 22. 記憶與世界模型分離

## 22.1 AI 記憶不是世界真值

模型的對話記憶、向量記憶和經驗摘要可能：

- 過時；
- 壓縮；
- 缺少來源；
- 混入推論。

## 22.2 World Claim API

AI 不能自由寫入世界，只能提交：

```text
Observation Proposal
Inference Proposal
Prediction Branch
Action Proposal
Reconciliation Proposal
```

## 22.3 Commit API

只有具備權限的服務可提交：

- 物理事件；
- 保管轉移；
- 租約；
- 世界紀元；
- 人類批准。

---

# 23. 人類在世界模型中的位置

## 23.1 人類不是一般障礙物

必須表示：

- 是否存在；
- 角色；
- 授權；
- 隱私；
- 安全；
- 接管；
- 不確定意圖。

## 23.2 最小必要表示

通常不需要保存：

- 生物特徵；
- 詳細人格；
- 不相關活動。

只保存：

- 現場安全所需；
- 任務分工所需；
- 法律與事故所需；
- 經同意的資訊。

## 23.3 人類觀點

人類可以：

- 修正錯誤身份；
- 宣布設備已搬動；
- 接管；
- 拒絕；
- 提供領域判斷。

但人類聲明也應保存來源與時間，不應不留痕地改寫歷史。

---

# 24. 模型更新管線

## 24.1 感知更新

- 感測；
- 特徵；
- 物體；
- 姿態；
- 關係；
- 不確定性。

## 24.2 事件更新

- 任務；
- 控制；
- 交接；
- 權限；
- 人類。

## 24.3 預測更新

建立候選分支，不修改提交世界。

## 24.4 調和更新

解決衝突、撤銷過期主張。

## 24.5 紀元提交

對關鍵作用域產生新的可引用版本。

---

# 25. SWM 系統架構

## 25.1 Frame and Geometry Service

管理：

- tf；
- mesh；
- occupancy；
- pose；
- covariance。

## 25.2 Entity Registry

管理：

- 身份；
- 型別；
- 批次；
- 實體與描述關係。

## 25.3 Zone and Topology Service

管理：

- 區域；
- 路徑；
- 邊界；
- 動態安全區。

## 25.4 Relation／Scene Graph Store

管理多層圖。

## 25.5 Event and Provenance Journal

append-only 事件與來源。

## 25.6 Governance Graph

權限、租約、紀元、政策和 fencing。

## 25.7 Affordance Engine

根據：

- 身體；
- 工具；
- 物件；
- 世界；
- 權限；

計算可能行動。

## 25.8 Prediction Branch Manager

管理模擬、世界模型和反事實分支。

## 25.9 Epistemic and Conflict Manager

管理：

- 可信度；
- 新鮮度；
- 衝突；
- 未知；
- 調和。

## 25.10 World Epoch Authority

提交任務可依賴的世界版本。

## 25.11 Perspective and Access Service

根據站點、任務、隱私和 IP 產生最小世界切片。

---

# 26. SWM 查詢

## 26.1 狀態查詢

> 樣本 17 現在在哪裡？信心多少？誰保管？

## 26.2 能力查詢

> 哪個已校準站點能在不破壞樣本的條件下量測尺寸？

## 26.3 治理查詢

> 哪個中央和租約允許機械臂在 cell-B 抓取？

## 26.4 證據查詢

> 這個研究結果依賴哪些量測、校準和樣本事件？

## 26.5 反事實查詢

> 如果 microscope-01 離線，哪些任務可改走 microscope-02？

## 26.6 不確定查詢

> 哪些高風險物件的位置已超過新鮮度期限？

---

# 27. MVP：StationWorld-4

## 27.1 配置

- 一個感測站；
- 一個固定機械臂站；
- 一個移動站；
- 一個量測站；
- 三個區域；
- 五至十個樣本和工具；
- 一名人類操作員；
- 一個虛擬預測站。

## 27.2 世界層

- ROS 2 tf2／模擬座標；
- 簡化 3D scene graph；
- Entity Registry；
- Event Journal；
- Governance Graph；
- Affordance Engine；
- Prediction Branch；
- World Epoch。

## 27.3 任務

1. 樣本入庫；
2. 身份辨識；
3. 機械臂抓取；
4. 跨站交接；
5. 移動至量測區；
6. 量測；
7. 人類中途移動一個物件；
8. 模型預測下一步；
9. 調和；
10. 回寫 EML-CF 證據。

## 27.4 故障注入

- 相機遮擋；
- tf 漂移；
- QR 與視覺身份衝突；
- 中央日誌與實際位置不符；
- 租約過期；
- 人類進入；
- 數位孿生未更新；
- 模型生成不可能的物體關係；
- 交接事件遲到；
- 世界紀元失效。

## 27.5 成功條件

- 觀測、推論、模擬和提交狀態不混淆；
- 高風險身份衝突時停止；
- 權限與區域參與可執行性；
- 世界模型可表示未知；
- 預測分支不覆蓋物理事實；
- 數位孿生衝突時要求實測；
- 事件可重建保管與任務歷史；
- 人類介入後重新提交世界紀元。

---

# 28. 評估指標

## 28.1 幾何

- 定位誤差；
- transform 一致性；
- 漂移；
- 可達性錯誤。

## 28.2 身份

- identity precision／recall；
- 錯誤合併；
- 重複實體；
- 身份恢復時間。

## 28.3 關係

- scene graph relation accuracy；
- 空間一致；
- 保管一致；
- 任務依賴正確。

## 28.4 認識狀態

- 推論誤標為事實；
- 模擬誤標為實測；
- 過期主張仍被使用；
- 未知被錯誤補全。

## 28.5 Affordance

- 可執行性預測；
- 錯誤允許；
- 錯誤拒絕；
- 前置條件遺失。

## 28.6 預測

- 多步預測誤差；
- 物理一致性；
- 任務相關性；
- 不確定性校準。

## 28.7 調和

- 衝突發現率；
- 調和時間；
- 錯誤覆蓋；
- 人工介入量。

## 28.8 來源

- 事件可重建率；
- 主張—來源覆蓋；
- 證據缺失；
- 撤銷傳播。

---

# 29. 可證偽命題

## H1：多層世界模型比單一場景圖更能降低治理錯誤

加入保管、權限、事件和認識狀態後，錯誤物理動作應下降。

## H2：顯式未知優於模型自動補全

在遮擋與身份不確定場景中，保留 UNKNOWN 應降低高風險誤操作，但增加暫停。

## H3：Affordance 層可降低規劃分支

只建模任務相關可行行動，應比搜索完整世界動作空間更有效。

## H4：預測分支隔離降低生成模型污染真實世界

模型錯誤不應直接寫入 committed world。

## H5：數位孿生 VVUQ 提高模型使用邊界清晰度

未經驗證的孿生不應被用於高風險決策。

## H6：來源圖提高事故與研究重建能力

## H7：站點局部觀點與最小披露可降低不必要資料共享

代價是調和與查詢複雜度。

## H8：世界紀元能阻止依賴舊狀態的任務執行

## H9：生成式世界模型提高候選規劃，但不能取代 committed state

## H10：同時使用幾何、語義與治理關係，會提高模型成本

若完全沒有成本，代表實驗未真實計入儲存、延遲與維護。

---

# 30. 主要限制

## 30.1 世界不可能被完整建模

SWM 只能保存任務相關、可觀測和被授權的部分。

## 30.2 多層模型增加複雜度

需要：

- schema；
- 本體；
- 版本；
- 查詢；
- 同步；
- 儲存。

## 30.3 關係語義難以統一

不同領域對「安全」「接近」「乾淨」「可抓」定義不同。

## 30.4 神經世界模型難以完全解釋

## 30.5 事件和來源不保證內容真實

來源可信度仍需判斷。

## 30.6 物理真值也可能不可直接觀測

需要估計與多假說。

## 30.7 人類隱私與持續感知有張力

## 30.8 即時性能

大型圖、預測和來源查詢可能不適合硬即時控制。

---

# 31. 不能宣稱的內容

本篇不主張：

- SWM 是完整世界；
- 中央世界模型是全知真值；
- 數位孿生等同實體；
- 場景圖可取代幾何控制；
- 生成影片等於物理預測正確；
- 模型高信心等於可直接執行；
- 所有不確定性都能精確量化；
- W3C PROV 能自動證明資料真實；
- OpenUSD 可直接成為安全控制資料庫；
- tf2 可解決身份、保管與治理；
- Affordance 是物體固定屬性；
- 最後寫入者應覆蓋所有衝突；
- 人類聲明永遠比感測器正確；
- 世界模型可以無限制保存人類活動；
- 預測分支可以自動提交為物理事實。

---

# 32. 與後續系列的關係

本文建立共同世界表示後，下一篇將處理：

> EML-CF 產生的概念產品，如何在 SWM、SPR、OSF 和 PCD 上形成假說—實驗—證據—修正的具身自主研究閉環？

因此第 10 篇為：

# 《具身化 AI 自主研究閉環：從假說生成到物理驗證》

將建立：

- Hypothesis Contract；
- Experimental Design Agent；
- Feasibility Compilation；
- Simulation Gate；
- Physical Execution；
- Evidence Evaluation；
- Failure Learning；
- Concept Revision；
- IP Routing；
- Human Scientific Oversight。

---

# 33. 結論

世界模型最危險的錯誤，不一定是完全看不見世界，而是：

> 系統無法區分自己看見的、被告知的、推論的、想像的，以及正式承諾的世界。

站點化世界模型因此不追求把所有資訊壓成單一神經表示，而建立：

$$
\boxed{
\text{幾何}
+
\text{身份}
+
\text{區域}
+
\text{關係}
+
\text{事件}
+
\text{權限}
+
\text{Affordance}
+
\text{預測}
+
\text{來源}
}
$$

共同構成的混合世界。

其核心規律是：

$$
\boxed{
\text{觀測不等於提交}
}
$$

$$
\boxed{
\text{推論不等於事實}
}
$$

$$
\boxed{
\text{模擬不等於驗證}
}
$$

$$
\boxed{
\text{可到達不等於有權行動}
}
$$

真正可供超靈使用的世界模型，不只要回答「世界是什麼樣子」，還必須回答：

- 我為何相信它；
- 它還新鮮嗎；
- 誰看到的；
- 誰承諾的；
- 哪些地方未知；
- 誰能改變它；
- 哪些行動現在可行；
- 做完後需要什麼證據。

因此：

$$
\boxed{
\text{世界模型}
=
\text{可被多站點共同引用、質疑、預測與提交的物理世界契約}
}
$$

---

# 參考文獻與官方技術資料

1. Rosinol, A. et al. **3D Dynamic Scene Graphs: Actionable Spatial Perception with Places, Objects, and Humans.** Robotics: Science and Systems, 2020.  
   arXiv:2002.06289.

2. Rosinol, A. et al. **Kimera: From SLAM to Spatial Perception with 3D Dynamic Scene Graphs.** *The International Journal of Robotics Research*, 2021.  
   arXiv:2101.06894.

3. Chang, Y. et al. **Kimera-Multi: A System for Distributed Multi-Robot Metric-Semantic Simultaneous Localization and Mapping.** 2020.  
   arXiv:2011.04087.

4. ROS 2 Documentation. **About tf2.**  
   https://docs.ros.org/en/galactic/Concepts/About-Tf2.html

5. Pixar Animation Studios. **Universal Scene Description／OpenUSD.**  
   https://openusd.org/

6. OpenUSD. **Introduction, Core Specification, Terms and Concepts.**  
   https://openusd.org/release/intro.html

7. W3C. **PROV-O: The PROV Ontology.** W3C Recommendation, 2013.  
   https://www.w3.org/TR/prov-o/

8. W3C. **PROV-DM: The PROV Data Model.** W3C Recommendation, 2013.  
   https://www.w3.org/TR/prov-dm/

9. NIST. **Digital Twins for Advanced Manufacturing.**  
   https://www.nist.gov/programs-projects/digital-twins-advanced-manufacturing

10. Lu, Y. et al. **Manufacturing Digital Twin Standards.** NIST, 2024.

11. NIST. **Towards a Digital Twin of a Robot Workcell: Standards and Methods.** 2024.

12. Assran, M. et al. **V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning.** Meta AI, 2025.

13. NVIDIA. **Cosmos World Foundation Model Platform for Physical AI.** 2025.

14. NVIDIA Cosmos Lab. **Cosmos 3: Omnimodal World Models for Physical AI.** Technical Report, 2026.

15. Khetarpal, K. et al. **Affordances Enable Partial World Modeling with LLMs.** 2026.  
    arXiv:2602.10390.

16. Zhang, Q. et al. **AGWM: Affordance-Grounded World Models for Environments with Compositional Prerequisites.** 2026.  
    arXiv:2605.06841.

17. Zhang, Z. et al. **Occupancy World Model for Robots.** 2025.  
    arXiv:2505.05512.

18. Neo.K／Aletheia. **Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路.**

19. Neo.K／Aletheia. **持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域.**

20. Neo.K／Aletheia. **語義即物理路由：從資料流治理到物料、能源、站點與行動流治理.**

21. Neo.K／Aletheia. **中央主權、地方自治與動態不動點中央.**

22. Neo.K／Aletheia. **連線不是纜線：有線、無線、光學與離線任務包的混合站網.**

---

# 附錄 A：World Entity Record

```yaml
entity:
  id: ""
  type: ""
  names: []
  physical: true

  geometry:
    frame: ""
    pose: null
    covariance: null
    mesh: null

  state: {}
  policy_tags: []
  digital_representations: []

  identity:
    status: "PROBABLE"
    identifiers: []
    confidence: 0

  provenance:
    created_by: ""
    created_at: ""
    evidence: []
```

---

# 附錄 B：Relation Assertion

```yaml
relation_assertion:
  id: ""
  subject: ""
  predicate: ""
  object: ""

  epistemic:
    state: "OBSERVED | MEASURED | DECLARED | INFERRED |
            PREDICTED | SIMULATED | COMMITTED | DISPUTED | STALE"
    confidence: 0
    uncertainty: null

  timing:
    asserted_at: ""
    valid_from: ""
    valid_until: null

  world:
    epoch: ""
    scope: ""

  provenance:
    source_agent: ""
    source_activity: ""
    evidence: []
```

---

# 附錄 C：Affordance Contract

```yaml
affordance:
  id: ""
  actor: ""
  action: ""
  target: ""

  preconditions:
    capability: []
    geometry: []
    material: []
    authority: []
    safety: []
    world_freshness: []

  effects:
    expected: []
    forbidden: []

  evidence_required: []
  confidence: 0
  prediction_model: ""
  valid_until: ""
```

---

# 附錄 D：Counterfactual Branch

```yaml
counterfactual_branch:
  id: ""
  parent_world_epoch: ""
  action_sequence: []
  model:
    id: ""
    version: ""
    class: "physics | video_world_model | rule | causal | statistical"

  predicted_world_delta: []
  uncertainty: {}
  failure_modes: []
  evidence_status: "SIMULATED"
  committable: false
```

---

# 附錄 E：World Conflict

```yaml
world_conflict:
  id: ""
  subject: ""
  predicate: ""
  assertions: []

  risk:
    decision_blocking: true
    affected_tasks: []
    affected_zones: []

  reconciliation:
    required_observations: []
    proposed_resolution: null
    authority_required: ""
    status: "OPEN"

  evidence: []
```

---

# 附錄 F：World Epoch

```yaml
world_epoch:
  id: ""
  domain_id: ""
  sequence: 0
  created_at: ""
  governance_epoch: 0

  committed_assertions: []
  revoked_assertions: []
  unresolved_conflicts: []
  scope: []
  dependency_hash: ""
  signature: ""
```

---

# 附錄 G：Perspective View

```yaml
perspective_view:
  consumer: ""
  task_id: ""
  world_epoch: ""

  visible_layers:
    - geometry
    - entities
    - relations
    - affordances

  hidden:
    - personal_data
    - restricted_ip
    - unrelated_zones

  freshness_requirements: {}
  authority_scope: []
```

---

# 附錄 H：系列血緣

```text
OSF
  站點、能力與局部觀測
        ↓

PCD
  跨時間狀態與義務
        ↓

SPR
  世界狀態作為物理程序前置條件
        ↓

DFC
  權限、治理紀元與提交權
        ↓

HLF
  不同鏈路上的狀態新鮮度與調和
        ↓

本篇 SWM
  幾何、物體、區域、事件、權限、Affordance、預測與來源的共同世界
        ↓

第 10 篇
  以共同世界模型支撐具身自主研究閉環
```
