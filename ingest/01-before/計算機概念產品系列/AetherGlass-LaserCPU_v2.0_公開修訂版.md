# AetherGlass–LaserCPU v2.0：三維玻璃光子與異質光電運算研究議程

## 從「全光學星際 CPU」到材料、器件、封裝、記憶與校準的可驗證架構

**英文題名：** AetherGlass–LaserCPU v2.0: A Research Agenda for Three-Dimensional Glass Photonics and Heterogeneous Electro-Photonic Computing  
**文件編號：** EML-AGLC-2026-v2.0  
**作者：** Neo.K（許筌崴）  
**協作修訂：** Aletheia  
**機構：** 一言諾科技有限公司（EveMissLab），台灣  
**原始版本：** 2025 年 11 月  
**公開修訂版：** 2026 年 7 月 30 日  
**文件性質：** 公開概念技術論文／長期研究議程／可證偽架構提案  
**證據等級：** E0（尚未完成 AetherGlass 專用玻璃晶片、LaserCPU 原型或第三方重現）  
**系列定位：** 三維玻璃光子承載層、光電異質運算、光互連、光子記憶與長期可靠度的遠期統合篇  
**授權：** 公開發布前由作者確認最終授權條款  

---

## 修訂聲明

本文由《AetherGlass 與 LaserCPU：星際文明級光子運算架構的理論基礎》重構而來。原稿最有價值的直覺，是將光子的波長、相位、振幅、空間模式和三維傳播路徑視為可被計算利用的自由度，並嘗試把玻璃、干涉、雷射、可重構光路、記憶與環境校正統合成一套長期運算架構。

然而，原稿同時包含多項過度外推：光子傳播被等同於近乎零能耗；光學元件被視為天然抗輻射、無老化並可運作數百年；數千次反射被當成在相同時間內完成數千次免費邏輯；光學邏輯閘被假定可像 CMOS 電晶體一樣任意深度級聯；高品質因子腔體被推導成可擴展的隨機存取記憶體；一束雷射的多參數編碼被直接換算成等價數位位元；並進一步將光子系統與 ASI 意識載體、星際文明必需硬體連成同一條技術必然鏈。

v2.0 進行以下重構：

1. **取消「光子全面取代電子」的主張。** 光子擅長傳輸、廣播、干涉、線性變換、頻寬複用與特定物理運算；電子仍擅長高密度記憶、精確狀態、非線性邏輯、分支控制與可靠提交。
2. **將 AetherGlass 重新定義為三維玻璃光子承載與空間變換平台。** 它可包含飛秒雷射寫入波導、干涉網路、被動多模介質、延遲線、感測與長期光學儲存，但不等於一塊可執行任意程式的魔法玻璃。
3. **將 LaserCPU 重新定義為異質光電處理器。** 它由電子控制與記憶、雷射與調製器、光子線性代數單元、可選非線性光子單元、光互連、校準和精確驗證共同組成，而不是完全以雷射取代電晶體的類馮諾依曼 CPU。
4. **重新定義 KaleidoPath。** 它不再依賴數千次自由空間反射獲得免費計算，而是指三維波導圖、多模傳播介質或可設計散射體中的空間變換。
5. **重新定義 C-PLU。** 它由「基於折射角的任意邏輯閘」改為可程式化相位—振幅—耦合單元，主要承擔矩陣乘法、濾波、路由、模式轉換與特定邏輯原語。
6. **取消光子陷阱作為主記憶體。** 高品質因子腔、延遲線和回授環可作為短期緩衝、狀態與動力學記憶；高密度主記憶仍優先使用電子 SRAM、DRAM、非揮發記憶或光電共置記憶。
7. **將 MEMSync 升級為校準與數位雙生系統。** 它管理溫度、波長、製程偏差、老化、振動、偏振與光功率，而不只控制機械反射鏡。
8. **將 ThermoFlow 降為熱穩定與選配廢熱利用。** 光源、調製器、探測器、DAC／ADC、驅動器與熱調諧仍會產熱，系統能效必須以牆插能耗計算。
9. **取消天然抗輻射與百年壽命。** 玻璃、塗層、矽光子、雷射、探測器與電子驅動均需獨立接受總游離劑量、位移損傷、單粒子效應、真空、熱循環與振動資格化。
10. **將星際文明與 ASI 改為需求壓力測試場景。** 它們可以用來檢查自治、維修、長期保存與輻射可靠度，但不能作為架構正確性的證據。
11. **加入精度、資料轉換、光源、校準與封裝成本模型。** 光在被動介質中完成一次變換可能極快，但完整系統還必須支付 E/O、O/E、記憶體存取、控制、熱穩定與錯誤修正成本。
12. **建立分階段原型與可證偽命題。** 第一個原型不製造全光 CPU，而驗證玻璃三維光子矩陣、光電異質推論、光互連和校準閉環。

因此，新版保留的核心不是「光即文明終極處理器」，而是更具體的研究問題：

> 如何把三維玻璃光子學、積體光子運算、光互連、光電共置記憶、可重構非線性與電子精確控制，組成一個在端到端能耗、精度、可製造性、可校準性與可靠度上可被公平驗證的異質運算平台？

---

## 摘要

本文提出 AetherGlass–LaserCPU v2.0，一套由三維玻璃光子承載層與異質光電處理器構成的長期研究議程。AetherGlass 不被視為全光學通用電腦，而被定義為可在透明材料內形成三維波導、耦合器、干涉器、延遲線、多模變換介質、感測結構與長期資料層的空間化光子平台。LaserCPU 不被定義為以雷射閘全面取代 CMOS 的處理器，而被定義為由電子控制與記憶、光子互連、光子線性代數、選配光學非線性、雷射與頻率梳、調製器、探測器、校準引擎及精確結果驗證共同構成的異質系統。

