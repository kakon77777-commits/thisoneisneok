# 連線不是纜線
## 有線、無線、光學與離線任務包的混合站網

**Connection Is Not a Cable: A Hybrid Station Fabric of Wired, Wireless, Optical, and Offline Mission Bundles**

**系列：**《時空域支配智能》系列第 8 篇  
**文件編號：** EML-STDI-HLF-2026-v0.1  
**作者：** Neo.K  
**協作整理：** Aletheia（阿萊）  
**機構：** EveMissLab／一言諾科技有限公司  
**日期：** 2026 年 7 月 30 日  
**文件類型：** 通訊架構論文／混合鏈路與斷線治理規格  
**證據成熟度：** E0——形式模型、協議架構與 MVP 驗證路線  
**公開狀態：** 私人研究稿；公開前應經 EML-CF 的 IP Gate、安全、來源與通訊合規審查  
**上位理論：** STDI｜時空域支配智能  
**直接前序：**
1. 《時空間支配型 AI：從單體具身智能到持續性時空域治理》
2. 《超靈的物理化：從 O-Chip 維度代理人到分布式具身主體》
3. 《Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路》
4. 《持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域》
5. 《語義即物理路由：從資料流治理到物料、能源、站點與行動流治理》
6. 《具身即佔域，對齊即能力：分布式身體的時序容量、協調稅與規模邊界》
7. 《中央主權、地方自治與動態不動點中央》

---

## 摘要

分布式具身智能常被想像成「中央 AI 透過網路控制許多機器」。這種描述容易將網路視為透明、連續且同質的管道，彷彿只要設備具有 IP 位址、無線訊號或某條纜線，就能承擔相同的控制責任。然而，物理站網中的通訊條件高度異質：本地馬達與安全互鎖需要微秒至毫秒級的確定性；跨站樣本交接需要有界延遲、時間同步與高可靠度；移動機器人需要可漫遊的無線連線；顯微影像與模型檔案可能需要高吞吐光學或有線鏈路；遠端、深海、軌道或災害環境則可能只有間歇連線，必須依靠可儲存、攜帶與轉送的任務包。

本文提出：

> **連線不是纜線。**

「連線」不是某條物理媒介持續存在，而是站點、治理中心與任務之間，仍維持可驗證身份、有效權限、可接受世界紀元、明確消息新鮮度、可用回報路徑與安全降級規則的邏輯關係。纜線、無線電、可見光、紅外線、移動載體與離線儲存只是承載這段關係的不同媒介。

本文將此架構命名為 **Hybrid Link Fabric（HLF，混合鏈路織網）**，作為 Oversoul Station Fabric 的通訊與時間平面。HLF 的基本形式為：

$$
\mathcal{H}_{\mathrm{HLF}}
=
\left(
\mathcal{N},
\mathcal{L},
\mathcal{P},
\mathcal{Q},
\mathcal{T},
\mathcal{S},
\mathcal{B},
\mathcal{E}
\right),
$$

其中：

- $\mathcal{N}$：OSF 站點；
- $\mathcal{L}$：實體與邏輯鏈路；
- $\mathcal{P}$：可行路徑與多重連線；
- $\mathcal{Q}$：服務品質與控制關鍵度；
- $\mathcal{T}$：時間同步、時間不確定性與 holdover；
- $\mathcal{S}$：身份、完整性、機密性與防重放；
- $\mathcal{B}$：離線任務包與儲存轉送；
- $\mathcal{E}$：鏈路事件、證據與故障紀錄。

本文區分六類鏈路：

1. **L0 本地硬安全鏈路**；
2. **L1 確定性有線鏈路**；
3. **L2 一般操作與資料鏈路**；
4. **L3 移動無線鏈路**；
5. **L4 光學與光通訊鏈路**；
6. **L5 延遲容忍與離線任務包鏈路**。

同時區分五類控制流：

- $K_0$：硬安全與立即停止；
- $K_1$：即時閉環與精密同步；
- $K_2$：站點操作、交接與狀態；
- $K_3$：治理、研究、模型與批次資料；
- $K_4$：延遲容忍任務、證據與遠端同步。

鏈路類型與控制流不能隨意互換。無線連線可支援大量移動與操作任務，但不能因標稱低延遲就自動承擔硬體安全；光學鏈路可提供高資料能力與頻譜隔離，卻受視距、遮擋、對準和環境影響；離線任務包能維持治理關係，卻不能承擔需要即時撤銷的不可逆動作。

本文建立 Link Descriptor、Path Contract、Time Contract、Freshness Budget、Multi-Homing Policy、Failover Epoch、Mission Bundle、Link Degradation State 與 Reconnection Reconciliation 等核心物件。其中心原則是：

$$
\boxed{
\text{控制責任必須依鏈路能力降級，而不是假裝所有鏈路等價}
}
$$

現有技術已提供可組合的底座。IEEE 802.1 TSN 以有界延遲、低延遲變異與低丟包為確定性網路目標；IEEE 802.1AS 管理時間敏感應用的同步，並處理網路元件加入、移除、故障和重配置；IEEE 802.1CB 提供幀複製、冗餘傳送與重複消除。3GPP 已建立 5G 與 TSN、時間同步和時間敏感通訊的整合機制。DDS 和 ROS 2 提供可靠度、deadline、lifespan、liveliness、durability 等 QoS 控制。IEEE 802.11bb 已將光通訊納入 802.11，而 P802.11br 正在延伸增強型光通訊。IETF Bundle Protocol v7 以 store-carry-forward 疊加網路支援間歇連線、長延遲和高錯誤率環境，BPSec 則提供 bundle 的完整性與機密性保護。

