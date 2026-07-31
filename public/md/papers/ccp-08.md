# 錐形相位光學平台：從軸錐透鏡、Bessel–Gauss 光束到可程式化延伸焦域

**Conical Phase Optics Platform: From Axicons and Bessel–Gauss Beams to Programmable Extended Focal Fields**

---

**作者**：Neo.K（許筌崴）  
**機構**：一言諾科技有限公司（EveMissLab）  
**版本**：v2.0 公開修訂版  
**日期**：2026 年 7 月 29 日  
**文件性質**：概念技術論文／既有光學元件的平台化架構提案  
**前版**：《錐形透鏡：突破對稱性束縛的光學革命》（v1.0）  
**系列定位**：計算機概念產品系列之一；AOCLS 光場生成與校準的前置基礎  
**證據狀態**：軸錐透鏡、Bessel 類光束及其在顯微、加工與光束整形中的物理基礎已有實驗文獻；本文提出的整合式錐形相位光學平台與 AOCLS 閉環尚屬 E0 架構提案  
**開源聲明**：本文公開術語、數學模型、系統架構、模擬方法與驗證流程；特定元件參數、製程窗口與設備校準資料可另依合作、專利或商業機密管理

---

## 摘要

本文提出**錐形相位光學平台**（Conical Phase Optics Platform, CPOP），將折射式軸錐透鏡、繞射式 axicon、空間光調變器、數位微鏡元件、液態可調軸錐、微型 axicon、meta-axicon、複合透鏡組、波前量測與閉環校準整合為一個可程式化結構光場平台。本文不是宣稱發明 axicon。軸錐光學元件自 1954 年即已被系統研究，其基本作用是把入射波前轉換為錐形波，使有限孔徑光束在一定傳播區間內形成延伸焦域、環形分布或 Bessel–Gauss 類光束。

本文首先修正前版三項根本誤解。第一，理想圓錐 axicon 具有旋轉對稱性；其特殊功能並非源自打破對稱，而是源自近似線性的徑向相位梯度與錐形波的自干涉。第二，標準 axicon 通常形成有限長度的軸向焦區，而不是自動生成任意數量的離散多焦層。多焦點、空心光束、離軸光束與三維強度圖樣，需要複合 axicon、相位疊加、振幅調制、空間光調變器或逆向設計。第三，有限口徑所生成的是近似無繞射的 Bessel 類或 Bessel–Gauss 光束，不是具有無限能量與無限傳播距離的理想 Bessel 模式。

CPOP 的核心貢獻，是把「錐形透鏡」由單一被動元件提升為五層系統：光源與波前準備層、錐形相位生成層、複合光場重構層、感測與數位校準層、應用與安全控制層。平台支援延伸焦線、環形與空心光束、可調 Bessel 區、軸向多焦點、離軸與多通道光束、延伸景深成像，以及非線性材料中的門檻式體積曝光。

本文重新界定其與 AOCLS 的關係：axicon 並不能單獨把任意三維 CAD 模型一次投影為材料結構；它可以作為 AOCLS 的結構光基元，用於延伸焦域、高深寬比加工、軸向曝光、並行多焦點、光片照明與製程容差提升。真正的三維製造仍需結合材料非線性、掃描或投影策略、空間光調制、劑量模型、像差校正、閉環量測與虛擬光刻引擎。

本文建立以中央光斑、Bessel 區長度、旁瓣能量、總傳輸效率、軸向均勻度、像差敏感度、域外穩健性與材料串擾為核心的評估方法，並提出 V0–V5 驗證路線與五項可證偽命題。最小可行原型可由可見光雷射、商用 axicon、相機與線性位移台構成；後續再引入數位 axicon、波前感測、飛秒雷射與雙光子材料。本文的目標不是以「革命」替代實驗，而是建立一套能被模擬、製造、校準、比較與否證的錐形相位光學工程框架。

**關鍵詞**：axicon、錐形透鏡、Bessel–Gauss 光束、延伸焦域、結構光、數位 axicon、空間光調變器、雙光子聚合、AOCLS、計算光學

---

## 一、研究定位：不是發明 axicon，而是建立可程式化平台

### 1.1 軸錐光學是既有技術家族

「Axicon」不是單指一片玻璃圓錐，而是一類把光線或波前映射到光軸、錐面、環帶或其他軸向分布的光學元件。最典型的折射式 axicon 是具有圓錐面的透明元件；其他實現還包括：

- 折射式玻璃或晶體 axicon；
- 反射式 axicon；
- 繞射光學元件與電腦生成全像；
- 液晶空間光調變器上的數位 axicon；
- 數位微鏡元件所形成的振幅式 axicon；
- 液態、電潤濕或折射率可調 axicon；
- 微型 3D 列印 axicon；
- 次波長 metasurface 所形成的 meta-axicon；
- 多段、雙錐、對數、螺旋與自由曲面 axicon。

