# Oversoul Station Fabric
## 固定站、移動站與虛擬站的分布式具身網路

**Oversoul Station Fabric: A Distributed Embodiment Network of Fixed, Mobile, and Virtual Stations**

**系列：**《時空域支配智能》系列第 3 篇  
**文件編號：** EML-STDI-OSF-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 系統架構論文／概念產品技術規格  
**證據成熟度：** E0——架構、形式模型與 MVP 規格  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate、來源、授權與安全審查  
**上位理論：** STDI｜時空域支配智能  
**前序論文：**
1. 《時空間支配型 AI：從單體具身智能到持續性時空域治理》
2. 《超靈的物理化：從 O-Chip 維度代理人到分布式具身主體》

---

## 摘要

前兩篇已提出，時空域支配智能不是一個 AI 加上多台機器人，而是一個具有持續治理核心、共享世界模型、權限租約、地方安全與證據責任鏈的分布式具身主體。然而，若沒有一個可部署的站點架構，「分布式身體」仍只是哲學描述：不同機器人、儀器、感測器、模擬器與遠端服務如何被發現？如何描述能力？如何進入共同世界模型？如何接收任務？如何完成跨站交接？如何在斷線、時序不一致或設備故障時安全退化？如何判定一個虛擬模型、遠端實驗室或人類專家是否也是站網的一部分？

本文提出 **Oversoul Station Fabric（OSF，超靈站網）**，作為 STDI 的物理—數位具身基礎設施。OSF 將一切可被治理、可提供能力、可回報狀態並可接受受限任務的實體或虛擬節點，抽象成「站點」。站點不是單純網路端點，也不是因接上 ROS、OPC UA 或 API 就自動成為超靈身體。正式站點必須同時具有：

1. 可驗證的身份；
2. 機器可讀的能力與限制；
3. 被定義的空間與作用域；
4. 可觀測的健康、校準與時間狀態；
5. 任務、權限與撤銷接口；
6. 本地安全或失敗邊界；
7. 世界紀元與證據提交能力。

本文將站點分成七類：感測站、執行站、儀器站、固定智能站、移動站、虛擬站與聯邦外部站。不同站點可經由有線確定性網路、一般有線網路、無線網路、光學鏈路或延遲容忍任務包連線。OSF 不要求所有連線具備相同即時性，而將通訊分成五個控制等級，禁止用高延遲雲端模型替代本地硬安全閉環。

OSF 的基本形式為：

$$
\mathcal{F}_{\mathrm{OSF}}
=
\left(
\mathcal{N},
\mathcal{E},
\mathcal{C},
\mathcal{W},
\mathcal{Q},
\mathcal{L},
\mathcal{P},
\mathcal{V}
\right),
$$

其中：

- $\mathcal{N}$：站點集合；
- $\mathcal{E}$：物理、通訊與任務關係；
- $\mathcal{C}$：能力與限制模型；
- $\mathcal{W}$：共享世界模型；
- $\mathcal{Q}$：任務與工作圖；
- $\mathcal{L}$：身體、能力與指揮租約；
- $\mathcal{P}$：安全、權限和治理政策；
- $\mathcal{V}$：證據、版本與來源血統。

本文建立 Station Descriptor、Capability Certificate、Station Registry、World Epoch、Task Envelope、Handoff Transaction 與 Evidence Commit 等核心物件，提出「準備—保留—移交—驗證—提交／中止」的跨站交接協議，避免樣本、工具、任務或責任在站點之間處於無人擁有或重複擁有的狀態。

現有 W3C Web of Things Thing Description 已提供描述實體或虛擬「Thing」的屬性、動作與事件之通用模型；OPC UA Robotics 已提供運動設備系統的資產、條件與診斷資訊模型；ROS 2 提供模組化節點、主題、服務、動作與 QoS；Open-RMF 以 Fleet Adapter 將異質移動機器人接入共同交通與任務管理；IEEE TSN 則提供有界延遲、低延遲變異與低丟包的確定性網路底座。OSF 不取代這些技術，而在它們之上增加「超靈具身」所需的能力語義、世界狀態、權限租約、跨站事務、地方自治與證據承諾。

本文的核心命題為：

> 站點不是因為連上網路而成為身體；站點是在被識別、被限制、被授權、被同步並被納入責任鏈之後，才成為超靈的物理或虛擬作用端。

**關鍵詞：** Oversoul Station Fabric、OSF、超靈站網、固定站、移動站、虛擬站、能力證書、站點註冊、世界紀元、跨站交接、身體租約、ROS 2、Open-RMF、OPC UA、Web of Things、TSN、分布式具身

---

# 0. 版本定位：第三篇補的是「多個身體如何形成一個可運作網路」

系列第一篇回答：

> 什麼是持續治理一個物理時空域的 AI？

系列第二篇回答：

