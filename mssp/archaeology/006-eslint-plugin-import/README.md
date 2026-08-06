# 006 — eslint-plugin-import 2.32.0：46 條規則裡只有一個碰到兄弟，而那一個是改名

> 原專案 [import-js/eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)，MIT。本篇考察 2.32.0。
> 所有數字都是對本站 `node_modules` 裡那一份量出來的。

```bash
node src/main.js          # 用舊名字啟用一條規則，看它解析到哪裡
node src/island-test.js   # 26 項檢查，其中 10 項直接量上游與本倉庫
```

## 為什麼選它

今天的[範例 006](/html/mssp/006-compiler-enforced.html) 把依賴規則交給了 cargo：未宣告的兄弟引用**編譯不過**。寫完之後該問的問題是——**沒有那種工具鏈的生態系，是怎麼過日子的？**

答案在本站自己的 `node_modules` 裡，而且量得出來：

```text
  declared in package.json    :  25
  installed packages          : 475
  requireable but undeclared  : 450
```

`require.resolve('@alloc/quick-lru')` 成功，而它在 `dependencies` 跟 `devDependencies` 裡都沒有。**450 個套件這個專案碰得到卻從來沒宣告過**，這不是失誤，是 npm 扁平化安裝的正常結果。

`eslint-plugin-import` 存在的理由就是把這個保證撿回來——它有一條規則叫 `no-extraneous-dependencies`。**一個 linter 規則，用來補回套件管理器讓掉的東西。** 那讓它成為範例 006 的正確對照面。

## 原專案的結構地圖

| | |
|---|---|
| 規則檔 | **46** |
| 預設 config | 8 |
| 向上取用共用核心（`../`） | **79** |
| 取用套件 | 108 |
| **引用兄弟規則（`./`）** | **1** |

共用核心是一個**獨立的套件**：`eslint-module-utils`。也就是說 SMS 不只是上層目錄，它連發佈邊界都分開了。

規則之間幾乎完全不相識——**45 / 46 是孤島**。這個比例比我到目前為止考察過的任何一個上游都乾淨。

## MSSP 重切

那唯一的一次是什麼，值得整段引出來：

```js
// lib/rules/imports-first.js
var first = require('./first');

var newMeta = Object.assign({}, first.meta, {
  deprecated: true,
  docs: { description: 'Replaced by `import/first`.' } });

module.exports = Object.assign({}, first, { meta: newMeta });
```

**那不是一條規則去拿兄弟的能力。那是改名時把舊門留著。** `imports-first` 是 `first` 的舊名字，這個檔案唯一做的事就是把新規則原封不動轉出去，並在 meta 上蓋一個 `deprecated: true`。

### 問題是 MSSP 自己

- [模組 02](/html/mssp/modules/patterns.html)：**沒有任何 TMS 引用兄弟 TMS**。這條規則的違反在審閱中看不見，而且它會摧毀「TMS 可以單獨載入」的主張。
- [模組 06 迭代授權](/html/mssp/modules/authority.html)：**替代先於移除**。舊名字不能直接消失，取代它的東西要先在位。

`imports-first.js` 同時滿足其中一條、違反另一條。而**方法沒有任何地方說過這兩條會撞在一起**。

重切的修法是：**改名是關於目錄的事實，不是關於檔案的事實。**

```console
$ node src/main.js

== rules
  ok  rules/first               <- requested as rules/imports-first, renamed in 2.0.0
  ok  rules/no-self-import

== what this run does not say
  lines scanned                    4
  enabled, loaded, found nothing   none
  deprecated names resolved        rules/imports-first -> rules/first
```

`FMS/catalogue.json` 裡有一筆 `renames`，SMS 的 registry 在載入前解析它。結果是：**沒有任何規則檔提到另一個規則檔**（孤島測試第 1 節逐檔驗過），舊名字照常運作，而且**解析這件事出現在執行報告裡**，就在它產生的結果旁邊——不是在 eslint 自己的 deprecation 通道裡等人去看。