因此，本研究的可主張部分不是「人類首次想到錐形透鏡」，而是提出一個面向 AOCLS、精密加工、計算成像與閉環製程的**平台化架構**：把不同 axicon 形式視為可互換的相位生成器，並以共同的模型、介面、感測與驗證制度加以整合。

### 1.2 理想 axicon 並不打破旋轉對稱

前版將錐形透鏡描述為「非對稱曲面」。這不適用於最典型的圓錐 axicon。令光軸為 $z$，徑向座標為 $r$，理想圓錐面可寫為：

$$
z(r)=r\tan\alpha,
$$

其中 $\alpha$ 為基角。此表面繞 $z$ 軸旋轉後不變，因此具有軸對稱性。它與球面透鏡的差異，不在於「有沒有對稱」，而在於相位函數的徑向形式不同：

- 薄球面透鏡近似施加二次相位；
- 理想 axicon 近似施加線性徑向相位。

若真空波長為 $\lambda_0$，介質中的波數為：

$$
k_m=\frac{2\pi n_m}{\lambda_0},
$$

則理想化的 axicon 相位可寫成：

$$
\Phi_{\mathrm{ax}}(r)=k_m\,r\sin\theta_c,
$$

其中 $\theta_c$ 是錐形波相對光軸的傳播角。這個徑向相位使不同方位角的平面波分量在軸附近自干涉，形成延伸焦域與近似 Bessel 的橫向分布。

真正的非對稱錐形光學仍然存在，例如離軸 axicon、橢圓 axicon、自由曲面 axicon 或故意加入角向項的螺旋 axicon，但那是更一般的設計家族，不能用來描述所有錐形透鏡。

### 1.3 從「焦點」改寫為「焦域」

普通聚焦透鏡通常被設計為在某一像方平面形成集中點擴散函數。Axicon 則把入射光重新分配到一段軸向區域。對有限半徑 $R$ 的入射光束，幾何近似下的有效 Bessel 區長度可寫為：

$$
L_B\approx\frac{R}{\tan\theta_c}.
$$

這不是無限長焦線。其起點、終點、軸向強度與橫向光斑會受到以下因素影響：

1. 入射光束直徑與振幅分布；
2. axicon 的錐角與材料折射率；
3. 頂點圓鈍、表面粗糙度與製造誤差；
4. 光源頻寬、偏振與空間相干性；
5. 後續物鏡、孔徑與中繼成像倍率；
6. 樣品折射率、像差與散射；
7. 非線性材料的曝光門檻。

因此，本文以「延伸焦域」或「Bessel 區」取代「無限焦點」與「自然多焦層」等表述。

---

## 二、物理基礎：從錐形波到有限 Bessel–Gauss 光束

### 2.1 錐形偏折角

對折射式 axicon，精確光路應由 Snell 定律求解。當錐角較小、介質近似均勻且在空氣中使用時，可用一階近似：

$$
\theta_c\approx(n_a-1)\alpha,
$$

其中 $n_a$ 為 axicon 材料折射率。若外部介質折射率為 $n_m$，則可改寫為：

$$
\theta_c\approx\left(\frac{n_a}{n_m}-1\right)\alpha.
$$

此式只用於初步設計。高數值孔徑、大錐角、寬頻光源或尖端附近的場分布，必須使用向量繞射或完整電磁模型。

### 2.2 理想 Bessel 模式與實際 Bessel–Gauss 光束

理想零階 Bessel 模式可寫為：

$$
E(r,z)=E_0J_0(k_r r)e^{ik_z z},
$$

其中：

$$
k_r=k_m\sin\theta_c,
\qquad
k_z=k_m\cos\theta_c,
\qquad
k_r^2+k_z^2=k_m^2.
$$

$J_0$ 是第一類零階 Bessel 函數。中央主瓣第一個零點半徑近似為：

$$
r_0\approx\frac{2.405}{k_r}.
$$

增大 $\theta_c$ 可以縮小中央主瓣，但也會改變有效傳播長度、旁瓣分布、光學效率與像差敏感度。理想 Bessel 模式在橫向上延伸到無限遠，總能量發散，因此不能被物理光源完整產生。有限高斯光束經 axicon 後，實際形成的是 Bessel–Gauss 類光束：

$$
E_{BG}(r,z)
\approx
A(r,z)
J_0\bigl(k_r(z)r\bigr)
\exp\bigl(i\varphi(r,z)\bigr),
$$

其中包絡 $A(r,z)$、有效徑向波數 $k_r(z)$ 與相位 $\varphi$ 均受到孔徑、傳播與元件誤差影響。

