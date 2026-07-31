# 具身即佔域，對齊即能力
## 分布式身體的時序容量、協調稅與規模邊界

**Embodiment as Domain Occupation, Alignment as Capability: Temporal Capacity, Coordination Tax, and Scaling Boundaries of Distributed Bodies**

**系列：**《時空域支配智能》系列第 6 篇  
**文件編號：** EML-STDI-EAC-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 形式模型論文／分布式具身容量與排程理論  
**證據成熟度：** E0——形式模型、容量會計與實驗規格  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate、來源、安全與數學審查  
**上位理論：** STDI｜時空域支配智能  
**直接前序：**
1. 《時空間支配型 AI：從單體具身智能到持續性時空域治理》
2. 《超靈的物理化：從 O-Chip 維度代理人到分布式具身主體》
3. 《Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路》
4. 《持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域》
5. 《語義即物理路由：從資料流治理到物料、能源、站點與行動流治理》

---

## 摘要

分布式具身系統最容易產生的錯覺，是把站點數量、機器人數量、儀器數量或標稱吞吐量直接相加，並將其宣稱為系統能力。若一個實驗室新增十台機器人、二十個感測器和五個量測站，表面上似乎獲得數十倍具身能力；但這些節點可能共享同一條通道、同一個交接區、同一套工具、同一個電力峰值、同一名人工批准者、同一個樣本批次，或必須在狹窄時間窗中共同到位。其真實能力不由「有多少節點」決定，而由「多少節點、物料、工具、能源、權限、世界狀態和證據能在需要時被正確對齊」決定。

本文提出：

> **具身即佔域，對齊即能力。**

「具身即佔域」表示，具身能力不只存在於機器人的本體，而表現為系統在有限物理時空域中可觀測、可到達、可操作和可維持的作用範圍。「對齊即能力」則表示，只有在任務所需的時間、位置、狀態、能力、權限、安全與證據條件共同成立時，裝設的具身資源才轉化為有效能力。

本文承接 ODML「對齊即容量」的核心修正：聚合運輸量、單一存取頭可交付量和可對齊容量不能混為同一數字；容量基準中已計入的自由度也不能再次相乘。本文將同一會計紀律遷移到分布式具身系統，區分四種容量：

$$
C_{\mathrm{installed}}
\geq
C_{\mathrm{available}}
\geq
C_{\mathrm{aligned}}
\geq
C_{\mathrm{effective}}.
$$

- $C_{\mathrm{installed}}$：裝設容量，所有站點的標稱能力；
- $C_{\mathrm{available}}$：扣除故障、維護、校準失效和不可達後的可用容量；
- $C_{\mathrm{aligned}}$：在特定任務與時間窗下，能共同滿足能力、物料、空間、能源、權限和一致性條件的容量；
- $C_{\mathrm{effective}}$：再扣除協調、交接、等待、爭用、恢復、安全和證據成本後，真正形成完成且可信結果的能力。

本文將這些成本定義為 **協調稅（Coordination Tax）**：

$$
\tau_{\mathrm{coord}}
=
\tau_{\mathrm{communication}}
+
\tau_{\mathrm{synchronization}}
+
\tau_{\mathrm{handoff}}
+
\tau_{\mathrm{contention}}
+
\tau_{\mathrm{reconciliation}}
+
\tau_{\mathrm{safety}}
+
\tau_{\mathrm{evidence}}
+
\tau_{\mathrm{recovery}}.
$$

協調稅不是純粹浪費。部分協調成本換取安全、可恢復性、可重現性與正確性；真正應最小化的是沒有產生相應可靠度價值的無效協調。

本文進一步提出：

1. **佔域覆蓋率**：系統實際可觀測與可作用的時空區域；
2. **能力聯集會計**：重複能力不能直接相加；
3. **共享瓶頸折扣**：共用通道、工具、能源和人工批准者會限制總能力；
4. **語義同步等級**：只有語義上需要相遇的任務才進入強對齊窗口；
5. **Amdahl 型具身加速界限**：不可平行的物理和治理比例封頂多站點加速；
6. **失效域與爆炸半徑**：中央化能降低協調成本，也可能放大共同失效；
7. **弱耦合、強耦合與聯盟任務**：不同任務具有不同對齊稅；
8. **有效驗證容量**：物理動作完成但證據不完整，不計入研究能力。

現有多機器人研究已證明，異質能力、時間窗、能源、聯盟任務與跨機器人依賴會使任務分配和排程成為複雜的組合問題；近期研究使用階層分解、MILP、時間邏輯、局部控制和線上同步，提高大規模團隊的可行性。Open-RMF 也已在實際建築中處理異質機器人、共享交通空間、電梯與門等基礎設施的衝突。這些工作支持本文的工程前提：多機器人價值來自協作，但協作本身會消耗通訊、同步和共享資源。

