# 014 — `URLSearchParams`：兩個「單值」讀法，各留一端，都不說話

> 原專案 [WHATWG URL Standard](https://url.spec.whatwg.org/)，在 Node 上的實作（MIT）。版本由執行時量出來。
> 這一則沒有重製任何原始碼，只對平台自己的 `URLSearchParams` 量行為。

```bash
node src/main.mjs            # 讀法、宣告驗證、mutator
node src/main.mjs --strict   # 宣告跟行為不一致就 exit 1
node src/island_test.mjs     # 26 項檢查，全部直接跑平台
```

## 為什麼選它

同日的[範例 014](/html/mssp/014-declared-arity.html) 主張 **arity 是契約的條款，不是 accessor 隨手決定的事**。那就要問：**這個決定在真實世界是在哪裡做的？** 答案是每一個 JavaScript web 應用的請求路徑上，而且做決定的不是作者。

## 原專案的結構地圖

一個鍵三個值——瀏覽器在兩個 checkbox 同名時就會這樣送：

```text
  tag=a&tag=b&tag=c&q=x

    get("tag")             "a"
    getAll("tag")          ["a","b","c"]
    Object.fromEntries     "c"
    has("tag")             true
    size                   4
    spread length          4
```

**`get` 留第一個。`Object.fromEntries` 留最後一個。兩個都不說。**

而且它們是**同一個物件的兩個單值讀法**，是最常被寫出來的兩種形狀。介面沒有任何地方可以問「你剛剛丟掉了什麼」——`has()` 說有、`size` 數的是 pair 不是 key，兩個都不碰多值這件事。

| accessor | 宣告 | 幾個活下來 | 留下什麼 |
|---|---|---|---|
| `get` | one | 1 / 3 | 第一個 |
| `from_entries` | one | 1 / 3 | 最後一個 |
| `get_all` | all | 3 / 3 | 全部 |
| `set` | one | 1 | 把所有值塌成一個 |
| `append` | all | 4 | 加一個，不動其他 |

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 五個 accessor、各自讓幾個值通過，以及 `units` 對照 |
| SCL | 這個部署拿哪一個 accessor 讀「它當成單值」的欄位 |
| SMS | 依 id 解析、**用跑的量存活數**，以及跑平台的探針 |
| TMS | 一個 accessor 一個檔——各自宣告留下什麼、幾個活下來，且不 import 任何東西 |
| DMS | 讀數、宣告對照行為的結果，以及看不到的部分 |

重切加的只有一件事：**每個 accessor 宣告自己讓幾個值通過**，而那份宣告用跑的驗。`URLSearchParams` 沒有這個——`get` 與 `Object.fromEntries` 都是單值讀，形狀一樣、留的那一端相反，而介面不提供任何辦法區分。

## 什麼不適合拆

**WHATWG 沒有做錯，不要「修」它。** 一個 query string **本來就允許重複**，所以一個單值 accessor 非選不可，而 `get` 就叫 `get`——它誠實地說了自己回傳一個值。

缺陷不在 `get` 回傳什麼，在於**呼叫端把它讀成在回答另一個問題**。這跟[考古 011](/html/mssp/archaeology/011-cpython-shelve.html) 的形狀相同：那裡也是同一個 API 兩種語義，而唯一分得出來的觀察沒有人會去看。

**`set` 與 `append` 也不適合合併。** 它們在呼叫端長得一模一樣、arity 相同，而在一個已經有兩個值的鍵上，`set` 留一個、`append` 留三個。那是兩個不同的操作，不是一個操作的兩種寫法。

## 這次沒有解決什麼

**我自己的檢查先錯了一次，而且是這個實驗室追了兩週的那一族。** 第一版把「all」的期望值寫死成 3，於是 `append` 被標成不一致——**它保留了全部三個，然後又加了一個，所以是 4**。錯的是檢查不是 accessor。改成從樣本量出基線之後五個都過，而且**把 `get` 故意標成 `all` 仍然會紅**（`!! get: declared all, measured 1`），所以修法沒有把檢查弄鬆。

**量得到但這次沒量：** 重複的鍵有多常是意外而不是設計；有多少框架預設把 params 轉成普通物件（那一步就是 `Object.fromEntries`）。

**這一則量不到：** 任何一位呼叫端當初以為 `get` 是什麼意思。**它量的是介面讓什麼通過，不是誰誤解了什麼。**