HLF 不試圖以一種新鏈路取代所有既有標準。它新增的是一個上層治理映射：

$$
\text{任務語義與風險}
\rightarrow
\text{控制關鍵度}
\rightarrow
\text{鏈路契約}
\rightarrow
\text{路徑與備援}
\rightarrow
\text{降級和離線策略}.
$$

本文的核心命題為：

> 一個站點即使暫時沒有纜線、沒有無線訊號或沒有即時回程，也可能在有限租約與任務包內保持治理連續；反之，一個訊號滿格且封包可達的站點，若權限過期、世界紀元失效或資料已不新鮮，也已經失去有效連線。

**關鍵詞：** 連線不是纜線、Hybrid Link Fabric、HLF、混合站網、有線、無線、光學通訊、離線任務包、TSN、5G TSN、IEEE 802.11bb、Bundle Protocol、DTN、QoS、時間同步、多重連線、failover、fencing、站點治理

---

# 0. 版本定位：第八篇補的是「治理如何穿越不同媒介與斷線」

前七篇已建立：

- STDI 的時空域治理；
- 多身體超靈；
- OSF 站點；
- PCD 持續存在；
- SPR 物理路由；
- EAC 對齊容量；
- DFC 中央與地方治理。

但仍有一個未處理的假設：

> 站點之間始終有一條可用、低延遲、可信且一致的網路。

真實物理域中可能同時存在：

- 安全 PLC 與本地總線；
- TSN Ethernet；
- 一般 Ethernet；
- Wi-Fi；
- 私有 5G；
- UWB 或短距無線；
- 光纖；
- 可見光或紅外線；
- 移動儲存；
- 長延遲 DTN；
- 完全離線任務包。

本篇的任務不是選出「最好的網路」，而是建立：

> 不同控制責任如何被安全地映射到不同鏈路，並在鏈路退化、切換或消失時維持治理邊界。

---

# 1. 連線的重新定義

## 1.1 物理可達不等於治理可達

若站點可以 ping 通，但：

- 憑證無效；
- 租約過期；
- 治理紀元落後；
- 世界狀態過期；
- 消息超過 lifespan；
- 站點已被隔離；

則：

$$
\operatorname{PhysicallyReachable}=1,
\quad
\operatorname{GovernanceConnected}=0.
$$

## 1.2 沒有即時鏈路也可能維持有限治理

若遠端站點持有：

- 已簽章任務包；
- 世界狀態快照；
- 短期權限租約；
- 本地安全包絡；
- 明確到期時間；
- 回報與補償規則；

則在短期內：

$$
\operatorname{Online}=0,
\quad
\operatorname{GovernanceContinuity}=1.
$$

## 1.3 連線契約

定義站點 $i$ 與治理域之間的邏輯連線：

$$
\chi_i(t)
=
\left(
I_i,
G_i,
W_i,
A_i,
F_i,
R_i
\right),
$$

其中：

- $I_i$：身份可驗證；
- $G_i$：治理紀元可接受；
- $W_i$：世界狀態新鮮度；
- $A_i$：權限與租約；
- $F_i$：前向與回報鏈路能力；
- $R_i$：失聯、恢復與撤銷規則。

只有這些條件成立，站點才處於有效治理連線。

---

# 2. 六類鏈路

## 2.1 L0：本地硬安全鏈路

用途：

- 急停；
- 馬達電流；
- 碰撞；
- 雷射互鎖；
- 高壓；
- 壓力；
- 熱失控；
- 安全門。

特徵：

- 微秒至毫秒；
- 通常不經雲端；
- 不依賴跨站路由；
- 必須能在上層網路全部失效時工作。

可能使用：

- 專用硬線；
- 安全 PLC；
- 工業現場總線；
- 本地 MCU；
- 獨立互鎖。

HLF 不對 L0 做高階替代，只記錄其狀態與否決結果。

## 2.2 L1：確定性有線鏈路

用途：

- 精密同步；
- 機械交接；
- 儀器觸發；
- 時間敏感控制；
- 高可靠站點協調。

特徵：

- 有界延遲；
- 低抖動；
- 流量排程；
- 冗餘；
- 時間同步。

候選底座包括：

- TSN Ethernet；
- 工業 Ethernet；
- 專用光纖；
- 其他經驗證的確定性網路。

## 2.3 L2：一般操作與資料鏈路

用途：

- ROS 2 Topic／Service／Action；
- DDS data space；
- OPC UA；
- 站點遙測；
- 一般任務；
- 影像與資料。

特徵：

- 可設定可靠度、deadline、lifespan、durability 和 liveliness；
- 不保證所有端到端物理期限；
- 適合站點操作和資料交換。

## 2.4 L3：移動無線鏈路

用途：

- AMR／AGV；
- 無人機；
- 移動感測；
- 穿戴設備；
- 臨時站；
- 重新配置空間。

候選包括：

- Wi-Fi；
- 私有 5G；
- UWB；
- 短距無線；
- 專用 RF。

特徵：

