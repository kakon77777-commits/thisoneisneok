# 時空間支配型 AI
## 從單體具身智能到持續性時空域治理

**Spatiotemporal Domain Intelligence: From Individual Embodied Agents to Persistent Governance of Physical Domains**

**系列：**《時空域支配智能》系列第 1 篇  
**文件編號：** EML-STDI-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 母命題論文／系統架構研究綱領  
**證據成熟度：** E0——概念、形式模型與可證偽研究議程  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate 與證據審查

---

## 摘要

現有具身人工智能研究通常將「身體」理解為一台機器人、一組感測器與執行器，或一群可以分工協作的移動代理。自主實驗室則進一步將人工智能、機器人、自動化儀器、材料與量測流程組合成實驗閉環，使系統能在有限問題空間中提出條件、執行操作、分析結果並選擇下一輪實驗。這些成果已證明，AI 可以控制物理或計算實驗，移動機器人也能在既有實驗室中操作多種設備。然而，現有系統大多仍是針對狹窄研究任務、少數工具與特定流程建立的客製化閉環；它們通常不被定義為一個長期維持同一物理區域、跨任務保存世界模型、持續分配權限與資源、管理多個固定與移動身體，並保存因果證據的統一智能主體。

本文提出「時空間支配型 AI」作為新的母命題，正式工程名稱為 **時空域支配智能（Spatiotemporal Domain Intelligence, STDI）**。本文中的「支配」不指無限制控制，不指對物理時空本身具有超自然能力，也不表示中央 AI 應直接操縱每一個馬達與安全回路。它指的是：在一個被明確授權、空間有限、時間持續的物理域中，人工智能能否長期維持可更新的世界狀態，管理固定站、移動站、儀器、材料、能源、算力與人類協作者，將研究或生產意圖編譯成可執行的站點任務，並在局部安全約束、可撤回權限與完整證據鏈之下完成觀測、行動、驗證與回退。

STDI 的基本形式不是：

$$
\text{一個 AI}+\text{很多機器人},
$$

而是：

$$
\begin{aligned}
\text{STDI}
={}&
\text{持續性智能主體}
+
\text{站點化分布式身體}
+
\text{時空域世界模型}
\\
&+
\text{語義—物理流編譯}
+
\text{權限與資源治理}
+
\text{證據與回退閉環}.
\end{aligned}
$$

本文承接 O-Chip／Oversoul 的「決策—執行分離」、SFRSN 的「中央主權—地方自治—動態不動點中央」、GFMSN 的站點、支線、分流與重注入語言、ODML 的「飛行即定址」與「對齊即容量」，以及 EML-CF 的概念生成、證據管理與智慧財產分流。其核心貢獻是把這些原本用於晶片、資料中心與光學資料運動層的架構原理，尺度遷移到具身研究、實驗室自動化與分布式物理控制。

本文提出九層 STDI 架構、六類站點、三層控制閉環、四種連線模式、五種域主權、權限租約與局部否決機制，並建立「具身即佔域、對齊即能力」的初步形式模型。本文同時給出與一般機器人群、自主實驗室、智慧工廠、數位孿生與多代理系統的差異，明確限制其近期工程範圍，並提出從軟體模擬、桌面研究站、單房間實驗域到跨實驗室聯邦的分階段驗證路線。

**關鍵詞：** 時空間支配型 AI、時空域支配智能、STDI、超靈、Oversoul、具身人工智能、分布式身體、站點網、持續性指揮控制區、自主實驗室、語義即物理路由、具身對齊、世界模型、權限租約、物理回退

---

# 0. 版本定位：這不是單一產品，而是新系列的母命題

本文是《時空域支配智能》系列的第一篇。它不試圖一次完成所有硬體、協議、機器人、安全規範與自主研究實作，而負責完成四項工作：

1. 定義什麼是「時空間支配型 AI」；
2. 區分它與既有具身 AI、自主實驗室及機器人群；
3. 建立整個系列可共用的形式模型與架構邊界；
4. 指定後續子論文與子產品的展開位置。

本系列預計至少包含：

1. 時空間支配型 AI 母命題；
2. 超靈的物理化；
3. Oversoul Station Fabric／超靈站網；
4. 持續性指揮控制區；
5. 語義即物理路由；
6. 具身即佔域、對齊即能力；
7. 中央主權、地方自治與動態不動點中央；
8. 有線、無線、光學與離線任務包混合站網；
9. 站點化世界模型；
10. 具身自主研究閉環；
11. 時空域 AI 安全憲法；
12. 從研究室到跨站點研究文明。

因此，本文不是一份單機器人設計，也不是一份單一實驗室自動化白皮書，而是一個產品族、協議族與研究議程的共同地基。

---

# 1. 問題起點：為什麼單體具身 AI 不足以驗證大量未來概念產品

對大量前沿概念產品而言，真正昂貴的部分通常不是寫出想法，而是完成以下循環：

$$
\text{假說}
\rightarrow
\text{設計}
\rightarrow
\text{製造}
\rightarrow
\text{量測}
\rightarrow
\text{失敗分析}
\rightarrow
\text{修改}
\rightarrow
\text{再驗證}.
$$

