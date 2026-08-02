---
id: authority
index: "06"
title_zh: 迭代授權
title_en: Iteration authority
summary_zh: MSSP 可以被改到什麼程度，由誰決定，以及哪六條不能動。SSD 工程規格全文收在這裡。
summary_en: How far MSSP may be changed, who decides, and the six invariants that stay. The SSD engineering spec in full.
state_zh: 已生效
state_en: In force
updated: 2026-08-01
---

# 迭代授權：MSSP 可以被改到什麼程度

前面五個模組都在說 MSSP 該怎麼用。這一個說的是相反的事：**它可以被改成什麼樣子，而仍然算數。**

一個方法如果沒有寫下自己的修改條件，它的每一次修訂都只能靠作者當下的判斷背書；別人無法檢查那次修訂是進步還是走樣，接手的人也無法在不問作者的情況下往前走。〈SSD / Dynamic MSSP 工程規格與 MVP v0.1〉補上了這一塊，所以它放在這裡，而不是放在論文區。

三件事值得先講清楚，因為它們改變了[開發區](/html/mssp/modules/development.html)的工作方式：

**一、FMS／SMS／TMS／DMS 是可替換層。** 規格 §0 把分類名稱、表示法、工具鏈，連同「MSSP」這個名字本身，都列進可替換清單。留下來的是治理語義——責任、關鍵性、權限、效應、生命週期、可觀測性、治理。§38 甚至明講：未來的 MSSP Profile 即使不再使用 FMS、SMS、TMS 這些名稱，也不構成破壞。

**二、相容性是語義相容，不是命名相容。** 一個系統只要能回答 §2 那九個問題，就算 MSSP-compatible。所以「有沒有五個資料夾」不是判準，「能不能說清楚誰負責什麼、誰有權改什麼、宣告與實際差在哪裡」才是。

**三、有一條可以跑的驗收條件。** §57-F：移除 Dynamic MSSP Profile 之後，治理核心仍然要能運作。這條不是宣言，是會失敗的檢查——而目前 [EveMiss FPL](/html/research/evemiss-fpl.html) 過不了它：五個集合的名字在原始碼裡出現 87 次，其中 45 次在型別檢查器裡，也就是說那八條規則檢查的不是架構治理，是五個特定字串。這件事已經記在[開發日誌](/html/mssp/modules/log.html)。

不能動的只有六條，列在 §72：架構必須可表示；責任與權限必須可區分；宣告與現實必須可比較；非顯然的主張必須有證據；架構變更必須經過治理；模型本身必須可演化。

規格全文照錄於下。

---

## SSD / Dynamic MSSP 工程規格與 MVP v0.1

**文件類型：**工程規格＋MVP 實作基線  
**定位：**Software Structural Dynamics（SSD）工程化第一版  
**核心原則：**MSSP 的基底概念可保留；除核心治理語義外，其分類、模組、表示法、工具鏈與名稱皆可替換  
**版本：**v0.1  
**日期：**2026-08-01  

---

## 0. 核心決策

本文件首先固定一個最重要的工程決策：

> **Dynamic MSSP 不等於「把既有 MSSP 的所有模組分類加上 runtime telemetry」。**

Dynamic MSSP 的真正目的仍然是 MSSP 最初的目的：

> **更好地描述、理解、驗證、治理與演化計算機／軟體架構。**

因此，以下內容屬於**可替換層**：

- FMS / SMS / TMS / DMS 的具體分類名稱；
- SCL、Router、Runtime 的既有劃分方式；
- YAML / JSON / TOML / DSL；
- FPL 是否作為唯一描述語言；
- graph database 是否存在；
- rule engine 使用什麼產品；
- runtime telemetry 使用什麼產品；
- AI 使用什麼模型；
- 是否採單體、microservice、local-first 或 cloud；
- 是否保留「MSSP」名稱。

而真正需要保留的是更底層的**架構治理語義**。

因此本工程線採：

```text
Software Structural Dynamics
        ↓
SSD Governance Kernel
        ↓
Governance Profiles
        ├─ Dynamic MSSP Profile
        ├─ Plain Architecture Profile
        ├─ Microservice Profile
        ├─ Agentic System Profile
        └─ Future Profiles
        ↓
Adapters / Tooling / Runtime
```

也就是：

$$
\boxed{
SSD\ Core
\neq
MSSP\ Taxonomy
}
$$

而：

$$
\boxed{
Dynamic\ MSSP
=
SSD\ Governance\ Kernel
+
MSSP\ Governance\ Profile
}
$$

FPL 則定位為：

$$
\boxed{
FPL
=
Reference\ Specification / Projection / Adapter
}
$$

而不是 SSD Runtime 的硬依賴。

---

## 1. 專案暫名與分層

本文件暫時使用三個名稱。

### 1.1 SSD

**Software Structural Dynamics**

理論層。

回答：

> 軟體結構如何隨時間形成、演化、補償、凝固、轉移與被治理？

---

### 1.2 SGR

**SSD Governance Runtime**

工程 runtime 暫名。

它是一個與具體架構方法論解耦的治理核心。

SGR 不要求使用者必須採 MSSP。

---