因此，「無繞射」在工程上應理解為：

> 在有限距離與給定容差內，中央光斑寬度與軸向強度變化小於比較基線。

### 2.3 自修復不是能量憑空重生

Bessel 類光束在中央主瓣遭局部遮擋後，外圍錐形波仍可能在下游重新干涉，恢復近似中央結構。這通常稱為自修復。然而，自修復不表示：

- 被遮擋的光能回到系統；
- 光束對任意障礙皆免疫；
- 散射、吸收與相位擾動不會降低品質；
- 下游恢復後的振幅、相位與雜訊完全等同原始光束。

工程上應量測恢復距離、主瓣對比、總能量損失與相位誤差，而不是只以視覺上「重新出現亮點」判定成功。

### 2.4 旁瓣是核心代價，不是可忽略裝飾

Axicon 把相當比例的能量分配到同心環。這些旁瓣是延伸焦域與自修復能力的重要來源，同時也是成像背景、非目標曝光、熱影響區與光毒性的來源。

定義主瓣區域為 $\Omega_c$，總量測平面為 $\Omega$，主瓣能量比例可寫為：

$$
\eta_c
=
\frac{\int_{\Omega_c}I(\mathbf{x})\,dA}
{\int_{\Omega}I(\mathbf{x})\,dA}.
$$

旁瓣能量比例為：

$$
\eta_s=1-\eta_c.
$$

對 AOCLS 與雙光子材料，還必須評估材料的非線性門檻。若反應階數為 $p$，有效曝光劑量可寫為：

$$
D(\mathbf{x})
=
\int I(\mathbf{x},t)^p\,dt.
$$

只有當：

$$
D(\mathbf{x})\ge D_{\mathrm{th}}
$$

時，材料才進入聚合、燒蝕、改質或其他反應區。旁瓣強度即使低於主瓣，也可能因曝光時間、脈衝累積或材料敏感性而造成串擾。

---

## 三、CPOP 五層系統架構

### 3.1 第一層：光源與波前準備

此層負責使入射場成為可量測、可重現的初始條件。模組包含：

- 連續波、奈秒、皮秒或飛秒光源；
- 光束擴束與空間濾波；
- 偏振控制；
- 光束直徑與截斷比控制；
- 脈衝展寬、壓縮與色散管理；
- 光功率、脈衝能量與時間同步量測。

入射場可寫為：

$$
E_{\mathrm{in}}(r,\phi,t,\lambda,\mathbf{p}),
$$

其中 $\mathbf{p}$ 表示偏振。若初始場未被正確表徵，後續 axicon 的性能比較將失去意義。

### 3.2 第二層：錐形相位生成

平台至少支援四種實作模式。

#### A. 靜態折射式 axicon

優點是高功率承受能力、低控制延遲與結構簡單；缺點是功能固定、尖端誤差敏感、色散不可忽略。

#### B. 繞射式或數位 axicon

相位遮罩可寫為：

$$
\Phi(r)=\operatorname{mod}(k_r r,2\pi).
$$

使用 SLM 時，可即時改變 $k_r$、加入角向項、疊加多個光束或進行像差預補償。DMD 則可用二值或灰階振幅圖樣產生近似 axicon，但需處理零級光、繞射效率與像素化誤差。

#### C. 可調液態與液晶 axicon

透過折射率、液面形狀或電控相位改變輸出光場。其優點是連續可調與緊湊；限制包括響應速度、溫度漂移、口徑、偏振依賴與功率承受能力。

#### D. 微型與 meta-axicon

可直接整合到光纖端面、感測器、光子晶片或微型探頭。其優點是尺寸與整合度；限制包括頻寬、入射角容忍度、製造誤差、效率與封裝。

### 3.3 第三層：複合光場重構

單一 axicon 主要提供徑向線性相位。更複雜的三維光場需與其他模組組合：

- axicon＋球面或非球面透鏡；
- 雙 axicon 或反向 axicon；
- axicon＋SLM／DMD；
- axicon＋振幅環形孔徑；
- axicon＋渦旋相位；
- axicon＋4f 中繼成像；
- axicon＋高 NA 物鏡；
- axicon＋波前編碼與數位反卷積。

若需生成 $M$ 組軸向或離軸結構光，可將目標場寫為：

$$
E_{\mathrm{tar}}(\mathbf{x})
=
\sum_{m=1}^{M}
a_mE_m(\mathbf{x};\boldsymbol{\theta}_m)e^{i\psi_m}.
$$

實際相位遮罩則透過 Gerchberg–Saxton、梯度式逆向設計、伴隨法或其他全像演算法求得。這些多焦點並非標準圓錐表面的自然結果，而是**相位與振幅多自由度設計**的結果。

### 3.4 第四層：感測、數位雙生與閉環校準