### 這次順手抓到自己的第三個洞

要驗「我的建置會不會把別名當違規」，就得先種一個進去。種下去之後：**建置全綠。**

原因是那條規則的 pattern 是 `import ... from`，而別名是用 `export ... from` 寫的。順著查下去，`import "./x"`（純副作用）也一樣看不見。

| 寫法 | 修之前 | 修之後 |
|---|---|---|
| `import { x } from "./y"` | 抓到 | 抓到 |
| `export { x } from "./y"` | **看不見** | 抓到 |
| `export * from "./y"` | **看不見** | 抓到 |
| `import "./y"` | **看不見** | 抓到 |

本週第三個同一條檢查的洞：08-03 是**語言**（Python 沒跑）、今天早上是**未知語言不出聲**、這個是**語法**（同一個語言裡的另一種寫法）。三次都是同一句話——**檢查覆蓋的是它列舉到的東西，而沒列到的那些，沉默起來跟通過一模一樣。**

## 什麼不適合拆

**`eslint-module-utils` 不該被拆進規則裡。** 79 次向上取用不是耦合，是**共用核心被正確地共用**。把 `resolve`、`moduleVisitor`、`ExportMap` 複製 46 份才是災難，而且那正是一個誤讀「TMS 不能有依賴」會做出來的事——規則不能依賴**兄弟**，向上依賴 SMS 是它應該做的事。

**46 條規則不該合併成幾個大規則。** 它們共用的是機制不是決定：`no-cycle` 跟 `order` 都走 import 圖，但「什麼算問題」完全無關。合併會讓一個使用者為了關掉一條而失去另一條。

**別名檔在 eslint 的 API 下是自然的形狀，不是錯誤。** eslint 的 plugin 介面收的是一個 `{ ruleName: ruleObject }` 物件——**沒有地方可以放「這個名字是那個名字的舊稱」**。上游沒有目錄可以記錄改名，所以改名只能變成一個檔案。我的重切能做得不一樣，是因為我有一個 registry；那是介面差異，不是判斷差異。

## 這次沒有解決什麼

依[改良點 8](/html/mssp/modules/development.html)，每一項要說出把它變成量測需要多少。

- **模組 02 與模組 06 的牴觸，我只指出了它，沒有解掉。** *（需要新寫東西：一條判準。）* 重切示範了「別名可以是目錄裡的一筆記錄」，但方法還是沒說：當一個 TMS 真的必須提到另一個 TMS 時，怎麼分辨「切錯了」跟「這是一次改名」。我的建置現在兩者都擋，而**擋下一次合法的改名是誤報**。

- **n = 1，而且是我挑的那個 1。** *（原則上要更多樣本。）* 45/46 很乾淨，但我沒有第二個 46 單元規模的上游可以比。這個比例是不是 eslint 生態的常態、還是這個專案維護得特別好，一則考古回答不了。

- **`no-extraneous-dependencies` 我沒有跑。** *（一條指令：拿它掃這個倉庫。）* 按改良點 8 自己的規則，這是**還沒做的工作，不是限制**。我沒做是因為要先設好 eslint 設定檔而那會改動倉庫狀態，而今天已經改了兩個建置腳本——但這個理由是「我選擇不做」，不是「做不到」，寫在這裡就是要它看起來是前者。

- **450 這個數字只說得出可達性，說不出真的被用了幾個。** *（需要新寫東西：一次跨全倉庫的靜態解析。）* 「可以 require」跟「有程式碼真的 require 了一個沒宣告的套件」是兩件事，而後者才是缺陷。前者是條件，我量的是條件。

- **我沒有量修好那三種寫法之後，既有的五個範例與五則考古裡有沒有藏著違規。** *（一條指令：清空重跑，而我跑了——全綠。）* 這一項本來要寫進限制，但它一條指令就能量，所以它不是限制：**修完之後對現有十則跑過，沒有新的違規冒出來。** 這代表那三個洞在這個語料庫裡從來沒有被踩到過，也代表它們一直沒有被測試過。