本文的核心結論是：

> 分布式具身系統的容量不是身體數量，而是被正確對齊、完成交付且能形成可信證據的物理作用量。

**關鍵詞：** 具身即佔域、對齊即能力、分布式身體、具身容量、協調稅、可對齊容量、能力重複計數、時序窗口、異質多機器人、聯盟任務、失效域、Amdahl 定律、有效驗證容量、語義同步、規模邊界

---

# 0. 版本定位：第六篇補的是「多站點到底增加了多少真實能力」

前五篇建立了：

- STDI 的物理域治理；
- 超靈與多身體；
- OSF 站點網；
- PCD 跨時間持續存在；
- SPR／DomainIR 對物料、能源、行動與證據的編譯。

但尚未正面回答：

> 增加一個身體、站點或儀器後，系統真實能力究竟增加多少？

若不建立容量會計，系列會出現四種誇張：

1. 把標稱吞吐當成有效能力；
2. 把相同能力的重複配置重複計數；
3. 忽略共享瓶頸；
4. 只計算動作完成，不計算驗證、錯誤與恢復成本。

本文的任務是建立一套可以被模擬、量測和否證的具身容量模型。

---

# 1. 血緣：從「對齊即容量」到「對齊即能力」

ODML 已區分：

1. 聚合飛行容量；
2. 單一存取頭可交付頻寬；
3. 可在共同時間窗中交互的可對齊容量。

其核心洞見是：

> 被分開傳輸不難，難的是讓需要互動的座標在正確時間相遇。

並建立容量會計原則：

> 若基準吞吐已經計入波長、偏振或其他自由度，不得將同一自由度再次乘入。

STDI 中同樣存在：

- 裝設多少機器；
- 單一站點能做多少；
- 多站點能否共同完成一項任務；
- 完成結果能否被驗證。

因此具身域需要同樣的分層會計。

---

# 2. 具身即佔域

## 2.1 身體不只是硬體外殼

一個具身節點的價值，包括：

- 能看到哪裡；
- 能移動到哪裡；
- 能作用於哪些物件；
- 能施加何種力量與能源；
- 能維持多久；
- 能在何種安全與權限下行動。

## 2.2 時空佔域集合

對站點 $N_i$，定義其時空作用域：

$$
\mathcal{O}_i
=
\left\{
(z,t,a)
\mid
z\in Z_i(t),
a\in A_i(t),
\operatorname{Permitted}(N_i,z,a,t)
\right\}.
$$

其中：

- $z$：空間位置或區域；
- $t$：時間；
- $a$：可執行作用。

整個系統的名義佔域為：

$$
\mathcal{O}_{\mathrm{nominal}}
=
\bigcup_{i=1}^{n}\mathcal{O}_i.
$$

## 2.3 真實佔域

真實佔域還需扣除：

- 不可達；
- 站點故障；
- 連線限制；
- 人類排除；
- 能源不足；
- 工具缺失；
- 權限到期。

$$
\mathcal{O}_{\mathrm{effective}}(t)
=
\bigcup_i
\left(
\mathcal{O}_i
\cap
H_i
\cap
L_i
\cap
R_i
\cap
P_i
\right).
$$

## 2.4 佔域覆蓋率

對目標域 $\Omega^\star$：

$$
\eta_{\mathrm{coverage}}
=
\frac{
\mu\left(
\mathcal{O}_{\mathrm{effective}}
\cap
\Omega^\star
\right)
}{
\mu\left(
\Omega^\star
\right)
}.
$$

其中 $\mu$ 可以是：

- 空間體積；
- 時間加權區域；
- 任務重要度加權作用域；
- 可觀測狀態測度。

高覆蓋率不必然表示高容量。系統可以看遍整個房間，卻缺乏任何精密操作能力。

---

# 3. 四層具身容量

## 3.1 裝設容量

對站點 $i$ 的標稱能力向量 $c_i$：

$$
C_{\mathrm{installed}}
=
\bigoplus_{i=1}^{n}c_i.
$$

符號 $\bigoplus$ 不代表普通相加，而表示保留能力類別、參數範圍和適用條件的組合。

## 3.2 可用容量

定義站點可用係數：

$$
a_i(t)
=
h_i(t)
\cdot
k_i(t)
\cdot
e_i(t)
\cdot
p_i(t),
$$

其中：

- $h_i$：健康；
- $k_i$：校準；
- $e_i$：能源；
- $p_i$：權限。

則：

$$
C_{\mathrm{available}}(t)
=
\bigoplus_i
a_i(t)c_i.
$$

## 3.3 可對齊容量

對任務 $q$，需要一個能力、資源與狀態聯盟：

$$
\mathcal{K}_q
=
\left(
C_q,
M_q,
T_q,
E_q,
A_q,
W_q,
V_q
\right),
$$

其中：