> 什麼條件下，多個物理作用端可以被視為同一超靈的分布式具身？

本文回答：

> 這些作用端如何被組織成可發現、可調度、可交接、可隔離、可擴展與可證明的站點網？

如果沒有 OSF，超靈物理化只能依賴專案級整合：

- 每增加一台機器人就重寫控制程式；
- 每增加一個儀器就建立新的專用 API；
- 每一種樣本交接都用人工約定；
- 每個地方 Agent 使用不同的狀態格式；
- 每次故障都由中央臨時猜測；
- 每個遠端站點都無法清楚界定權限和責任。

OSF 的目標是建立一個「窄腰」：

```text
異質物理與數位設備
        ↓
Station Descriptor
Capability Certificate
Task / Lease / Evidence Protocol
        ↓
STDI 世界模型與超靈治理
```

OSF 不消除裝置差異，而是將差異轉化為可機器理解、可排程與可驗證的契約。

---

# 1. 從 GFMSN 站點語言到一般化具身站網

GFMSN／ODML 系列曾將光學資料運動層描述為：

- 主通道；
- 截面站；
- 支線站；
- 暫存站；
- 邏輯站；
- 中繼站；
- 讀出與重注入。

其中的關鍵抽象不是光纖本身，而是：

> 一個持續運動的對象，在不同站點被識別、分流、等待、變換、量測，最後重新進入主流程。

OSF 將被處理的對象從光學資料擴張為：

$$
\mathcal{X}
=
\{
\text{樣本},
\text{工具},
\text{材料},
\text{任務},
\text{數據},
\text{能源},
\text{權限},
\text{人類請求},
\text{證據}
\}.
$$

原本的：

$$
\text{drop}
\rightarrow
\text{delay}
\rightarrow
\text{transform}
\rightarrow
\text{reinject}
$$

轉化為：

$$
\text{取得}
\rightarrow
\text{保留／等待}
\rightarrow
\text{處理／量測}
\rightarrow
\text{驗證}
\rightarrow
\text{移交或回流}.
$$

因此，OSF 是 GFMSN 的站點化思維在一般物理域中的尺度遷移，但它不要求光學媒介，也不預設所有站點位於一條線性路徑上。

---

# 2. 定義：什麼是站點

## 2.1 最低定義

一個 OSF 站點 $N_i$ 表示為：

$$
N_i
=
\left(
I_i,
T_i,
C_i,
F_i,
Z_i,
X_i,
H_i,
K_i,
A_i,
P_i,
V_i
\right),
$$

其中：

- $I_i$：身份與所有權；
- $T_i$：站點類型；
- $C_i$：能力集合；
- $F_i$：限制、失敗與安全包絡；
- $Z_i$：位置、作用區與移動範圍；
- $X_i$：可讀寫接口；
- $H_i$：健康、校準、能源與時鐘狀態；
- $K_i$：地方控制和自治能力；
- $A_i$：當前任務、租約與保留；
- $P_i$：政策、信任與安全標籤；
- $V_i$：版本、證據與來源。

## 2.2 站點不是一般網路節點

一般網路節點只需能收發資料。

OSF 站點還必須回答：

- 我是誰？
- 我能做什麼？
- 我不能做什麼？
- 我目前在哪裡？
- 我是否校準？
- 我的資料多久以前觀測？
- 我現在被誰租用？
- 我正在持有哪個樣本或工具？
- 我的本地安全能否拒絕命令？
- 我產生的結果如何被驗證？

## 2.3 站點也不一定有物理身體

虛擬站、模擬器、HPC、遠端資料分析服務和人類專家也可以成為站點，但它們的能力類型不同。

一個虛擬站不能宣稱：

- 已移動物體；
- 已執行物理測量；
- 已完成設備校準。

它只能提交相應類型的數位結果及證據。

---

# 3. 七類站點

## 3.1 S0：感測站

主要能力：

- 觀察；
- 定位；
- 識別；
- 追蹤；
- 狀態估計；
- 事件偵測。

例子：

- 相機；
- 深度相機；
- 光譜感測器；
- 溫度與濕度；
- 電流、電壓、壓力；
- 聲學；
- UWB 定位；
- 安全光幕。

感測站的核心輸出必須帶有：

$$
o
=
\left(
\hat{x},
\Sigma,
t,
s,
c
\right),
$$

其中：

- $\hat{x}$：觀測值；
- $\Sigma$：不確定性；
- $t$：時間；
- $s$：來源；
- $c$：校準與可信度。

## 3.2 S1：執行站

提供有限致動：

- 開關；
- 泵；
- 閥；
- 加熱；
- 冷卻；
- 旋轉；
- 位移；
- 夾持；
- 照明；
- 電源切換。

執行站通常不負責長期規劃，但必須具有本地安全限制。

## 3.3 S2：儀器站

儀器站不只是「可以呼叫的 API」，而是具有：