CPOP 不以製造名義值作為真實光場。每一個元件都需由量測形成個體模型：

$$
\widehat{\mathcal{H}}_j
=
\operatorname{Calibrate}
\left(
\mathcal{H}_j^{\mathrm{nominal}},
\mathcal{D}_j^{\mathrm{measured}}
\right).
$$

建議量測包含：

- 軸向相機掃描；
- 波前感測或相位回復；
- 功率與脈衝能量；
- 頂點形貌與表面粗糙度；
- 光譜與色散；
- 輸入偏振與輸出偏振；
- 樣品前後的像差；
- 實際材料曝光輪廓。

閉環控制器根據目標場 $I_\star$ 與量測場 $I_{\mathrm{meas}}$ 更新相位控制量：

$$
\mathbf{u}_{t+1}
=
\mathbf{u}_t
-
\gamma
\nabla_{\mathbf{u}}
\mathcal{L}
\bigl(
I_{\mathrm{meas}},I_\star
\bigr).
$$

### 3.5 第五層：應用控制與硬體安全

高功率與超快雷射不能只由 AI 軟體控制。平台應包含獨立安全鏈：

- 光路封閉與門禁互鎖；
- 過功率、過溫與失去冷卻保護；
- 快門與硬體急停；
- 樣品位置確認；
- 反射光與回返光隔離；
- 雷射等級標示與人員防護；
- 控制程式失效時的預設關光狀態。

AI、優化器或應用程式只能在安全包絡內請求光場，不能直接取消硬體限制。

---

## 四、平台操作模式

### 4.1 延伸焦域模式

目標是在給定軸向區間 $[z_1,z_2]$ 內維持中央主瓣寬度與強度。可定義：

$$
\mathcal{L}_{\mathrm{axial}}
=
\frac{1}{z_2-z_1}
\int_{z_1}^{z_2}
\left|
\frac{I(0,z)}{\overline{I}_0}-1
\right|^2dz.
$$

此模式適合高深寬比加工、容差較大的聚焦、部分顯微與 OCT 探頭，但必須同時限制旁瓣與總光劑量。

### 4.2 環形與空心光束模式

Axicon 與透鏡組可把高斯光轉換為環形分布，用於：

- 環形照明；
- 空心鑽孔或環狀改質；
- 粒子、液滴與冷原子操控；
- 渦旋光與軌道角動量光束的前置整形；
- 中央暗區成像或檢測。

此模式的關鍵指標不是「形狀看起來像圓」，而是環半徑、環寬、方位均勻度、偏心、相位奇點與功率效率。

### 4.3 軸向多焦點模式

離散軸向多焦點需使用：

- 雙梯度或分段 axicon；
- 多徑向空間頻率疊加；
- SLM／DMD 全像；
- 振幅與相位共同調制；
- 時分掃描後的材料累積。

目標軸向強度可寫為：

$$
I_{\star}(0,z)
=
\sum_{m=1}^{M}
A_m
\exp\left[
-\frac{(z-z_m)^2}{2\sigma_m^2}
\right].
$$

設計器需同時最小化非目標區曝光與多焦點間的相干串擾。

### 4.4 多通道與離軸模式

將角向相位、光柵或多個 axicon 項加入相位函數，可產生多條 Bessel 類光束：

$$
\Phi(r,\phi)
=
\arg\left[
\sum_{m=1}^{M}
a_m
\exp\left(
ik_{r,m}r
+i\ell_m\phi
+i\mathbf{q}_m\cdot\mathbf{x}
+i\psi_m
\right)
\right].
$$

這可用於並行加工、多點照明與光學多工，但通道數增加會稀釋每通道功率並提高零級光、散斑與串擾。

### 4.5 延伸景深成像模式

Axicon 可置於照明端、檢測端或瞳面，使點擴散函數沿軸向延伸。這可以減少機械 $z$ 掃描或提高傾斜表面的成像容忍度，但通常伴隨：

- 橫向解析度與景深的權衡；
- 旁瓣背景；
- 色差；
- 空間變異 PSF；
- 對數位反卷積的依賴；
- 對雜訊與模型失配的敏感度。

因此，「全深度都清晰」不是免費能力，而是光學編碼與計算重建的共同結果。

---

## 五、與 AOCLS 的關係：結構光基元，而非任意物質投影器

### 5.1 Axicon 可以提供什麼

在 AOCLS 中，CPOP 可擔任以下角色：

1. 形成延伸焦線，降低樣品高度誤差對聚焦的敏感度；
2. 形成高深寬比能量沉積區，用於孔道、切割與內部改質；
3. 產生軸向或橫向多焦點，提高特定圖樣的並行度；
4. 形成光片或筆狀光束，用於觀察與製程量測；
5. 產生環形、空心、渦旋或其他結構光基元；
6. 作為可校準的相位先驗，減少逆向設計自由度；
7. 與 SLM、DMD、meta-optics 共同形成可重構光場。