- $C_q$：能力；
- $M_q$：物料與工具；
- $T_q$：時間；
- $E_q$：能源；
- $A_q$：權限；
- $W_q$：世界狀態；
- $V_q$：證據。

可對齊聯盟集合：

$$
\mathfrak{C}_q(t)
=
\left\{
S\subseteq\mathcal{N}
\mid
S\models\mathcal{K}_q(t)
\right\}.
$$

可對齊容量為：

$$
C_{\mathrm{aligned}}(q,t)
=
\max_{S\in\mathfrak{C}_q(t)}
V_q(S),
$$

其中 $V_q(S)$ 是該聯盟能交付的任務價值或吞吐。

## 3.4 有效容量

定義：

$$
C_{\mathrm{effective}}
=
C_{\mathrm{aligned}}
-
C_{\mathrm{coord}}
-
C_{\mathrm{failure}}
-
C_{\mathrm{verification}}^{\mathrm{missing}}.
$$

或用比例表示：

$$
C_{\mathrm{effective}}
=
C_{\mathrm{aligned}}
\left(
1-
\tau_{\mathrm{coord}}
\right)
p_{\mathrm{success}}
p_{\mathrm{evidence}}.
$$

其中：

- $p_{\mathrm{success}}$：物理任務成功概率；
- $p_{\mathrm{evidence}}$：結果满足證據契約的概率。

---

# 4. 容量不能隨便相加

## 4.1 能力聯集，不是設備計數

兩台相同相機提供：

- 備援；
- 不同視角；
- 並行觀測。

但如果它們：

- 只能看同一位置；
- 共用同一網路瓶頸；
- 需要同一人工操作員；

其能力增量不等於兩倍。

## 4.2 重複能力折扣

對能力 $c$：

$$
C_c^{\mathrm{union}}
=
\sum_i c_i
-
\sum_{i<j}\rho_{ij}^{(c)}
+
\sum_{i<j<k}\rho_{ijk}^{(c)}
-\cdots.
$$

其中 $\rho$ 表示能力重疊。

工程上不需要完整容斥計算，可以將站點分成：

- 完全可疊加；
- 部分重疊；
- 純備援；
- 互斥；
- 必須成組。

## 4.3 備援不算主動吞吐

一主一備配置的價值主要是可用性：

$$
C_{\mathrm{throughput}}
\approx
C_{\mathrm{primary}},
$$

而可靠度可能提升：

$$
R_{\mathrm{system}}
>
R_{\mathrm{primary}}.
$$

不能把備援設備同時計入吞吐和可靠度增益。

## 4.4 共享瓶頸

若 $n$ 個站點共享容量 $B$ 的資源：

$$
\sum_{i=1}^{n}x_i
\leq
B.
$$

共享瓶頸可能是：

- 狹窄走道；
- 電梯；
- 交接區；
- 工具；
- 儀器；
- 網路；
- 電力；
- 冷卻；
- 人工批准；
- 樣本批次。

Open-RMF 對共享空間、電梯、門和交通衝突的治理，正是此類瓶頸的現實範例。

---

# 5. 三類任務耦合

## 5.1 獨立任務

每個站點可單獨執行：

$$
q_i\perp q_j.
$$

例如不同房間的獨立環境觀測。

此時並行收益最接近線性。

## 5.2 弱耦合任務

需要共享：

- 最終世界狀態；
- 同一批材料；
- 大致時間期限；
- 結果合併。

但不需要精確同時。

此時可採有界過期和最終一致。

## 5.3 強耦合任務

需要：

- 同時抓取；
- 共同搬運；
- 精密交接；
- 同步量測；
- 共同安全區；
- 相同世界紀元。

其對齊成本最高。

## 5.4 聯盟任務

一項任務需多種能力：

$$
\sum_{i\in S}c_i
\models
C_q.
$$

近期異質 MRTA 研究已明確處理：

- 不可分割任務；
- 可分割或中繼任務；
- 需要機器人聯盟共同完成的任務；
- 充電與長續航。

這說明「多身體共同完成」本身就是獨立的排程類型。

---

# 6. 對齊向量

對任務 $q$，定義：

$$
\mathbf{a}_q
=
\left(
a_{\mathrm{cap}},
a_{\mathrm{space}},
a_{\mathrm{time}},
a_{\mathrm{material}},
a_{\mathrm{energy}},
a_{\mathrm{authority}},
a_{\mathrm{world}},
a_{\mathrm{evidence}}
\right).
$$

## 6.1 能力對齊

所需能力必須由一個或多個有效證書滿足。

## 6.2 空間對齊

站點、樣本、工具和安全區域必須在可行路徑上相遇。

## 6.3 時間對齊

所有必要窗口必須有非空交集：

$$
\bigcap_{r\in R_q}
[t_r^-,t_r^+]
\neq
\varnothing.
$$

## 6.4 物料對齊