當產品涉及：

- 新型處理器架構；
- 異質封裝；
- 光電混合互連；
- 熱與功率控制；
- 材料與微結構；
- 生物混合介面；
- 新型製造流程；
- 多站點分布式系統；

人類研究團隊往往受到：

- 儀器時間；
- 人員排班；
- 樣本交接；
- 跨專業溝通；
- 夜間停機；
- 量測格式不一致；
- 重複操作；
- 實驗版本混亂；
- 長週期等待；
- 證據斷裂；

等問題限制。

具身化 AI 的價值，不是讓材料反應、製造過程或物理測試失去必要時間，而是降低大量非物理性的等待與協調成本。

一台通用機器人仍然不足，原因包括：

1. 它只能同時佔據有限位置；
2. 它攜帶的工具有限；
3. 它不能替代固定的大型儀器；
4. 它的故障會使整個身體失去功能；
5. 它通常以單一任務或短期工作階段運作；
6. 它很難獨自維持跨房間、跨設備與跨數日的完整世界狀態。

真正需要的不是一個更像人的機器人，而是：

> 一個能將整個被授權研究空間理解為分布式身體的持續性智能。

---

# 2. 現有技術提供了哪些基礎，又缺少什麼

## 2.1 自主實驗室已證明閉環可行

A-Lab 已展示以自主代理、機器人與材料合成設備形成閉環，在研究者指定的目標集合內持續選擇合成方案、執行實驗與分析結果。移動機器人也已被用於在傳統實驗室中操作多種設備，使不完全為自動化而設計的空間可以被納入自主工作流。

這些成果證明：

$$
\text{AI 決策}
+
\text{機器人執行}
+
\text{儀器量測}
+
\text{結果回饋}
$$

可以形成實際物理閉環。

但現有自主實驗室通常具有以下特徵：

- 研究問題狹窄；
- 工作流高度客製；
- 使用工具數量有限；
- 對材料與設備依賴強；
- 安全邊界由人類預先設定；
- 世界模型主要服務當前實驗；
- 系統身份與任務多在專案級存在。

因此，自主實驗室是 STDI 的必要前身，但不等於完整 STDI。

## 2.2 資訊物理系統提供了感知—通訊—致動框架

NIST 將資訊物理系統描述為將計算、通訊、感測與致動和物理系統及人類整合，以完成不同關鍵程度的功能。這提供 STDI 的基本工程底座。

但資訊物理系統通常不必具備：

- 長期研究目標；
- 跨任務身份連續性；
- 主動生成新實驗；
- 多身體共同自我模型；
- 智慧財產與證據分流；
- 對自身能力邊界的語義理解。

STDI 在 CPS 上增加的是持續性智能治理層。

## 2.3 數位孿生提供狀態映射，但不自動產生治理主體

數位孿生可以對實體、設備與流程建立虛擬對應，支援即時監控、模擬、分析與異常偵測。它是 STDI 世界模型的重要組件。

但：

$$
\text{Digital Twin}
\neq
\text{Autonomous Domain Governor}.
$$

數位孿生可以描述世界，STDI 還必須決定：

- 哪些任務應執行；
- 誰可以執行；
- 何時執行；
- 需要哪些資源；
- 哪些結果可信；
- 何時停止或回退。

## 2.4 機器人軟體與工業互通提供站點接口

ROS 2、ros2_control、DDS、OPC UA Robotics 與 IEEE TSN 等技術，已提供：

- 機器人元件抽象；
- 感測器、執行器與系統描述；
- 即時資料分發；
- 多廠商設備資訊模型；
- 有界延遲與低抖動網路；
- 多機器人與機器人—感測器組合。

因此，STDI 不需要重新發明所有底層裝置驅動與通訊協議。

它真正需要新增的是：

- 時空域任務語義；
- 站點能力證書；
- 權限租約；
- 世界狀態紀元；
- 具身對齊排程；
- 證據與回退關係；
- 中央與地方的治理規則。

---

# 3. 定義：什麼是時空域支配智能

定義一個被授權的物理時空域：

$$
\mathcal{D}
=
\left(
\Omega,
\mathcal{T},
\mathcal{N},
\mathcal{R},
\mathcal{A},
\mathcal{P}
\right),
$$

其中：

- $\Omega$：空間區域集合；
- $\mathcal{T}$：時間窗口、期限與事件序列；
- $\mathcal{N}$：固定站、移動站與虛擬站；
- $\mathcal{R}$：材料、能源、算力、儀器與人員資源；
- $\mathcal{A}$：可被系統請求或執行的動作；
- $\mathcal{P}$：權限、安全與治理政策。

**時空域支配智能**定義為：

> 一個能在被授權的有限物理時空域中，持續維護帶不確定性的世界模型，將高階意圖編譯為站點任務與物理流，配置資源與權限，協調多個固定和移動身體，執行觀測—行動—驗證閉環，並在故障或政策違反時安全降級與回退的人工智能系統。

可表示為：