### 1.3 Dynamic MSSP

SGR 的第一個官方 Governance Profile。

它提供 MSSP 世界中的：

- role；
- authority；
- effect；
- responsibility；
- evidence；
- compensation；
- lifecycle；
- governance semantics。

但它不強制保留舊版全部 taxonomy。

---

## 2. 最重要的相容性原則

本文不定義：

> 「符合 Dynamic MSSP = 必須有 FMS / SMS / TMS / DMS。」

而定義：

## MSSP Semantic Compatibility

一個系統只要能表達下列核心問題，就可以視為 MSSP-compatible：

1. **系統中有哪些架構實體？**
2. **它們承擔什麼責任？**
3. **它們能讀、寫、改變什麼？**
4. **它們與哪些其他實體形成有效依賴？**
5. **哪些內容是宣告的，哪些是觀察到的？**
6. **哪些判斷有證據，哪些仍不確定？**
7. **誰有權接受、拒絕或修改架構決策？**
8. **系統如何知道自己的架構正在發生變化？**
9. **系統如何安全地保留、替換或淘汰既有結構？**

因此：

$$
\boxed{
MSSP\ Compatibility
=
Semantic\ Compatibility
}
$$

而不是：

$$
MSSP\ Compatibility
=
Naming\ Compatibility
$$

---

## 3. SSD Governance Kernel：不可輕易破壞的核心

SGR v0.1 固定七個核心 primitive。

```text
Entity
Relation
Role
Authority
Evidence
State
GovernanceEvent
```

額外支援：

```text
Compensation
Burden
Context
Snapshot
```

這些 primitive 比 FMS / SMS / TMS 更底層。

---

## 4. Entity

任何需要被架構治理的東西都可以成為：

```text
Entity
```

例如：

- repository；
- package；
- module；
- service；
- database；
- table；
- queue；
- API；
- workflow；
- cron job；
- spreadsheet；
- deployment；
- human role；
- external SaaS；
- AI agent；
- policy；
- model；
- infrastructure resource。

最小表示：

```yaml
entity:
  id: payment-service
  kind: service
  name: Payment Service
```

SSD 不預設：

```text
software module
```

是唯一合法 entity。

---

## 5. Relation

Entity 之間可以有 typed relation。

MVP 至少支援：

```text
compile
runtime
data_read
data_write
event_publish
event_consume
interface
permission
deployment
test
human_operation
external
ai_context
recovery
compensation
```

例如：

```yaml
relation:
  from: checkout-service
  to: payment-service
  type: runtime
```

因此：

$$
D_{\text{effective}}
\supseteq
D_{\text{static}}
$$

是系統的預設假設。

---

## 6. Role

Role 不再是單一固定 enum。

核心格式：

```yaml
role_assertion:
  entity: payment-reconcile

  layer: declared | observed | effective

  role: critical_support

  context: production
  valid_from: ...
  valid_to: ...

  evidence_refs:
    - ev-103
    - ev-210
```

Role schema 可由 Profile 定義。

例如 MSSP Profile 可以使用：

```text
FMS
SMS
TMS
DMS
SCL
Router
Runtime
```

但另一個 Profile 可以使用：

```text
core
supporting
optional
experimental
deprecated
external
operator
```

甚至可以完全改成多維 role：

```yaml
role:
  criticality: high
  replaceability: low
  state_authority: high
  lifecycle: stable
```

因此：

$$
\boxed{
Role\ Model
=
Pluggable
}
$$

---

## 7. Declared / Observed / Effective

這是 SSD v0.1 的核心不變語義之一。

對任意 entity：

$$
R_d
=
Declared
$$

$$
R_o
=
Observed
$$

$$
R_e
=
Effective
$$

但這三層不只作用於 Role。

同樣可以作用於：

- dependency；
- authority；
- ownership；
- deployment；
- state；
- compensation。

例如：

```yaml
authority:
  declared:
    writes:
      - recommendation_cache

  observed:
    writes:
      - recommendation_cache
      - user_profile

  effective:
    writes:
      - recommendation_cache
      - user_profile
```

因此：

$$
Declared\neq Observed
$$

可以直接形成 Governance Event。

---

## 8. Authority

Authority 與 Role 分開。

因為：

> 一個模組是 SMS，不代表它自動有所有資料寫入權。

MVP 至少支援：

```text
read
write
mutate
execute
approve
deploy
delete
override
delegate
```

例如：

```yaml
authority:
  subject: payment-service

  allow:
    - action: write
      target: payment_state

  deny:
    - action: write
      target: user_identity
```

Policy enforcement 可以由 SGR 自己實作簡化版，

或接 OPA / Rego。

Open Policy Agent 的設計本身就是將：

```text
policy decision
```

與：

```text
policy enforcement
```

解耦，因此非常適合作為可選 adapter，而不是 SSD 的硬依賴。

---

## 9. Evidence

所有非純 deterministic 的架構判斷都必須能回溯到 evidence。

最小 Evidence：

```yaml
evidence:
  id: ev-103

  type: runtime_trace
  source: opentelemetry
  observed_at: 2026-08-01T12:00:00+08:00

  subject: recommendation-service

  claim_support:
    - "high activation rate"

  payload:
    activation_rate: 0.992

  freshness:
    window: 30d
```

