# 016 — `Promise.all` / `Promise.allSettled`：做完的工作被丟掉，而且沒有人被告知丟了多少

> 上游是 ECMAScript 內建的兩個 combinator（[Promise.all](https://tc39.es/ecma262/#sec-promise.all)），
> 實作為 V8（BSD-3-Clause），跑在 Node.js（MIT）。版本由執行時量出來。
> 這一則沒有任何檔案系統或網路操作——四個 `setTimeout`，全部在本機重現。

```bash
node src/main.mjs            # 兩個 combinator，同樣四個 promise
node src/main.mjs --strict   # 這個部署丟掉了付過錢的工作就 exit 1
node src/island_test.mjs     # 34 項檢查，全部直接跑真的內建函式，數字由它自己印
```

## 為什麼選它

同日的[範例 016](/html/mssp/016-partial-and-complete.html) 主張**合併方式本身是一個宣告單元**——它宣告的是「已經成功的工作要怎麼辦」。

`Promise.all` 是那個宣告在上游最普遍、而且**沒有地方可以寫下來**的地方。它是每個人手指第一個打出來的東西，而它對已經回來的答案做的事，簽名上一個字都沒有。

## 原專案的結構地圖

四個成員，其中一個 reject：

```text
    combinator            kept   ran        reasons
    Promise.all           0      a,b,c,d    1
    Promise.allSettled    3      a,b,c,d    1
```

**兩邊四個成員都跑完了。** 三個 fulfilled 的值真的存在過，而從那個 rejection **一個都拿不回來**。

而**對照組**是這一則能不能說話的關鍵——同樣四個成員，沒有人 reject：

```text
    Promise.all           4      a,b,c,d    0
    Promise.allSettled    4      a,b,c,d    0
```

**一模一樣。** 所以上面那個落差是一句關於**失敗**的話，不是關於這兩個函式的話。沒有這個對照組，「allSettled 不一樣」不構成任何具體主張。

第二個量測，跟昨天的[考古 015](/html/mssp/archaeology/015-cpython-os-walk.html) 相反：

```text
                             values the caller receives
    rejecting member removed  3   ["a:ok","c:ok","d:ok"]
    rejecting member present  0   rejected: b broke
```

**把壞掉的成員移除，比留著讓它壞，拿到的還多。** 而且輸入沒有變小——留著的那次四個成員都跑了，移除的那次三個。

第三、**兩個成員 reject，抵達呼叫端的理由是 1 個**。第二個失敗不是延後回報、不是報去別的地方，是**沒有回報**。

第四、**rejection 什麼都不取消**。快的那個炸掉之後，慢的那個照樣 settle：

```text
  after the rejection, members settled so far: b
  ...and 100ms later:                          b,slow - nothing was cancelled
```

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 每個 combinator 保留什麼、浮出幾個理由，以及 `units` 對照 |
| SCL | 這個部署用哪一個，以及「丟掉做完的工作」在這裡是不是致命的 |
| SMS | 直接跑真內建函式的探針，每一個都記錄**哪些成員真的執行了** |
| TMS | 一個 combinator 一個檔——各自宣告**保留什麼**，而且 import 任何東西都沒有 |
| DMS | 呼叫端最後拿到什麼、什麼照樣跑了，以及它已經問不到什麼 |

重切加的只有一件事：**combinator 要宣告它保留什麼，而那份宣告用跑的驗。**

第 3b 節是鑽孔——一個**宣稱** `KEEPS_WHAT_SUCCEEDED: true`、實作卻是 `Promise.all` 的單元必須被抓到，而且誠實的兩個單元在同一支探針下宣告要成立。四個變異跑過，每一個都讓套件變紅（包括探針自己忘記記錄哪些成員跑過）。

## 什麼不適合拆

**`Promise.all` 的行為不適合改。** 一個必須全有或全無的交易要的正是它——三個寫入成功、一個失敗，這時候留下三個才是災難。`allSettled` 在 ES2020 進語言，正是因為**沒有一個語義適合所有人**。

缺陷不在它拋棄成功的值，在於**它拋棄的量沒有出現在任何地方**。呼叫端拿到一個 reason，而「有三個值曾經存在」這件事沒有通道可以講。這跟昨天 `os.walk` 是同一句話的兩面：那邊是吞掉錯誤、結果看起來完整；這邊是保住錯誤、把結果整個丟掉。**兩邊都只留下一個數字，而那個數字說不出發生過什麼。**

## 這次沒有解決什麼

**量得到但這次沒量：** 真實程式裡 `Promise.all` 的 rejection 有多少比例伴隨著至少一個 fulfilled 成員；有多少呼叫端在 catch 之後真的重跑了整批。

**這一則量不到：** 任何一位呼叫端當初以為 `Promise.all` 會怎麼處理已經回來的答案。**它量的是介面讓什麼通過，不是誰誤解了什麼**——跟考古 015 同一句話。

**還有一個沒做的：** `Promise.any` 與 `Promise.race` 是同一族的另外兩個點，這一則沒有把它們納入比較。加進來需要新的探針，不是重讀既有輸出。