- 覆蓋和吞吐隨位置變化；
- 可能漫遊、遮蔽、干擾；
- 能支援時間敏感服務，但必須按部署條件驗證；
- 不應默認承擔 L0。

## 2.5 L4：光學與光通訊鏈路

用途：

- 高吞吐影像與科學資料；
- 電磁敏感環境；
- 定向安全區；
- 移動對接；
- 空間與遠距資料傳輸。

形式包括：

- 光纖；
- 可見光通訊；
- 紅外線；
- free-space optical；
- 雷射通訊。

優點：

- 高資料能力；
- 可與 RF 頻譜分離；
- 空間方向性；
- 光纖具有良好隔離性。

限制：

- 視距；
- 遮擋；
- 指向、捕獲與追蹤；
- 污染、煙霧、雲層或環境干擾；
- 光學安全；
- 移動對準成本。

## 2.6 L5：延遲容忍與離線任務包

用途：

- 間歇連線；
- 遠端基地；
- 深海；
- 軌道；
- 災害環境；
- 跨組織離線資料室；
- 人工攜帶資料。

特徵：

- store-carry-forward；
- 高延遲；
- 非即時；
- 需要到期和重放保護；
- 任務和證據必須自包含；
- 無法依賴即時撤銷。

---

# 3. 五類控制關鍵度

## $K_0$：硬安全

要求：

- 最小延遲；
- 本地確定性；
- 獨立供電或安全失效；
- 不允許經 L5；
- 不允許依賴遠端 AI。

## $K_1$：即時閉環與同步

例：

- 精密伺服；
- 多站同步觸發；
- 協同搬運。

偏好：

- L0／L1；
- 經驗證的 L3 或 L4 只能作特定部署下的補充。

## $K_2$：站點操作與交接

例：

- ROS 2 Action；
- 樣本交接；
- 任務狀態；
- 移動交通。

可使用：

- L1／L2／L3；
- 必須有 deadline、freshness 和 failover。

## $K_3$：治理、模型與高吞吐資料

例：

- 世界模型同步；
- 影像；
- 模型更新；
- EML-CF；
- 研究資料。

可使用：

- L2／L3／L4；
- 可緩衝、壓縮和重傳。

## $K_4$：延遲容忍任務與證據

例：

- 遠端任務包；
- 批次證據；
- 長延遲同步；
- 離線更新。

可使用：

- L5；
- 必須自包含、可驗證和可到期。

---

# 4. 控制—鏈路映射

| 控制類別 | L0 | L1 | L2 | L3 | L4 | L5 |
|---|---:|---:|---:|---:|---:|---:|
| $K_0$ 硬安全 | 核心 | 輔助 | 禁止作唯一鏈路 | 禁止作唯一鏈路 | 禁止作唯一鏈路 | 禁止 |
| $K_1$ 即時同步 | 可用 | 核心 | 有條件 | 經驗證後 | 經驗證後 | 禁止 |
| $K_2$ 站點操作 | — | 可用 | 核心 | 核心 | 有條件 | 僅非即時 |
| $K_3$ 治理與資料 | — | 可用 | 核心 | 可用 | 核心／可用 | 可緩衝 |
| $K_4$ 延遲容忍 | — | 可用 | 可用 | 可用 | 可用 | 核心 |

此表不是普世認證，而是 HLF 的保守預設。實際部署仍需依：

- 延遲；
- 抖動；
- 丟包；
- 覆蓋；
- 安全等級；
- 終端能力；

進行驗證。

---

# 5. Link Descriptor

每條鏈路 $l$ 表示為：

$$
l
=
\left(
m,
d,
j,
p,
b,
r,
f,
s,
e,
v
\right),
$$

其中：

- $m$：媒介；
- $d$：延遲區間；
- $j$：抖動；
- $p$：丟包和錯誤；
- $b$：吞吐；
- $r$：可靠度與冗餘；
- $f$：新鮮度與消息期限；
- $s$：身份、完整性、機密性；
- $e$：能源成本；
- $v$：可見性、移動性和環境限制。

## 5.1 最小描述

```yaml
link:
  id: "hlf:lab-a:wifi-01"
  medium: "wireless_rf"
  technology: "private_wifi"

endpoints:
  - "osf:amr-02"
  - "osf:edge-gateway-01"

performance:
  latency_budget_ms: 30
  jitter_budget_ms: 10
  loss_budget: 0.01
  bandwidth_mbps: 200

semantics:
  supported_classes: ["K2", "K3"]
  forbidden_classes: ["K0"]
  maximum_message_age_ms: 500
  offline_fallback: "local_safe_mission"

security:
  mutual_authentication: true
  encryption: true
  replay_protection: true

mobility:
  roaming: true
  coverage_zones: ["lab-a", "corridor-1"]
```

## 5.2 描述不等於實測

Link Descriptor 是設計契約。

運行時仍需收集：

- 實際延遲；
- 實際丟包；
- 訊號；
- 漫遊；
- 時鐘偏差；
- 斷線；
- 安全事件。

---

# 6. Path Contract

任務流 $f$ 的路徑契約：

$$
\pi_f
=
\left(
K_f,
D_f,
J_f,
R_f,
F_f,
S_f,
T_f,
B_f
\right),
$$

其中：

- $K_f$：控制關鍵度；
- $D_f$：最大延遲；
- $J_f$：抖動；
- $R_f$：可靠度；
- $F_f$：最大消息年齡；
- $S_f$：安全需求；
- $T_f$：時間同步；
- $B_f$：失效和備援策略。