- 樣本接口；
- 操作程序；
- 校準程序；
- 量測範圍；
- 解析度；
- 不確定性；
- 耗材；
- 污染限制；
- 數據格式；
- 證據輸出。

例子：

- 顯微鏡；
- 示波器；
- 熱像儀；
- 光譜儀；
- 材料試驗機；
- 3D 列印；
- CNC；
- 電性量測；
- 化學分析。

## 3.4 S3：固定智能站

固定智能站是在固定位置提供：

- 多種感測；
- 多種執行；
- 本地世界模型；
- 局部任務排程；
- 故障處理；
- 安全否決；

的複合站。

例如自動測試工作台、機械臂工作單元、自動材料製備單元。

## 3.5 S4：移動站

包括：

- AGV；
- AMR；
- 移動機械臂；
- 無人機；
- 移動感測平台；
- 移動儀器；
- 人形或輪足機器人。

其額外狀態包括：

- 路徑；
- 地圖；
- 定位信心；
- 電池；
- 載荷；
- 交通保留；
- 對接能力；
- 動態作用域。

Open-RMF 的 Fleet Adapter 類型提供了一個現實前身：不同機器人可以透過轉接層與共同交通和任務系統互動，而不必共享相同的原生控制 API。

## 3.6 S5：虛擬站

包括：

- 模擬器；
- 數位孿生；
- AI 模型；
- HPC；
- 最佳化器；
- CAD／CAE；
- 資料分析器；
- EML-CF 研究 Agent。

虛擬站的輸入輸出必須明確區分：

- 預測；
- 模擬；
- 推論；
- 建議；
- 實際量測。

## 3.7 S6：聯邦外部站

包括：

- 遠端實驗室；
- 第三方設備；
- 合作公司；
- 共享儀器；
- 人類專家；
- 雲端服務。

外部站不直接繼承內部信任，必須經：

- 身份認證；
- 能力聲明；
- 組織契約；
- NDA／資料政策；
- 任務租約；
- 結果驗證。

---

# 4. Station Descriptor：站點描述文件

## 4.1 目的

Station Descriptor 是 OSF 的機器可讀窄腰。它可借用：

- W3C WoT Thing Description 的 Properties、Actions 與 Events；
- OPC UA 的資訊模型；
- ROS 2 interface；
- 自訂 OSF 能力與治理欄位。

## 4.2 最小結構

```yaml
station:
  id: "osf:lab-a:thermal-rig-02"
  name: "Thermal Test Rig 02"
  type: "instrument_station"
  owner: "EveMissLab"
  trust_domain: "private-lab-a"

location:
  zone: "thermal-cell"
  pose_frame: "lab_map"
  fixed: true

interfaces:
  properties:
    - temperature
    - calibration_state
    - occupancy
  actions:
    - reserve
    - load_sample
    - execute_profile
    - emergency_stop
  events:
    - calibration_expired
    - over_temperature
    - sample_complete

capabilities:
  - id: "thermal_transient_test"
    input_types: ["thermal_coupon"]
    temperature_range_c: [20, 180]
    max_power_w: 500
    evidence_outputs:
      - thermal_video
      - power_trace
      - thermocouple_log

safety:
  local_interlock: true
  human_exclusion_zone: "thermal-cell"
  abort_actions:
    - remove_power
    - cool_down

governance:
  lease_required: true
  world_epoch_required: true
  local_veto: true
```

## 4.3 Descriptor 不等於能力已被證明

Station Descriptor 是聲明。

能力證書才記錄：

- 誰驗證；
- 用何種測試；
- 版本；
- 有效期限；
- 誤差；
- 適用範圍。

---

# 5. Capability Certificate：能力證書

## 5.1 定義

能力證書：

$$
\kappa_{i,c}
=
\left(
N_i,
c,
\Theta,
M,
R,
t_0,
t_1,
\sigma
\right),
$$

其中：

- $N_i$：站點；
- $c$：能力；
- $\Theta$：適用參數範圍；
- $M$：測試方法；
- $R$：測試結果與不確定性；
- $[t_0,t_1]$：有效期；
- $\sigma$：簽章。

## 5.2 能力狀態

```text
DECLARED
  ↓
SIMULATED
  ↓
SHADOW_TESTED
  ↓
VERIFIED
  ↓
OPERATIONAL
  ↓
DEGRADED | EXPIRED | REVOKED
```

## 5.3 能力不是二元值

例如「抓取」能力應包含：

- 物體尺寸；
- 質量；
- 材質；
- 摩擦；
- 允許姿態；
- 最大作用力；
- 成功率；
- 視覺條件；
- 所需工具。

形式上：

$$
\operatorname{Capable}(N_i,q)
=
\mathbb{1}
\left[
\Theta_q
\subseteq
\Theta_{i,c}
\land
H_i\in H_{\mathrm{valid}}
\right].
$$

