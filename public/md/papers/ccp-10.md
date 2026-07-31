# AOCLS 虛擬光刻模擬引擎：物理約束神經算子、格點收斂與拓撲驗證框架

**Physics-Constrained Neural Operators for AOCLS Virtual Lithography: A Lattice-Convergent and Topology-Aware Framework**

---

**作者**：Neo.K（許筌崴）  
**機構**：一言諾科技有限公司（EveMissLab Technology Co., Ltd.）  
**文件編號**：EML-AOCLS-VL-2026-v2.0  
**原始版本**：AOCLS-AI v1.0，2026 年 3 月  
**修訂日期**：2026 年 7 月 29 日  
**文件類型**：公開概念技術論文／可驗證架構提案  
**論文授權**：CC BY-SA 4.0  
**程式碼與資料狀態**：尚未公開釋出；其授權應於實際發布時另行聲明  
**證據狀態**：本文提出模型、數學表述、驗證協議與工程路線；尚未宣稱完成端到端軟體基準、真實材料校準或實體製造驗證。文中數值門檻均為建議驗收標準，而非既成實驗結果。

---

## 摘要

本文提出 AOCLS 虛擬光刻模擬引擎的第二版架構。其目標不是以神經網路取代所有高保真數值求解器，而是在 AOCLS「觀察—理解—模擬—製造—驗證」閉環中，建立一個具備物理約束、跨格點檢驗、拓撲保真與不確定性輸出的快速代理模擬層。

本文將光刻製程表述為參數化多物理場解算子。輸入包括光源、光學元件、材料場、幾何、邊界條件與製程參數；輸出則可依任務需要包含電磁場、溫度、反應物濃度、聚合程度、位移與應力。高保真離散求解器記為 $\mathcal{F}_h$，其中 $h$ 代表空間離散尺度；待學習的代理模型記為 $\mathcal{G}_\phi$。本文提出格點—拓撲物理約束神經算子框架，使 $\mathcal{G}_\phi$ 同時接受場函數、材料函數與離散尺度，並以資料誤差、偏微分方程殘差、邊界條件、能量平衡、幾何誤差、持久同調拓撲誤差、跨格點一致性與不確定性校準共同訓練。

相較原始版本，本文做出五項關鍵修正。第一，不再把尚未執行的模擬寫成實驗結果。第二，不把 FDTD、FEM 或神經代理模型的複雜度簡化為不準確的單一公式。第三，將「拓撲不變量恆定」修正為「拓撲事件與參考解一致」；聚合體在形成、連接與封閉空腔時，本來就可能發生合法拓撲轉換。第四，以 Betti 數、Euler 示性數與持久同調取代一般材料情境下不必要的 Chern 數。第五，增加跨材料、跨幾何、跨解析度、域外輸入與真實製程校準的分層驗證協議。

本文的核心主張是：AOCLS 所需的不是一個宣稱永遠正確的「AI 物理模擬器」，而是一個能清楚區分已知域與未知域、能指出物理違反、能量化拓撲偏差、能回退至高保真求解器，並能為每次預測生成驗證證書的混合式計算系統。

**關鍵詞**：AOCLS、虛擬光刻、神經算子、科學機器學習、多物理場、格點收斂、持久同調、拓撲保真、不確定性量化、代理模型

---

## 第一章　問題定位與研究邊界

### 1.1 AOCLS 中的模擬瓶頸

AOCLS 的整體流程可表示為：

$$
\text{多模態觀察}
\longrightarrow
\text{幾何與材料推斷}
\longrightarrow
\text{虛擬光刻}
\longrightarrow
\text{製程參數選擇}
\longrightarrow
\text{實體製造}
\longrightarrow
\text{量測回饋}.
$$

其中，虛擬光刻並非單純產生一張光強圖，而是要回答以下問題：

1. 指定光源與光學配置會形成何種三維場分布？
2. 材料中的吸收、反應、擴散與熱累積如何隨時間演化？
3. 最終可顯影或可固化區域的幾何是否符合目標？
4. 結構是否出現斷裂、錯誤連接、封閉空腔或局部過曝？
5. 模型對這次預測有多大把握？是否應交由高保真求解器複核？

高保真電磁與多物理場求解通常需要細密網格、長時間積分或大型稀疏系統求解。以 Yee 格點的 FDTD 為例，若空間格點總數為 $N$、時間步數為 $T$，每一時間步的局部更新通常約為 $O(N)$，總計算成本約為 $O(NT)$，並受到 CFL 穩定條件約束。FEM 的成本則取決於網格、元素階數、矩陣條件數、線性或非線性求解器與預條件器，不能一概寫成 $O(N^3)$。

因此，AOCLS 的合理策略不是捨棄數值求解器，而是建立兩層結構：