路徑可由多條鏈路組成：

$$
P_f
=
(l_1,l_2,\ldots,l_n).
$$

端到端契約不能只看其中一段。

---

# 7. QoS 不等於物理安全

## 7.1 DDS 與 ROS 2 QoS

可配置：

- reliability；
- durability；
- deadline；
- lifespan；
- liveliness；
- history；
- resource limits。

這些能力對站點資料和任務非常重要。

## 7.2 仍需端到端驗證

即使 Topic 設為 reliable：

- 應用程式可能延遲；
- 執行器可能排隊；
- 世界狀態可能過期；
- 命令可能已失去權限；
- 物理機構可能故障。

所以：

$$
\text{Reliable Delivery}
\neq
\text{Timely Safe Effect}.
$$

## 7.3 服務的舊請求

具有副作用的 Service 或 Action 必須帶：

- command ID；
- governance epoch；
- deadline；
- idempotency key；
- world epoch；
- fencing token。

避免重啟後重新執行過期命令。

---

# 8. Freshness Budget

消息 $m$ 的有效條件：

$$
\operatorname{Fresh}(m,t)
=
\mathbb{1}
\left[
t-t_{\mathrm{source}}
\leq
\Delta_m^{\max}
\right].
$$

## 8.1 不同消息不同期限

| 消息 | 典型語義 |
|---|---|
| 急停與人員存在 | 極短 |
| 機器人姿態 | 短 |
| 任務狀態 | 秒級或任務級 |
| 儀器校準 | 依校準政策 |
| 模型檔案 | 版本固定 |
| 遠端研究報告 | 長 |

## 8.2 過期不一定丟棄

過期消息可：

- 保存為歷史證據；
- 禁止作為當前控制；
- 觸發重新觀測；
- 進入調和流程。

---

# 9. 時間平面與資料平面分離

## 9.1 同步不是普通資料

精密協作需要：

- 共同時間；
- 可估計偏差；
- 來源與失效狀態；
- holdover。

## 9.2 Time Contract

$$
\tau_i
=
\left(
c_i,
\epsilon_i,
u_i,
h_i,
s_i
\right),
$$

其中：

- $c_i$：時鐘來源；
- $\epsilon_i$：誤差界；
- $u_i$：更新頻率；
- $h_i$：失去來源後 holdover；
- $s_i$：同步狀態。

## 9.3 IEEE 802.1AS

可作時間敏感站網的同步底座之一，並處理網路元件加入、移除、故障和重配置時的同步維持。

## 9.4 無線與 5G 時間

3GPP 的工業 5G 工作已支援 TSN 整合、時間同步和時間敏感通訊。

但部署仍需量測：

- 空口延遲；
- 排程；
- 漫遊；
- 覆蓋；
- 時鐘路徑；
- trust domain。

## 9.5 Holdover

同步來源中斷後，站點可以在有限時間依本地時鐘維持。

若：

$$
\epsilon_i(t)
>
\epsilon_{\max},
$$

精密同步任務必須停止或降級。

---

# 10. 確定性有線與冗餘

## 10.1 TSN

TSN 的目標是透過 IEEE 802 網路提供：

- 有界延遲；
- 低延遲變異；
- 低丟包；
- 時間敏感服務。

HLF 可將 TSN 用於：

- 站點觸發；
- 同步量測；
- 關鍵操作資料；
- 時間分配。

## 10.2 Frame Replication and Elimination

IEEE 802.1CB 提供：

- 幀識別；
- 多路複製；
- 冗餘傳送；
- 重複消除。

這可降低單一路徑故障造成的丟失。

## 10.3 不重複計算容量

若同一幀經兩條路徑複製：

$$
\text{Delivered Information}=1,
$$

不是 $2$。

冗餘增加可靠度，但消耗額外頻寬。

## 10.4 無縫不等於無故障

即使使用冗餘：

- 兩條路徑可能共享交換器；
- 共享電源；
- 共享時間源；
- 配置錯誤；
- 接收端故障。

需建立失效域圖。

---

# 11. 移動無線與 5G／Wi-Fi

## 11.1 無線的不可替代價值

- 移動；
- 快速重配置；
- 臨時站；
- 跨房間；
- 減少拖纜；
- 人員與穿戴裝置。

## 11.2 無線容量是位置函數

$$
C_{\mathrm{wireless}}
=
f(
z,
t,
i,
o,
m,
p
),
$$

其中：

- $z$：位置；
- $t$：時間；
- $i$：干擾；
- $o$：遮蔽；
- $m$：漫遊和調變；
- $p$：功率與政策。

## 11.3 5G 與 TSN

5G 系統可以作為整合 TSN 的邏輯橋梁並提供時間敏感通訊與時間同步服務，但不代表所有 5G 部署都自動滿足相同的確定性。

## 11.4 Wi-Fi

適合：

- 高吞吐移動資料；
- 一般控制；
- 影像；
- 臨時設備。

需要：

- 覆蓋量測；
- 漫遊測試；
- 頻道與干擾管理；
- 重要流量優先；
- 斷線地方策略。

## 11.5 多無線鏈路

移動站可同時具有：

- Wi-Fi；
- 5G；
- 短距對接鏈路；
- 本地離線任務包。