---

# 6. Station Registry：發現、註冊與信任

## 6.1 站點生命週期

```text
DISCOVERED
  ↓
IDENTIFIED
  ↓
DESCRIBED
  ↓
ATTESTED
  ↓
SHADOW
  ↓
ACTIVE
  ↓
DEGRADED | QUARANTINED | RETIRED
```

## 6.2 發現

可以透過：

- 靜態設定；
- WoT Discovery；
- ROS 2 discovery；
- OPC UA discovery；
- Fleet Adapter；
- 人工註冊；
- 遠端合作入口。

發現只表示系統知道某個端點存在，不表示信任。

## 6.3 身份與證明

每個站點至少有：

- 穩定 ID；
- 組織所有者；
- 軟體／韌體版本；
- 憑證；
- 公鑰；
- 硬體或軟體證明；
- 最後驗證時間。

## 6.4 影子模式

新站點先進入 Shadow：

- 接收任務但不執行；
- 比較其計畫與既有站點；
- 驗證狀態回報；
- 執行模擬或空載測試；
- 不持有高風險權限。

---

# 7. 站網圖

OSF 是多層有向圖：

$$
\mathcal{G}_{\mathrm{OSF}}
=
\left(
V,
E_{\mathrm{physical}},
E_{\mathrm{communication}},
E_{\mathrm{task}},
E_{\mathrm{authority}},
E_{\mathrm{evidence}}
\right).
$$

## 7.1 物理邊

表示：

- 可移動路徑；
- 可交接樣本；
- 可連接工具；
- 能源供應；
- 空間鄰接；
- 管線或材料流。

## 7.2 通訊邊

表示：

- 協定；
- 頻寬；
- 延遲；
- 抖動；
- 可靠度；
- 安全；
- 是否持續在線。

## 7.3 任務邊

表示：

- 前置依賴；
- 可替代站點；
- 必須共窗；
- 交接；
- 排他鎖。

## 7.4 權限邊

表示：

- 哪個治理核心可租用站點；
- 哪個站點可代理其他站；
- 哪些動作不能轉授；
- 哪些區域需人類批准。

## 7.5 證據邊

表示：

- 哪項觀測支持哪項決策；
- 哪個儀器生成哪個結果；
- 哪個轉換產生哪個樣本；
- 哪個版本被用於哪次實驗。

---

# 8. 五級通訊與控制分類

OSF 不要求所有通訊都使用同一網路。

## C0：硬即時本地控制

- 微秒至毫秒；
- 不依賴外部網路；
- 馬達、互鎖、急停；
- 封閉或認證控制器。

## C1：確定性站點協調

- 毫秒級；
- 有界延遲；
- 儀器同步；
- 機械交接；
- 時間敏感資料。

IEEE TSN 的設計目標包括有界延遲、低延遲變異與低丟包，可作為 C1 底層候選。

## C2：操作級資料與任務

- 毫秒至秒；
- ROS 2／DDS；
- OPC UA；
- 一般工業 Ethernet；
- 高可靠無線。

ROS 2 QoS 可針對可靠度、持久性、歷史與期限調整通訊行為，但 QoS 設定不能取代端到端安全分析。

## C3：治理與研究

- 秒至小時；
- 高階任務；
- 模型更新；
- EML-CF；
- 報告；
- 雲端推理。

## C4：延遲容忍與離線任務包

- 長延遲；
- 間歇連線；
- 遠端站；
- 軌道、深海或跨組織作業。

每個任務包必須攜帶：

- 有效期限；
- 允許動作；
- 安全集合；
- 世界狀態快照；
- 回報與撤銷規則。

---

# 9. Task Envelope：任務封套

## 9.1 定義

任務不只是自然語言提示，而是：

$$
q
=
\left(
g,
P,
E,
R,
D,
S,
V,
B
\right),
$$

其中：

- $g$：目標；
- $P$：前置條件；
- $E$：期望效果；
- $R$：所需資源與能力；
- $D$：期限與時間窗；
- $S$：安全與權限；
- $V$：證據要求；
- $B$：失敗、回退與替代策略。

## 9.2 範例

```yaml
task:
  id: "task:sample-17:microscopy"
  goal: "Acquire calibrated microstructure images"

preconditions:
  sample_state: "clean"
  sample_owner_station: "handoff-cell-01"
  microscope_calibration: "valid"

requirements:
  capabilities:
    - sample_transfer
    - optical_microscopy
  deadline: "2026-07-30T21:10:00+08:00"

safety:
  max_grip_force_n: 5
  human_exclusion_required: false

world:
  required_epoch: "WE-0042"
  stale_after_seconds: 30

evidence:
  required:
    - pre_transfer_image
    - custody_change
    - microscope_settings
    - raw_images
    - calibration_reference

fallback:
  - station: "microscope-02"
  - human_assist: true
```