Evidence source 可以包括：

```text
source_code
dependency_graph
git
runtime_trace
metric
log
event
schema
incident
ticket
ADR
runbook
human_assertion
external_contract
AI_analysis
```

---

## 10. Evidence Provenance

Evidence 至少需要：

```text
source
timestamp
subject
collector
hash / revision
freshness
confidence class
```

MVP 不要求完整 cryptographic ledger，

但要避免：

> AI 說它看過某件事，卻不知道它根據什麼。

---

## 11. Evidence Packet

所有需要 reasoning 的結論使用：

```yaml
evidence_packet:
  claim:
    "payment-reconcile behaves as critical core"

  evidence:
    - ev-103
    - ev-210
    - ev-551

  counterevidence:
    - ev-621

  confidence:
    level: medium_high

  inference:
    engine: llm
    model: optional

  authority:
    required:
      - architecture_owner
```

因此：

$$
\boxed{
Claim
+
Evidence
+
Counterevidence
+
Confidence
+
Authority
}
$$

是核心治理格式。

---

## 12. Confidence 不等於真實機率

MVP 的：

```text
confidence = high
```

只表示：

- evidence coverage；
- source consistency；
- freshness；
- inference stability。

不宣稱：

```text
0.84 = 84% probability of truth
```

除非未來完成真正 calibration。

---

## 13. State

SGR 的核心物件不是 document，而是：

## Architecture State

```yaml
architecture_state:
  timestamp: ...
  context: production

  entities: ...
  relations: ...
  role_assertions: ...
  authorities: ...
  compensations: ...
  burdens: ...
  evidence: ...
  governance_events: ...
```

概念上：

$$
\boxed{
\mathcal S(t,c)
=
(
A_d,
A_e,
\mathbf R,
\mathbf B,
N,
\mathbf C,
L_c,
\mathbf F_C,
\rho_g,
\mathbf E,
\mathbf Q
)
}
$$

---

## 14. Snapshot 與 Event

SGR 同時採：

```text
Snapshot
+
Event Log
```

Snapshot 方便查目前狀態。

Event Log 方便知道：

> 為什麼變成現在這樣？

最小事件：

```yaml
event:
  id: evt-8172
  type: dependency_added

  at: 2026-08-01T12:00:00+08:00

  subject: checkout-service

  object: fraud-service

  evidence:
    - ev-881
```

---

## 15. Architecture Event 類型

MVP 第一批事件：

```text
ENTITY_ADDED
ENTITY_REMOVED
DEPENDENCY_ADDED
DEPENDENCY_REMOVED
AUTHORITY_CHANGED
SCHEMA_CHANGED
ROLE_DECLARED
ROLE_DIVERGENCE
RUNTIME_USAGE_SHIFT
COMPENSATION_DISCOVERED
COMPENSATION_REPEATED
INCIDENT_OCCURRED
DEPRECATION_DETECTED
GOVERNANCE_DECISION
```

事件驅動：

$$
Event_t
\rightarrow
\Delta\mathcal S
$$

而不是每次重新分析整個 universe。

---

## 16. Compensation

補償在 SGR 中是一級物件。

```yaml
compensation:
  id: comp-001

  subject: settlement

  type:
    operational

  mechanism:
    manual_reconciliation

  target_gap:
    "automatic settlement mismatch"

  dependents:
    - finance-ops

  observability: medium

  substitutability: low

  owner:
    team: finance-platform

  status:
    active
```

Profile 可以增加：

```text
technical
human
operational
compatibility
external
governance
```

等分類。

---

## 17. Compensation Load

MVP 不先做 universal scalar。

先保留 evidence dimensions：

```yaml
compensation_load:
  dependence: high
  criticality: high
  maintenance_cost: medium
  removal_risk: high
  observability: low
  substitutability: low
  human_concentration: high
```

後續才可用：

$$
L_c
=
\sum_i w_i\ell_i
$$

生成 domain-specific score。

第一版重點是：

> 能解釋為什麼這個補償很重。

而不是假裝算出：

```text
Compensation Load = 78.3
```

---

## 18. Burden

MVP 支援：

```text
technical_debt
architecture_erosion
historical_residue
```

Necessary Complexity 獨立：

```text
necessary_complexity
```

避免把必要複雜度語義污染成 debt。

例如：

```yaml
burden:
  subject: legacy-auth-adapter

  technical_debt:
    level: medium

  architecture_erosion:
    level: low

  historical_residue:
    level: high

  necessary_complexity:
    level: low

  evidence:
    - ...
```

---

## 19. Governance Event

所有需要人類、policy 或更高 authority 處理的事情轉成：

```text
GovernanceEvent
```

MVP 類型：

```text
REVIEW_REQUIRED
ROLE_REVIEW_REQUIRED
AUTHORITY_REVIEW_REQUIRED
COMPENSATION_REVIEW_REQUIRED
DEPRECATION_CANDIDATE
MIGRATION_REQUIRED
ARCHITECTURE_DRIFT_ALERT
EVIDENCE_INSUFFICIENT
CONFLICTING_EVIDENCE
```