但多鏈路不應讓同一命令被重複執行。

---

# 12. 光學與光通訊

## 12.1 光纖

適合：

- 高吞吐；
- 長距；
- 電磁隔離；
- 穩定固定站點。

## 12.2 Light Communications

IEEE 802.11bb 已將光通訊納入 802.11 系列；P802.11br 正在研究增強型光通訊。

可用於：

- 室內高吞吐；
- RF 受限區；
- 空間定向鏈路；
- 特定移動站對接。

## 12.3 Free-Space Optical／Laser Communication

NASA 的光通訊實作證明紅外線與雷射鏈路可承擔高資料量，但也需要精密指向，並受到大氣、雲層、遮擋和追蹤條件影響。

## 12.4 光學鏈路狀態

```text
ACQUIRING
TRACKING
LOCKED
DEGRADED
OBSCURED
LOST
```

## 12.5 光學不應單獨承擔不可中斷控制

若光學鏈路被遮擋，站點應：

- 切換 RF／有線；
- 降級；
- 本地完成安全步驟；
- 暫停高風險任務。

---

# 13. Multi-Homing

## 13.1 定義

站點同時具有路徑集合：

$$
\mathcal{P}_i
=
\{P_i^{(1)},P_i^{(2)},\ldots,P_i^{(k)}\}.
$$

## 13.2 策略

- Active／Standby；
- Active／Active；
- 流分類；
- 冗餘複製；
- 負載分散；
- 僅證據批次轉移。

## 13.3 路徑選擇

$$
P_f^\star
=
\arg\min_{P\in\mathcal{P}_f}
\left(
w_dD_P
+
w_jJ_P
+
w_lL_P
+
w_eE_P
+
w_rR_P
\right),
$$

其中 $R_P$ 可表示風險，不是可靠度。

## 13.4 不以吞吐最大為唯一目標

高吞吐路徑可能：

- 延遲不穩；
- 信任域不同；
- 能耗高；
- 不允許機密資料；
- 不支援時間同步。

---

# 14. 鏈路切換

## 14.1 切換狀態機

```text
PRIMARY_ACTIVE
DEGRADING
SECONDARY_PREPARE
DUAL_PATH_VERIFY
SECONDARY_COMMIT
PRIMARY_RELEASE
RECOVERY
```

## 14.2 切換前檢查

- 新路徑身份；
- 路徑契約；
- 治理紀元；
- 時間狀態；
- QoS；
- 安全；
- 消息序號。

## 14.3 Failover Epoch

鏈路切換建立：

$$
f_k
=
\left(
k,
P_{\mathrm{old}},
P_{\mathrm{new}},
s_{\mathrm{commit}}
\right).
$$

站點只接受最高 failover epoch 的提交流，避免新舊路徑同時執行。

## 14.4 非冪等操作

以下不能自動重送：

- 啟動加熱；
- 釋放夾具；
- 注入材料；
- 執行破壞性試驗。

需使用：

- idempotency key；
- command ledger；
- 執行前狀態；
- 本地確認。

---

# 15. 鏈路退化不是二元

## 15.1 狀態集合

```text
HEALTHY
CONSTRAINED
LOSSY
HIGH_LATENCY
ASYMMETRIC
INTERMITTENT
PARTITIONED
RECOVERING
QUARANTINED
```

## 15.2 降級動作

### CONSTRAINED

- 降低影像品質；
- 壓縮；
- 延長回報週期。

### LOSSY

- 增加重傳；
- 切換可靠流；
- 冗餘路徑。

### HIGH_LATENCY

- 增加地方自治；
- 禁止精密遠端閉環；
- 任務批次化。

### INTERMITTENT

- 使用 bundle；
- 縮短租約；
- 本地保存證據。

### PARTITIONED

- C2／C3 凍結；
- 地方安全；
- 等待治理收斂。

---

# 16. Mission Bundle

## 16.1 定義

離線任務包：

$$
B_q
=
\left(
I,
G,
WE,
GE,
L,
S,
D,
R,
V,
X
\right),
$$

其中：

- $I$：身份與目的；
- $G$：任務圖；
- $WE$：世界紀元快照；
- $GE$：治理紀元；
- $L$：權限租約；
- $S$：安全與禁止集合；
- $D$：期限和到期；
- $R$：回報與補償；
- $V$：證據要求；
- $X$：簽章與安全資訊。

## 16.2 任務包必須自包含

不能依賴：

- 即時中央追問；
- 隨時取得新模型；
- 即時撤銷；
- 雲端秘密；
- 未攜帶的能力描述。

## 16.3 Store-Carry-Forward

Bundle Protocol v7 可將 bundle 放在應用層疊加網路中，跨間歇連線、長延遲和高錯誤率環境儲存與轉送。

## 16.4 BPSec

BPSec 可為 bundle 提供：

- 完整性；
- 機密性。

HLF 仍需額外處理：

- 任務權限；
- 世界紀元；
- 防重放；
- 執行冪等；
- 物理安全。

## 16.5 Bundle 到期

若：

$$
t>t_{\mathrm{expire}},
$$

站點不得自行執行，必須：

- 丟棄控制權；
- 保留歷史；
- 等待更新；
- 執行安全義務。

---

# 17. 離線撤銷的限制

## 17.1 即時撤銷不可能保證