---

# 10. 任務分配

對任務 $q$ 與站點 $N_i$，適配分數：

$$
\begin{aligned}
S(q,N_i)
={}&
w_c C_{\mathrm{cap}}
+
w_h C_{\mathrm{health}}
+
w_t C_{\mathrm{time}}
+
w_z C_{\mathrm{location}}
\\
&+
w_e C_{\mathrm{evidence}}
+
w_r C_{\mathrm{reliability}}
-
w_p C_{\mathrm{power}}
-
w_k C_{\mathrm{risk}}.
\end{aligned}
$$

多站點任務需要求解：

$$
\min_{\pi}
\left(
T_{\mathrm{makespan}}
+
\lambda E_{\mathrm{energy}}
+
\mu R_{\mathrm{risk}}
+
\nu C_{\mathrm{handoff}}
\right),
$$

滿足：

- 能力；
- 空間；
- 時間；
- 排他；
- 世界紀元；
- 權限；
- 安全；
- 證據；

約束。

AI 可以提出計畫，但執行前由形式規則和地方安全檢查。

---

# 11. Handoff Transaction：跨站交接事務

跨站交接是 OSF 最重要的工程問題之一。

交接對象可能是：

- 樣本；
- 工具；
- 任務；
- 控制權；
- 數據流；
- 安全責任；
- 實驗證據。

## 11.1 為何不能只發「已交給 B」

物理世界中可能發生：

- A 已放手，B 未抓穩；
- A、B 都認為自己持有；
- 樣本已移動，但世界模型未更新；
- 樣本身份混淆；
- 交接期間人類介入；
- 網路在提交前中斷。

## 11.2 五階段協議

### H0：Prepare

確認：

- 雙方身份；
- 世界紀元；
- 物件身份；
- 區域；
- 能力；
- 安全；
- 證據設備。

### H1：Reserve

鎖定：

- 交接區；
- 接收站；
- 對象；
- 時間窗；
- 交通路徑。

### H2：Transfer

執行物理或數位移交，但責任尚未提交。

### H3：Verify

透過：

- 視覺；
- 重量；
- RFID；
- 力感；
- 位置；
- 雜湊；
- 雙方回報；

確認接收成功。

### H4：Commit／Abort

成功：

$$
\operatorname{Owner}(x)
:
A
\rightarrow
B.
$$

失敗：

- 返回 A；
- 放入安全緩衝區；
- 隔離；
- 人工介入。

## 11.3 交接不一定原子

物理狀態不能像資料庫一樣瞬間回滾，因此 OSF 採用補償事務，而非假設完美 ACID。

---

# 12. 世界紀元與站點一致性

## 12.1 站點局部狀態

每個站點維護：

$$
W_i(t)
=
\left(
O_i,
Z_i,
Q_i,
H_i,
L_i,
U_i
\right).
$$

## 12.2 全局狀態是估計

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

不存在完全免費的即時全局真值。

## 12.3 世界紀元

每個高風險任務聲明：

- 依賴哪些物件；
- 容許多舊；
- 哪些狀態需要強一致；
- 哪些可最終一致。

若紀元不再有效：

$$
\operatorname{Valid}(q,WE_k)=0,
$$

任務必須暫停、重新觀測或重新規劃。

---

# 13. 地方自治與失聯

## 13.1 失聯模式

```text
CONNECTED
DEGRADED_LINK
ISOLATED
SAFE_STOP
LOCAL_MISSION
RECOVERY
```

## 13.2 地方可做的事

失聯時站點只能在預先授予的離線租約內：

- 完成當前安全子步驟；
- 停止；
- 保存樣本；
- 返回安全區；
- 執行低風險觀測；
- 保存日誌。

不能：

- 啟動新高風險任務；
- 擴張區域；
- 轉授權；
- 更換世界目標；
- 將結果自行公開。

## 13.3 重連

重連後必須：

1. 身份再認證；
2. 比較世界紀元；
3. 上傳離線事件；
4. 解決狀態衝突；
5. 重發或撤銷租約；
6. 再進入 ACTIVE。

---

# 14. 虛擬站與物理站的證據隔離

## 14.1 虛擬站的價值

虛擬站可以：

- 搜尋；
- 模擬；
- 最佳化；
- 預測；
- 生成實驗；
- 分析資料；
- 建立數位孿生。

## 14.2 最危險的錯誤

將虛擬站輸出誤標為物理證據。

因此每個輸出具有：

```yaml
evidence_class:
  - simulation
  - model_prediction
  - inferred_state
  - physical_observation
  - calibrated_measurement
  - human_report
```

只有適當的物理站點和校準鏈能提交 `calibrated_measurement`。

## 14.3 數位孿生不是權威本體

數位孿生應被視為：

$$
\hat{W}_{\mathrm{twin}}
\approx
W_{\mathrm{physical}},
$$