而不是：

```text
AI AUTO FIX
```

---

## 20. 核心治理原則

SGR v0.1 固定四條：

$$
\boxed{
Deterministic\ First
}
$$

$$
\boxed{
Evidence\ Before\ Inference
}
$$

$$
\boxed{
Authority\ Before\ Commit
}
$$

$$
\boxed{
Replacement\ Before\ Removal
}
$$

第五條建議：

$$
\boxed{
Reversible\ By\ Default
}
$$

---

## 21. Deterministic First

可以由：

- parser；
- AST；
- type checker；
- dependency graph；
- schema；
- policy；
- graph algorithm；

確定的事情，

不交給 LLM。

例如：

```text
A imports B
```

不用 AI。

```text
A writes forbidden table
```

如果有明確 telemetry / schema，

也不用 AI。

---

## 22. AI Sparse Reasoning

只有下列問題進 AI：

- 這個 workaround 實際承擔什麼責任？
- 這個模組是不是已經變成 effective core？
- 這個歷史結構還有沒有存在理由？
- conflicting evidence 怎麼解釋？
- ADR 與實作偏離是 violation 還是 evolution？
- 某個人工作流程是否已經成為 effective architecture？

因此：

$$
AI\ Cost
\propto
|UncertainCases|
$$

而不是：

$$
AI\ Cost
\propto
|Repository|
$$

---

## 23. AI 只能輸出 Hypothesis

AI output：

```yaml
hypothesis:
  type: role_shift

  subject: recommendation-service

  candidate:
    role: critical_core

  evidence:
    - ev-1
    - ev-2

  confidence:
    level: medium_high
```

AI 不能直接改：

```yaml
declared_role:
```

除非 governance policy 明確允許。

---

## 24. SGR 五層 runtime

MVP 架構：

```text
┌──────────────────────────────┐
│  5. Governance / Decision    │
├──────────────────────────────┤
│  4. Reasoning                │
├──────────────────────────────┤
│  3. Evidence / Observation   │
├──────────────────────────────┤
│  2. Architecture State / IR  │
├──────────────────────────────┤
│  1. Adapters / Collectors    │
└──────────────────────────────┘
```

---

## 25. Layer 1 — Adapters / Collectors

第一版：

```text
Repo Scanner
Git Adapter
Static Dependency Adapter
Config Adapter
OpenTelemetry Adapter
Manual Evidence Adapter
FPL Adapter
```

FPL Adapter 是 optional。

OpenTelemetry 的 Semantic Conventions 已提供跨 traces、metrics、logs、events、resources 的共通語義命名，因此非常適合拿來作 runtime evidence adapter，而不用自己發明 telemetry 協定。

---

## 26. Layer 2 — Architecture State / Neutral IR

核心要求：

> IR 不能是 MSSP taxonomy 的直接 serialization。

也就是不能寫成：

```text
IR = FMS + SMS + TMS + DMS
```

應寫成更中性：

```text
Entity
Relation
RoleAssertion
Authority
State
Evidence
Compensation
Burden
GovernanceEvent
```

MSSP Profile 再做 projection：

```text
Neutral IR
    ↓
MSSP Role Mapping
    ↓
SMS / TMS / ...
```

---

## 27. Layer 3 — Evidence / Observation

負責：

- static evidence；
- runtime evidence；
- historical evidence；
- operational evidence；
- human evidence。

第一版至少要做：

```text
evidence ingestion
deduplication
timestamp
source attribution
freshness
subject mapping
```

---

## 28. Layer 4 — Reasoning

由三種 engine 組成：

```text
Rule Engine
Trend / Statistical Engine
AI Reasoner
```

執行順序：

```text
deterministic
→ quantitative
→ semantic AI
```

不是反過來。

---

## 29. Layer 5 — Governance

Governance 層不負責「理解」。

它負責：

- acceptance；
- rejection；
- exception；
- migration；
- assignment；
- approval；
- audit；
- rollback。

可以接：

- local policy；
- GitHub PR；
- CI；
- OPA；
- human UI；
- agent governance。

---

## 30. 參考技術，但不綁技術

v0.1 可使用：

```text
Backend: Python / TypeScript / Rust 任一
Storage: SQLite 起步
Graph: NetworkX / SQLite relations
Telemetry: OpenTelemetry
Policy: internal rules → optional OPA
AI: provider-neutral
CLI: Typer / Click / equivalent
API: FastAPI / equivalent
```

但所有選擇都不是 SSD semantic requirement。

---

## 31. MVP 最小能力

MVP 只做六件事。

### M1 — Architecture Ingest

輸入：

- repository；
- optional FPL / YAML / JSON spec；
- git history。

輸出 Neutral IR。

---

### M2 — Static Architecture Scan

至少支援：

- module/package；
- imports；
- call/dependency approximation；
- config references；
- file ownership hints。

---

### M3 — Declared vs Observed Diff

輸出：

```text
declared dependency missing
undeclared dependency discovered
declared entity unused
observed entity undeclared
authority mismatch
```

---

### M4 — Evidence Packet

任一 warning 都能：