### 5.2 Axicon 不能單獨提供什麼

單一 axicon 不能直接保證：

- 任意三維 CAD 結構一次曝光完成；
- 多個深度完全獨立、互不串擾；
- 任意材料都具有適合的非線性門檻；
- 旁瓣不造成背景聚合、燒蝕或熱累積；
- 光穿過厚材料後仍保持原設計波前；
- 原子級、奈米級或某固定解析度；
- 整個體積的曝光時間與體素數無關；
- 與半導體量產製程天然相容。

因此，AOCLS 製程鏈應寫成：

$$
\text{目標結構}
\rightarrow
\text{材料與劑量模型}
\rightarrow
\text{光場逆向設計}
\rightarrow
\text{CPOP 生成結構光}
\rightarrow
\text{曝光／掃描／投影}
\rightarrow
\text{顯影與後處理}
\rightarrow
\text{三維量測}
\rightarrow
\text{模型更新}.
$$

### 5.3 門檻式體積曝光

對 $p$ 光子反應材料，可用：

$$
R(\mathbf{x},t)
=
\kappa_p
I(\mathbf{x},t)^p
C(\mathbf{x},t)
$$

描述局部反應速率，其中 $C$ 是可反應物或光引發劑濃度。最終材料狀態還受到擴散、氧抑制、熱、聚合收縮與掃描歷史影響：

$$
\frac{\partial C}{\partial t}
=
D_c\nabla^2C
-R
+S_C.
$$

因此，同一個光場在不同材料中可能形成完全不同的實際結構。AOCLS 虛擬光刻引擎必須模擬「光場＋材料動力學」，不能只看真空中的強度分布。

### 5.4 串擾與旁瓣損失

令目標反應區為 $\Omega_\star$，非目標區為 $\Omega_{\mathrm{off}}$。可定義：

$$
\mathcal{L}_{\mathrm{target}}
=
\int_{\Omega_\star}
\left|
D(\mathbf{x})-D_\star(\mathbf{x})
\right|^2dV,
$$

$$
\mathcal{L}_{\mathrm{xtalk}}
=
\int_{\Omega_{\mathrm{off}}}
\operatorname{softplus}
\left[
D(\mathbf{x})-D_{\mathrm{th}}
\right]dV.
$$

總設計目標可寫為：

$$
\boldsymbol{\theta}^{\star}
=
\arg\min_{\boldsymbol{\theta}}
\left(
w_1\mathcal{L}_{\mathrm{target}}
+w_2\mathcal{L}_{\mathrm{xtalk}}
+w_3\mathcal{L}_{\mathrm{eff}}
+w_4\mathcal{L}_{\mathrm{robust}}
\right).
$$

這使「好看的 Bessel 光斑」與「可製造的劑量場」成為兩個不同驗證層級。

---

## 六、可落地應用與邊界

### 6.1 雷射加工與高深寬比結構

Bessel 類光束已被用於透明材料、金屬與矽中的鑽孔、切割、內部改質與通孔研究。其主要價值是延伸焦域與沿深度方向輸送能量，而不是普遍提高所有材料去除效率。

應用評估至少需比較：

- 孔深與孔徑；
- 錐度；
- 側壁粗糙度；
- 裂紋與熱影響區；
- 單位去除體積能耗；
- 加工速度；
- 重複性；
- 與高斯光束的公平基線。

在某些深孔加工條件下，Bessel 光束可能因自重構與較長能量沉積區而改善效率；在淺層加工中，其優勢可能縮小或消失。

### 6.2 雙光子聚合與多焦點曝光

Axicon、Bessel 光束與疊加多焦點已被用於雙光子聚合研究。可行方向包括：

- 一次曝光形成長條或柱狀體素；
- 多個軸向或橫向焦點並行曝光；
- 以高階 Bessel 光束形成環形或管狀結構；
- 配合 SLM 動態改變體素長度與方向；
- 透過像差預補償提高深層製造品質。

但「長體素」並不等於「任意三維結構一次完成」。體素越長，軸向選擇性越低；多焦點越多，單點能量與均勻性越難控制。這是一個並行度、解析度、材料門檻與光功率之間的多目標權衡。

### 6.3 顯微與光片照明

Axicon 或 lens–axicon 組可以產生較長的 Bessel 光束，用於光片顯微、雙光子顯微、拉曼顯微與光聲顯微。其優勢是較長的照明或檢測深度；主要限制則是旁瓣引起的背景、光毒性與反卷積負擔。

適合的比較指標包括：