樣本、容器、工具與校準件必須處於正確保管和狀態。

## 6.5 能源對齊

功率、能源品質、冷卻與熱預算同時成立。

## 6.6 權限對齊

所有身體和區域租約有效，人工批准已完成。

## 6.7 世界狀態對齊

依賴的世界紀元沒有失效。

## 6.8 證據對齊

所需感測、校準和原始資料管線已準備。

## 6.9 最弱環節

可以使用保守模型：

$$
A_q
=
\min_k a_{q,k}.
$$

任一必要對齊維度為零，整項任務不可執行。

---

# 7. 協調稅

## 7.1 定義

理想情況下，$n$ 個單位能力站點提供：

$$
C_{\mathrm{ideal}}(n)=nC_1.
$$

實際：

$$
C_{\mathrm{actual}}(n)
=
C_{\mathrm{ideal}}(n)
-
C_{\mathrm{coord}}(n).
$$

協調稅：

$$
\tau_{\mathrm{coord}}(n)
=
\frac{
C_{\mathrm{coord}}(n)
}{
C_{\mathrm{ideal}}(n)
}.
$$

## 7.2 組成

$$
\begin{aligned}
\tau_{\mathrm{coord}}
={}&
\tau_{\mathrm{communication}}
+
\tau_{\mathrm{synchronization}}
+
\tau_{\mathrm{handoff}}
\\
&+
\tau_{\mathrm{contention}}
+
\tau_{\mathrm{reconciliation}}
+
\tau_{\mathrm{safety}}
\\
&+
\tau_{\mathrm{evidence}}
+
\tau_{\mathrm{recovery}}.
\end{aligned}
$$

## 7.3 通訊稅

- 狀態回報；
- 任務協商；
- 世界模型更新；
- 心跳；
- 衝突解決。

在連線受限的多機器人系統中，全時通訊通常不現實。2026 年的事件觸發協調研究以任務和空間事件決定何時通信，報告通訊開銷可下降，同時保持協調性能。這支持「並非所有狀態都值得持續同步」。

## 7.4 同步稅

- 等待較慢站點；
- 共同起點；
- 時鐘和世界紀元；
- 共同行動窗口。

## 7.5 交接稅

- 移動；
- 保留；
- 驗證；
- 責任轉移；
- 補償。

## 7.6 爭用稅

共享：

- 路徑；
- 工具；
- 儀器；
- 電力；
- 人工批准。

## 7.7 狀態調和稅

中央與地方、分叉體、斷線站點之間需要比較並解決：

- 位置；
- 樣本；
- 任務；
- 權限；
- 記憶。

## 7.8 安全稅

- 速度降低；
- 雙重確認；
- 人員排除；
- 本地互鎖；
- 安全停機。

安全稅不是應消除的浪費，而是換取事故風險下降的成本。

## 7.9 證據稅

- 校準；
- 原始資料；
- 影像；
- 日誌；
- 簽章；
- 重複量測。

沒有證據稅，系統或許做得更快，但不能可靠驗證概念產品。

## 7.10 恢復稅

- 備援；
- 快照；
- 重播；
- 盤點；
- 重排。

---

# 8. 有價值的協調與無效協調

## 8.1 淨協調價值

定義：

$$
V_{\mathrm{coord}}
=
\Delta R_{\mathrm{reliability}}
+
\Delta S_{\mathrm{safety}}
+
\Delta V_{\mathrm{evidence}}
-
C_{\mathrm{coord}}.
$$

若：

$$
V_{\mathrm{coord}}>0,
$$

協調值得。

## 8.2 過度同步

不是所有資料與站點都需要強同步。

SFRSN 已提出：

> 只有語義上需要相遇的資料才應消耗對齊預算。

STDI 同樣應：

- 安全與交接：強同步；
- 排程與健康：有界過期；
- 長期學習：最終一致；
- 獨立實驗：弱同步。

## 8.3 語義同步策略

$$
\operatorname{SyncClass}(q)
\in
\{
\text{hard},
\text{bounded},
\text{event-triggered},
\text{eventual},
\text{none}
\}.
$$

對齊是昂貴資源，應由任務語義決定。

---

# 9. Amdahl 型具身加速界限

## 9.1 不可平行比例

設任務中不可平行部分為 $s$，可平行部分為 $1-s$。

理想加速：

$$
S_{\mathrm{ideal}}(n)
=
\frac{1}{
s+\frac{1-s}{n}
}.
$$

## 9.2 加入協調與爭用

$$
S_{\mathrm{embodied}}(n)
=
\frac{1}{
s+\frac{1-s}{n}
+\kappa(n)
+\rho(n)
+\phi(n)
}.
$$

其中：

- $\kappa(n)$：協調；
- $\rho(n)$：共享資源爭用；
- $\phi(n)$：失敗與恢復。

## 9.3 物理串行區