```text
explain
```

並列出：

- claim；
- evidence；
- counterevidence；
- confidence；
- source。

---

### M5 — Governance Event

將高價值問題轉成：

```text
ROLE_REVIEW_REQUIRED
ARCHITECTURE_DRIFT_ALERT
COMPENSATION_REVIEW_REQUIRED
```

而不是只有 console warning。

---

### M6 — AI Sparse Reasoning

只針對：

```text
ambiguous / contextual
```

case 呼叫模型。

例如：

> 根據 ADR、git history 與 runtime evidence，判斷此 undeclared dependency 更可能是 architecture drift 還是 legitimate evolution。

---

## 32. MVP 暫時不做

v0.1 明確不做：

- universal architecture health score；
- fully autonomous refactoring；
- production auto-mutation；
- full organization modeling；
- full causal inference；
- graph database cluster；
- complex agent swarm；
- multi-tenant SaaS；
- full IDE；
- full visual architecture studio；
- proprietary telemetry protocol；
- 自製 policy language。

---

## 33. MVP CLI

暫定：

```bash
sgr init
sgr scan
sgr ingest
sgr observe
sgr diff
sgr explain <event-id>
sgr review
sgr snapshot
sgr history
```

若使用 MSSP Profile：

```bash
sgr profile use mssp
```

若使用 FPL：

```bash
sgr ingest --adapter fpl ./architecture.fpl
```

所以沒有：

```text
必須先有 FPL 才能跑
```

---

## 34. MVP API

最低限度：

```http
POST /ingest
POST /scan
POST /evidence
GET  /state
GET  /entities/{id}
GET  /relations
GET  /events
GET  /events/{id}/explain
POST /events/{id}/decision
GET  /snapshots
```

---

## 35. Repository Layout

建議：

```text
ssd-governance-runtime/
│
├─ core/
│  ├─ entity/
│  ├─ relation/
│  ├─ state/
│  ├─ evidence/
│  ├─ governance/
│  └─ events/
│
├─ adapters/
│  ├─ repo/
│  ├─ git/
│  ├─ opentelemetry/
│  ├─ fpl/
│  └─ manual/
│
├─ profiles/
│  ├─ mssp/
│  └─ default/
│
├─ engines/
│  ├─ deterministic/
│  ├─ trend/
│  └─ ai/
│
├─ policy/
│
├─ storage/
│
├─ api/
├─ cli/
├─ tests/
└─ examples/
```

---

## 36. Neutral IR v0.1

最小 JSON：

```json
{
  "entities": [],
  "relations": [],
  "role_assertions": [],
  "authorities": [],
  "compensations": [],
  "burdens": [],
  "evidence": [],
  "events": []
}
```

這個 IR 必須：

```text
Profile-independent
Language-independent
Repository-independent
AI-provider-independent
```

---

## 37. Dynamic MSSP Profile

MSSP Profile 只負責：

```text
Role Vocabulary
Default Rules
Role Transition Hints
Evidence Expectations
Governance Policies
```

例如：

```yaml
profile:
  name: dynamic-mssp

  roles:
    - FMS
    - SMS
    - TMS
    - DMS
    - SCL
    - Router
    - Runtime

  rules:
    - id: sms-cannot-be-optional-at-runtime
      ...

    - id: tms-high-criticality-review
      ...
```

未來完全可以把 role vocabulary 改掉。

---

## 38. MSSP Profile v2 可以沒有 FMS / SMS / TMS

這一點刻意寫進規格：

> **未來新版 MSSP Profile 即使不再使用 FMS、SMS、TMS 名稱，也不構成對 SSD 或 MSSP 核心思想的破壞。**

只要仍然保留：

- responsibility；
- criticality；
- authority；
- effect；
- lifecycle；
- observability；
- governance；

就可以。

甚至更好的新版可能直接使用多維 role：

```yaml
role:
  criticality: 0.91
  replaceability: 0.18
  authority: write
  lifecycle: stable
  runtime_usage: 0.97
```

而不是：

```text
SMS / TMS
```

---

## 39. FPL 的新定位

FPL 不再被視為：

> Dynamic MSSP 的唯一語言。

而是：

## Architecture Projection Language

可以負責：

```text
Authoring
Validation
Generation
Migration
Projection
```

關係：

$$
Problem\ World
\rightarrow
Neutral\ Architecture\ IR
\leftrightarrow
FPL
$$

FPL 是一個很好的人類＋AI authoring surface，

但 runtime state 不應只能存在 FPL 文字裡。

---

## 40. Policy-as-Code Adapter

SGR 可以自己實作最小規則：

```yaml
rule:
  when:
    relation.type: data_write
    target.classification: restricted

  require:
    authority.write: true
```

後續再可選編譯／映射到 OPA。

OPA 本身提供 general-purpose policy engine，並將 policy decision 與 enforcement 解耦；因此很適合作為 mature policy backend，而非 SSD 核心本體。

---

## 41. Runtime Evidence Adapter

OpenTelemetry v0.1 Adapter 讀：

```text
spans
metrics
logs
events
resources
```

利用 semantic conventions 做：

```text
service identity
operation identity
database interaction
RPC
messaging
errors
```

