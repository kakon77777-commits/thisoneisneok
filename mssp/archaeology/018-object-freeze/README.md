# 018 — `Object.freeze`：宣告「不可變」的人，沒有辦法說違反它代表什麼

> 上游是 ECMAScript 的 [`Object.freeze`](https://tc39.es/ecma262/#sec-object.freeze) 與兩個語言模式，
> 實作為 V8（BSD-3-Clause），跑在 Node.js（MIT）。版本由執行時量出來。
> 這一則不需要任何 I/O——一個凍結物件、一次賦值，全部在本機重現。

```bash
node src/main.mjs            # 同一次賦值，兩個模式
node src/main.mjs --strict   # 這個部署可能吞掉違反就 exit 1
node src/island_test.mjs     # 34 項檢查，全部直接跑真的內建函式，數字由它自己印
```

## 為什麼選它

同日的[範例 018](/html/mssp/018-who-the-declaration-serves.html) 主張**一份宣告到底幫了誰，是讀它的人決定的**。

`Object.freeze` 是這句話在語言本體裡的樣子：**宣告者說「不可變」，而「違反它會怎樣」完全由消費者決定，宣告者既說不出來也看不到。**

## 原專案的結構地圖

同一個凍結物件，同一行賦值：

```text
    object        mode     returned   actual   threw
    frozen        sloppy   999        100      -
    frozen        strict   -          100      TypeError: Cannot assign to read only property 'price'
    never frozen  sloppy   999        999      -
    never frozen  strict   999        999      -
```

**第一列是重點：運算式求值為 999，物件裡還是 100。**

```js
const v = (frozen.price = 999);   // v === 999
frozen.price;                     // 100
```

**讀運算式的人被告知寫入成功，讀物件的人被告知失敗。** 同一次寫入，兩個答案。

而**對照組**是第三、四列——一個**從來沒被凍結**的物件也回傳 999。所以 `returned` 不是「錯的」，是**沒有資訊**：它在成功與安靜失敗兩種情況下一模一樣。沒有這個對照組，「sloppy 回傳 999」不構成任何主張。

## 第二個發現：宣告者根本沒有被給那個欄位

```text
  Object.freeze.length = 1
```

**一個參數，就是那個物件。沒有第二個參數說違反代表什麼。** 而兩個模式的入口是**不同的語法構造**（module／class body／明示指示詞 對上 Function 建構子／eval／傳統 script），不是一個可以傳進去的設定——所以物件連自己被誰讀了都不知道。

這正是[範例 018](/html/mssp/018-who-the-declaration-serves.html) 的那句話：**方向不是宣告的性質，是宣告加上消費它的政策的性質。** 那一則的修法是把假設寫進 SCL 讓建置去量；`Object.freeze` 連寫的地方都沒有。

## 第三個發現：宣告比它讀起來的窄

```text
    frozen({ inner: { price: 100 } }), then inner.price = 999
    under both modes the nested value is now 999
```

**淺凍結。** 對內層物件的寫入在 **strict 模式下也不會拋**——這一次不是模式的問題，是宣告本身涵蓋的範圍比它的名字小。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 每個模式回不回報違反、怎麼進去，以及 `units` 對照 |
| SCL | 這個部署用哪個模式載入消費者、安靜的違反在這裡是不是致命的，以及**它伸不到哪裡** |
| SMS | 直接跑真內建函式的探針，包含那個從未凍結的對照物件 |
| TMS | 一個模式一個檔——各自宣告**回不回報違反**與**怎麼進去**，而且 import 任何東西都沒有 |
| DMS | `returned`／`actual`／`threw` 三欄**永遠一起印**——任何一欄單獨看都是同一個問題的不同答案 |

重切加的只有一件事：**模式要宣告它回不回報違反，而那份宣告用跑的驗。** 第 3b 節是鑽孔——一個宣稱回報、實際吞掉的模式必須被抓到。四個變異跑過，每一個都讓套件變紅，包含「對照組自己也被凍結」。

SCL 這裡多了一欄值得記：**`what_this_cannot_reach`**。凍結不會跟著物件走進一個 Function 建構子，所以部署可以規定自己怎麼載入消費者，規定不了別人怎麼把值再遞出去。**一份說得出自己伸不到哪裡的政策，比一份宣稱全面的政策誠實。**

## 什麼不適合拆

**凍結是對的。** 兩個模式底下物件都保住了原值——`Object.freeze` 做到了它說的那件事。

**sloppy 模式也不能事後修掉。** 它就是「沒有標記的程式碼」的意思，而那是為了不弄壞既有的網頁。ES modules 一律 strict，正是承認了這件事而且**只在新的入口上**改。

缺陷不在任何一邊，在於**違反的後果被定義在消費者那一側，而宣告者連問都問不到**。

## 這次沒有解決什麼

**量得到但這次沒量：** 真實程式碼裡有多少 `Object.freeze` 的消費者其實在 sloppy 邊界後面；`Object.isFrozen` 有多少呼叫端真的讀。

**這一則量不到：** 任何一位宣告者當初以為凍結會保證什麼。**它量的是介面讓什麼通過，不是誰誤解了什麼**——跟考古 015、016、017 同一句話。

**沒有做的：** `Object.seal` 與 `preventExtensions`。

**而 `Proxy` 順手量了一下，因為它是同一個語言裡把後果搬回宣告側的例子——量出來是一半：**

```text
    proxy invariant, sloppy read : TypeError      不變量違反，兩個模式都拋
    proxy invariant, strict read : TypeError
    proxy set trap false, sloppy : no throw       trap 自己回 false，照模式走
    proxy set trap false, strict : TypeError
```

**不變量**（`get` 對一個 non-configurable non-writable 屬性回不同的值）**不管消費者是哪個模式都拋**——那確實是把後果搬回宣告側。但 `set` trap **自己回 `false`** 的時候，行為跟普通賦值一模一樣。所以「Proxy 解決了這件事」是錯的：它只在**引擎自己要維護的那組不變量**上解決了，作者寫進 trap 的拒絕仍然由消費者決定意義。要把這個做成完整的一則需要新的探針，不是重讀既有輸出。