2025 至 2026 年的研究已證明多項必要元件正在快速進展：大型積體光子加速器已整合超過一萬六千個光子元件並展示低延遲矩陣運算；光子 AI 處理器開始執行 ResNet、BERT 和強化學習等較複雜模型；三維電子—光子整合已展示數十飛焦耳每位元的前端傳輸；飛秒雷射寫入玻璃的三維光子神經網路晶片已能直接處理二維圖像；玻璃雷射寫入亦已形成端到端的多 TB 長期光學儲存系統。這些成果支持「光子作為異質運算與資料移動層」的可行性，但也清楚暴露出電光轉換、類比精度、光源功耗、記憶密度、熱漂移、製程偏差、封裝、校準與軟體模型等瓶頸。

本文將系統分為六個執行與控制域：電子精確域、光源與頻率域、光電轉換域、光子線性與路由域、可選非線性／物理運算域，以及校準—證據—安全域。端到端能耗被定義為雷射、調製、DAC／ADC、探測、調諧、記憶、控制、冷卻與資料搬移的總和，而不是只計算光在波導中的傳播能耗。光子記憶則被重新分為光學延遲與回授、光子權重記憶、電子共置類比記憶、非揮發光子記憶和玻璃長期檔案五個層級；沒有任何一層被假定可以單獨替代現代記憶體階層。

本文提出 AetherIR 中介表示、光電執行圖、精度與漂移誤差模型、牆插能效模型、封裝與校準協議、空間與輻射資格化流程，以及從軟體模擬、玻璃波導晶片、FPGA—光子混合平台、封裝內光子 chiplet 到遠期光學 ALU 的驗證路線。AetherGlass–LaserCPU 的公開主張因此被縮減為：**三維玻璃光子平台可提供電子平面晶片難以直接取得的空間路由與多模變換；異質光電處理器可在特定工作負載中降低資料移動或線性運算成本；但通用性、精度、記憶、控制與可靠性仍必須由電子系統及跨層校準共同承擔。**

**關鍵詞：** 三維玻璃光子學、飛秒雷射直寫、積體光子運算、光子神經網路、光互連、光子記憶、相變材料、磁光記憶、光電異質整合、共封裝光學、空間運算、長期資料保存

---

# 第一章　問題重述：光子不是更快的電子

## 1.1 電子系統的瓶頸不等於電子即將失效

現代電子運算的主要壓力包含：

- 資料移動能耗隨系統規模上升；
- 晶片間與封裝外頻寬密度不足；
- 功率密度、熱點與電源完整性限制時脈和整合度；
- 先進製程與封裝成本快速增加；
- AI 工作負載中的矩陣與張量運算需求持續擴張。

但這些問題不能被簡化為「電子訊號比光慢」。在晶片尺度上，電子和光子的傳播延遲通常都不是唯一瓶頸；路由器、緩衝、序列化、資料轉換、記憶存取、同步、控制和軟體依賴往往佔據更大比例。

一段長度為 $L$ 的傳播路徑，其最低傳播時間約為：

$$
T_{\mathrm{prop}}
=
\frac{n_{\mathrm{eff}}L}{c},
$$

其中 $n_{\mathrm{eff}}$ 是有效折射率。即使光子路徑具有較低傳播延遲，完整工作仍包含：

$$
T_{\mathrm{end}}
=
T_{\mathrm{memory}}
+
T_{\mathrm{encode}}
+
T_{\mathrm{prop}}
+
T_{\mathrm{compute}}
+
T_{\mathrm{detect}}
+
T_{\mathrm{decode}}
+
T_{\mathrm{verify}}.
$$

因此，光子系統是否較快，必須比較端到端流程，而不是只比較載流子速度。

## 1.2 光子的真正自由度

光可同時利用：

$$
\mathcal{D}_{\gamma}
=
\{A,\phi,\lambda,t,\mathbf{r},m,p\},
$$

其中 $A$ 為振幅、$\phi$ 為相位、$\lambda$ 為波長、$t$ 為時間、$\mathbf{r}$ 為空間位置、$m$ 為空間模式、$p$ 為偏振。

這些自由度可支援：

- 波分複用；
- 空分與模式分工；
- 干涉式矩陣變換；
- 被動繞射與卷積；
- 廣播與扇出；
- 低電容光電互連；
- 連續值與機率型運算；
- 光學延遲、回授與動力學記憶。

但自由度增加也帶來：

- 交叉耦合與串擾；
- 波長與溫度漂移；
- 相位穩定問題；
- 類比誤差；
- 模式轉換與耦合損耗；
- 更複雜的標定與編譯。

光子的高維性不是免費位元。若把 $N_{\lambda}$ 個波長、$N_m$ 個模式和 $N_p$ 個偏振狀態同時使用，理論通道數可寫為：

$$
N_{\mathrm{ch}}
=
N_{\lambda}N_mN_p,
$$

但有效通道數還必須扣除信噪比、濾波器選擇性、模式串擾、探測器動態範圍與校準誤差。

## 1.3 光子與電子的比較應以功能分工為中心

| 功能 | 電子系統通常較強 | 光子系統可能較強 |
|---|---|---|
| 高密度靜態記憶 | 是 | 否 |
| 精確分支與例外 | 是 | 否 |
| 非線性與狀態更新 | 是 | 條件式 |
| 高頻寬長距離傳輸 | 受限 | 是 |
| 廣播與 WDM | 受限 | 是 |
| 線性矩陣變換 | 可行但能耗高 | 特定條件下有優勢 |
| 三維空間路由 | 平面製程受限 | 玻璃直寫具有優勢 |
| 長期被動資料保存 | 需介質與刷新 | 玻璃光學儲存具有潛力 |
| 精確數位提交 | 是 | 仍需電子驗證 |

因此，AetherGlass–LaserCPU 的基礎原則是：

> **讓光子承擔它擅長的傳播、變換與並行；讓電子承擔它擅長的記憶、控制、精確提交與安全。**

---

# 第二章　現有技術基線與可主張邊界

## 2.1 大型積體光子加速器已跨過「只有小型示範」階段

2025 年的 64 × 64 積體光子矩陣加速器整合超過 16,000 個光子元件，報告最高 1 GHz 運作頻率與約 3 ns 週期延遲，並以共整合電子晶片承擔邏輯、記憶與控制。這項成果支持三個判定：