- **高保真層**：提供可信基準、域外複核與最終簽核；
- **快速代理層**：提供參數掃描、互動預覽、初步逆向設計與主動學習。

### 1.2 本文不主張的事項

本文不主張：

- 神經模型已經在所有材料與幾何上達成固定精度；
- 代理模型可以在沒有適用域檢查時取代 FDTD、FEM 或實驗；
- 物理殘差足夠小就等於實體製程必然正確；
- 拓撲約束會使所有形狀細節自動正確；
- 格點收斂可以僅靠單一解析度訓練自動獲得；
- AOCLS 已完成真實設備、材料資料庫與閉環製造驗證。

本文提出的是一套可被實作、檢驗、證偽與逐級擴充的架構。

### 1.3 從「綜合微積分」到工程操作化

原始版本使用「綜合微積分」描述多種局部微分量、整體積分量與多場耦合量的共同表述。本文保留此思想，但在工程上將其操作化為**多場狀態與描述符系統**，不把它直接宣稱為已獲外部驗證的獨立數學體系。

對任一物理狀態 $\mathbf{s}$，定義綜合描述符：

$$
\mathcal{D}[\mathbf{s}]
=
\left(
\mathbf{s},
\nabla \mathbf{s},
\partial_t \mathbf{s},
\mathcal{I}[\mathbf{s}],
\mathcal{T}[\mathbf{s}]
\right),
$$

其中：

- $\mathbf{s}$ 是原始物理場；
- $\nabla \mathbf{s}$ 與 $\partial_t\mathbf{s}$ 是局部空間與時間變化；
- $\mathcal{I}$ 是能量、體積、質量或反應總量等積分泛函；
- $\mathcal{T}$ 是連通性、孔洞與空腔等拓撲描述符。

如此可保留原始命題的跨尺度精神，同時使其能被標準數值分析與科學機器學習方法檢驗。

---

## 第二章　多物理場解算子

### 2.1 輸入、狀態與輸出

令 AOCLS 單次虛擬製程的輸入為：

$$
\Theta
=
\left(
G,
M,
S,
B,
P
\right),
$$

其中：

- $G$：目標幾何、遮罩、錐形光學或其他光場生成幾何；
- $M$：折射率、介電常數、吸收係數、熱參數、擴散係數、反應速率與力學參數等材料場；
- $S$：波長、偏振、脈衝、功率、入射角與相位等光源條件；
- $B$：週期、吸收、對稱、固定、絕熱或對流等邊界條件；
- $P$：曝光時間、顯影閾值、掃描策略與其他製程控制參數。

完整狀態可寫為：

$$
\mathbf{s}(\mathbf{x},t)
=
\left(
\mathbf{E},
\mathbf{H},
T,
c_m,
c_r,
\rho_p,
\mathbf{u},
\boldsymbol{\sigma}
\right),
$$

其中 $c_m$ 與 $c_r$ 分別表示單體與活性反應物濃度，$\rho_p$ 表示聚合或固化程度。實際 MVP 不必一次求解全部分量，而應使用可切換的模型階層：

- **L0 光場模式**：只估計 $\mathbf{E},\mathbf{H}$ 或光強；
- **L1 光化學模式**：加入 $c_m,c_r,\rho_p$；
- **L2 熱耦合模式**：加入 $T$；
- **L3 熱—化學—力學模式**：加入 $\mathbf{u},\boldsymbol{\sigma}$；
- **L4 實驗校準模式**：加入設備與材料偏差模型。

### 2.2 高保真離散解算子

在格點尺度 $h$ 與時間步長 $\Delta t$ 下，高保真求解器表示為：

$$
\mathcal{F}_{h,\Delta t}:\Theta\mapsto \mathbf{s}_{h,\Delta t}.
$$

本文擬學習的是參數到場函數的解算子：

$$
\mathcal{G}_\phi:
(\Theta,h,\Delta t)
\mapsto
\widehat{\mathbf{s}}_{h,\Delta t},
$$

其中 $\phi$ 為模型參數。將 $h$ 與 $\Delta t$ 納入輸入，是為了避免模型把某一固定解析度誤認為物理定律本身。

### 2.3 電磁場方程

在線性、各向同性且可含導電損耗的簡化情況下：

$$
\nabla\times\mathbf{E}
=
-\mu\frac{\partial\mathbf{H}}{\partial t},
$$

$$
\nabla\times\mathbf{H}
=
\epsilon\frac{\partial\mathbf{E}}{\partial t}
+\sigma_e\mathbf{E}
+\mathbf{J}_{\mathrm{src}}.
$$

若存在非線性極化，則應加入：

$$
\mathbf{D}
=
\epsilon_0\mathbf{E}
+\mathbf{P}^{(1)}
+\mathbf{P}^{(2)}
+\mathbf{P}^{(3)}+\cdots.
$$