而不是：

$$
\hat{W}_{\mathrm{twin}}
=
W_{\mathrm{physical}}.
$$

---

# 15. 安全、信任與隔離

## 15.1 零信任站點原則

站點接入網路不等於獲得動作權。

每次動作需要：

- 身份；
- 租約；
- 世界紀元；
- 能力；
- 健康；
- 政策；
- 本地安全；

共同通過。

## 15.2 安全區域

每個區域 $Z_j$ 具有：

$$
Z_j
=
\left(
R_j,
A_j,
H_j,
O_j,
E_j
\right),
$$

其中：

- $R_j$：風險；
- $A_j$：允許動作；
- $H_j$：人類進入規則；
- $O_j$：允許物件；
- $E_j$：緊急程序。

## 15.3 隔離

站點可因以下原因被隔離：

- 校準過期；
- 異常遙測；
- 安全事件；
- 韌體不符；
- 身份失效；
- 世界模型污染；
- 資料授權不明；
- 重複失敗。

隔離站仍可回報最低狀態，但不能取得新租約。

---

# 16. 現有技術如何映射到 OSF

## 16.1 W3C Web of Things

WoT Thing Description 提供一個通用模型，用於描述實體或虛擬 Thing 的：

- Metadata；
- Properties；
- Actions；
- Events；
- Protocol bindings。

OSF 可用它作為通用站點外殼，再增加：

- 能力證書；
- 安全包絡；
- 世界紀元；
- 租約；
- 證據類型。

## 16.2 OPC UA Robotics

OPC UA Robotics Part 1 描述運動設備系統，支援資產管理、條件監控與診斷等垂直整合用例。

OSF 可將其作為工業機器人和運動設備的狀態來源，但仍需額外處理：

- 高階任務；
- 移動交通；
- 身體租約；
- 多站交接；
- 研究證據。

## 16.3 ROS 2／DDS

ROS 2 將複雜系統拆成節點，透過 Topics、Services、Actions 與 QoS 交換資料。

OSF 可使用：

- Topic：連續狀態；
- Service：短操作；
- Action：長任務；
- Lifecycle Node：站點生命週期；
- QoS：可靠度、歷史、期限與存活。

但 ROS graph 不是治理圖；發現節點也不表示其可被租用。

## 16.4 Open-RMF

Open-RMF 的 Fleet Adapter 為異質移動機器人建立轉接層，讓不同原生 API 的車隊接入共同交通和任務系統。

OSF 將這種 adapter 原則一般化到：

- 固定儀器；
- 機械臂；
- 移動儀器；
- 虛擬站；
- 遠端實驗室。

## 16.5 IEEE TSN

TSN 適合時間敏感的站點間資料與協調，但不應被描述為所有安全控制的唯一解法。硬即時與安全互鎖仍應盡量留在本地。

---

# 17. OSF 九層架構

## L0：物理域與區域安全

- 房間；
- 工作單元；
- 人員；
- 危險區；
- 緊急設備。

## L1：裝置原生控制

- PLC；
- MCU；
- servo；
- 儀器 firmware；
- 急停。

## L2：站點轉接與描述

- ROS 2 node；
- OPC UA server；
- WoT Thing；
- Fleet Adapter；
- 自訂 adapter。

## L3：能力與健康

- Capability Certificate；
- 校準；
- 健康；
- 信心；
- 維護。

## L4：通訊與時間

- TSN；
- DDS；
- Ethernet；
- Wi-Fi／5G；
- 光纖；
- 離線任務包。

## L5：Station Registry 與信任

- 身份；
- 註冊；
- 發現；
- attest；
- shadow；
- 隔離。

## L6：任務、租約與交接

- Task Envelope；
- Reservation；
- Lease；
- Handoff Transaction；
- Compensation。

## L7：世界模型與超靈治理

- World Epoch；
- 任務圖；
- 資源；
- 語義路由；
- 地方自治。

## L8：證據、EML-CF 與聯邦接口

- Evidence Commit；
- Provenance；
- IP；
- 開源；
- 遠端合作；
- 發布。

---

# 18. MVP：OSF-Lab-4

## 18.1 配置

第一個 OSF MVP 使用四個主要站點：

1. **S0 感測站**：相機與標記識別；
2. **S3 固定智能站**：桌面機械臂；
3. **S4 移動站**：小型 AMR 或模擬移動平台；
4. **S2 儀器站**：重量、尺寸或成像量測。

另有：

- S5 虛擬站：任務規劃與模擬；
- STDI 中央治理服務；
- 本地安全控制；
- Station Registry；
- Evidence Store。

## 18.2 任務

```text
樣本入庫
→ 感測站識別
→ 固定站抓取
→ 交接區移交給移動站
→ 移動至儀器站
→ 儀器量測
→ 回傳結果
→ EML-CF 建立證據紀錄
```