1. 大規模光子元件整合已進入萬級元件；
2. 光子核心仍需要電子記憶與控制；
3. 光子加速器的現實形式是 2.5D／3D 異質封裝，而不是孤立的全光晶片。

另一項 2025 年研究展示能執行 ResNet、BERT 和強化學習模型的光子 AI 處理器，說明光子計算正在從簡化手寫數字基準走向較複雜模型。然而，「可執行模型」仍不等於對所有工作負載具有更佳能效或成本；必須把資料轉換、光源、記憶與控制納入比較。

## 2.2 三維玻璃光子運算已從概念走向實驗晶片

2026 年的可程式三維光子神經網路晶片，以飛秒雷射直寫在玻璃中形成多層波導與相位調制結構，直接處理二維圖像。這證明玻璃內三維光路不只適合量子光學與感測，也可作為空間並行的光子計算介質。

但其報告的 TOPS 指標主要反映光學場在高度平行架構中的等效運算吞吐，不能不經校正地與數位 GPU 的整數或浮點 TOPS 等同。公平比較至少要同時報告：

- 精度與有效位元；
- 光源與驅動功耗；
- 資料輸入輸出成本；
- 重編程時間；
- 晶片面積與封裝；
- 校準頻率；
- 可支援運算類型。

## 2.3 光互連可能比光邏輯更早產生系統價值

2025 年的三維電子—光子整合平台，以 80 組發射與接收通道展示總計 800 Gb/s 頻寬；其發射與接收前端分別報告約 50 fJ/bit 與 70 fJ/bit。這種成果說明，光子最成熟的近期角色可能是減少晶片間資料移動成本，而不是立即取代 CPU 核心。

但完整鏈路能耗仍必須加入：

$$
E_{\mathrm{link}}
=
E_{\mathrm{laser}}
+
E_{\mathrm{driver}}
+
E_{\mathrm{mod}}
+
E_{\mathrm{route}}
+
E_{\mathrm{PD}}
+
E_{\mathrm{TIA}}
+
E_{\mathrm{clock}}
+
E_{\mathrm{thermal}}.
$$

單一元件的飛焦耳級數字不能直接等同整條鏈路或系統的牆插能效。

## 2.4 光學數位邏輯正在進步，但尚未形成 CMOS 等價生態

2026 年已有可重構光學算術邏輯單元研究展示多功能算術與邏輯原語，另有自由空間繞射系統把多級非線性邏輯折疊為單級平行光學讀出。這些成果證明光學不只能執行矩陣乘法。

然而，通用數位處理器還需要：

- 大量可級聯邏輯；
- 高扇出與訊號恢復；
- 狀態、鎖存與時序；
- 精確例外；
- 分支、記憶體保護與虛擬化；
- 高密度快取；
- 故障檢測與良率。

所以 LaserCPU v2.0 只把光學 ALU 視為遠期執行域，而不是近期主核心。

---

# 第三章　AetherGlass：三維玻璃光子承載層

## 3.1 正式定義

AetherGlass 是一種可在透明材料內部形成三維光子結構、並與電子與其他光子晶片耦合的承載平台。其功能集合為：

$$
\mathcal{A}_{\mathrm{AG}}
=
\left(
\mathcal{W}_{3D},
\mathcal{T}_{\mathrm{passive}},
\mathcal{R}_{\mathrm{config}},
\mathcal{B}_{\mathrm{buffer}},
\mathcal{S}_{\mathrm{sense}},
\mathcal{M}_{\mathrm{archive}},
\mathcal{C}_{\mathrm{cal}}
\right).
$$

其中：

- $\mathcal{W}_{3D}$：三維波導與耦合圖；
- $\mathcal{T}_{\mathrm{passive}}$：被動光學變換；
- $\mathcal{R}_{\mathrm{config}}$：可重構相位、振幅和路由；
- $\mathcal{B}_{\mathrm{buffer}}$：延遲、回授與短期狀態；
- $\mathcal{S}_{\mathrm{sense}}$：內建監測與校準；
- $\mathcal{M}_{\mathrm{archive}}$：長期玻璃資料層；
- $\mathcal{C}_{\mathrm{cal}}$：模型、控制與證據。

AetherGlass 可以是一塊玻璃晶片、玻璃中介層、透明模組，或多個玻璃與半導體晶粒的封裝組合。

## 3.2 KaleidoPath：從萬花鏡反射改為三維光路圖

原稿將 KaleidoPath 描述為數百至數千次反射，使光在相同宏觀時間內「訪問」大量運算節點。這忽略了路徑長度必然增加，以及每次反射、耦合與散射都會累積損耗。

對由邊 $e$ 構成的光路圖：

$$
\mathcal{G}_{\mathrm{opt}}
=
(V_{\mathrm{opt}},E_{\mathrm{opt}}),
$$

某條路徑 $p$ 的時間和傳輸率為：

$$
T_p
=
\sum_{e\in p}
\frac{n_eL_e}{c}
+
\sum_{v\in p}T_v,
$$

$$
\eta_p
=
\prod_{e\in p}\eta_e
\prod_{v\in p}\eta_v.
$$

因此增加更多反射或節點不會免費增加計算量。新版 KaleidoPath 指以下三類結構：

1. **三維單模／少模波導圖**：減少平面交叉並提供空間路由；
2. **多模干涉介質**：以整體傳播完成矩陣或核變換；
3. **被動繞射與散射體**：針對固定或低頻更新任務執行空間變換。

KaleidoPath 的目標是減少路由衝突與 I/O 序列化，而不是追求反射次數本身。

## 3.3 C-PLU：可程式化光子線性單元

C-PLU 保留名稱，但正式改為 **Configurable Photonic Linear Unit**。其核心是：

$$
\mathbf{y}
=
\mathbf{H}(\boldsymbol{\theta},T,\lambda,p)\mathbf{x}
+
\boldsymbol{\epsilon},
$$

其中 $\mathbf{H}$ 由相位移器、耦合器、干涉器、微環、模式轉換器或多模介質形成；$\boldsymbol{\theta}$ 是可調參數；$T$、$\lambda$、$p$ 分別是溫度、波長與偏振；$\boldsymbol{\epsilon}$ 是噪聲與漂移。