當鏈路不存在時，中央無法保證撤銷立即送達。

## 17.2 因此租約必須自動到期

本地站點根據：

- 本地時鐘；
- 任務步驟；
- 世界狀態；
- 風險；

自行終止權限。

## 17.3 離線任務必須保守

允許：

- 觀測；
- 安全返航；
- 保存樣本；
- 完成已開始的低風險步驟；
- 等待。

禁止：

- 新高風險任務；
- 自行續租；
- 擴張區域；
- 轉授權；
- 公開或外傳資料。

---

# 18. 重連與狀態調和

## 18.1 重連不是直接恢復中央控制

步驟：

1. 身份再認證；
2. 交換治理紀元；
3. 交換世界紀元；
4. 上傳離線事件；
5. 驗證 bundle 執行；
6. 解決物理與日誌差異；
7. 撤銷舊租約；
8. 重新簽發權限；
9. 進入正常模式。

## 18.2 衝突

可能出現：

- 中央認為樣本在 A，地方已移到 B；
- 任務在中央被取消，地方已完成；
- 模型版本不同；
- 兩方都建立新的任務。

## 18.3 不覆蓋歷史

衝突應保存為：

```yaml
reconciliation_conflict:
  central_state: ""
  station_state: ""
  physical_observation: ""
  resolution: ""
  responsible_party: ""
  evidence: []
```

---

# 19. 安全與威脅模型

## 19.1 鏈路降級攻擊

攻擊者使系統誤以為需要切換至較弱安全鏈路。

控制：

- 路徑策略；
- 最低安全等級；
- 降級不可放寬權限。

## 19.2 重放舊命令

控制：

- 治理紀元；
- failover epoch；
- command ID；
- world epoch；
- lifespan；
- fencing。

## 19.3 重複執行

多路徑或重傳可能造成同一物理命令執行兩次。

控制：

- idempotency；
- 本地 command ledger；
- 效果確認。

## 19.4 假鏈路或假基站

控制：

- 雙向身份；
- 憑證；
- trust domain；
- station policy。

## 19.5 光學側錄與干擾

方向性不等於絕對安全。

仍需：

- 加密；
- 完整性；
- 光學安全；
- 遮擋偵測。

## 19.6 Bundle 遺失或延遲

控制：

- 到期；
- 多路複製；
- 優先級；
- 狀態回報；
- 任務風險限制。

## 19.7 時間欺騙

控制：

- 多時間源；
- 誤差界；
- holdover；
- 異常偵測；
- 本地安全不只依賴網路時間。

---

# 20. HLF 架構

## 20.1 Link Registry

保存：

- 鏈路；
- 技術；
- 範圍；
- 性能；
- 信任；
- 支援控制類別。

## 20.2 Link Adapter

封裝：

- TSN；
- DDS；
- ROS 2；
- OPC UA；
- 5G；
- Wi-Fi；
- 光學；
- BPv7。

## 20.3 Path Broker

根據 Path Contract 選擇路徑。

## 20.4 QoS／Safety Mapper

將 DomainIR、Task Envelope 和決策類別映射至鏈路要求。

## 20.5 Time Authority

管理：

- 時鐘；
- 誤差；
- holdover；
- 同步狀態；
- 時間事件。

## 20.6 Multi-Homing Manager

管理：

- 主備；
- active-active；
- frame replication；
- 路徑切換；
- failover epoch。

## 20.7 Bundle Agent

建立、儲存、轉送、驗證和提交離線任務包。

## 20.8 Link Health Monitor

監測：

- 延遲；
- 抖動；
- 丟包；
- 覆蓋；
- 光學 lock；
- 漫遊；
- 信任；
- 消息新鮮度。

## 20.9 Reconciliation Manager

管理斷線後的事件和世界狀態調和。

## 20.10 Evidence Journal

保存所有：

- 路徑；
- 切換；
- 丟包；
- 降級；
- bundle；
- 重連；
- 安全事件。

---

# 21. MVP：Hybrid Link Lab

## 21.1 配置

- 一台中央治理節點；
- 兩個固定 OSF 站；
- 一台移動站；
- 一個虛擬站；
- 有線 Ethernet／TSN 模擬；
- Wi-Fi；
- 可選私有 5G 或 5G 模擬；
- 一條短距光學鏈路；
- BPv7 Bundle Agent；
- 本地安全控制器。

## 21.2 任務

1. 固定站進行量測；
2. 移動站搬運樣本；
3. 影像經高吞吐路徑回傳；
4. 操作命令使用一般操作鏈路；
5. 精密交接使用確定性或本地同步；
6. 故意斷開中央；
7. 移動站依離線任務包進入安全區；
8. 重連後提交證據並調和世界狀態。

## 21.3 故障注入

- Wi-Fi 漫遊；
- 有線斷路；
- 光學遮擋；
- 高延遲；
- 消息過期；
- 舊路徑恢復；
- 兩路重複命令；
- 時鐘漂移；
- bundle 延遲；
- 假憑證；
- 中央撤銷但站點離線。

## 21.4 成功條件

- $K_0$ 不依賴上層網路；
- 鏈路降級不放寬權限；
- 過期消息不控制設備；
- 多重連線不重複執行物理命令；
- 光學遮擋能安全切換或停止；
- 離線站點不自行續租；
- 重連後不直接覆蓋中央狀態；
- 所有切換和 bundle 有證據。