AOCLS 不應預設所有材料都能由單一吸收係數描述；材料模型必須明確聲明適用波長、溫度、劑量與非線性範圍。

### 2.4 熱與光化學演化

熱場可採用：

$$
\rho_m C_p\frac{\partial T}{\partial t}
=
\nabla\cdot(\kappa\nabla T)
+Q_{\mathrm{abs}}
+Q_{\mathrm{rxn}}
-Q_{\mathrm{loss}}.
$$

聚合或固化反應可用一般反應—擴散形式表示：

$$
\frac{\partial c_m}{\partial t}
=
\nabla\cdot(D_m\nabla c_m)
-R(I,T,c_m,c_r),
$$

$$
\frac{\partial \rho_p}{\partial t}
=
R(I,T,c_m,c_r)-R_{\mathrm{term}}.
$$

反應函數 $R$ 應由材料資料、文獻模型或校準實驗決定，而非直接假設為普適的 $I(1-\rho_p)$。

### 2.5 力學響應

若要預測收縮、翹曲或殘餘應力，可使用準靜態平衡：

$$
\nabla\cdot\boldsymbol{\sigma}+\mathbf{f}=0,
$$

$$
\boldsymbol{\sigma}
=
\mathbb{C}:
\left(
\boldsymbol{\varepsilon}(\mathbf{u})
-\boldsymbol{\varepsilon}^{\ast}(\rho_p,T)
\right).
$$

其中 $\boldsymbol{\varepsilon}^{\ast}$ 表示聚合收縮與熱膨脹造成的本徵應變。

### 2.6 能量平衡的正確形式

原始版本將輸入能量與吸收能量直接相等，忽略反射、透射、場能儲存與數值耗散。更完整的離散能量平衡應寫為：

$$
E_{\mathrm{in}}
=
E_{\mathrm{ref}}
+E_{\mathrm{trans}}
+E_{\mathrm{abs}}
+\Delta E_{\mathrm{field}}
+\varepsilon_{\mathrm{num}}.
$$

因此能量殘差可定義為：

$$
\mathcal{R}_{E}
=
\frac{
\left|
E_{\mathrm{in}}
-E_{\mathrm{ref}}
-E_{\mathrm{trans}}
-E_{\mathrm{abs}}
-\Delta E_{\mathrm{field}}
\right|
}{E_{\mathrm{in}}+\epsilon}.
$$

此殘差能揭示明顯物理違反，但不能單獨證明所有局部場都正確。

---

## 第三章　格點化、穩定性與連續極限

### 3.1 離散化不是中性容器

不同離散方法會引入不同的數值色散、邊界誤差與人工耗散。AOCLS 代理模型若只學習單一求解器輸出，可能學到的是求解器特有偏差，而非目標物理。

因此資料集需保留：

- 求解器名稱與版本；
- 網格生成方法；
- $h$ 與 $\Delta t$；
- 邊界條件；
- 收斂容許值；
- 硬體與數值精度；
- 已知近似與失效條件。

### 3.2 Yee 格點與其他離散方式

電磁 FDTD 可採交錯 Yee 格點；光化學與熱場可採有限差分、有限體積或 FEM；力學則可由 FEM 處理。不同場之間需要保守插值或共同網格映射。

對顯式 FDTD，時間步長需滿足類 CFL 條件。三維均勻格點的典型形式為：

$$
\Delta t
\le
\frac{1}{c}
\left(
\frac{1}{\Delta x^2}
+\frac{1}{\Delta y^2}
+\frac{1}{\Delta z^2}
\right)^{-1/2}.
$$

神經代理模型即使能一次跨越多個時間步，也必須檢查其長期滾動誤差與因果性，不能只比較單步誤差。

### 3.3 格點收斂

對可觀測量 $Q$，若數值方法具有階數 $p$，理想誤差展開為：

$$
Q(h)
=
Q^{\star}
+C h^p
+o(h^p).
$$

代理模型應至少在三個解析度上接受檢驗：

$$
h_1>h_2>h_3.
$$

可使用 Richardson 外推估計 $Q^{\star}$，但前提是三個解析度已進入漸近收斂區。若尚未進入該區，外推出來的「連續極限」不具可信度。

### 3.4 跨格點一致性損失

令 $\mathcal{R}_{h_i\rightarrow h_j}$ 為網格轉換算子，則可定義：

$$
\mathcal{L}_{\mathrm{grid}}
=
\sum_{i\ne j}
\left\|
\mathcal{R}_{h_i\rightarrow h_j}
\widehat{\mathbf{s}}_{h_i}
-
\widehat{\mathbf{s}}_{h_j}
\right\|^2_{W}.
$$

這只能鼓勵解析度一致性，不能取代與高保真解及實驗的比較。

---

## 第四章　格點—拓撲物理約束神經算子