C-PLU 適合：

- 矩陣—向量乘法；
- 卷積與濾波；
- 波束形成；
- 模式分解；
- 光交換與路由；
- 頻譜與時序變換；
- 小型光學算術原語。

它不被假定可以直接取代完整 ALU、快取和控制單元。

## 3.4 被動空間計算介質

AetherGlass 可包含固定或低頻重構的連續介質。對輸入光場 $E_{\mathrm{in}}$，輸出為：

$$
E_{\mathrm{out}}
=
\mathcal{P}_{\Omega,\chi,\epsilon_r}
[E_{\mathrm{in}}],
$$

其中 $\Omega$ 是三維幾何，$\chi$ 是材料非線性，$\epsilon_r$ 是介電分布。設計工作不是逐閘連接，而是求解：

$$
\Omega^{\star},\chi^{\star},\epsilon_r^{\star}
=
\arg\min
\mathcal{L}
\left(
\mathcal{D}
\left(
\mathcal{P}[E_{\mathrm{in}}]
\right),
\mathbf{y}_{\mathrm{target}}
\right),
$$

其中 $\mathcal{D}$ 是探測與解碼。

這類介質可以非常低延遲地完成一次固定變換，但其代價是：

- 任務專用性高；
- 重新製造或重編程成本；
- 類比誤差；
- 輸入輸出轉換；
- 難以實現任意資料依賴和分支。

## 3.5 玻璃長期資料層

2026 年的玻璃雷射寫入系統已展示 301 層、約 1.59 Gbit/mm³ 的資料密度和約 4.8 TB 單片可用容量，並建立寫入、儲存和讀出的端到端流程。這支持 AetherGlass 將玻璃作為長期檔案層。

但玻璃檔案層的角色是：

- 不頻繁改寫；
- 長時間保存；
- 離線或近線資料；
- 模型權重、任務紀錄、科學資料與恢復映像。

它不是奈秒級隨機存取記憶體。存取時間模型為：

$$
T_{\mathrm{archive}}
=
T_{\mathrm{locate}}
+
T_{\mathrm{scan}}
+
T_{\mathrm{decode}}
+
T_{\mathrm{ECC}},
$$

其最佳比較對象是磁帶、光碟和冷資料儲存，而不是 SRAM。

## 3.6 玻璃平台的限制

飛秒雷射寫入玻璃具有真正三維、快速迭代與低批量成本優勢，但也受到：

- 折射率改變量有限；
- 彎曲半徑與彎曲損耗；
- 寫入速度；
- 製程均勻性；
- 偏振依賴；
- 與半導體、雷射及探測器的耦合；
- 大規模量產與測試；
- 熱光係數和機械應力；
- 玻璃種類與波段相容性；

限制。AetherGlass 必須以玻璃最適合的三維路由、被動變換、感測與檔案功能為起點，而不是強迫玻璃承擔所有主動邏輯。

---

# 第四章　LaserCPU：異質光電處理器

## 4.1 正式定義

LaserCPU 是由電子與光子執行域共同構成的處理器：

$$
\mathcal{L}_{\mathrm{CPU}}
=
\left(
\mathcal{E}_{\mathrm{exact}},
\mathcal{S}_{\mathrm{laser}},
\mathcal{X}_{\mathrm{EO/OE}},
\mathcal{P}_{\mathrm{linear}},
\mathcal{N}_{\mathrm{nonlinear}},
\mathcal{M}_{\mathrm{memory}},
\mathcal{V}_{\mathrm{verify}}
\right).
$$

其元件為：

1. **電子精確域**：控制流、位址、虛擬記憶體、例外、安全、精確提交；
2. **光源域**：雷射、頻率梳、波長選擇與功率分配；
3. **E/O 與 O/E 域**：調製、DAC／ADC、探測與跨域資料交換；
4. **光子線性域**：矩陣、卷積、路由、交換與模式處理；
5. **光子非線性域**：選配激活、邏輯、閾值、儲備池與物理運算；
6. **記憶域**：電子、光電共置、光子權重與長期玻璃儲存；
7. **驗證域**：校準、誤差估計、重算、比較與回退。

## 4.2 LEU：雷射與頻率資源池

原稿的 Laser Emitter Unit 假設每個運算單元都可快速、寬範圍地獨立調整波長、功率、相位與脈衝時序。新版改為共用的 **Laser and Comb Resource Pool**：

- 外置或封裝內連續波雷射；
- 多波長頻率梳；
- 波長選擇器；
- 功率分配網路；
- 調制器與相位鎖定；
- 健康度與備援光源。

光源牆插能效為：

$$
\eta_{\mathrm{wall}}
=
\frac{P_{\mathrm{opt,out}}}{P_{\mathrm{electrical,in}}}.
$$

系統不能只計算進入光子核心的光功率。若某項運算需要光放大器、熱調諧或高功率非線性，其功耗必須完整納入。

多參數編碼亦不能直接用狀態數換算為可靠位元。有效資訊量受符號間距與噪聲限制：

$$
I(X;Y)
\le
\log_2 M,
$$

但只有在通道信噪比、相位穩定度與探測器分辨率足夠時，才接近 $\log_2 M$。

## 4.3 Photonic Linear Tile

近期最成熟的 LaserCPU 執行域是光子線性代數。對批次輸入 $\mathbf{X}$ 和權重 $\mathbf{W}$：

$$
\mathbf{Y}_{\mathrm{opt}}
=
\mathbf{W}_{\mathrm{phys}}\mathbf{X}_{\mathrm{enc}}
+
\boldsymbol{\nu}.
$$

其中：

$$
\mathbf{W}_{\mathrm{phys}}
=
\mathbf{W}_{\mathrm{target}}
+
\Delta\mathbf{W}_{\mathrm{fab}}
+
\Delta\mathbf{W}_{T}
+
\Delta\mathbf{W}_{\lambda}
+
\Delta\mathbf{W}_{\mathrm{age}}.
$$

因此光子核心必須配合：