---

# 22. 評估指標

## 22.1 性能

- 端到端延遲；
- 抖動；
- 吞吐；
- 丟包；
- 切換時間；
- 時鐘誤差。

## 22.2 治理

- 過期命令執行數；
- 舊紀元命令拒絕率；
- 離線越權；
- 重連衝突；
- 重複物理作用。

## 22.3 可靠度

- 任務完成率；
- 多路徑生存率；
- 共享失效域；
- 恢復時間。

## 22.4 安全

- 降級放權；
- 假鏈路接入；
- bundle 重放；
- 時間欺騙；
- 光學鏈路失鎖處理。

## 22.5 能源

- 移動無線耗能；
- 多鏈路常開成本；
- 光學對準成本；
- bundle 儲存和轉送成本。

---

# 23. 可證偽命題

## H1：單一媒介不能同時最優承擔所有控制類別

若同一鏈路在安全、即時、移動、高吞吐和長延遲場景都無代價勝出，測試設計可能不充分。

## H2：多重連線提高韌性，但增加重複、切換和安全成本

## H3：消息新鮮度比可靠送達更能預測控制正確性

可靠送達的過期命令仍可能有害。

## H4：光學鏈路提高資料能力，但對遮擋和對準更敏感

## H5：事件與控制分級能降低不必要的高可靠鏈路成本

並非所有遙測都需要 TSN 或可靠重傳。

## H6：離線任務包提高斷線連續性，但必須降低自治範圍

## H7：fencing 與 idempotency 可降低多路徑重複執行

## H8：時間平面失效會先於資料平面失效破壞精密協作

封包仍可達，但時間誤差超標時，強同步任務應停止。

---

# 24. 主要限制

## 24.1 鏈路性能依部署高度變動

標準支援某項能力，不表示具體部署一定達標。

## 24.2 QoS 參數跨中介軟體不一定完全一致

## 24.3 光學鏈路的安全、視距和移動對準需要專門工程

## 24.4 多重連線增加配置和觀測複雜度

## 24.5 DTN 無法解決即時撤銷

只能依保守租約和本地到期。

## 24.6 時間同步本身可能形成共同失效域

## 24.7 端到端證明比單鏈路測試困難

## 24.8 本文未建立特定安全認證等級

實際工業、醫療或危險環境必須依相應法規與安全標準設計。

---

# 25. 不能宣稱的內容

本篇不主張：

- 無線可以取代所有有線安全鏈路；
- 5G 或 Wi-Fi 標稱低延遲即表示端到端確定性；
- TSN 能修復應用程式和物理控制錯誤；
- 光通訊永遠比 RF 安全；
- 光學鏈路不會被遮擋或干擾；
- 多路徑使系統不會失效；
- frame replication 會增加有效資訊容量；
- reliable QoS 表示命令仍然新鮮；
- DTN 可支援任意即時控制；
- 離線站點能即時收到撤銷；
- 同一命令可在不同路徑自由重送而不考慮副作用；
- 站點訊號滿格即代表治理連線有效；
- 所有媒介都應被統一成單一協定；
- HLF 已是成熟標準。

---

# 26. 與後續系列的關係

本篇建立通訊與時間平面後，下一篇將處理：

> 多個站點、物件、區域、事件、權限、任務和不確定性，應如何形成一個可供超靈持續推理的世界模型？

因此第 9 篇為：

# 《站點化世界模型：物體、區域、事件、權限與可能行動》

將建立：

- Object／Zone／Agent Model；
- Event Graph；
- Action Affordance；
- Uncertainty；
- World Epoch；
- Partial Observability；
- Digital Twin Boundary；
- Causal and Custody Relations；
- Human and AI Perspectives；
- World Model Reconciliation。

---

# 27. 結論

「連線」最不應被簡化成：

- 是否插著線；
- 是否有 Wi-Fi；
- 是否能 ping；
- 是否收到心跳。

對時空域支配智能而言，真正的連線是：

$$
\boxed{
\text{身份仍可信}
+
\text{紀元仍有效}
+
\text{權限未過期}
+
\text{消息仍新鮮}
+
\text{回報仍可重建}
+
\text{失聯仍有安全邊界}
}
$$

有線、無線、光學和離線任務包各有不同的：

- 延遲；
- 吞吐；
- 移動性；
- 視距；
- 能耗；
- 信任；
- 故障；
- 撤銷能力。

因此，合理架構不是選擇唯一媒介，而是：

$$
\boxed{
\text{任務語義}
\rightarrow
\text{控制關鍵度}
\rightarrow
\text{鏈路契約}
\rightarrow
\text{多路徑與降級策略}
}
$$

本文最終命題是：

> **纜線只是連線的一種載體；真正的連線，是治理關係跨媒介、跨時間、跨斷線仍保持可驗證邊界。**

所以：

$$
\boxed{
\text{連線不是纜線}
}
$$

而是：

$$
\boxed{
\text{連線}
=
\text{可被安全承載、可被降級、可被恢復的治理關係}
}
$$

---

# 參考文獻與官方技術資料

1. IEEE 802.1 Time-Sensitive Networking Task Group.  
   https://1.ieee802.org/tsn/

2. IEEE 802.1AS. **Timing and Synchronization for Time-Sensitive Applications.**  
   https://1.ieee802.org/maintenance/802-1as-2025-revision-timing-and-synchronization-for-time-sensitive-applications/