$$
\mathfrak{I}_{\mathrm{STDI}}
=
\left(
\mathcal{W},
\mathcal{G},
\mathcal{Q},
\mathcal{B},
\mathcal{E},
\Pi,
\Gamma
\right),
$$

其中：

- $\mathcal{W}$：世界狀態模型；
- $\mathcal{G}$：站點與通訊圖；
- $\mathcal{Q}$：任務、實驗與維護佇列；
- $\mathcal{B}$：資源、能量、熱與風險預算；
- $\mathcal{E}$：證據、來源與不確定性；
- $\Pi$：控制與排程策略；
- $\Gamma$：治理、權限與安全憲法。

---

# 4. 「支配」不是無限控制，而是有限域中的五種主權

「支配」是一個有意保留張力的母命題詞。工程上必須把它拆解，防止概念滑向全知全能或無限制控制。

## 4.1 感知主權

系統能持續回答：

- 哪些物體存在；
- 它們位於何處；
- 哪些狀態由感測器直接觀測；
- 哪些只是模型推定；
- 哪些區域目前不可觀測；
- 哪些感測器失準；
- 哪些資訊已過期。

因此感知主權包含「知道自己不知道什麼」。

## 4.2 時序主權

系統能管理：

- 任務順序；
- 同步窗口；
- 樣本有效期限；
- 儀器暖機時間；
- 維護週期；
- 不得同時發生的操作；
- 必須共同發生的量測；
- 中斷後的恢復點。

## 4.3 資源主權

系統能在授權範圍內分配：

- 儀器時段；
- 機器人；
- 材料；
- 樣本容器；
- 電力；
- 熱預算；
- 算力；
- 網路；
- 人類介入時間。

## 4.4 行動主權

系統可以透過站點改變物理世界，但任何動作都受：

- 能力邊界；
- 權限租約；
- 本地互鎖；
- 安全集合；
- 執行前檢查；
- 事後證據；

限制。

## 4.5 證據主權

系統能追蹤：

- 哪一個模型提出實驗；
- 哪一個策略批准；
- 哪一個站點執行；
- 使用哪一批材料；
- 在何種校準狀態下量測；
- 結果由誰或哪個模型判讀；
- 哪些結論需要重做；
- 哪些資料已進入產品、專利或公開流程。

五種主權可以寫為：

$$
\mathcal{S}_{D}
=
S_{\mathrm{sense}}
+
S_{\mathrm{time}}
+
S_{\mathrm{resource}}
+
S_{\mathrm{action}}
+
S_{\mathrm{evidence}}.
$$

缺少其中任一項，系統都不應被稱為完整時空域支配智能。

---

# 5. 從 O-Chip 到超靈物理化

O-Chip 的原始命題，是把高階預測、規劃、依賴分析與資源治理從執行核心中抽離：

$$
\text{高階決策}
\rightarrow
\text{O-Chip／Oversoul},
$$

$$
\text{高吞吐執行}
\rightarrow
\text{CPU／GPU／專用單元}.
$$

這可概括為：

> 決策應發生在長視野、高語義與全局狀態可見的地方；執行應發生在短反射、高吞吐與局部確定性的地方。

STDI 將這個結構再做一次尺度遷移：

$$
\text{晶片內靈肉分離}
\rightarrow
\text{資料中心語義治理}
\rightarrow
\text{物理時空域治理}.
$$

新的分工為：

```text
Oversoul／Domain Intelligence
= 長期目標、因果模型、跨站點規劃、權限與證據

Local Station Agent
= 局部狀態估計、快速反射、站點排程、故障處理

Hard Real-Time Controller
= 馬達、互鎖、急停、壓力、溫度、雷射與電氣安全
```

因此，超靈物理化不代表把一個大模型直接接到所有馬達，而是建立不同時間尺度的嵌套控制。

---

# 6. 站點化分布式身體

STDI 的身體不是單一機器，而是站點集合：

$$
\mathcal{B}_{D}
=
\{
N_0,N_1,\ldots,N_k
\}.
$$

每一站點表示為：

$$
N_i
=
\left(
C_i,
O_i,
Z_i,
L_i,
R_i,
H_i,
U_i
\right),
$$

其中：

- $C_i$：能力集合；
- $O_i$：可觀測狀態；
- $Z_i$：可作用空間；
- $L_i$：延遲與連線特性；
- $R_i$：資源需求；
- $H_i$：健康與校準狀態；
- $U_i$：地方自主權與安全限制。

## 6.1 S0：感測站

功能包括：

- 視覺；
- 光譜；
- 聲學；
- 溫度；
- 壓力；
- 電磁；
- 化學；
- 環境；
- 人員與設備位置。

感測站可以只讀，不必具有致動權。

## 6.2 S1：執行站

功能包括：

- 開關；
- 泵；
- 閥；
- 馬達；
- 加熱；
- 冷卻；
- 電源；
- 夾具；
- 基本搬運。

其控制邏輯應有限、可驗證且具有本地安全邊界。

## 6.3 S2：儀器站

代表：