不可平行部分可能包括：

- 樣本固化；
- 單一稀有儀器；
- 人工批准；
- 單一交接區；
- 安全檢查；
- 依序加工；
- 結果驅動下一步。

## 9.4 最佳站點數

當：

$$
\frac{dS_{\mathrm{embodied}}}{dn}
\leq 0,
$$

增加站點不再提高能力。

最佳規模：

$$
n^\star
=
\arg\max_n
S_{\mathrm{embodied}}(n).
$$

因此，系統可能存在「增加機器反而更慢」的區域。

---

# 10. 排程容量與時間窗

## 10.1 任務需求

任務 $q$：

$$
q
=
\left(
r_q,
[d_q^-,d_q^+],
\ell_q,
v_q,
p_q
\right),
$$

其中：

- $r_q$：資源與能力需求；
- $[d_q^-,d_q^+]$：時間窗；
- $\ell_q$：持續時間；
- $v_q$：價值；
- $p_q$：成功概率。

## 10.2 有效吞吐

在區間 $[0,T]$：

$$
\Theta_{\mathrm{effective}}(T)
=
\frac{
\sum_{q\in Q_{\mathrm{verified}}(T)}v_q
}{
T
}.
$$

只計入：

- 完成；
- 驗證；
- 未被撤銷；
- 證據完整；

的任務。

## 10.3 排程可行率

$$
\eta_{\mathrm{sched}}
=
\frac{
|Q_{\mathrm{aligned}}|
}{
|Q_{\mathrm{requested}}|
}.
$$

## 10.4 鬆弛量

任務鬆弛：

$$
\sigma_q
=
d_q^+
-
d_q^-
-
\ell_q
-
T_{\mathrm{transfer}}
-
T_{\mathrm{verify}}.
$$

$\sigma_q$ 越小，對齊越困難。

---

# 11. 異質性：不是缺點，也不是免費能力

## 11.1 異質能力擴大聯集

不同站點可以提供：

- 移動；
- 精密抓取；
- 成像；
- 熱；
- 化學；
- 算力。

## 11.2 異質性提高轉譯成本

需要：

- 不同 adapter；
- 不同控制頻率；
- 不同錯誤模式；
- 不同能力證書；
- 不同維護。

## 11.3 異質價值條件

新增站點 $N_j$ 的邊際價值：

$$
\Delta V_j
=
\Delta C_{\mathrm{unique}}
+
\Delta R_{\mathrm{resilience}}
+
\Delta O_{\mathrm{coverage}}
-
\Delta C_{\mathrm{coord}}
-
\Delta C_{\mathrm{integration}}.
$$

若 $\Delta V_j\leq0$，不應為「多一種身體」而加入。

## 11.4 車隊設計本身是最佳化問題

研究已將異質車隊選型、任務配置、時間窗和預算共同建模，並指出精確 MILP 在規模增長時可擴展性有限，需要啟發式或 Large Neighbourhood Search。這支持 OSF 在採購與架構階段就應評估站點組合，而不是先買設備再尋找用途。

---

# 12. 失效域與爆炸半徑

## 12.1 獨立故障與共同故障

若站點故障獨立，增加站點可提升韌性。

若共享：

- 電力；
- 網路；
- 世界模型；
- 中央策略；
- 單一工具；

則可能形成共同失效。

## 12.2 失效域

定義：

$$
F_k
=
\left\{
N_i
\mid
\operatorname{fail}(r_k)
\Rightarrow
\operatorname{degrade}(N_i)
\right\}.
$$

## 12.3 爆炸半徑

$$
B(r_k)
=
\sum_{N_i\in F_k}
w_i.
$$

中央化可以降低協調稅，但提高某些故障的爆炸半徑。

## 12.4 容量與韌性不能用同一數字

應分別報告：

- 正常吞吐；
- 降級吞吐；
- 單故障後能力；
- 平均恢復時間；
- 最大失效域。

---

# 13. 中央、地方與動態不動點

## 13.1 中央化

優點：

- 全局資訊；
- 較少協商；
- 較容易證據與治理。

缺點：

- 延遲；
- 單點失效；
- 擴展壓力。

## 13.2 地方自治

優點：

- 快速反應；
- 斷線能力；
- 降低中央負載。

缺點：

- 狀態分歧；
- 重複工作；
- 局部最優；
- 權限漂移。

## 13.3 混合式

近期多機器人時間邏輯研究使用：

- 高階集中配置；
- 低階地方控制；
- 線上通信同步；

處理重複任務與延遲，並在九台實體機器人與更大模擬規模上驗證適應性。這支持 STDI 的「中央策略＋地方執行＋事件觸發同步」。

## 13.4 動態不動點中央

遠期可根據：

- 資訊完整；
- 延遲；
- 信任；
- 故障；
- 任務耦合；

動態選擇治理中心。