- 有效景深；
- 橫向與軸向解析度；
- 信噪比；
- 旁瓣背景；
- 光漂白與光毒性；
- 單位體積掃描時間；
- 重建演算法開銷。

### 6.4 OCT、內視鏡與微型探頭

微型 axicon、自由曲面微透鏡與光纖端面元件可形成針狀光束，延伸 OCT 或內視鏡探頭的景深。此方向適合 CPOP 的微型化版本，但需要處理：

- 探頭直徑與工作距離；
- 像散與場曲；
- 組織散射；
- 色散與寬頻相干光；
- 旋轉掃描與封裝；
- 生物相容性與消毒。

### 6.5 光學操控與通訊

環形、空心與 Bessel 類光束可用於粒子操控、原子陷阱、對準容忍度較高的自由空間光學與阻擋情境下的結構光通訊。這些能力仍然依賴具體尺度、散射環境、接收孔徑與安全限制，不能由「自修復」直接外推成無遮擋損失或無限距離通訊。

### 6.6 不應作為主張中心的應用

下列方向可以保留為遠期探索，但不宜在本篇作為主要工程承諾：

- 單靠 axicon 解決 VR／AR 輻輳調節衝突；
- 以錐形透鏡直接製造完整先進邏輯晶片；
- 讓感測器自動獲得完整深度資訊而無需編碼與重建；
- 在太陽能系統中無追蹤且對所有入射角保持高聚光效率；
- 使光學預處理「幾乎不耗能」；
- 以一片微型 axicon 取代完整神經網路或處理器。

這些命題需要獨立系統論文、基線比較與應用級驗證，不能由 axicon 的焦線性質直接推出。

---

## 七、數位模擬與逆向設計流程

### 7.1 模型層級

CPOP 採用分層模型，避免所有問題一律使用最昂貴的全波模擬。

**M0：幾何光學**  
用於初步估算錐角、焦區與元件尺寸。

**M1：標量 Fresnel／角譜傳播**  
用於中低 NA、相位遮罩與大尺度傳播。

**M2：Debye–Wolf 向量繞射**  
用於高 NA、偏振與緊聚焦。

**M3：FDTD／FEM／RCWA**  
用於微型 axicon、metasurface、尖端近場與材料色散。

**M4：光—熱—材料反應耦合**  
用於加工、聚合、燒蝕與實際製程預測。

### 7.2 設計參數

設計向量可寫為：

$$
\boldsymbol{\theta}
=
\bigl(
\alpha,n,R,\lambda,
\mathbf{p},
\Phi_{\mathrm{SLM}},
A_{\mathrm{pupil}},
NA,M,
\mathbf{a}_{\mathrm{ab}},
\mathbf{m}_{\mathrm{mat}}
\bigr),
$$

其中：

- $\alpha$：錐角；
- $n$：折射率與色散；
- $R$：有效口徑；
- $\Phi_{\mathrm{SLM}}$：可程式化相位；
- $A_{\mathrm{pupil}}$：瞳面振幅；
- $M$：中繼倍率；
- $\mathbf{a}_{\mathrm{ab}}$：像差係數；
- $\mathbf{m}_{\mathrm{mat}}$：材料反應參數。

### 7.3 多目標損失

建議的總損失為：

$$
\mathcal{L}_{\mathrm{CPOP}}
=
w_a\mathcal{L}_{\mathrm{axial}}
+w_r\mathcal{L}_{\mathrm{radial}}
+w_s\mathcal{L}_{\mathrm{sidelobe}}
+w_e\mathcal{L}_{\mathrm{efficiency}}
+w_c\mathcal{L}_{\mathrm{chromatic}}
+w_u\mathcal{L}_{\mathrm{uncertainty}}
+w_m\mathcal{L}_{\mathrm{material}}.
$$

性能不能只以中央光斑最小化。某些應用更重視焦區長度，有些更重視旁瓣抑制、效率、色差或加工輪廓。

### 7.4 不確定性與製造容差

令製造與環境誤差為 $\boldsymbol{\delta}$，穩健設計可寫為：

$$
\boldsymbol{\theta}^{\star}
=
\arg\min_{\boldsymbol{\theta}}
\mathbb{E}_{\boldsymbol{\delta}}
\left[
\mathcal{L}
(\boldsymbol{\theta},\boldsymbol{\delta})
\right]
+
\beta
\operatorname{CVaR}_{q}
\left[
\mathcal{L}
(\boldsymbol{\theta},\boldsymbol{\delta})
\right].
$$

誤差來源至少包括：

- 頂點圓鈍半徑；
- 錐角誤差；
- 偏心與傾斜；
- SLM 相位非線性；
- 入射光束尺寸漂移；
- 波長與溫度漂移；
- 樣品折射率不均；
- 材料門檻與吸收係數變異。