- 顯微鏡；
- 光譜儀；
- 示波器；
- 3D 列印；
- CNC；
- 化學分析；
- 材料測試；
- 熱與電性量測。

儀器站必須提供能力、校準、樣本接口與證據格式。

## 6.4 S3：移動站

代表：

- AGV；
- AMR；
- 輪式機器人；
- 無人機；
- 移動機械臂；
- 可換工具平台。

移動站的主要價值是把未自動化的空間與異質儀器納入站網。

## 6.5 S4：地方智能站

具有：

- 局部世界模型；
- 任務片段；
- 異常偵測；
- 通訊中斷降級；
- 本地安全否決；
- 受限重排程；
- 狀態摘要。

## 6.6 S5：虛擬與遠端站

包括：

- 模擬器；
- 數位孿生；
- 遠端 HPC；
- 雲端模型；
- 第三方實驗室；
- 遠端儀器；
- 人類專家。

虛擬站不直接佔據本地域，但可以提供推理、模擬、分析與外部驗證。

---

# 7. 從 GFMSN 到 Oversoul Station Fabric

GFMSN 將光學資料運動系統理解為主通道、站點、支線、延遲、分流、局部操作與重注入的網路。

STDI 保留此結構，但把被路由的對象從光脈衝擴張為：

- 任務；
- 樣本；
- 材料；
- 工具；
- 能源；
- 數據；
- 人員請求；
- 權限；
- 證據。

GFMSN 的：

$$
\text{drop}
\rightarrow
\text{delay}
\rightarrow
\text{transform}
\rightarrow
\text{reinject}
$$

在物理研究域中對應：

$$
\text{取出樣本或任務}
\rightarrow
\text{等待或局部處理}
\rightarrow
\text{量測與變換}
\rightarrow
\text{重新進入主流程}.
$$

由此形成：

> **Oversoul Station Fabric，OSF／超靈站網**

OSF 是 STDI 的分布式身體與控制織網，不限定使用單一廠牌、單一通訊介質或單一機器人形態。

---

# 8. 語義即物理路由

SFRSN 原本將資料語義編譯成物理流座標：

$$
\text{semantic tag}
\rightarrow
\text{flow class}
\rightarrow
\text{physical coordinate}
\rightarrow
\text{delivery window}.
$$

STDI 將其物理化為：

$$
\begin{aligned}
\text{research intent}
&\rightarrow
\text{task semantics}
\rightarrow
\text{station capability}
\\
&\rightarrow
\text{material／energy／action route}
\rightarrow
\text{execution window}.
\end{aligned}
$$

例如：

```yaml
intent:
  "比較三種散熱微結構在相同熱流密度下的穩態與瞬態性能"

task_semantics:
  sample_class: thermal_coupon
  contamination_class: low
  temperature_limit: 180C
  measurement: [thermal_camera, thermocouple, electrical_power]
  repeatability: 5
  destructive: false

route:
  fabrication_station: S2_print_03
  conditioning_station: S1_oven_01
  test_station: S2_thermal_rig_02
  inspection_station: S2_microscope_01
  mobile_carrier: S3_amr_02
```

這裡的路由不是最短路問題，而是同時受：

- 材料相容；
- 工具可用性；
- 校準狀態；
- 時間窗口；
- 能源；
- 安全；
- 樣本有效期；
- 證據需求；
- 人類權限；

共同約束。

---

# 9. 具身即佔域，對齊即能力

## 9.1 身體數量不等於能力

一個系統擁有 $N$ 個站點，不代表能同時完成 $N$ 個有效任務。

$$
C_{\mathrm{embodied}}
\neq
|\mathcal{N}|.
$$

站點可能：

- 正在維護；
- 尚未校準；
- 缺少材料；
- 與其他任務衝突；
- 不在正確位置；
- 網路中斷；
- 安全條件不允許；
- 使用不同世界狀態版本。

## 9.2 具身對齊集合

對任務 $q$，定義所需站點、資源與狀態的對齊條件：

$$
\mathcal{A}(q,t)
=
\left\{
(n,r,w,p,e)
\mid
\operatorname{Ready}(n,t),
\operatorname{Available}(r,t),
\operatorname{Consistent}(w),
\operatorname{Permitted}(p),
\operatorname{EvidenceReady}(e)
\right\}.
$$

可執行條件為：

$$
\operatorname{Executable}(q,t)
=
\mathbb{1}
\left[
\mathcal{A}(q,t)
\models
\mathcal{C}_q
\right],
$$

其中 $\mathcal{C}_q$ 是任務約束。

## 9.3 有效具身容量

在時間窗 $\Delta t$ 內的有效具身容量可初步定義為：

$$
C_{\mathrm{eff}}(\Delta t)
=
\sum_{q\in\mathcal{Q}}
v_q
\cdot
\operatorname{Executable}(q,\Delta t)
\cdot
p_q^{\mathrm{success}}
-
C_{\mathrm{coord}}
-
C_{\mathrm{recovery}},
$$

其中：

- $v_q$：任務價值；
- $p_q^{\mathrm{success}}$：成功概率；
- $C_{\mathrm{coord}}$：協調成本；
- $C_{\mathrm{recovery}}$：錯誤與回退成本。