但中心漂移本身也產生協調稅，不能假設免費。

---

# 14. 容量會計規則

## 規則一：不把裝設數量當有效能力

報告必須列四層容量。

## 規則二：已計入的能力不得重乘

若單站吞吐已包含多工具或多相機並行，不得再次以工具數乘算。

## 規則三：共享瓶頸取最小截面

串聯系統能力：

$$
C_{\mathrm{pipeline}}
\leq
\min_i C_i.
$$

## 規則四：備援與吞吐分開

備援主要增加可靠度，不自動增加正常吞吐。

## 規則五：不可替代的異質能力不做標量相加

一台顯微鏡與一台移動機器人的能力不能直接寫成「2 個能力單位」。

## 規則六：物理完成但證據失敗，不計入驗證容量

## 規則七：等待不是設備能力

大量排隊中的設備不表示大量可用能力。

## 規則八：安全限制是容量邊界

不能把取消安全後的理論吞吐當合法容量。

## 規則九：按任務族報告

同一站網對：

- 獨立任務；
- 弱耦合任務；
- 強耦合任務；

的容量完全不同。

## 規則十：報告協調稅與邊際收益

每新增一個站點都應量測：

$$
\Delta C_{\mathrm{effective}}
\quad\text{與}\quad
\Delta\tau_{\mathrm{coord}}.
$$

---

# 15. 有效驗證容量

## 15.1 研究能力不等於動作吞吐

定義物理完成量：

$$
C_{\mathrm{action}}.
$$

定義證據完整量：

$$
C_{\mathrm{verified}}.
$$

通常：

$$
C_{\mathrm{verified}}
\leq
C_{\mathrm{action}}.
$$

## 15.2 驗證折扣

$$
\eta_{\mathrm{verify}}
=
\frac{
C_{\mathrm{verified}}
}{
C_{\mathrm{action}}
}.
$$

## 15.3 有效研究容量

$$
C_{\mathrm{research}}
=
C_{\mathrm{action}}
\cdot
\eta_{\mathrm{verify}}
\cdot
\eta_{\mathrm{reproducible}}
\cdot
\eta_{\mathrm{relevant}}.
$$

其中：

- $\eta_{\mathrm{reproducible}}$：可重現；
- $\eta_{\mathrm{relevant}}$：結果對假說有實際資訊價值。

做了一萬次沒有校準或不能區分假說的動作，不代表高研究能力。

---

# 16. 第一個容量模型實驗

## 16.1 目的

量測站點數量從 $1,2,4,8$ 增加時：

- 裝設容量；
- 可用容量；
- 可對齊容量；
- 有效容量；
- 協調稅；

如何變化。

## 16.2 任務族

### T1：獨立觀測

多個樣本各自成像。

### T2：弱耦合搬運與量測

移動站將樣本送至不同量測站。

### T3：強耦合交接

兩個身體在同一交接區完成樣本轉移。

### T4：聯盟搬運

兩個或多個身體共同移動大物體。

### T5：證據密集任務

每個步驟要求校準、原始數據、影像和保管證據。

## 16.3 控制變量

- 相同任務總量；
- 相同站點能力；
- 相同區域；
- 相同能源；
- 相同安全；
- 相同證據要求。

## 16.4 指標

- 任務完成時間；
- 等待；
- 通訊量；
- 同步次數；
- 交接失敗；
- 路徑衝突；
- 能源峰值；
- 人工介入；
- 證據完整；
- 恢復時間。

---

# 17. MVP：Embodied Alignment Benchmark

## 17.1 軟體

- OSF 模擬站網；
- DomainIR；
- SPR Scheduler；
- Open-RMF 或等價交通層；
- ROS 2 模擬；
- Event／Evidence Journal；
- 故障注入器。

## 17.2 物理

- 兩台移動平台；
- 一個固定機械臂；
- 一個量測站；
- 一個交接區；
- 一個共享充電或通道瓶頸。

## 17.3 實驗矩陣

```text
站點數：1 / 2 / 4 / 8
耦合：獨立 / 弱 / 強 / 聯盟
同步：全時 / 有界 / 事件觸發 / 最終
故障：無 / 單站 / 網路 / 共享資源
證據：低 / 標準 / 高
```

## 17.4 輸出

- Capacity Report；
- Coordination Tax Breakdown；
- Alignment Failure Matrix；
- Scaling Curve；
- Failure Domain Map；
- Evidence Discount。

---

# 18. 可證偽命題

## H1：站點數與有效容量不是線性關係

在弱耦合及強耦合任務中，$C_{\mathrm{effective}}(n)$ 應呈現遞減邊際收益。

## H2：獨立任務接近線性，強耦合任務較早飽和

若兩者曲線完全相同，對齊分類沒有解釋力。

## H3：事件觸發同步可降低通訊稅