### 4.1 為何從固定 U-Net 升級為神經算子

固定尺寸 3D U-Net 可以作為早期基線，但它通常將輸入與輸出視為固定維度張量，對解析度、幾何與邊界條件變化的泛化有限。AOCLS 更適合學習函數空間之間的映射，因此本文採用神經算子作為主幹，並允許 Fourier Neural Operator、DeepONet、圖神經算子或混合架構作為候選。

這不代表神經算子天然跨解析度正確。模型仍需透過跨網格資料、域外測試與收斂協議驗證。

### 4.2 架構總覽

本文將模型暫稱為 **LTPNO**（Lattice-Topological Physics-constrained Neural Operator）。其模組包括：

1. **幾何與材料編碼器**：輸入空間材料場、目標幾何與邊界遮罩；
2. **光源與製程參數編碼器**：輸入波長、相位、偏振、功率與曝光程序；
3. **神經算子主幹**：學習參數化 PDE 的解算子；
4. **時間傳播器**：直接預測時空塊，或以自回歸方式推進；
5. **物理校正層**：降低 PDE、邊界與守恆殘差；
6. **拓撲頭**：計算連通分量、孔洞、空腔與持久同調描述；
7. **幾何頭**：輸出可製造區域、臨界尺寸與表面誤差；
8. **不確定性頭**：輸出置信區間、域外分數與回退建議。

抽象地寫：

$$
\widehat{\mathbf{s}}_{t+\Delta t}
=
\Pi_{\mathrm{phys}}
\left[
\mathcal{G}_\phi
\left(
\mathbf{s}_t,
\Theta,
h,
\Delta t
\right)
\right],
$$

其中 $\Pi_{\mathrm{phys}}$ 是校正或投影算子。對非線性耦合系統，該投影通常只是近似校正，不應宣稱能保證精確落在完整物理解流形上。

### 4.3 因果性與時間建模

光場、反應與熱場具有不同時間尺度。模型可採：

- 分段時間捆綁；
- 多速率積分；
- 光場準穩態加慢變化學場；
- 因果卷積或狀態空間模型；
- 自回歸與直接時空塊混合。

若模型預測 $K$ 個時間步，需同時報告單步誤差與滾動誤差：

$$
\mathcal{E}_{\mathrm{roll}}(K)
=
\frac{1}{K}
\sum_{k=1}^{K}
\left\|
\widehat{\mathbf{s}}_{t+k\Delta t}
-
\mathbf{s}_{t+k\Delta t}
\right\|_W.
$$

### 4.4 多保真修正

資料來源可包含粗格點模擬、細格點模擬與真實量測。可將代理模型寫成：

$$
\widehat{\mathbf{s}}_{\mathrm{HF}}
=
\mathcal{G}^{\mathrm{LF}}_{\phi}(\Theta)
+
\Delta\mathcal{G}_{\psi}
\left(
\Theta,
\mathcal{G}^{\mathrm{LF}}_{\phi}(\Theta)
\right),
$$

其中第一項學習低保真結構，第二項學習低保真到高保真的修正。真實設備校準也可採相同形式建立 sim-to-real 修正層。

---

## 第五章　物理、幾何與拓撲損失

### 5.1 總損失

總訓練目標定義為：

$$
\mathcal{L}
=
\lambda_d\mathcal{L}_{\mathrm{data}}
+
\lambda_p\mathcal{L}_{\mathrm{PDE}}
+
\lambda_b\mathcal{L}_{\mathrm{BC}}
+
\lambda_e\mathcal{L}_{\mathrm{energy}}
+
\lambda_g\mathcal{L}_{\mathrm{geom}}
+
\lambda_t\mathcal{L}_{\mathrm{topo}}
+
\lambda_r\mathcal{L}_{\mathrm{grid}}
+
\lambda_u\mathcal{L}_{\mathrm{uncert}}.
$$

權重不應由固定的「物理重要性數字」武斷指定。可採用無量綱化、梯度平衡、同方差不確定性加權、增廣拉格朗日法或分階段課程學習。

### 5.2 資料損失

對多場輸出：

$$
\mathcal{L}_{\mathrm{data}}
=
\sum_{q\in\mathcal{Q}}
\omega_q
\frac{
\left\|
\widehat{q}-q
\right\|_2^2
}{
\left\|q\right\|_2^2+\epsilon
},
$$

其中 $\mathcal{Q}$ 可包含場、溫度、聚合程度與應力。應避免單一高幅值場支配全部梯度。

### 5.3 PDE 與邊界殘差

以 Maxwell 方程為例：

$$
\mathcal{R}_{F}
=
\nabla\times\widehat{\mathbf{E}}
+
\mu\partial_t\widehat{\mathbf{H}},
$$