- 硬體感知訓練；
- 權重量化；
- 校準矩陣；
- 差分讀出；
- 漂移追蹤；
- 週期性再映射；
- 數位殘差修正。

## 4.4 非線性與完整神經元

純被動光學主要實現線性變換。深層神經網路、邏輯與狀態機仍需要非線性。2025 年已有完整積體光子神經元利用 Kerr 效應執行高階時序卷積和全光非線性激活，證明非線性光子元件正在進步。

但每種非線性都需評估：

- 啟動能量；
- 響應時間；
- 消光比；
- 級聯能力；
- 噪聲與飽和；
- 光功率閾值；
- 材料損傷；
- 製程一致性。

因此 LaserCPU 支援三種非線性策略：

1. **O/E/O 非線性**：探測後由電子執行激活，再重新調制；
2. **混合光電非線性**：光子與電子元件共置；
3. **全光非線性**：只用於已證明端到端收益的特定層或任務。

## 4.5 遠期光學 ALU

光學 ALU 可以作為 P4 等級研究原型，研究：

- 加法、比較、位運算；
- 多功能重構；
- 高速前處理；
- 資料加密與圖像運算；
- 特定訊號協議。

但它不在 v2.0 中被視為取代 CPU 的必要條件。評估至少包含：

$$
\mathbf{K}_{\mathrm{ALU}}
=
\left(
L,
E,
A,
B,
P_{\mathrm{err}},
F,
C_{\mathrm{cascade}},
C_{\mathrm{state}}
\right),
$$

分別表示延遲、能耗、面積、頻寬、錯誤率、功能完備度、級聯成本與狀態成本。

---

# 第五章　記憶階層：光不能停下來，不代表光不能具有記憶

## 5.1 五類記憶必須分開

### M0：電子精確記憶

SRAM、DRAM、HBM、快閃、MRAM 或其他電子記憶，承擔：

- 指令與資料；
- 精確狀態；
- 位址與權限；
- 快取；
- 檢查點與回退。

### M1：光學延遲與回授

波導延遲、光纖環、諧振腔和回授網路可以保存一段時間的歷史。對群速度 $v_g$ 和路徑長度 $L$：

$$
\tau_{\mathrm{delay}}
=
\frac{L}{v_g}.
$$

其容量受頻寬、脈衝寬度、色散和損耗限制。它適合：

- 串流對齊；
- 儲備池計算；
- 時序特徵；
- 短期緩衝。

它不適合高密度、長時間、任意位址存取。

### M2：光子權重記憶

相變材料、磁光材料、微環與其他非揮發光子元件，可儲存神經網路權重或路由狀態。2025 年的磁光光子記憶展示約 GHz 級編程、多級非揮發權重與高耐久潛力；相變材料則提供較大折射率對比，但面臨吸收、耐久、熱串擾與漂移。

### M3：光電共置類比記憶

2026 年已有將電容式類比記憶與光子權重庫單片整合的神經形態晶片，顯示不必堅持「記憶也必須是光」。其目的在於減少 SRAM—DAC 間長距離搬移，而不是消滅電子記憶。

### M4：玻璃長期檔案

以飛秒雷射寫入玻璃，保存：

- 模型基線；
- 系統配置；
- 任務紀錄；
- 科學資料；
- 法規與維修文件；
- 災難恢復映像。

## 5.2 Photon Trap 的新定位

Photon Trap 名稱可以保留，但只表示高品質因子腔、回授環或長延遲線中的光學狀態。其衰減可寫為：

$$
U(t)
=
U_0e^{-t/\tau},
$$

其中：

$$
\tau
=
\frac{Q}{\omega}.
$$

高 $Q$ 可延長壽命，但也可能帶來：

- 窄頻；
- 對溫度與製程更敏感；
- 較慢載入與釋放；
- 難以獨立尋址；
- 更高校準成本。

因此 Photon Trap 是動力學元件，不是自動可擴展成 GB 級快取的單位元陷阱陣列。

---

# 第六章　MEMSync：從機械補償到全系統校準

## 6.1 校準向量

MEMSync v2.0 管理的狀態為：

$$
\mathbf{s}_{\mathrm{cal}}
=
\left(
T,
\lambda,
P,
\phi,
\mathbf{c},
\mathbf{m},
\mathbf{d},
\mathbf{a}
\right),
$$

其中 $T$ 是溫度，$\lambda$ 是波長，$P$ 是功率，$\phi$ 是相位，$\mathbf{c}$ 是耦合係數，$\mathbf{m}$ 是模式狀態，$\mathbf{d}$ 是探測器參數，$\mathbf{a}$ 是老化與輻射狀態。

## 6.2 校準閉環

$$
\text{Pilot Input}
\rightarrow
\text{Optical Measurement}
\rightarrow
\text{Parameter Estimation}
\rightarrow
\text{Compensation}
\rightarrow
\text{Verification}.
$$

補償可以包含：

- 熱調諧；
- 電光相位調制；
- 權重重映射；
- 波長重分配；
- 數位殘差校正；
- 光功率正規化；
- 故障路由繞行；
- 重新訓練或重新編譯。

## 6.3 不確定性與證書

對每次運算，系統輸出：

$$
\mathcal{C}_{\mathrm{run}}
=
\left(
\hat{\mathbf{y}},
\Sigma_{\mathbf{y}},
\mathcal{D}_{\mathrm{cal}},
\mathcal{H}_{\mathrm{health}},
\mathcal{F}_{\mathrm{fallback}}
\right).
$$

若誤差界、健康度或校準域不合格，結果必須：

- 由電子路徑重算；
- 降低精度要求；
- 使用冗餘光路；
- 停用失效波長或模式；
- 重新校準。

---

# 第七章　端到端能耗與精度模型

## 7.1 牆插能耗

一次光電任務的總能耗為：

$$
E_{\mathrm{total}}
=
E_{\mathrm{memory}}
+
E_{\mathrm{encode}}
+
E_{\mathrm{laser}}
+
E_{\mathrm{mod}}
+
E_{\mathrm{opt}}
+
E_{\mathrm{detect}}
+
E_{\mathrm{ADC/DAC}}
+
E_{\mathrm{control}}
+
E_{\mathrm{cal}}
+
E_{\mathrm{cool}}
+
E_{\mathrm{retry}}.
$$