## 18.3 故障注入

- 移動站斷線；
- 儀器校準過期；
- 樣本身份不一致；
- 世界紀元變更；
- 交接後視覺未確認；
- 租約過期；
- 人類進入交接區；
- 虛擬站預測與實測矛盾。

## 18.4 成功條件

- 新站點可經 descriptor 接入；
- 能力不足的站點不被分配；
- 交接失敗不造成樣本無主；
- 地方安全可否決中央；
- 斷線站點不能擴張任務；
- 虛擬結果不被標為實測；
- 所有物理行動具有責任與證據鏈。

---

# 19. 指標

## 19.1 接入

- 新站點接入時間；
- 自訂程式碼量；
- descriptor 完整率；
- 能力證書覆蓋率。

## 19.2 排程

- 有效任務完成率；
- 排程重算次數；
- 能力錯配；
- 世界紀元過期造成的停止率。

## 19.3 交接

- 交接成功率；
- 重複所有權事件；
- 無主樣本事件；
- 平均補償時間。

## 19.4 安全

- 越權動作；
- 地方否決正確率；
- 隔離生效時間；
- 失聯後安全停止率。

## 19.5 證據

- 證據完整率；
- 來源不明結果；
- 模擬／實測誤標；
- 事件重建成功率。

---

# 20. 可證偽命題

## H1：Station Descriptor 降低異質設備接入成本

相較完全專案式整合，第二個與第三個異質站點所需的人工開發時間應下降。

## H2：能力證書降低錯誤任務分配

使用參數化能力、健康與校準狀態後，因設備不適合而失敗的任務應下降。

## H3：交接事務降低樣本所有權不一致

相較單純事件訊息，Prepare—Reserve—Transfer—Verify—Commit 流程應降低無主與重複所有權。

## H4：世界紀元增加停止但提高有效成功率

引入紀元驗證後，表面任務啟動率可能下降，但錯誤狀態下執行的實驗應下降。

## H5：混合通訊優於全雲端或全硬即時

將安全、地方自治、操作資料和高階治理分層後，應在成本、可靠度與擴展性之間取得較佳平衡。

## H6：虛擬站證據隔離降低過度宣稱

將模擬、推論和實測分級後，報告中把模型結果寫成物理驗證的錯誤應下降。

---

# 21. 主要限制

## 21.1 Descriptor 不會自動解決語義互通

兩個站點都宣稱 `grasp`，不表示：

- 物體類型相同；
- 成功定義相同；
- 精度相同；
- 安全條件相同。

仍需要本體、測試與能力證書。

## 21.2 跨站事務不能保證物理原子性

物理轉移可能不可逆。OSF 只能建立可觀測、可補償與可追責的流程。

## 21.3 中央世界模型必然有延遲

站網規模增加時，不應追求所有狀態的強一致。

## 21.4 多標準整合會增加複雜度

ROS 2、OPC UA、WoT、RMF 與 TSN 解決不同層級問題。把它們全部引入並不自動形成好系統。

## 21.5 能力證書可能過期

設備老化、工具更換、環境變化與模型更新都可能使證書失效。

## 21.6 外部站點的責任邊界更複雜

跨組織操作需要契約、資料政策、人員安全與事故責任安排，不能只靠技術協議。

---

# 22. 不能宣稱的內容

本篇不主張：

- OSF 已是成熟標準；
- 連上 ROS 2 或 OPC UA 的設備自動成為超靈身體；
- W3C WoT 可直接處理所有工業安全；
- Open-RMF 已解決所有異質站點問題；
- TSN 可以取代本地安全控制；
- 所有物理交接都能像資料庫事務般回滾；
- 世界模型可以保持完全即時與一致；
- Station Descriptor 等同能力已被驗證；
- 虛擬站輸出等同物理實驗；
- 超靈可以自行接管未授權設備；
- 站點越多，研究能力必然線性增加。

---

# 23. 與後續系列的關係

OSF 建立「身體網路」之後，下一篇將回答：

> 這個站網如何跨越數小時、數天甚至數年，持續維持同一個物理域？

因此第 4 篇自然進入：

# 《持續性指揮控制區：AI 如何佔據並維持一個物理時空域》

後續將處理：

- 域建立與解除；
- 持續存在；
- 世界狀態老化；
- 人類進出；
- 長任務；
- 夜間與斷線運作；
- 權限續租；
- 事件與未完成義務；
- 指揮存在的最小條件。

---

# 24. 結論

分布式具身智能最容易犯的錯，是把「設備可連線」誤認為「設備已形成共同身體」。

真正的超靈站網需要把每一個作用端轉化為：

$$
\boxed{
\text{身份}
+
\text{能力}
+
\text{限制}
+
\text{位置}
+
\text{健康}
+
\text{租約}
+
\text{證據}
}
$$