在不影響關鍵安全與交接的前提下，事件觸發應比全時同步減少通訊。

## H4：證據要求降低表面吞吐，但提高有效驗證率

若高證據模式不降低動作吞吐，可能代表證據成本未被真實計入。

## H5：共享瓶頸會使新增站點失去邊際價值

當路徑、儀器或能源飽和後，新增站點可能只增加排隊與協調。

## H6：局部自治在斷線時提高能力，在一致性任務中可能增加調和稅

地方自治不是單向增益。

## H7：能力重複計數會系統性高估容量

以站點數或標稱吞吐計算的預測，應高於實測有效容量。

## H8：存在任務相關的最佳站點數 $n^\star$

對至少部分強耦合任務，增加節點超過 $n^\star$ 後應不再增益，甚至退化。

---

# 19. 主要限制

## 19.1 能力難以壓縮成單一數字

本文建議使用能力向量和任務族，而不是唯一「具身算力」。

## 19.2 協調稅分解可能重疊

等待可能同時來自同步、爭用和安全，需要統一會計規則。

## 19.3 任務價值具有主觀性

不同研究計畫對結果價值不同。

## 19.4 模擬和現實差距

真實設備故障、摩擦、人類介入和網路抖動會改變曲線。

## 19.5 大型系統的精確最佳化不可擴展

需採階層、啟發式和滾動規劃。

## 19.6 對齊要求可能動態變化

同一任務在不同階段有不同同步級別。

## 19.7 安全和倫理不能被折算成純吞吐

不能因提高容量而取消不可違反的限制。

---

# 20. 不能宣稱的內容

本篇不主張：

- 站點越多能力越大；
- 所有具身能力可以換算成同一單位；
- 協調稅可以完全消除；
- 所有同步都應分散化或事件觸發；
- Amdahl 型公式能精確描述所有物理系統；
- 故障彼此獨立；
- 備援設備可以同時計入吞吐增益；
- 物理動作完成等於研究驗證完成；
- 對齊是唯一瓶頸；
- 中央治理必然優於地方自治；
- 動態不動點中央沒有切換成本；
- 模擬得到的規模曲線可直接代表實驗室；
- 機器人數量可以作為自主研究能力的代理指標。

---

# 21. 與後續系列的關係

本文建立容量與對齊理論後，下一篇將專門處理：

> 當中央超靈、地方 Agent 和多個治理節點都有決策能力時，誰擁有什麼主權？如何在失聯、衝突和多中心狀態下收斂？

因此第 7 篇為：

# 《中央主權、地方自治與動態不動點中央》

將深入建立：

- Authority Lattice；
- Local Veto；
- Delegation Boundary；
- Consensus／Commit；
- Split-Brain；
- Dynamic Center Election；
- Governance Epoch；
- Responsibility Partition；
- 多 AI 衝突和收斂。

---

# 22. 結論

分布式具身系統最大的幻覺，是把「身體很多」誤認為「能力很大」。

真實容量至少經過四層折扣：

$$
C_{\mathrm{installed}}
\geq
C_{\mathrm{available}}
\geq
C_{\mathrm{aligned}}
\geq
C_{\mathrm{effective}}.
$$

站點只有在：

- 正常；
- 校準；
- 有工具；
- 有物料；
- 有能源；
- 有權限；
- 有正確世界狀態；
- 能在任務窗口相遇；
- 能完成證據；

時，才真正形成能力。

因此：

$$
\boxed{
\text{具身}
\neq
\text{擁有一具硬體外殼}
}
$$

而是：

$$
\boxed{
\text{具身}
=
\text{在時空域中取得可觀測、可到達與可作用的位置}
}
$$

同時：

$$
\boxed{
\text{能力}
\neq
\text{站點數量}
}
$$

而是：

$$
\boxed{
\text{能力}
=
\text{被對齊、被交付、被驗證的作用量}
}
$$

本文最終將「具身即佔域，對齊即能力」濃縮為：

> 身體讓智能獲得物理位置；對齊讓位置轉化為共同作用；證據讓共同作用轉化為可信研究能力。

---

# 參考文獻與技術資料

1. Neo.K／Aletheia. **對齊即容量：飛行即定址架構的差分時序界限與分層排程.** EML-ODML-2026-v0.5.

2. Neo.K／Aletheia. **語義即路由：AI 資料中心的語義流站網與直連流時空間.** EML-SFRSN-2026-v0.1.

3. Neo.K／Aletheia. **語義即路由：從 O-Chip 維度代理人到 AI 資料中心語義流治理.** EML-SFRSN-2026-v0.2.

4. Notomista, G., Mayya, S., Hutchinson, S. and Egerstedt, M. **An Optimal Task Allocation Strategy for Heterogeneous Multi-Robot Systems.** arXiv:1903.08641, 2019.