這就是「對齊即能力」在具身域的版本。

---

# 10. 三層控制閉環

STDI 不允許單一高階模型直接承擔所有控制頻率。

## 10.1 L0：硬即時安全閉環

時間尺度：

$$
\mu s \sim ms.
$$

負責：

- 馬達電流；
- 碰撞；
- 急停；
- 雷射互鎖；
- 高壓；
- 壓力；
- 溫度；
- 化學洩漏；
- 人體接近。

原則：

$$
\text{Global AI Command}
<
\text{Local Hard Safety Constraint}.
$$

任何中央命令都不能繞過 L0。

## 10.2 L1：地方站點自治閉環

時間尺度：

$$
ms \sim s.
$$

負責：

- 局部運動規劃；
- 儀器程序；
- 站內重試；
- 故障隔離；
- 量測品質檢查；
- 通訊中斷時安全完成或停止。

## 10.3 L2：超靈全局治理閉環

時間尺度：

$$
s \sim days.
$$

負責：

- 實驗設計；
- 任務分解；
- 資源調度；
- 跨站點路由；
- 研究優先級；
- 模型更新；
- 證據整合；
- IP 與發布路由。

三層關係為：

$$
\text{L0 Safety}
\subset
\text{L1 Local Autonomy}
\subset
\text{L2 Global Governance}.
$$

---

# 11. 中央主權、地方自治與動態不動點中央

STDI 可以分成三代。

## 11.1 第一代：中央主權

中央智能：

- 保存主要世界模型；
- 分配所有任務；
- 決定站點路由；
- 設定資源與風險預算。

地方站點只執行受限程序。

優點是容易理解與審計；缺點是中央延遲、單點失效與擴展性。

## 11.2 第二代：中央策略＋地方自治

地方 Agent 可以在租約範圍內：

- 重排局部任務；
- 重新選擇工具；
- 處理小型故障；
- 暫停不可信操作；
- 壓縮並回報狀態。

但不能：

- 改變全局研究目標；
- 擴張自身權限；
- 解除安全限制；
- 決定專利或公開；
- 對高風險動作自行批准。

## 11.3 第三代：動態不動點中央

當系統跨越多個實驗室、資料中心與遠端站點時，中央不一定是一台固定機器。

可以將治理中心定義為：

$$
c_t^{\star}
=
\arg\max_{c\in\mathcal{C}_t}
\left(
I_c
+
T_c
+
R_c
-
L_c
-
U_c
\right),
$$

其中：

- $I_c$：資訊完整性；
- $T_c$：可信度；
- $R_c$：資源可用性；
- $L_c$：延遲；
- $U_c$：不確定性。

「中央」是當前最適合維持共同策略與證據一致性的治理狀態，而不必永久綁定單一節點。

這仍只是遠期研究命題，不是 MVP 前提。

---

# 12. 連線不是纜線：混合通訊站網

站網的本體是治理與任務關係，不是固定物理線路。

## 12.1 有線確定性連線

適合：

- 安全；
- 即時控制；
- 高頻儀器；
- 大量數據；
- 固定設備。

候選包括：

- 工業 Ethernet；
- TSN；
- EtherCAT；
- 專用光纖；
- 儀器匯流排。

IEEE TSN 的目標是提供有界延遲、低延遲變異與低丟包的確定性連線，可作為站點間時間敏感流的底層之一。

## 12.2 無線移動連線

適合：

- 移動機器人；
- 臨時站；
- 人類穿戴裝置；
- 空間重配置。

但不能假設所有無線連線都能支援硬即時安全。

## 12.3 光學與視覺信標

可用於：

- 高速資料；
- 精密時間參考；
- 站點定位；
- 近距離對接；
- 無線電受限環境。

## 12.4 離線任務包

在斷線、遠距、深海、軌道或行星環境中，站點可以接受帶有：

- 任務；
- 權限；
- 截止時間；
- 安全集合；
- 回報條件；

的簽章任務包。

因此：

$$
\text{連線持續性}
\neq
\text{治理持續性}.
$$

治理關係可以在有限時間內由租約與任務包維持。

---

# 13. 時空域世界模型

STDI 的世界模型不能只是三維地圖。

定義：

$$
\mathcal{W}_t
=
\left(
O_t,
Z_t,
E_t,
R_t,
A_t,
P_t,
U_t,
V_t
\right),
$$

其中：

- $O_t$：物體、樣本、設備與代理；
- $Z_t$：空間區域與邊界；
- $E_t$：事件與時間線；
- $R_t$：物理、任務與因果關係；
- $A_t$：可能動作；
- $P_t$：權限與安全政策；
- $U_t$：不確定性；
- $V_t$：世界狀態版本／紀元。

## 13.1 世界狀態不是單一真值

每個狀態可表示為：

$$
x
=
(\hat{x},\Sigma_x,t_{\mathrm{obs}},s_{\mathrm{source}}),
$$

其中：

- $\hat{x}$：估計值；
- $\Sigma_x$：不確定性；
- $t_{\mathrm{obs}}$：觀測時間；
- $s_{\mathrm{source}}$：來源。