其中 $E_{\mathrm{opt}}$ 可能很低，但其他項不一定低。光子架構只有在：

$$
E_{\mathrm{total,photonic}}
<
E_{\mathrm{total,baseline}}
$$

且達到相同精度、吞吐、延遲與可靠度時，才能宣稱能效優勢。

## 7.2 精度模型

令數位輸入為 $\mathbf{x}$：

$$
\hat{\mathbf{y}}
=
Q_{\mathrm{ADC}}
\left[
\mathcal{D}
\left(
\mathbf{H}(\boldsymbol{\theta}+\Delta\boldsymbol{\theta})
Q_{\mathrm{DAC}}(\mathbf{x})
+
\boldsymbol{\nu}_{\mathrm{opt}}
\right)
\right]
+
\boldsymbol{\nu}_{\mathrm{elec}}.
$$

誤差來源包含：

- 輸入量化；
- DAC／調制器非線性；
- 製程偏差；
- 熱與波長漂移；
- 散粒噪聲；
- 探測器與放大器噪聲；
- ADC 量化；
- 光功率飽和；
- 權重記憶漂移。

有效位元數與任務精度都必須實測，不能只用光場的連續性宣稱「無限精度」。

## 7.3 吞吐不能脫離資料重用

光子核心的峰值吞吐可能非常高，但若權重和輸入頻繁從電子記憶搬入，則有效利用率為：

$$
U_{\mathrm{eff}}
=
\frac{T_{\mathrm{compute}}}
{T_{\mathrm{load}}+T_{\mathrm{convert}}+T_{\mathrm{compute}}+T_{\mathrm{readout}}}.
$$

適合光子加速的工作負載通常具有：

- 大量線性運算；
- 高權重重用；
- 批次或 WDM 並行；
- 可容忍有限精度；
- 低分支密度；
- 可用電子後處理修正。

---

# 第八章　材料、封裝與製造

## 8.1 多平台異質整合

LaserCPU 不應限制於單一材料。可使用：

- 矽：電子與成熟矽光子；
- 氮化矽：低損耗與非線性；
- 薄膜鈮酸鋰：高速電光調制；
- III–V：雷射與光放大；
- 磁光石榴石：非互易與記憶；
- 相變材料：非揮發調制；
- 玻璃：三維波導、檔案與光學介面；
- 聚合物：快速原型與模式轉接。

平台選擇是多目標問題：

$$
\boldsymbol{\mu}^{\star}
=
\arg\min_{\boldsymbol{\mu}}
\left(
L_{\mathrm{opt}},
E_{\mathrm{EO}},
C_{\mathrm{fab}},
R_{\mathrm{thermal}},
R_{\mathrm{rad}},
C_{\mathrm{package}},
U_{\mathrm{yield}}
\right).
$$

## 8.2 玻璃中介層與光學扇出

AetherGlass 可作為：

- 電子—光子晶粒間光學扇出；
- 三維波導橋；
- 模式轉換與光纖耦合；
- 感測與校準結構；
- 與玻璃通孔、金屬線和微凸塊共存的封裝層。

但玻璃中介層同樣具有熱膨脹、翹曲、通孔可靠性、熱傳導與組裝良率問題，必須與電子封裝共同設計。

## 8.3 GVS 流程重構

原稿的 Generate–Verify–Solidify 保留，但改為：

### G：Generate

- AetherIR 生成光電任務圖；
- 逆向設計波導、耦合器與多模介質；
- 封裝與光纖路由；
- 製程容差與校準點共同設計。

### V：Verify

- 電磁、熱、機械與電路共同模擬；
- 類比精度與噪聲；
- E/O、O/E 與記憶體能耗；
- 製程蒙地卡羅；
- 可靠度、輻射與熱循環；
- 編譯器和工作負載模擬。

### S：Solidify

- 半導體晶圓製程；
- 異質鍵合與 micro-transfer printing；
- 飛秒雷射玻璃寫入；
- 光纖／雷射／探測器組裝；
- 自動光學對準；
- 晶圓級與封裝後測試；
- 校準資料寫入。

製造完成後必須回到 Verify，而不是把 Solidify 當作流程終點。

---

# 第九章　太空與長期自治：需求壓力測試，而非天然優勢

## 9.1 光子元件不等於輻射免疫

矽光子調制器在游離輻射下可能出現界面陷阱、頻寬下降與眼圖閉合；玻璃、光纖與塗層可能產生色心、吸收增加和機械性質變化；雷射和探測器含有半導體結構；驅動與控制仍依賴電子元件。

因此太空版本必須分元件建立：

$$
\mathcal{Q}_{\mathrm{space}}
=
\left(
\mathrm{TID},
\mathrm{DDD},
\mathrm{SEE},
\mathrm{vacuum},
\mathrm{thermal\ cycle},
\mathrm{vibration},
\mathrm{outgassing},
\mathrm{lifetime}
\right).
$$

沒有通過資格化的光子元件，不能因為「光子不帶電」而被宣稱抗輻射。

## 9.2 深空不是 3 K 的免費冷源

太空散熱主要依賴輻射：

$$
P_{\mathrm{rad}}
=
\epsilon\sigma A
\left(
T^4-T_{\mathrm{env}}^4
\right).
$$

即使背景溫度很低，散熱能力仍受散熱面積、放射率、朝向、太陽與行星輻射，以及內部熱傳路徑限制。大型光電系統仍需熱管、冷板、散熱器與穩溫。

## 9.3 長期自治所需的真正功能

對數十年任務，AetherGlass–LaserCPU 的潛在價值不在於「永不失效」，而在於：

- 三維光路冗餘；
- 波長與模式重新分配；
- 電子與光子雙路執行；
- 玻璃長期恢復映像；
- 內建校準與健康監測；
- 模組更換和可隔離故障域；
- 降級運作；
- 遠端可審計證據。

## 9.4 ASI 與意識主張的處置