$$
\mathcal{R}_{A}
=
\nabla\times\widehat{\mathbf{H}}
-
\epsilon\partial_t\widehat{\mathbf{E}}
-
\sigma_e\widehat{\mathbf{E}}
-
\mathbf{J}_{\mathrm{src}}.
$$

則：

$$
\mathcal{L}_{\mathrm{PDE}}
=
\|\mathcal{R}_{F}\|_2^2
+
\|\mathcal{R}_{A}\|_2^2
+\mathcal{L}_{\mathrm{thermal}}
+\mathcal{L}_{\mathrm{reaction}}
+\mathcal{L}_{\mathrm{mechanical}}.
$$

邊界條件必須另行評估，否則低內部殘差仍可能對應錯誤解。

### 5.4 幾何損失

令固化區域為：

$$
\Omega_{\tau}
=
\left\{
\mathbf{x}:
ho_p(\mathbf{x},t_f)\ge\tau
\right\}.
$$

可使用 Dice、IoU、Chamfer 距離與 Hausdorff 距離。對臨界尺寸敏感的製程，還需計算局部線寬、孔徑、側壁角與表面粗糙度。

### 5.5 拓撲描述符

對三維固化區域，最直接的拓撲量為：

- $\beta_0$：連通分量數；
- $\beta_1$：獨立環或通道數；
- $\beta_2$：封閉空腔數。

Euler 示性數為：

$$
\chi
=
\beta_0-\beta_1+\beta_2.
$$

若使用體素立方複形，也可由各維胞腔數計算：

$$
\chi
=
N_0-N_1+N_2-N_3.
$$

原始版本主張拓撲在時間中應保持不變，這並不普遍成立。聚合過程可能合法地出現成核、合併、打通與封閉事件。正確要求應是：

- 預測拓撲事件與高保真解或量測一致；
- 不應出現短暫數值雜訊造成的假連接或假孔洞；
- 最終拓撲需符合設計規格。

### 5.6 持久同調損失

單一閾值 $\tau$ 容易受數值雜訊影響。持久同調可觀察一系列閾值下拓撲特徵的出生與消失。令 $D_k(\rho_p)$ 為第 $k$ 維持久圖，則可定義：

$$
\mathcal{L}_{\mathrm{topo}}
=
\sum_{k=0}^{2}
\eta_k
W_p
\left(
D_k(\widehat{\rho}_p),
D_k(\rho_p)
\right),
$$

其中 $W_p$ 為持久圖距離。實作時可使用可微拓撲層，或將完整拓撲計算作為週期性驗證與模型選擇指標。

拓撲損失不能取代幾何損失。兩個物體可具有相同 Betti 數，卻在尺寸、位置與曲率上完全不同。

---

## 第六章　資料生成、主動學習與資料治理

### 6.1 資料來源分層

AOCLS 資料可分為：

1. **解析或半解析基準**：平面波、Gaussian beam、均勻介質與簡單界面；
2. **低保真模擬**：粗格點或簡化多物理模型；
3. **高保真模擬**：細格點 FDTD、FEM 或經驗證的商用／開源求解器；
4. **實驗量測**：顯微影像、輪廓儀、SEM、AFM、光譜與製程紀錄；
5. **失敗案例**：不收斂、材料參數缺失、設備飄移與製造破壞。

失敗資料不得刪除，因為域外偵測與回退策略正需要這些負例。

### 6.2 參數空間採樣

若輸入維度高，純均勻隨機採樣效率低。可混合使用：

- Latin hypercube；
- Sobol 序列；
- 基於靈敏度的局部加密；
- 貝葉斯最佳化；
- 不確定性主動學習；
- 拓撲事件附近的邊界採樣。

尤其應加密以下區域：

- 聚合閾值附近；
- 連通與斷裂相變附近；
- 高折射率或吸收梯度；
- 高熱累積區；
- 訓練模型不確定性高的輸入。

### 6.3 防止資料洩漏

資料切分不能只隨機切割樣本，否則相似幾何的細微變體可能同時出現在訓練與測試集中。至少需建立：

- 幾何家族留出；
- 材料家族留出；
- 波長區間留出；
- 解析度留出；
- 設備批次留出；
- 時間批次留出。

### 6.4 資料卡與可追溯性

每筆樣本應附帶：

$$
\text{Sample ID}
+
\text{Solver Hash}
+
\text{Material Version}
+
\text{Mesh}
+
\text{BC}
+
\text{Hardware}
+
\text{Random Seed}
+
\text{Post-processing}.
$$

如此才能判斷模型進步來自架構、資料或求解器版本變化。

---

## 第七章　分層驗證與驗收標準

### 7.1 五級驗證

**V0：單元與守恆測試**  
檢查離散算子、邊界條件、能量計算與拓撲計算是否正確。

**V1：解析基準**  
在有解析解或可信半解析解的場景中比較場幅值、相位與收斂階。