的統一映射。

不要求使用者為 SSD 重新埋一套 telemetry。

---

## 42. Architecture Conformance

MVP 同時支援：

```text
hard violation
```

與：

```text
distance / drift
```

概念：

$$
\delta_A(t)
=
D(A_d,A_o(t))
$$

但 v0.1 不追求 universal mathematical distance。

可以先以：

```text
number of weighted divergences
+
severity
+
persistence
```

表示。

Continuous Conformance 的研究已證明 architecture conformance 可以被處理成 multi-level、incremental、non-blocking 的 distance，而不必全部轉成 CI hard failure。

---

## 43. Observed 不等於 Effective

即使 runtime 發現：

```text
A → B
```

也不表示：

```text
B = core
```

Observed 只是 facts。

Effective 是 inference。

所以：

```text
Observation
→ Evidence
→ Interpretation
```

不可省略。

---

## 44. Effective 不等於 Declared

Effective model 也不能直接覆蓋 declared model。

例如：

```text
observed:
  payment-service writes user-profile
```

可能表示：

- legitimate evolution；
- temporary migration；
- architecture violation；
- incident workaround。

所以：

$$
A_o\neq A_e\neq A_d
$$

在 SGR 中都被保留。

---

## 45. Unknown 是合法狀態

MVP 必須支援：

```text
unknown
pending
disputed
exception
insufficient_evidence
```

不能強迫 AI：

> 一定選 SMS 或 TMS。

這和 Program Ontology 中：

$$
x\notin M
\nRightarrow
\neg x
$$

一致。

---

## 46. Time Window

所有 observed evidence 支援：

```text
24h
7d
30d
90d
180d
custom
```

例如：

```yaml
observation:
  metric: runtime_required_rate
  value: 0.99
  window: 30d
```

避免一次尖峰造成角色 flapping。

---

## 47. Context

同一 Entity 可以：

```text
normal = optional
disaster_recovery = critical
migration = transitional
```

因此：

```yaml
context:
  mode: disaster_recovery
```

是一級維度。

---

## 48. Role Hysteresis

只有：

```text
evidence persistence
+
confidence threshold
+
criticality
```

達標，

才產生：

```text
ROLE_REVIEW_REQUIRED
```

而不是即時自動 reclassify。

---

## 49. Governance Decision

最小 decision：

```yaml
decision:
  event: evt-001

  outcome:
    accept
    reject
    defer
    exception
    migrate

  authority:
    actor: architecture-owner

  reason:
    "Temporary migration path until 2026-10"

  review_at:
    2026-10-01
```

---

## 50. Append-Only Decision History

MVP 建議：

```text
State 可更新
Decision History append-only
```

避免：

> 今天改了 architecture，明天完全不知道以前為什麼這樣。

---

## 51. AI Provider Abstraction

AI interface：

```python
reason(case, evidence_packet, policy_context) -> hypothesis
```

輸入禁止直接是：

```text
entire repo dump
```

而應先經 deterministic selection。

---

## 52. AI Context Pack

AI 最小 context：

```text
Question
Relevant Entities
Relevant Relations
Relevant Evidence
Relevant ADR
Relevant History
Counterevidence
Allowed Actions
```

這就是 GCMS／context retrieval 類方法未來可以接入的位置，

但 SGR v0.1 不綁具體記憶系統。

---

## 53. AI Output Schema

```json
{
  "hypothesis": "...",
  "classification": "...",
  "supporting_evidence": [],
  "counterevidence": [],
  "uncertainties": [],
  "suggested_actions": [],
  "confidence": "medium"
}
```

禁止 AI 回：

```text
I fixed it.
```

除非另外進 execution pipeline。

---

## 54. MVP Demo Scenario

建議第一個 demo repository 建立：

```text
order-service
payment-service
recommendation-service
reconcile-job
postgres
```

Declared：

```text
recommendation = optional
reconcile-job = temporary
```

Runtime 模擬：

```text
recommendation used by 99%
reconcile-job required every night
```

SGR 應偵測：

```text
ROLE_DIVERGENCE
COMPENSATION_SOLIDIFICATION_CANDIDATE
```

並產 Evidence Packet。

---

## 55. 第二個 Demo Scenario

Declared：

```text
payment-service
cannot write user-profile
```

Source 沒有直接 dependency。

Runtime trace / DB audit 發現：

```text
payment-service → user_profile UPDATE
```

SGR 輸出：

```text
AUTHORITY_REVIEW_REQUIRED
```

這可以直接展示：

> Static dependency graph 看不到的 effective dependency。

---

## 56. 第三個 Demo Scenario

舊 adapter：

```text
legacy-auth-adapter
```

Git 顯示：

```text
2019 introduced for v1 clients
```

目前：

```text
0 external callers
2 internal recovery scripts
```

SGR 不應直接輸出：

```text
DELETE
```

而應：

```text
DEPRECATION_CANDIDATE
replacement_before_removal = required
```

---

## 57. MVP Acceptance Criteria

MVP 完成定義：

### A. Neutral IR

可以成功表示至少：

- service；
- database；
- manual workflow；
- AI agent。

---