本文不以光子是量子實體推導光子系統更適合承載意識。所有物質在量子力學上都是量子系統，不能由此判定特定運算介質具有主體性。

ASI 在本文中只表示一類可能具有：

- 高模型吞吐；
- 大型記憶與資料移動；
- 長時間自治；
- 自我校準和重配置；
- 嚴格可靠度；

需求的遠期工作負載。硬體價值仍以可觀測指標判定。

---

# 第十章　AetherIR 與軟體模型

## 10.1 AetherIR

AetherIR 描述一個光電執行圖：

$$
\mathcal{G}_{\mathrm{AE}}
=
(V_E,V_P,V_X,E_D,E_C,E_S),
$$

其中：

- $V_E$：電子運算節點；
- $V_P$：光子運算節點；
- $V_X$：跨域轉換節點；
- $E_D$：資料依賴；
- $E_C$：控制依賴；
- $E_S$：校準、安全與同步依賴。

每個節點具有：

$$
\mathbf{a}_v
=
\left(
\mathrm{dtype},
\mathrm{precision},
\mathrm{shape},
\mathrm{latency},
\mathrm{energy},
\mathrm{error},
\mathrm{reconfig},
\mathrm{calibration},
\mathrm{fallback}
\right).
$$

## 10.2 編譯器的任務

編譯器必須決定：

- 哪些算子留在電子域；
- 哪些線性層映射到光子域；
- 波長、模式、時間和空間資源；
- 權重如何寫入；
- 轉換次數是否過多；
- 校準矩陣與數位修正；
- 不確定性超界時的重算策略。

最小化：

$$
J(\Pi)
=
\alpha T_{\mathrm{end}}
+
\beta E_{\mathrm{total}}
+
\gamma C_{\mathrm{convert}}
+
\delta R_{\mathrm{error}}
+
\eta C_{\mathrm{cal}}
+
\zeta C_{\mathrm{reconfig}}
+
\xi R_{\mathrm{failure}}.
$$

## 10.3 與 O-Chip 和 SynCore 的關係

$$
\text{應用／AetherIR}
\rightarrow
\text{O-Chip 編排}
\rightarrow
\begin{cases}
\text{SynCore 數位與物理執行域}\\
\text{LaserCPU 光電執行域}\\
\text{AetherGlass 路由與空間變換}
\end{cases}
\rightarrow
\text{驗證與提交}.
$$

LaserCPU 不取代 SynCore；兩者是不同類型的異質執行域。

---

# 第十一章　分階段工程路線

## P0：軟體與系統模型

目標：建立 AetherIR、能耗模型、精度模型與可比較基準。

輸出：

- 光電任務圖；
- 模擬的 MZI／微環／多模介質；
- E/O 和 O/E 成本；
- 校準與漂移模型；
- GPU／CPU／FPGA 基線。

## P1：AetherGlass 被動三維晶片

製造：

- 飛秒雷射直寫玻璃；
- 三維波導和耦合器；
- 8 × 8 或 16 × 16 被動矩陣變換；
- 內建 pilot 光路與監測端口。

驗證：

- 插入損耗；
- 串擾；
- 變換誤差；
- 溫度漂移；
- 重複製造一致性；
- 與自由空間／平面 PIC 基線比較。

## P2：FPGA—光子混合加速器

- FPGA 產生數位輸入；
- DAC／調制器編碼；
- AetherGlass 或矽光子執行矩陣；
- 探測／ADC；
- 數位殘差校正；
- 明確報告牆插能耗。

工作負載：

- 小型線性分類；
- 卷積核；
- 通訊等化；
- 波束形成；
- 小型最小平方問題。

## P3：光電共置記憶與校準

比較：

- 熱調諧；
- 電容類比記憶；
- 相變記憶；
- 磁光記憶；
- 電子 SRAM—DAC 基線。

## P4：封裝內 LaserCPU Tile

- 電子控制 chiplet；
- 光子計算 chiplet；
- 雷射與頻率梳；
- 玻璃或矽光子中介層；
- 光學 I/O；
- 故障繞行與熱控制。

## P5：遠期光學 ALU 與非線性執行域

只有當 P0–P4 證明：

- 光電轉換不是主瓶頸；
- 校準可維持；
- 非線性級聯具有能效收益；
- 記憶與精確提交可安全整合；

才進入全光或多功能光學 ALU。

## P6：太空資格化

- 元件級輻射；
- 工作狀態下輻射；
- 熱真空；
- 振動與衝擊；
- 長時間老化；
- 光路污染；
- 自動校準與降級；
- 在軌驗證。

---

# 第十二章　公平基準與證據制度

## 12.1 比較基線

每個光子方案至少比較：

1. CPU；
2. GPU；
3. FPGA；
4. 電子類比／記憶體內運算；
5. 矽光子平面加速器；
6. AetherGlass 三維版本；
7. 不含資料轉換成本的核心結果；
8. 含所有轉換與冷卻的端到端結果。

## 12.2 指標

$$
\mathbf{K}
=
\left(
T_{\mathrm{end}},
E_{\mathrm{wall}},
Q_{\mathrm{good}},
P_{\mathrm{error}},
B_{\mathrm{effective}},
A_{\mathrm{package}},
C_{\mathrm{cal}},
C_{\mathrm{reconfig}},
Y,
R_{\mathrm{lifetime}}
\right).
$$

## 12.3 證據等級

| 等級 | 定義 |
|---|---|
| E0 | 概念、方程與路線 |
| E1 | 可公開模擬與程式碼 |
| E2 | 單元件／小規模玻璃或光子晶片 |
| E3 | 光電完整閉環原型與公平基準 |
| E4 | 封裝系統、長時間穩定與第三方重現 |
| E5 | 特定應用資格化、量產與現場資料 |

本文目前為 E0。

---

# 第十三章　可證偽命題

## 命題 A：三維玻璃路由優勢

在相同端口數、光路功能和封裝體積下，AetherGlass 三維波導圖相較平面波導可降低交叉、串擾或總路由損耗；若不能，三維化不成立為該任務的優勢。

## 命題 B：端到端能效