**V2：求解器對求解器**  
與 FDTD、FEM 或其他高保真求解器比較，並跨幾何與材料留出。

**V3：域外與失效測試**  
測試模型是否能對未知材料、未知幾何、極端參數與解析度外推發出警告。

**V4：實驗閉環**  
以真實曝光、顯影與量測結果校準，區分數值誤差、材料模型誤差與設備誤差。

只有通過 V4，才可把模型稱為經實體製程驗證。

### 7.2 指標矩陣

| 類別 | 指標 | 用途 |
|---|---|---|
| 場精度 | NRMSE、相位誤差、散射參數誤差 | 比較電磁場 |
| 物理一致性 | PDE 殘差、邊界殘差、能量殘差 | 排除明顯非物理解 |
| 幾何 | Dice、IoU、Hausdorff、臨界尺寸誤差 | 比較最終結構 |
| 拓撲 | $\beta_0,\beta_1,\beta_2$、Euler、持久圖距離 | 檢查斷裂、錯接與空腔 |
| 時間 | 單次延遲、吞吐量、記憶體、訓練成本 | 衡量工程效益 |
| 泛化 | 幾何／材料／解析度留出誤差 | 衡量域外能力 |
| 可信度 | 覆蓋率、校準誤差、域外偵測 AUROC | 決定是否回退 |

### 7.3 建議驗收門檻

以下僅是 MVP 的初始工程目標，必須在指定資料集、硬體、解析度與基準求解器下重新確認：

| 項目 | 建議初始門檻 | 狀態 |
|---|---:|---|
| 場 NRMSE | $\le 5\%$ | 待實測 |
| 最終幾何 IoU | $\ge 0.95$ | 待實測 |
| 能量平衡殘差 | $\le 1\%$ | 待實測 |
| 最終 Betti 數完全一致率 | $\ge 95\%$ | 待實測 |
| 域內推理加速 | 相對同硬體基準求解器 $\ge 100\times$ | 待實測 |
| 高風險域外樣本回退率 | $\ge 99\%$ | 待實測 |
| 置信區間經驗覆蓋 | 接近聲明覆蓋率 | 待實測 |

速度比較必須聲明：

- 相同問題定義；
- 相同精度門檻；
- 相同硬體或清楚列出硬體差異；
- 是否包含前處理、資料搬移與模型載入；
- 是否把離線資料生成與訓練成本計入總成本。

### 7.4 消融實驗

至少比較：

1. 純資料模型；
2. 加入 PDE 殘差；
3. 加入能量與邊界條件；
4. 加入拓撲損失；
5. 加入跨格點訓練；
6. 加入不確定性與回退；
7. 神經算子與固定 U-Net 基線。

若物理或拓撲模組沒有改善域外誤差、失效偵測或樣本效率，就不能僅因概念漂亮而保留。

---

## 第八章　不確定性、回退與預測證書

### 8.1 不確定性的兩個來源

- **資料不確定性**：量測噪聲、材料批次差異與設備飄移；
- **模型不確定性**：訓練域不足、模型容量或錯誤歸納偏置。

可使用深度集成、貝葉斯近似、概率輸出頭、共形預測或其組合。輸出不應只有單一幾何，而應包括：

$$
\left(
\widehat{\mathbf{s}},
\mathcal{U},
\mathcal{R}_{\mathrm{phys}},
\mathcal{R}_{\mathrm{topo}},
\text{OOD Score},
\text{Decision}
\right).
$$

### 8.2 回退決策

定義風險分數：

$$
\mathcal{Z}
=
a_1\mathcal{U}
+a_2\mathcal{R}_{\mathrm{phys}}
+a_3\mathcal{R}_{\mathrm{topo}}
+a_4\mathcal{R}_{\mathrm{grid}}
+a_5\mathcal{O}_{\mathrm{OOD}}.
$$

當 $\mathcal{Z}$ 超過門檻，系統不得直接進入製造，而應：

1. 呼叫高保真求解器；
2. 要求更完整材料參數；
3. 降低製程範圍或調整解析度；
4. 將新結果加入主動學習佇列。

### 8.3 預測證書

每次預測應生成機器可讀證書，至少包含：

- 模型版本與權重指紋；
- 訓練資料版本；
- 輸入參數與材料版本；
- 網格與邊界條件；
- 預測模式；
- 物理殘差；
- 幾何與拓撲指標；
- 不確定性；
- 適用域判定；
- 是否允許進入製造；
- 是否已由高保真求解器或實驗複核。

此證書比單純顯示「98% 準確」更有工程價值。

---

## 第九章　工程實作路線

### 9.1 建議軟體結構