## 13.2 世界狀態紀元

當中央與地方站點狀態不同步時，每個任務必須聲明其依賴的世界狀態版本：

```yaml
world_epoch: WE-2026-07-30-042
valid_until: 2026-07-30T21:05:00+08:00
required_entities:
  - sample_batch_17
  - thermal_rig_02
  - robot_arm_04
```

若重要狀態已變更，任務必須重新驗證。

---

# 14. 權限租約與行動證書

永久性全域控制權不適合分布式具身系統。

STDI 採用權限租約：

$$
\ell
=
\left(
a,
n,
z,
[t_0,t_1],
\mathcal{C},
k
\right),
$$

其中：

- $a$：允許動作；
- $n$：被授權站點；
- $z$：作用區域；
- $[t_0,t_1]$：有效時間；
- $\mathcal{C}$：約束；
- $k$：簽章與撤銷資訊。

例如：

```yaml
lease:
  station: robot_arm_04
  action: transfer_sample
  zone: clean_cell_B
  valid_from: "20:15:00"
  valid_until: "20:20:00"
  max_force: "20N"
  allowed_objects: [sample_17]
  destination: microscope_01
  revoke_on:
    - human_entry
    - vision_confidence_below_0.95
    - world_epoch_changed
```

權限租約使站點有足夠自治完成任務，但不能將暫時權限轉化為永久主權。

---

# 15. 證據閉環與 EML-CF

STDI 的每個物理行動應產生證據事件：

$$
e_t
=
\left(
\text{intent},
\text{plan},
\text{station},
\text{artifact},
\text{parameters},
\text{observation},
\text{decision},
\text{hash}
\right).
$$

完整自主研究循環為：

$$
\begin{aligned}
\text{EML-CF Concept}
&\rightarrow
\text{Falsifiable Hypothesis}
\rightarrow
\text{Experiment Graph}
\\
&\rightarrow
\text{Station Scheduling}
\rightarrow
\text{Physical Execution}
\rightarrow
\text{Evidence}
\\
&\rightarrow
\text{Model Revision}
\rightarrow
\text{Concept／IP Routing}.
\end{aligned}
$$

EML-CF 負責：

- 概念產品；
- 先前技術；
- 文件；
- IP 路由；
- 公開與開源。

STDI 負責：

- 實驗計畫物理化；
- 站點與材料協調；
- 實驗執行；
- 量測；
- 世界狀態；
- 證據回傳。

兩者結合後形成：

> AI 自主概念產品研究—驗證閉環。

---

# 16. 與相似系統的差異

## 16.1 與一般機器人群

機器人群重點通常是：

- 分布式協作；
- 編隊；
- 探索；
- 任務分配；
- 局部自治。

STDI 還要求：

- 長期身份；
- 世界狀態版本；
- 儀器與材料治理；
- 證據；
- 權限租約；
- 跨任務研究目標；
- IP 與發布接口。

## 16.2 與智慧工廠

智慧工廠通常圍繞：

- 已知產品；
- 穩定製程；
- 生產效率；
- 品質控制；
- 維護。

STDI 允許：

- 未知流程；
- 實驗性任務；
- 假說生成；
- 失敗即證據；
- 架構與設備持續重組。

## 16.3 與自主實驗室

自主實驗室通常是 STDI 的特定應用域。

STDI 更強調：

- 多研究線；
- 多類站點；
- 跨時間持續性；
- 物理域權限；
- 多實驗室聯邦；
- 概念產品生命週期。

## 16.4 與數位孿生

數位孿生是世界模型的一部分；STDI 還具有策略、授權、執行與證據治理。

## 16.5 與一般多代理系統

多代理系統可以全部存在於軟體。

STDI 必須面對：

- 物理不可逆；
- 能源；
- 空間占用；
- 材料耗損；
- 人身安全；
- 設備老化；
- 實驗污染；
- 法規。

---

# 17. 九層架構

## L0：物理環境與安全邊界

- 空間；
- 人員；
- 設備；
- 化學、電氣、機械與熱限制；
- 急停與互鎖。

## L1：感測與致動

- 感測器；
- 馬達；
- 泵閥；
- 工具；
- 儀器接口。

## L2：本地即時控制

- PLC；
- MCU；
- servo；
- safety controller；
- ros2_control 類控制框架。

## L3：站點能力與地方 Agent

- 能力描述；
- 校準；
- 健康；
- 局部規劃；
- 本地否決；
- 任務執行。

## L4：混合連線與時序

- 有線；
- 無線；
- DDS；
- OPC UA；
- TSN；
- 光纖；
- 離線任務包。

## L5：世界模型與事件圖

- 物體；
- 區域；
- 任務；
- 因果；
- 版本；
- 不確定性。

## L6：語義—物理流編譯

- Intent；
- DomainIR；
- Experiment Graph；
- Station Assignment；
- Material Route；
- Alignment Window。

## L7：超靈治理與自主研究

- 長期規劃；
- 因果推理；
- 資源；
- 跨域協調；
- 模型更新。