---

## 八、證據分級與驗證流程

### 8.1 E0–E5 證據分級

- **E0：概念架構**——方程、模組、風險與可證偽命題完整；
- **E1：純數值模擬**——提供程式、參數、網格與收斂測試；
- **E2：光學台架**——量測三維光場並與模擬比較；
- **E3：材料作用**——完成聚合、改質、鑽孔或成像實驗；
- **E4：跨樣本與跨批次重現**——提供統計、失敗案例與域外條件；
- **E5：應用級驗證**——在實際製程、儀器或設備中達到比較基線與可靠度要求。

本篇的 axicon 物理基礎可由既有研究支撐至 E3–E5 的不同應用；**EveMissLab 的 CPOP 整合平台目前為 E0**。

### 8.2 V0：文獻與數學重現

重現：

- 線性徑向相位；
- Bessel–Gauss 光束；
- Bessel 區長度；
- 主瓣與旁瓣分布；
- 有限口徑與頂點圓鈍的影響。

### 8.3 V1：最低成本可見光原型

建議配置：

- $532\ \mathrm{nm}$ 低功率雷射；
- 擴束器與空間濾波；
- 商用折射式 axicon；
- 功率計；
- 相機與線性位移台；
- 光束剖面分析程式。

量測：

$$
I(x,y,z),
\quad
r_0(z),
\quad
I(0,z),
\quad
\eta_c(z),
\quad
\eta_s(z).
$$

基線為相同輸入口徑與功率下的普通聚焦透鏡。

### 8.4 V2：數位 axicon 與閉環校準

加入 SLM 或 DMD，測試：

- 可調 $k_r$；
- 軸向焦區長度；
- 多焦點；
- 像差預補償；
- 不同波長與偏振；
- 對準誤差與溫度漂移。

### 8.5 V3：非線性材料曝光

使用雙光子樹脂或透明材料，驗證：

- 長體素與高斯體素比較；
- 軸向尺寸與橫向尺寸；
- 旁瓣聚合；
- 單位結構能耗；
- 製造速度；
- 深層像差；
- 多焦點均勻性。

### 8.6 V4：AOCLS 閉環

把實際材料截面、顯影後幾何與模擬結果回饋到虛擬光刻引擎，建立：

$$
\text{光場誤差}
+
\text{材料模型誤差}
+
\text{製程誤差}
\rightarrow
\text{校正更新}.
$$

### 8.7 V5：應用級比較

依應用選擇：

- 高深寬比通孔；
- 微流道；
- 光片顯微；
- OCT 微型探頭；
- 多焦點雙光子聚合。

必須與現有最佳可用基線進行公平比較，不能只展示單次成功樣品。

---

## 九、五項可證偽命題

### 命題一：焦區可預測性

在已校準的靜態 axicon 系統中，標量或向量模型對 $I(0,z)$ 與主瓣半徑的預測誤差，應能在預先設定容差內重現。若模型在對準與元件量測完整後仍系統性失效，則平台的低階模型不足。

### 命題二：數位可調性

數位 axicon 改變 $k_r$ 時，中央主瓣與 Bessel 區長度應依設計趨勢變化。若控制量與輸出無穩定單調關係，則不能宣稱可程式化焦域。

### 命題三：旁瓣可管理而非可消失

經過振幅整形、複合相位或演算法優化後，應能在固定主瓣尺寸與總功率條件下，降低特定應用中的旁瓣損失；若只能以犧牲主瓣能量或大幅縮短焦區達成，必須明示權衡。

### 命題四：材料速度增益是條件式的

在選定的雙光子或雷射加工任務中，CPOP 相對高斯基線的速度、深寬比或容差增益必須依材料與幾何而定。若沒有跨樣品統計，不得外推為所有三維製造皆更快。

### 命題五：AOCLS 需要閉環

若僅以真空光場設計、未使用材料與製程回饋，最終結構誤差應顯著高於閉環版本。若閉環無法持續改善結果，則目前的感測、材料模型或優化策略不足。

---

## 十、實作與產品化路線

### 10.1 階段 A：CPOP-Lab

建立桌上型光學驗證平台，完成靜態 axicon、數位 axicon、三維場量測與開源模擬工具。

### 10.2 階段 B：CPOP-Process

加入飛秒光源、材料平台、劑量模型、樣品定位、截面量測與製程資料庫，對接 AOCLS 虛擬光刻引擎。

### 10.3 階段 C：CPOP-Micro

發展光纖端面、兩光子列印與 metasurface 微型 axicon，用於微型探頭、晶片級照明與小型加工頭。

### 10.4 階段 D：CPOP-Array

建立多通道 axicon 陣列與功率均衡控制，驗證並行曝光、熱串擾、通道校準與故障隔離。