```text
aocls-vl/
├── configs/          # 光源、材料、幾何與邊界設定
├── solvers/          # FDTD、FEM、反應擴散與耦合求解器介面
├── datasets/         # 資料卡、版本、切分與品質檢查
├── operators/        # FNO、DeepONet、圖算子與混合模型
├── physics/          # PDE、守恆與邊界殘差
├── topology/         # cubical complex、Betti、Euler、持久同調
├── uncertainty/      # ensemble、校準與域外偵測
├── validation/       # V0–V4 基準與報告
├── certificates/     # 預測證書格式
├── api/              # 推理、回退與批次模擬介面
├── tests/            # 單元、回歸與收斂測試
└── docs/             # 方法、限制與重現說明
```

### 9.2 最小可行版本

**M0：數學與資料規格**  
完成材料 schema、幾何表示、求解器介面、資料卡與基準案例。

**M1：二維光場代理模型**  
使用標量波或簡化 Maxwell 問題建立完整訓練、驗證與證書流程。

**M2：三維電磁神經算子**  
加入複數場、邊界條件、因果時間推進與跨幾何測試。

**M3：光化學與熱耦合**  
加入材料反應、熱擴散與多速率時間建模。

**M4：拓撲與不確定性**  
加入持久同調、域外偵測、主動學習與回退。

**M5：實體校準**  
連接 AOCLS 實驗設備，以量測結果建立 sim-to-real 修正與 V4 證據。

### 9.3 三種運作模式

- **Preview**：快速、低成本、允許較大誤差，但必須顯示不確定性；
- **Verify**：較高解析度、多模型集成，必要時自動呼叫高保真求解器；
- **Sign-off**：必須有指定求解器或實驗複核，代理模型不得獨立簽核。

---

## 第十章　限制、可證偽命題與判敗條件

### 10.1 主要限制

1. 材料參數可能比模型架構更限制準確度；
2. 真實設備的像差、漂移、污染與批次差異難由理想模擬捕捉；
3. 持久同調對拓撲敏感，但可能忽略幾何位置與尺寸；
4. 物理殘差可因離散方式或自動微分誤差而被錯估；
5. 神經算子對固定分布內插很強，對真正域外材料未必可靠；
6. 多物理場耦合可能造成誤差逐層放大；
7. 高保真資料生成成本不會因代理模型存在而消失，只是被轉移到離線階段。

### 10.2 可證偽命題

**H1：物理約束改善域外泛化。**  
若加入 PDE、邊界與能量殘差後，在幾何或材料留出集上沒有穩定改善，則 H1 在該設定下被否證。

**H2：跨格點訓練改善解析度轉移。**  
若多解析度模型在未見解析度上的誤差不低於單解析度基線，或收斂階更差，則 H2 被否證。

**H3：拓撲損失降低錯接與斷裂。**  
若 Betti 數與持久圖誤差沒有改善，或幾何誤差顯著惡化，則拓撲模組需要移除或重設。

**H4：主動學習降低高保真樣本需求。**  
若在相同誤差門檻下，主動學習所需高保真樣本不低於 Sobol 或 Latin hypercube 基線，則 H4 被否證。

**H5：預測證書能有效攔截高風險樣本。**  
若低信心或高殘差規則無法在域外測試中達到預定召回率，則不得將系統接入自動製造。

### 10.3 判敗不是失敗，而是系統功能

對 AOCLS 而言，可靠地說「我不知道」比在未知材料上輸出精美但錯誤的三維預測更重要。可回退、可追蹤、可複核是模擬引擎的核心能力，不是附加功能。

---

## 第十一章　結論

AOCLS 虛擬光刻模擬引擎的可行方向，不是把神經網路描述成能自動掌握全部物理的黑盒，也不是把拓撲、格點與守恆律堆疊成不可證偽的宏大宣言。更可行的路徑是建立一個分層混合系統：高保真求解器提供基準，神經算子提供快速近似，物理殘差揭示局部違反，拓撲描述符檢查結構性錯誤，跨格點協議檢查尺度一致性，不確定性與域外偵測決定何時回退，實驗量測則負責最後校準。

在這個框架下，「計算即證明」需要被改寫為更嚴格的工程命題：

$$
\text{計算結果}
+
\text{假設聲明}
+
\text{收斂證據}
+
\text{適用域}
+
\text{可重現紀錄}
\neq
\text{絕對真理},
$$

但它們可以共同構成一份可檢查、可反駁、可逐步增強的證據。

AOCLS 的真正價值不在於宣稱「所見必然即所造」，而在於把「所見如何轉化為可製造結構」拆成一系列可計算、可驗證、可回退的明確環節。當這些環節被完整實作後，虛擬光刻才可能從願景變成可信的工程基礎設施。

---

## 附錄 A　v1.0 至 v2.0 的主要修訂