3. IEEE 802.1CB. **Frame Replication and Elimination for Reliability.**  
   https://1.ieee802.org/tsn/802-1cb/

4. 3GPP. **5G for Industry 4.0／TSN Integration.**  
   https://www.3gpp.org/technologies/tsn-v-lan

5. 3GPP. **Industrial 5G.**  
   https://www.3gpp.org/technologies/ind-5g

6. Object Management Group. **Data Distribution Service, Version 1.4.**  
   https://www.omg.org/spec/DDS/1.4/

7. Open Robotics. **ROS 2 Quality of Service Settings.**  
   https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html

8. IEEE 802.11 Working Group. **IEEE Std 802.11bb-2023 Light Communications.**  
   https://www.ieee802.org/11/overview.html

9. IEEE 802.11 Working Group. **P802.11br Enhanced Light Communications.**  
   https://www.ieee802.org/11/Reports/tgbr_update.htm

10. NASA. **Laser Communications.**  
    https://www.nasa.gov/communicating-with-missions/lasercomms/

11. NASA. **Optical Communications Overview.**  
    https://www.nasa.gov/technology/space-comms/optical-communications-overview/

12. IETF. **RFC 9171: Bundle Protocol Version 7.**  
    https://www.rfc-editor.org/rfc/rfc9171.html

13. IETF. **RFC 9172: Bundle Protocol Security.**  
    https://www.rfc-editor.org/rfc/rfc9172.html

14. IETF. **RFC 9173: Default Security Contexts for Bundle Protocol Security.**  
    https://www.rfc-editor.org/rfc/rfc9173.html

15. Neo.K／Aletheia. **Oversoul Station Fabric：固定站、移動站與虛擬站的分布式具身網路.**

16. Neo.K／Aletheia. **持續性指揮控制區：AI 如何佔據、維持並安全解除一個物理時空域.**

17. Neo.K／Aletheia. **中央主權、地方自治與動態不動點中央.**

---

# 附錄 A：Link Descriptor

```yaml
link:
  id: ""
  medium: ""
  technology: ""
  endpoints: []

  performance:
    latency_budget: null
    jitter_budget: null
    loss_budget: null
    bandwidth: null

  semantics:
    supported_control_classes: []
    forbidden_control_classes: []
    maximum_message_age: null
    offline_fallback: null

  time:
    synchronization_supported: false
    maximum_time_error: null
    holdover: null

  security:
    mutual_authentication: false
    integrity: false
    confidentiality: false
    replay_protection: false

  mobility:
    roaming: false
    coverage_zones: []

  evidence:
    monitoring_required: true
    logs: []
```

---

# 附錄 B：Path Contract

```yaml
path_contract:
  flow_id: ""
  control_class: "K0 | K1 | K2 | K3 | K4"

  bounds:
    maximum_latency: null
    maximum_jitter: null
    maximum_loss: null
    maximum_message_age: null
    minimum_bandwidth: null

  time:
    synchronization_required: false
    maximum_clock_error: null

  security:
    trust_domain: ""
    confidentiality: false
    integrity: true

  failover:
    mode: "none | active_standby | active_active | replicated"
    fallback_path: null
    local_behavior_on_loss: "safe_stop"
```

---

# 附錄 C：Mission Bundle

```yaml
mission_bundle:
  id: ""
  source: ""
  destination: ""

  governance:
    domain_id: ""
    governance_epoch: 0
    world_epoch: ""
    lease_id: ""

  task:
    graph: ""
    allowed_actions: []
    forbidden_actions: []

  validity:
    created_at: ""
    valid_from: ""
    expires_at: ""

  safety:
    local_safe_set: []
    stop_conditions: []
    human_approval_required: false

  reporting:
    required_events: []
    evidence_required: []
    compensation_on_failure: []

  security:
    integrity: true
    confidentiality: true
    anti_replay: true
    signature: ""
```

---

# 附錄 D：Link Degradation Policy

```yaml
link_degradation_policy:
  healthy:
    allowed_classes: ["K1", "K2", "K3", "K4"]

  constrained:
    actions:
      - reduce_bandwidth
      - compress_data
      - extend_noncritical_reporting

  high_latency:
    actions:
      - disable_remote_closed_loop
      - increase_local_autonomy
      - batch_noncritical_data

  intermittent:
    actions:
      - activate_bundle_mode
      - shorten_offline_lease
      - preserve_local_evidence

  partitioned:
    actions:
      - freeze_C2
      - prohibit_C3
      - allow_C0
      - allow_limited_C1
```

---

# 附錄 E：Failover Record

```yaml
failover:
  id: ""
  flow_id: ""
  failover_epoch: 0
  old_path: ""
  new_path: ""
  reason: ""
  old_path_last_sequence: 0
  new_path_first_sequence: 0
  duplicate_elimination: true
  physical_command_idempotency_checked: false
  committed_at: ""
  evidence: []
```

---

# 附錄 F：系列血緣

```text
OSF
  站點與能力端
        ↓

PCD
  跨時間治理連續
        ↓

DFC
  中央、地方、紀元與權限
        ↓

本篇 HLF
  治理關係如何穿越有線、無線、光學、斷線與離線任務包
        ↓

第 9 篇
  站點、物件、區域、事件與可能行動如何形成共同世界模型
```