5. Luo, X. and Zavlanos, M. M. **Temporal Logic Task Allocation in Heterogeneous Multi-Robot Systems.** arXiv:2101.05694, 2021.

6. Giacometti, Z. and Zhang, Y. **Allocation of Multi-Robot Tasks with Task Variants.** arXiv:2007.00777, 2020.

7. Wilde, N. and Alonso-Mora, J. **Designing Heterogeneous Robot Fleets for Task Allocation and Sequencing.** arXiv:2312.07234, 2023.

8. Nam, C. et al. **Heterogeneous Multi-Robot Task Allocation for Long-Endurance Missions in Dynamic Scenarios.** arXiv:2411.02062, revised 2025.

9. Liu, W., Majcherczyk, N. and Pecora, F. **Scalable Multi-Robot Task Allocation and Coordination under Signal Temporal Logic Specifications.** arXiv:2503.02719, 2025.

10. Lin, X. and Tron, R. **Adaptive Bi-Level Multi-Robot Task Allocation and Learning under Uncertainty with Temporal Logic Constraints.** arXiv:2502.10062, 2025.

11. Peron, D. et al. **Efficient Coordination and Synchronization of Multi-Robot Systems Under Recurring Linear Temporal Logic.** arXiv:2502.16531, 2025.

12. Aznar, F. et al. **Event-Triggered Adaptive Consensus for Multi-Robot Task Allocation with Communication Awareness.** arXiv:2604.06813, 2026.

13. Open Robotics. **Open-RMF demonstrations and multi-fleet traffic coordination.**  
    https://github.com/open-rmf/rmf_demos

14. ROS 2. **Interfaces: Topics, Services and Actions.**  
    https://docs.ros.org/en/ros2_documentation/rolling/Concepts/Basic/Interfaces-Topics-Services-Actions.html

15. ROS 2. **message_filters and time synchronization.**  
    https://docs.ros.org/en/ros2_packages/kilted/api/message_filters/message_filters.html

16. Neo.K／Aletheia. **Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路.**

17. Neo.K／Aletheia. **持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域.**

18. Neo.K／Aletheia. **語義即物理路由：從資料流治理到物料、能源、站點與行動流治理.**

---

# 附錄 A：容量報告模板

```yaml
capacity_report:
  domain_id: ""
  task_family: ""
  time_window: ""

  installed:
    stations: 0
    capability_vector: {}

  available:
    stations: 0
    unavailable_reasons: {}

  aligned:
    feasible_coalitions: 0
    limiting_alignment_dimensions: []

  effective:
    verified_tasks: 0
    value_per_hour: 0

  coordination_tax:
    communication: 0
    synchronization: 0
    handoff: 0
    contention: 0
    reconciliation: 0
    safety: 0
    evidence: 0
    recovery: 0

  shared_bottlenecks: []
  failure_domains: []
  evidence_discount: 0
```

---

# 附錄 B：Alignment Requirement

```yaml
alignment_requirement:
  task_id: ""

  capability:
    required: []
    coalition_allowed: true

  space:
    zones: []
    co_location_required: false

  time:
    window: null
    synchronization_class: "bounded"
    maximum_skew: null

  material:
    objects: []
    custody_required: true

  energy:
    power_profile: null
    cooling_required: null

  authority:
    leases: []
    human_approval: false

  world:
    epoch: ""
    freshness_requirements: {}

  evidence:
    required: []
```

---

# 附錄 C：協調稅事件

```yaml
coordination_event:
  id: ""
  task_id: ""
  category: "communication | synchronization | handoff | contention |
             reconciliation | safety | evidence | recovery"
  started_at: ""
  ended_at: ""
  affected_stations: []
  affected_resources: []
  value_protected: ""
  avoidable: null
  evidence: []
```

---

# 附錄 D：規模曲線實驗

```yaml
scaling_experiment:
  task_family: ""
  station_counts: [1, 2, 4, 8]

  coupling:
    - independent
    - weak
    - strong
    - coalition

  synchronization:
    - continuous
    - bounded
    - event_triggered
    - eventual

  failure_modes:
    - none
    - single_station
    - network_partition
    - shared_resource

  metrics:
    - installed_capacity
    - available_capacity
    - aligned_capacity
    - effective_capacity
    - coordination_tax
    - verified_throughput
    - recovery_time
```

---

# 附錄 E：系列血緣

```text
ODML
  聚合容量 ≠ 可對齊容量
        ↓

SFRSN
  只有語義需要相遇的流才消耗對齊預算
        ↓

OSF
  異質固定、移動、儀器與虛擬站點
        ↓

PCD
  跨時間維持狀態、義務和權限
        ↓

SPR
  意圖編譯成物料、能源、行動與證據流
        ↓

本篇
  計算站點數量如何轉化為可對齊、有效且可信的能力
        ↓

第 7 篇
  決策權如何在中央、地方與動態中心之間配置
```