1. 刪除未有證據支撐的「99% 精度」「10,000 倍加速」「0.5 秒推理」等既成結果表述。
2. 將全部數值改為驗收目標或待測欄位。
3. 將固定 3D U-Net 升級為可替換的神經算子架構。
4. 修正 FDTD 與 FEM 複雜度敘述。
5. 修正能量守恆式，納入反射、透射與場能變化。
6. 刪除一般光敏材料情境下不必要的 Chern 數要求。
7. 將「拓撲恆定」改為「拓撲事件與參考解一致」。
8. 引入 Betti 數、Euler 示性數與持久同調。
9. 加入跨格點、跨材料、跨幾何與域外驗證。
10. 加入不確定性、回退與預測證書。
11. 區分論文開源授權與尚未發布的程式碼／資料授權。
12. 移除 Office 轉檔殘碼與內嵌 base64 公式圖片，統一為 Markdown 與 LaTeX。

---

## 附錄 B　主要符號

| 符號 | 意義 |
|---|---|
| $\Theta$ | 幾何、材料、光源、邊界與製程輸入 |
| $\mathbf{s}$ | 多物理場狀態 |
| $\mathcal{F}_{h,\Delta t}$ | 高保真離散解算子 |
| $\mathcal{G}_\phi$ | 學習式代理解算子 |
| $h$ | 空間離散尺度 |
| $\Delta t$ | 時間步長 |
| $\rho_p$ | 聚合或固化程度 |
| $\Omega_\tau$ | 以閾值 $\tau$ 定義的固化區域 |
| $\beta_k$ | 第 $k$ 維 Betti 數 |
| $D_k$ | 第 $k$ 維持久圖 |
| $\chi$ | Euler 示性數 |
| $\mathcal{U}$ | 預測不確定性 |
| $\mathcal{Z}$ | 綜合風險與回退分數 |

---

## 參考文獻

1. Yee, K. S. (1966). “Numerical Solution of Initial Boundary Value Problems Involving Maxwell’s Equations in Isotropic Media.” *IEEE Transactions on Antennas and Propagation*, 14(3), 302–307. DOI: 10.1109/TAP.1966.1138693.
2. Wilson, K. G. (1974). “Confinement of Quarks.” *Physical Review D*, 10, 2445–2459. DOI: 10.1103/PhysRevD.10.2445.
3. Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). “Physics-Informed Neural Networks: A Deep Learning Framework for Solving Forward and Inverse Problems Involving Nonlinear Partial Differential Equations.” *Journal of Computational Physics*, 378, 686–707. DOI: 10.1016/j.jcp.2018.10.045.
4. Lu, L., Jin, P., Pang, G., Zhang, Z., & Karniadakis, G. E. (2021). “Learning Nonlinear Operators via DeepONet Based on the Universal Approximation Theorem of Operators.” *Nature Machine Intelligence*, 3, 218–229. DOI: 10.1038/s42256-021-00302-5.
5. Li, Z., Kovachki, N., Azizzadenesheli, K., et al. (2021). “Fourier Neural Operator for Parametric Partial Differential Equations.” *International Conference on Learning Representations*.
6. Gu, J., Gao, Z., Feng, C., Zhu, H., Chen, R. T., Boning, D. S., & Pan, D. Z. (2022). “NeurOLight: A Physics-Agnostic Neural Operator Enabling Parametric Photonic Device Simulation.” *Advances in Neural Information Processing Systems*, 35.
7. Ma, P., Yang, H., Gao, Z., Boning, D. S., & Gu, J. (2024). “PIC2O-Sim: A Physics-Inspired Causality-Aware Dynamic Convolutional Neural Operator for Ultra-Fast Photonic Device FDTD Simulation.” arXiv:2406.17810.
8. Furat, O., Gogineni, V. C., Bindslev, H., & Nadimi, E. S. (2025). “Physics-Informed Neural Operators for Predicting 3D Electromagnetic Fields Transformed by Metasurfaces.” arXiv:2512.15694.
9. Brüel-Gabrielsson, R., Nelson, B. J., Dwaraknath, A., Skraba, P., Guibas, L. J., & Carlsson, G. (2020). “A Topology Layer for Machine Learning.” *Proceedings of AISTATS*, PMLR 108, 1553–1563.
10. Clough, J. R., Byrne, N., Oksuz, I., Zimmer, V. A., Schnabel, J. A., & King, A. P. (2022). “A Topological Loss Function for Deep-Learning Based Image Segmentation Using Persistent Homology.” *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 44(7), 3666–3678.
11. Neo.K (2025). “AOCLS 觀察式錐形光刻系統：AI 驅動的『所見即所造』製造革命.” EveMissLab 概念技術論文。
12. Neo.K (2025). “錐形透鏡：突破對稱性束縛的光學革命.” EveMissLab 概念產品論文。

---

**版本狀態**：v2.0 公開修訂版  
**定位**：可實作、可驗證、可證偽的 AOCLS 虛擬光刻代理模擬架構