## L8：證據、權限、IP 與公共接口

- Provenance；
- Audit；
- Safety Constitution；
- EML-CF；
- Patent Hold；
- Open Source；
- Publication。

---

# 18. 安全憲法的最低原則

## 18.1 局部安全優先

$$
\text{Local Safety}
>
\text{Global Optimization}.
$$

## 18.2 高風險行動不得由單一模型批准

需要：

- 獨立規則；
- 硬體互鎖；
- 人類批准；
- 或雙模型／雙代理交叉確認。

## 18.3 人類進入即改變域狀態

人類不是一般移動障礙物，而是帶有權利與不可預測性的主體。

## 18.4 不確定性不足時拒絕行動

$$
U(x)>U_{\max}
\Rightarrow
\text{Stop／Observe／Ask}.
$$

## 18.5 可回退不代表物理可逆

某些物理行動不可逆，因此「回退」可能只表示：

- 停止；
- 隔離；
- 保存證據；
- 切換備份樣本；
- 回到安全程序。

## 18.6 禁止自動擴張作用域

站點或中央 AI 不能自行把未授權房間、設備、人員或外部實驗室納入自身域。

---

# 19. 近期可行版本：Persistent Lab Domain MVP

第一個 MVP 不需要人形機器人、全自動化研究室或新型光學站網。

## 19.1 物理配置

- 一個桌面或單房間區域；
- 兩到四個固定儀器；
- 一台機械臂或移動平台；
- 相機與環境感測；
- 樣本識別；
- 本地安全控制器；
- 一台中央工作站。

## 19.2 軟體配置

- 世界模型；
- 站點能力描述；
- 任務圖；
- 權限租約；
- 事件日誌；
- 模擬器；
- 具身排程器；
- 人工批准界面；
- EML-CF 匯入／回傳。

## 19.3 第一批任務

選擇低風險、非化學、非高溫的研究流程，例如：

1. 放置不同幾何樣本；
2. 使用相機與重量感測器確認；
3. 移動至量測站；
4. 執行重複量測；
5. 偵測放置錯誤；
6. 自動重試；
7. 保存完整證據；
8. 由 AI 選擇下一個測試條件。

## 19.4 MVP 成功條件

- 任務跨越多站點；
- 世界狀態在中斷後可恢復；
- 地方安全能否決中央；
- 權限租約過期後停止；
- 樣本、版本與量測不混淆；
- 實驗結果自動回寫；
- 人類可以隨時暫停與接管。

---

# 20. 分階段研究路線

## V0：純軟體域模擬

建立：

- DomainIR；
- Station Graph；
- World Epoch；
- Lease；
- Scheduler；
- Failure Injection。

## V1：桌面虛實混合站

使用模擬站＋少量真實感測與致動。

## V2：單房間具身域

加入機械臂、移動站、固定儀器與本地安全。

## V3：自主研究閉環

由 EML-CF 提供假說，STDI 完成低風險實驗並回傳證據。

## V4：多房間站網

測試：

- 斷線；
- 延遲；
- 地方自治；
- 物料交接；
- 權限跨區。

## V5：遠端實驗室聯邦

不同組織、設備與安全政策之間以能力證書和任務租約協作。

## V6：極端遠距域

軌道、深海、極地或行星站點，測試長延遲與離線治理。

---

# 21. 可證偽命題

## H1：持續世界模型降低跨日任務恢復成本

與一次性腳本相比，STDI 在中斷後恢復多站點實驗所需的人工作業與錯誤率應較低。

## H2：權限租約降低失控作用域

站點只持有短期、區域限定的權限時，錯誤命令造成的最大作用範圍應低於永久權限模式。

## H3：具身對齊排程提高有效站點利用率

相較只按設備空閒時間排程，加入樣本、校準、世界紀元、安全與證據條件後，雖可能降低表面設備使用率，但應提高有效實驗完成率。

## H4：地方否決降低中央模型錯誤造成的事故

在故障注入實驗中，本地安全與地方 Agent 應能攔截中央模型產生的越界動作。

## H5：語義物理路由降低錯誤交接

將樣本類型、污染限制、實驗版本與期限加入路由後，錯誤站點、錯誤容器與錯誤量測流程應下降。

## H6：證據閉環提高概念產品淘汰效率

STDI 與 EML-CF 結合後，缺乏物理支持的概念應更快被降級、合併或封存，而不是只增加文件數量。

---

# 22. 不能宣稱的內容

本篇不主張：

- 已經存在通用時空域支配智能；
- 大模型可以安全直接控制完整研究室；
- 具身 AI 能消除昂貴設備與材料需求；
- 機器人數量會線性提高研究能力；
- 無線網路可取代所有確定性控制；
- 數位孿生等同真實世界；
- AI 可在無人類與法規治理下自行擴張物理作用域；
- 自主實驗室已等同自主科學家；
- 「支配」表示所有裝置失去本地安全與人類否決；
- 遠期跨城市或行星站網已經具備工程成熟度。

---

# 23. 系列的產品化分支

從本文可以產生以下獨立產品：