對固定精度和吞吐量的矩陣工作負載，含雷射、DAC／ADC、控制和冷卻的 LaserCPU 原型，能耗低於最強電子基線；若只在忽略轉換時較低，則主張被否證。

## 命題 C：校準可維持性

在指定溫度循環與老化條件下，MEMSync 可在限定校準開銷內維持誤差上界；若校準時間或功耗抵銷計算收益，架構需縮減。

## 命題 D：光電共置記憶

共置類比或光子權重記憶能降低資料搬移能耗，且耐久、漂移和精度符合工作負載；若頻繁重寫造成壽命或校準失效，應退回電子記憶。

## 命題 E：玻璃空間計算

對直接二維／三維感測輸入，玻璃三維光子晶片能減少序列化 I/O 並維持任務精度；若輸入、相位控制和讀出仍成為主瓶頸，空間並行優勢被否證。

## 命題 F：太空可靠度

經工作狀態輻射、熱真空與振動後，系統可透過校準和冗餘維持指定服務；若光子元件退化與電子元件相同或更嚴重，不能宣稱天然深空優勢。

---

# 第十四章　系列中的正式位置

AetherGlass–LaserCPU v2.0 與其他概念產品的關係為：

$$
\text{SDMCA}
\supset
\text{光電模組空間與服務拓撲},
$$

$$
\text{DPCPS}
\rightarrow
\text{雷射、調制器與電子控制供電},
$$

$$
\text{DryCore}
\rightarrow
\text{光源、探測器、調諧器與封裝熱管理},
$$

$$
\text{O-Chip}
\rightarrow
\text{光電任務與資源編排},
$$

$$
\text{SynCore}
\leftrightarrow
\text{LaserCPU 異質執行協同},
$$

$$
\text{CPOP／AOCLS}
\rightarrow
\text{微光學、玻璃原型、封裝與量測製造工具}.
$$

AetherGlass 不是「萬物皆 AI」的物理證明，也不是拓撲計算引擎的自動實現；它是可被上述系統調度的一個光子物理承載與執行域。

---

# 第十五章　結論

AetherGlass 和 LaserCPU 的原始願景並非毫無根據。光子確實提供電子導線難以取得的波長、模式、相位與空間並行；飛秒雷射直寫使三維玻璃光子電路成為現實；大型積體光子加速器、光子 AI 處理器、三維光電互連、光子記憶和可重構光學邏輯，均在 2025 至 2026 年取得重要進展。

但這些進展支持的是**異質光電共存**，而不是「電子運算已經終結」。光源、調制、探測、ADC／DAC、記憶、控制、校準、封裝和散熱仍決定完整系統的性能。光子傳播本身的低延遲和低能耗，只有在跨域成本被壓低、工作負載結構適合、精度可維持時，才會轉化為系統優勢。

AetherGlass v2.0 的價值，在於將玻璃的三維製造、穩定性、空間路由、被動變換和長期資料保存整合為一種新的光子承載層。LaserCPU v2.0 的價值，在於把電子精確控制、光子線性運算、光互連、選配非線性與多層記憶組成可被編譯、校準、驗證和回退的異質處理器。

因此，本篇最終主張是：

> **光子不是電子的靈魂，也不是電子的終結者。它是一種具有不同自由度、不同誤差結構與不同成本函數的運算介質。真正可行的 LaserCPU，將不是一台純光 CPU，而是一個知道何時使用光、何時返回電子、如何校準並如何證明結果可信的光電共同體。**

---

# 參考文獻

[1] Hua, S. et al. An integrated large-scale photonic accelerator with ultralow latency. *Nature* 640, 361–367 (2025). DOI: 10.1038/s41586-025-08786-6.  
[2] Ahmed, S. R. et al. Universal photonic artificial intelligence acceleration. *Nature* 640, 368–374 (2025). DOI: 10.1038/s41586-025-08854-x.  
[3] Daudlin, S. et al. Three-dimensional photonic integration for ultra-low-energy, high-bandwidth interchip data links. *Nature Photonics* 19, 502–509 (2025). DOI: 10.1038/s41566-025-01633-0.  
[4] Cao, Z. et al. Programmable Three-dimensional Photonic Neural Network Chip. *Nature Communications* 17, 5476 (2026). DOI: 10.1038/s41467-026-72316-9.  
[5] Microsoft Research Project Silica Team. Laser writing in glass for dense, fast and efficient archival data storage. *Nature* 650, 606–612 (2026). DOI: 10.1038/s41586-025-10042-w.  
[6] Wei, M. et al. Monolithic back-end-of-line integration of phase change photonics. *Nature Communications* 15 (2024). DOI: 10.1038/s41467-024-47206-7.  
[7] Integrated non-reciprocal magneto-optics with ultra-high endurance for photonic in-memory computing. *Nature Photonics* 19 (2025). DOI: 10.1038/s41566-024-01549-1.  
[8] Neuromorphic photonic computing with an electro-optic analog memory. *Nature Communications* (2026). DOI: 10.1038/s41467-026-69084-x.  
[9] Yan, T. et al. A complete photonic integrated neuron for nonlinear all-optical computing. *Nature Computational Science* 5, 1202–1213 (2025). DOI: 10.1038/s43588-025-00866-x.  
[10] Zhou, X. et al. Reconfigurable optical arithmetic logic unit and its applications. *Nature Communications* (2026). DOI: 10.1038/s41467-026-75750-x.  
[11] Arnold, K. P. et al. Radiation-induced Ionization Effects and Space Mission Requirements for Silicon Photonic Mach-Zehnder Modulators. arXiv:2509.20267 (2025).  
[12] ESA. Photonic Components: development, environmental testing and space qualification programme. European Space Agency.  
[13] Davis, K. M. et al. Writing waveguides in glass with a femtosecond laser. *Optics Letters* 21, 1729–1731 (1996). DOI: 10.1364/OL.21.001729.  
[14] Zhou, X. et al. Towards fibre-like loss for photonic integration from violet to near-infrared. *Nature* (2026). DOI: 10.1038/s41586-025-09889-w.  