OSF 的功能不是取消異質性，而是讓異質性可以被治理。

固定機械臂、移動機器人、量測儀器、模擬器、遠端實驗室與人類專家，不需要變成同一種設備；它們需要的是一個共同語言，用來回答：

- 誰能做什麼；
- 在哪裡做；
- 在何時做；
- 在何種世界狀態下做；
- 由誰授權；
- 失敗時怎麼辦；
- 結果如何被證明。

因此：

$$
\text{站點}
\neq
\text{網路端點},
$$

$$
\boxed{
\text{站點}
=
\text{被描述、被驗證、被租用、被同步與被追責的能力端}
}
$$

而：

$$
\boxed{
\text{Oversoul Station Fabric}
=
\text{異質能力的可治理分布式身體}
}
$$

這使「超靈」第一次不只是高階智能的隱喻，而具有可逐步實作的身體網路。

---

# 參考文獻與官方技術資料

1. W3C. **Web of Things (WoT) Thing Description 2.0.** 2025.  
   https://www.w3.org/TR/wot-thing-description-2.0/

2. W3C. **Web of Things (WoT) Discovery.** 2023.  
   https://www.w3.org/TR/wot-discovery/

3. W3C. **Web of Things (WoT) Scripting API.**  
   https://www.w3.org/TR/wot-scripting-api/

4. OPC Foundation. **OPC UA for Robotics — Part 1: Vertical Integration.**  
   https://reference.opcfoundation.org/specs/OPC-40010-1

5. OPC Foundation. **OPC UA Companion Specifications.**  
   https://opcfoundation.org/about/opc-technologies/opc-ua/ua-companion-specifications/

6. Open Robotics. **ROS 2 Documentation.**  
   https://docs.ros.org/

7. Open Robotics. **ROS 2 Quality of Service settings.**  
   https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Quality-of-Service-Settings.html

8. Open-RMF. **Fleet Adapter Template.**  
   https://github.com/open-rmf/fleet_adapter_template

9. IEEE 802.1. **Time-Sensitive Networking Task Group.**  
   https://1.ieee802.org/tsn/

10. Object Management Group. **Data Distribution Service, Version 1.4.**  
    https://www.omg.org/spec/DDS/1.4/

11. Neo.K／Aletheia. **飛行即定址與幾何站網：光學資料運動層的站點化實作框架.** EML-ODML-GFMSN-2026-v0.3.

12. Neo.K／Aletheia. **語義即路由：從 O-Chip 維度代理人到 AI 資料中心語義流治理.** EML-SFRSN-2026-v0.2.

13. Neo.K／Aletheia. **時空間支配型 AI：從單體具身智能到持續性時空域治理.** EML-STDI-2026-v0.1.

14. Neo.K／Aletheia. **超靈的物理化：從 O-Chip 維度代理人到分布式具身主體.** EML-STDI-2026-v0.2.

---

# 附錄 A：最小 Station Descriptor

```yaml
station:
  id: ""
  name: ""
  type: ""
  owner: ""
  trust_domain: ""

location:
  fixed: true
  zone: ""
  pose_frame: ""

interfaces:
  properties: []
  actions: []
  events: []

capabilities: []
limitations: []

health:
  status: "unknown"
  calibration: "unknown"
  firmware_version: ""
  last_attested_at: ""

governance:
  lease_required: true
  world_epoch_required: true
  local_veto: true
  offline_policy: "safe_stop"

evidence:
  output_types: []
  provenance_required: true
```

---

# 附錄 B：最小 Capability Certificate

```yaml
capability_certificate:
  id: ""
  station_id: ""
  capability: ""
  parameter_envelope: {}
  test_method: ""
  result_summary: ""
  uncertainty: ""
  issued_by: ""
  valid_from: ""
  valid_until: ""
  station_version: ""
  signature: ""
```

---

# 附錄 C：最小交接紀錄

```yaml
handoff:
  id: ""
  object_id: ""
  sender_station: ""
  receiver_station: ""
  handoff_zone: ""
  world_epoch: ""

  prepare:
    sender_ready: false
    receiver_ready: false
    zone_reserved: false

  transfer:
    started_at: ""
    completed_at: ""

  verification:
    vision: null
    weight: null
    identity: null
    receiver_confirmation: false

  result:
    state: "pending"
    new_custodian: null
    compensation_action: null

  evidence_artifacts: []
```

---

# 附錄 D：系列血緣

```text
GFMSN
  站點、支線、局部處理、交會與重注入
        ↓

SFRSN
  語義分類、流路治理、中央與地方
        ↓

STDI 第 1 篇
  持續時空域治理
        ↓

STDI 第 2 篇
  同一治理核心與多身體
        ↓

本篇 OSF
  身體如何註冊、發現、租用、交接與形成站網
        ↓

第 4 篇
  站網如何形成持續性指揮控制區
```