- **OSF｜Oversoul Station Fabric**：超靈站網；
- **StationOS**：站點作業系統；
- **DomainIR**：時空域任務中介表示；
- **EmbodiedFlow**：物理任務流編譯器；
- **StationTwin**：站點數位孿生；
- **WorldEpoch Ledger**：世界狀態紀元帳本；
- **Command Lease Protocol**：指揮權限租約協議；
- **Embodied Alignment Scheduler**：具身對齊排程器；
- **Local Sovereign Node**：地方主權節點；
- **Physical Evidence Graph**：物理證據圖；
- **Physical Rollback Engine**：物理回退與隔離引擎；
- **Remote Lab Federation**：遠端實驗室聯邦；
- **Research Station Foundry**：自主研究站生成器。

這證明「時空間支配型 AI」不是單篇論文的誇張名稱，而是一個能自然產生技術白皮書、協議、MVP 與子產品的系列母體。

---

# 24. 結論

具身人工智能的下一個尺度，不必只是讓單一機器人更像人，也不必只是讓更多機器人形成群體。

真正重要的轉變可能是：

$$
\text{單體身體}
\rightarrow
\text{分布式身體},
$$

$$
\text{一次性任務}
\rightarrow
\text{持續性時空域},
$$

$$
\text{裝置控制}
\rightarrow
\text{世界狀態與權限治理},
$$

$$
\text{資料回傳}
\rightarrow
\text{物理證據閉環}.
$$

時空域支配智能的核心不是「更強的控制」，而是：

$$
\boxed{
\text{可觀測}
+
\text{可排程}
+
\text{可行動}
+
\text{可驗證}
+
\text{可回退}
}
$$

其最終命題是：

> AI 的身體可以不是一台機器；它可以是一個由固定站、移動站、儀器、感測器、算力、材料庫與人類協作者共同構成的物理域。當同一智能能跨越時間持續維持這個域的世界狀態、任務、權限與證據時，具身不再只是「擁有身體」，而成為「持續佔據並治理一個時空域」。

這就是：

$$
\boxed{
\text{具身即佔域，對齊即能力，證據即持續存在}
}
$$

---

# 參考文獻

1. Szymanski, N. J. et al. **An autonomous laboratory for the accelerated synthesis of novel materials.** *Nature* 624, 86–91 (2023). DOI: 10.1038/s41586-023-06734-w.

2. Dai, T. et al. **Autonomous mobile robots for exploratory synthetic chemistry.** *Nature* 635, 890–897 (2024). DOI: 10.1038/s41586-024-08173-7.

3. Ha, T. et al. **AI-driven robotic chemist for autonomous synthesis of organic molecules.** *Science Advances* (2023). DOI: 10.1126/sciadv.adj0461.

4. Koscher, B. A. et al. **Autonomous, multiproperty-driven molecular discovery.** *Science* (2023). DOI: 10.1126/science.adi1407.

5. Kusne, A. G. et al. **Managing autonomous materials labs with multi-agent AI.** *Communications Materials* (2026). DOI: 10.1038/s43246-026-01219-5.

6. NIST. **Cyber-Physical Systems and Internet of Things Foundations.**

7. Balta, E. et al. **Digital Twin-Based Cyber-Attack Detection Framework for Cyber-Physical Manufacturing Systems.** NIST publication (2023).

8. Object Management Group. **Data Distribution Service for Real-Time Systems, Version 1.4.**

9. IEEE 802.1 Time-Sensitive Networking Task Group. **Deterministic connectivity with bounded latency, low delay variation and low loss.**

10. OPC Foundation／VDMA. **OPC UA Companion Specification for Robotics.**

11. Open Robotics. **ROS 2 and ros2_control documentation.**

---

# 附錄 A：最小 STDI 產品卡

```yaml
product:
  name: "Spatiotemporal Domain Intelligence"
  codename: "STDI"
  type: "mother_theory_and_system_family"
  evidence_level: "E0"

domain:
  spatial_scope: []
  temporal_scope: []
  stations: []
  resources: []
  allowed_actions: []
  policies: []

intelligence:
  world_model: true
  long_horizon_planning: true
  local_agents: optional
  human_governance: required

safety:
  local_hard_interlocks: required
  command_leases: required
  emergency_stop: required
  automatic_scope_expansion: forbidden

evidence:
  event_log: required
  artifact_hashing: required
  world_epochs: required
  eml_cf_integration: planned
```

---

# 附錄 B：系列血緣

```text
O-Chip／Oversoul
    └─ 決策—執行分離、長視野規劃

SFRSN
    └─ 語義即路由、中央主權、地方自治、動態不動點中央

GFMSN
    └─ 站點、支線、分流、局部操作、重注入

ODML／對齊即容量
    └─ 多座標排程、差分時序、可對齊能力

EML-CF
    └─ 概念生成、證據、IP 分流、選擇性公開

自主實驗室與具身 AI
    └─ 物理操作、移動機器人、閉環實驗

                    ↓

時空域支配智能 STDI
    └─ 持續世界模型＋分布式身體＋物理域治理＋證據閉環
```