### 10.5 階段 E：AOCLS 光場核心

在 AOCLS 中，CPOP 只負責被驗證的光場生成與量測，不承擔尚未驗證的材料、辨識與整機能力。系統輸出應包含：

- 光場設定檔；
- 元件與校準版本；
- 模擬模型；
- 不確定性範圍；
- 功率與安全包絡；
- 實際量測場；
- 材料曝光證書；
- 失敗與回退紀錄。

---

## 十一、結論

錐形相位光學的價值，不在於否定傳統透鏡，也不在於把既有 axicon 重新包裝成全新發明。其真正價值是提供一種與點聚焦互補的光場基元：以徑向相位形成錐形波，將光能重新分配到有限軸向區域、環形分布或 Bessel–Gauss 類結構中。

本文將前版的「突破對稱性」改寫為更準確的命題：

> 錐形相位光學透過改變波前的徑向函數，將光學設計從單一點焦擴展到可設計的軸向焦域與結構光場。

這項能力已在顯微、材料加工、雙光子聚合、微型探頭與光束整形等研究中獲得不同程度的驗證；但它不等於任意三維製造、不取消衍射、不免除旁瓣、不保證材料響應，也不能單靠一片透鏡完成 AOCLS 的全部願景。

CPOP 的工程路線因此不是追求一片「萬能錐形透鏡」，而是建立：

$$
\text{可表徵光源}
+
\text{錐形相位生成}
+
\text{複合波前設計}
+
\text{三維量測}
+
\text{材料模型}
+
\text{閉環校準}
+
\text{安全控制}.
$$

當這些條件被逐項完成後，錐形光學才可能從一個成熟但專用的光學元件家族，轉化為 AOCLS 可依賴、可重現、可審計的光場生成基礎。

---

## 參考文獻

[1] J. H. McLeod, “The Axicon: A New Type of Optical Element,” *Journal of the Optical Society of America*, 44, 592–597, 1954. DOI: 10.1364/JOSA.44.000592.  
[2] J. Durnin, J. J. Miceli Jr., and J. H. Eberly, “Diffraction-Free Beams,” *Physical Review Letters*, 58, 1499–1501, 1987. DOI: 10.1103/PhysRevLett.58.1499.  
[3] Y. Wang et al., “Electromagnetic Diffraction Theory of Refractive Axicon Lenses,” *Journal of the Optical Society of America A*, 34, 1201–1211, 2017. DOI: 10.1364/JOSAA.34.001201.  
[4] G. Milne et al., “Tunable Generation of Bessel Beams with a Fluidic Axicon,” *Applied Physics Letters*, 92, 261101, 2008.  
[5] W. Chu et al., “Generation of Nondiffracting Bessel Beam Using Digital Micromirror Device,” *Applied Optics*, 52, 4566–4570, 2013.  
[6] B. P. S. Ahluwalia et al., “Design and Fabrication of a Double-Axicon for Generation of Tailorable Self-Imaged Three-Dimensional Intensity Voids,” *Optics Letters*, 31, 987–989, 2006. DOI: 10.1364/OL.31.000987.  
[7] S. Takanezawa et al., “Wide Field Light-Sheet Microscopy with Lens-Axicon Triplet for Generating Long Bessel Beams,” *Nature Communications*, 12, 2979, 2021.  
[8] F. He et al., “Tailoring Femtosecond 1.5-μm Bessel Beams for Manufacturing High-Aspect-Ratio Through-Silicon Vias,” *Scientific Reports*, 7, 40785, 2017.  
[9] L. Yang et al., “Two-Photon Polymerization of Microstructures by a Non-Diffraction Multifoci Pattern Generated from a Superposed Bessel Beam,” *Optics Letters*, 42, 743–746, 2017. DOI: 10.1364/OL.42.000743.  
[10] C. Taneja et al., “Sidelobe-Suppressed Bessel Beams for One-Photon Light-Sheet Microscopy,” *Biomedical Optics Express*, 15, 6183–6199, 2024.  
[11] S. Li et al., “Unidirectional Guided-Wave-Driven Metasurfaces for Arbitrary Wavefront Control,” *Nature Communications*, 15, 2024.  
[12] P. Ruchka et al., “3D-Printed Axicon Enables Extended-Depth-of-Focus Intravascular Optical Coherence Tomography,” preprint, 2024.  
[13] H. D. Nguyen et al., “Super-Efficient Drilling of Metals with Ultrafast Non-Diffractive Laser Beams,” *Scientific Reports*, 12, 2022.  
[14] J. Pereiro-García et al., “Flat Variable Liquid-Crystal Diffractive Spiral Axicon Enabling Tunable High-Order Bessel Beams,” *Scientific Reports*, 13, 2023.