### B. Declared / Observed Diff

能偵測至少：

- undeclared dependency；
- unused declared entity；
- authority mismatch。

---

### C. Evidence Traceability

任一 warning 都能回答：

> 根據什麼？

---

### D. AI Sparse

至少一種 ambiguous case 能：

```text
rule engine abstain
→ AI reason
→ evidence-backed hypothesis
```

---

### E. Governance

能：

```text
accept / reject / defer / exception
```

且保留 decision history。

---

### F. Profile Swap

移除 Dynamic MSSP Profile 後，

SGR 核心仍然能運作。

這一條非常重要。

它直接驗證：

$$
\boxed{
SSD\ Runtime
\neq
MSSP\ Hardcode
}
$$

---

## 58. 測試策略

MVP 至少：

```text
Unit Tests
IR Schema Tests
Adapter Tests
Golden Repository Tests
Policy Tests
AI Contract Tests
Regression Snapshots
```

AI test 不測：

> 每次文字完全相同。

而測：

- schema valid；
- evidence refs valid；
- forbidden action absent；
- uncertainty retained。

---

## 59. False Positive Budget

Architecture governance tool 最大風險之一是：

```text
warning fatigue
```

所以 v0.1 建立：

## False Positive Budget

High severity event 必須：

```text
high evidence
or
deterministic proof
```

低信心推論：

```text
OBSERVATION
```

不要：

```text
ERROR
```

---

## 60. Severity

建議：

```text
ERROR
WARNING
ADVISORY
OBSERVATION
```

其中：

### ERROR

明確 deterministic policy violation。

### WARNING

高信心、高影響 drift。

### ADVISORY

需要 review 的 hypothesis。

### OBSERVATION

趨勢或低信心訊號。

---

## 61. Performance

MVP 不追求 real-time architecture reconstruction。

目標：

```text
PR / commit triggered
+
periodic runtime aggregation
```

例如：

```text
on PR
on merge
hourly runtime digest
daily architecture snapshot
```

避免過度消耗。

---

## 62. Storage

MVP：

```text
SQLite
```

足夠。

表：

```text
entities
relations
role_assertions
authorities
evidence
compensations
burdens
events
decisions
snapshots
```

等需要 graph query 再升級。

---

## 63. Privacy

Runtime evidence 預設不儲存：

- request body；
- personal content；
- secrets；
- full prompt；
- full source unless needed。

SGR 儲存：

```text
metadata
reference
hash
aggregate
```

優先。

---

## 64. Security

AI Reasoner 預設 read-only。

它不可直接：

```text
merge
deploy
delete
change policy
```

除非額外 profile + authority 開放。

---

## 65. Phase 0 — Spec Kernel

完成：

```text
Neutral IR
Event Schema
Evidence Schema
Governance Schema
Profile Interface
```

---

## 66. Phase 1 — Static MVP

完成：

```text
Repo Scanner
Git Adapter
Dependency Graph
Declared Diff
CLI
SQLite
```

此時已可作為：

## Architecture Drift Analyzer

---

## 67. Phase 2 — Dynamic Evidence

加入：

```text
OpenTelemetry Adapter
Runtime Usage
Data Flow
Observation Window
Trend
```

此時才真正成為：

## Dynamic Architecture Observer

---

## 68. Phase 3 — AI Sparse Reasoning

加入：

```text
context pack
evidence packet
AI hypothesis
confidence
counterevidence
```

此時成為：

## AI-Assisted Architecture Governance

---

## 69. Phase 4 — Governance Runtime

加入：

```text
authority
decision
exception
migration
review deadline
policy adapter
```

此時 SGR v1.0 才算真正成立。

---

## 70. Phase 5 — Optional Dynamic MSSP Full Profile

再決定：

- SMS/TMS 是否繼續；
- FMS 是否需要；
- Router 是否獨立；
- SCL 是否改造成 Authority Model；
- DMS 是否直接併入 Evidence Layer。

也就是：

> **先讓 SSD Kernel 工作，再重新判斷 MSSP 哪些舊分類值得留下。**

---

## 71. 對舊 MSSP 的可能重構

本文件不直接宣布以下改動，

但工程上可測試：

```text
FMS
→ Architecture Narrative / Intent Layer

SMS/TMS
→ Role / Criticality / Replaceability dimensions

DMS
→ Evidence & Observability Layer

SCL
→ Authority / Governance Layer

Router
→ Policy / Selection Engine

Runtime
→ Execution Adapter
```

如果這種表示更好，

就可以使用。

MSSP 不應保護自己的舊名詞，

而應保護：

> **架構可理解、可驗證、可治理的目的。**

---

## 72. Dynamic MSSP 最小不變量

因此最後只固定六條：

### I1 — Architecture must be representable

架構不能只存在人腦。

---

### I2 — Responsibility and authority must be distinguishable

誰負責與誰有權改，不能混為一談。

---

### I3 — Declared and effective reality must be comparable

規格必須能與現實比較。

---

### I4 — Non-trivial claims require evidence

架構判斷必須可追溯。

---

### I5 — Architectural change requires governance

推論不等於決策。

---

### I6 — Architecture must be evolvable

模型本身必須允許：

```text
unknown
context
history
migration
replacement
```

---

## 73. 如果未來連「MSSP」都不適合了呢？

允許。

如果研究最後得到：

```text
MSSP v1
→ Dynamic MSSP
→ SSD Governance Runtime
→ New Architecture Governance Model
```

也沒有問題。

因為 MSSP 最初不是宗教或終極本體。

它只是：

> **為了更好管理計算機架構而建立的方法。**

如果未來存在：

$$
M'
$$

使：

$$
Governability(M')
>
Governability(MSSP)
$$

那麼：

$$
MSSP
\rightarrow
M'
$$

就是合理演化。

甚至可以說：

> 一個真正符合 Dynamic MSSP 精神的系統，理論上必須允許「Dynamic MSSP 自己被更好的方法替代」。

---

## 74. 這也是 SSD 與 MSSP 最重要的關係

SSD 比 MSSP 更底層。

SSD 描述：

> 軟體結構本身就是演化中的狀態。

因此 MSSP 也只是：

$$
A_{\text{method}}(t)
$$

的一部分。

既然：

$$
A(t)
$$

可以演化，

那麼：

$$
MSSP(t)
$$

當然也可以演化。

所以：

$$
\boxed{
Dynamic\ MSSP
\text{ must be dynamically replaceable}
}
$$

這並不是自我否定。

反而是它真正完成「動態」的地方。

---

## 75. MVP 最終一句話

第一個 MVP 不做：

> AI 自動治理所有軟體。

只做：

> **把「架構規格」和「實際觀察到的系統」放到同一個 Neutral IR 中，找出高價值差異，附上證據，在必要時才讓 AI 解釋，最後交由治理機制決定要不要改。**

即：

$$
\boxed{
Declared
+
Observed
\rightarrow
Evidence
\rightarrow
Difference
\rightarrow
Reasoning
\rightarrow
Governance
}
$$

只要這條跑通，

SSD / Dynamic MSSP 工程線就真正從論文進入可執行系統。

---

## 76. v0.1 最終架構

```text
                     ┌─────────────────────┐
                     │ Governance Profiles │
                     │ MSSP / Other / AI   │
                     └──────────┬──────────┘
                                │
┌──────────────┐       ┌────────▼────────┐
│ Repo / Git   │──────▶│                 │
├──────────────┤       │ Neutral SSD IR  │
│ FPL Optional │──────▶│                 │
├──────────────┤       └────────┬────────┘
│ OpenTelemetry│──────▶         │
├──────────────┤                ▼
│ Manual/ADR   │──────▶ ┌────────────────┐
└──────────────┘        │ Evidence Engine │
                        └───────┬────────┘
                                ▼
                ┌──────────────────────────┐
                │ Deterministic Validator  │
                │ Trend Analyzer           │
                │ AI Sparse Reasoner       │
                └────────────┬─────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Governance Event │
                    └─────────┬────────┘
                              ▼
                    ┌──────────────────┐
                    │ Human / Policy   │
                    │ Decision         │
                    └─────────┬────────┘
                              ▼
                       Architecture
                          State Δ
```

---

## 77. 結論

SSD / Dynamic MSSP 工程線的目的不是：

> 建立另一個巨大的架構框架。

而是建立一個最小、可替換、可觀測的治理 substrate。

它不要求：

- 一定使用 MSSP 舊 taxonomy；
- 一定使用 FPL；
- 一定使用某個 AI；
- 一定使用某個資料庫；
- 一定使用某個 policy engine。

它只要求：

$$
\boxed{
Architecture
\text{ can be}
\begin{cases}
represented\\
observed\\
compared\\
explained\\
governed\\
evolved
\end{cases}
}
$$

因此最終：

$$
\boxed{
MSSP
\text{ is a means, not the invariant}
}
$$

真正的不變量是：

$$
\boxed{
Better\ Architecture\ Governability
}
$$

而 SSD Governance Runtime 的任務就是：

> **讓任何架構方法論，都能有機會從靜態文件變成可觀察、可追蹤、可證據化、可演化的計算機架構治理系統。**

---

## 參考與工程對照

1. Bucaioni, A., Di Salle, A., Iovino, L., Mariani, L., & Pelliccione, P. (2024). *Continuous Conformance of Software Architectures*. IEEE ICSA 2024. DOI: 10.1109/ICSA59870.2024.00019.
2. Blair, G., Bencomo, N., & France, R. B. (2009). *Models@run.time*. Computer, 42(10), 22–27. DOI: 10.1109/MC.2009.326.
3. ArchUnit. *ArchUnit User Guide*. https://www.archunit.org/userguide/html/000_Index.html
4. OpenTelemetry. *Semantic Conventions*. https://opentelemetry.io/docs/specs/semconv/
5. Open Policy Agent. *OPA Documentation*. https://www.openpolicyagent.org/docs
6. Neo.K / EveMissLab. 《表觀完好系統：從軟體屎山、補償性完整到動態架構治理》12 篇系列，Software Structural Dynamics v1.0.
7. Neo.K / EveMissLab. MSSP / FPL / Program Ontology 既有工程與理論文件。


