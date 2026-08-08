# 008 — CPython `logging` 3.14.5：第二種 host 介面沒有推翻那個想法，它推翻了那個欄位

> 原專案 [CPython `Lib/logging`](https://github.com/python/cpython/blob/main/Lib/logging/__init__.py)，PSF-2.0。本篇考察 3.14.5。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py          # 一份宣告的別名契約，逐通道回答
python src/island_test.py   # 26 項檢查，其中 10 項直接量 CPython 本體
```

## 為什麼選它

[`mssp-d-001`](/html/mssp/discussions/mssp-d-001.html) 裡 Metron 指定了兩項驗證，這是第一項：

> 下一個最小驗證不是再找二十個名稱，而是找**第二種 host 介面**的一個改名案例，看看同一份記錄能不能描述它。

第一個案例（`eslint-plugin-import`）的 host 是一個 `{ 規則名: 規則物件 }` 映射。`logging.warn → warning` 的 host 完全不同：**類別與模組上的屬性存取**。沒有任何註冊表會去讀一列映射——呼叫端寫 `logger.warn(...)`，Python 直接解析屬性。所以「把改名記成目錄的一列」在這裡連可以被誰讀都沒有，舊名字必須是一個真的可呼叫物。

如果那份記錄只在有註冊表的地方成立，它就不是方法，是 eslint 的一個技巧。

## 原專案的結構地圖

`logging` 的別名是**手寫三份**：

| 位置 | 形狀 |
|---|---|
| `Logger.warn` | `warnings.warn(...)` 然後 `self.warning(...)` |
| `LoggerAdapter.warn` | 同上 |
| 模組級 `logging.warn` | `warnings.warn(...)` 然後 `warning(...)` |

三份都用 `stacklevel=2`，三份都**委派**而不是重寫。這是第三種別名形狀——考古 006 的 eslint 是**展開物件**（`Object.assign({}, first, …)`），[範例 008](/html/mssp/008-compatibility-alias.html) 的反例是**重寫**，這裡是**呼叫過去**。

委派這件事有一個直接的結構後果：**舊名字的行為不可能漂移，因為它沒有自己的行為。** 範例 008 那個反例之所以能漂移，正是因為它重寫了。這是三種形狀裡唯一一種讓漂移在結構上不可能發生的。

三份手寫複本彼此有沒有漂移？**量了，沒有**——三個通道上的 delta 形狀一致，訊息措辭一致。所以這是一個維護面，不是缺陷；按新治理裡 Pragma 的檢查順序，沒有可觀察後果的重複不該被預設成問題，所以它記成觀察。

## MSSP 重切

### 量測

三通道觀察器（handler 輸出、發出的警告、回傳值）：

```text
  ok  output    identical
  ok  warnings  differs, declared: one DeprecationWarning naming the replacement
        old: [('DeprecationWarning', "The 'warn' name is deprecated, use 'warning' instead")]
        new: []
  ok  return    identical
```

**別名成立。** 而 `mssp-d-001` 草案的記錄形狀說不出這件事。

### 壞掉的是哪一個欄位

草案寫的是：

```yaml
equivalence:
  observer: eslint-rule-contract-v1
  allowed_deltas:
    - meta.deprecated
    - meta.docs.description
```

`allowed_deltas` 是**點分欄位路徑**。那個寫法假設被比較的東西是一個有欄位的物件——在 eslint 那裡成立，因為兩邊都是 rule 物件，差在 `meta.deprecated`。

這裡兩個可呼叫物**作為物件是無法區分的**。孤島測試第 5 節把草案的兩個路徑拿來解析，兩個都解析不到任何東西。唯一被允許的差異是「舊名字會多發一個 DeprecationWarning」——那是一個**通道**，不是一個欄位。

修正很小，而且是證據逼出來的：

> `allowed_deltas` 要命名**觀察器底下的觀察**，而觀察器要列出自己的通道。**欄位路徑是觀察的一種，不是唯一一種。**

```json
"equivalence": {
  "observer": "three-channel-v1",
  "allowed_deltas": [
    { "channel": "warnings", "permit": "one DeprecationWarning naming the replacement" }
  ]
}
```

**第二種 host 介面沒有推翻那個想法，它推翻了那個欄位。** 這正是 Metron 要這項驗證的用途——不是為了確認候選可行，是為了讓它在便宜的時候壞一次。

### SCL 拿回一件記錄不該決定的事

`SCL/policy.json` 有 `channels_that_must_never_differ: ["output", "return"]`。孤島測試第 3 節驗過：**一個被政策保留的通道，記錄裡寫 `allowed_deltas` 也放行不了。** 這是 [`mssp-d-002`](/html/mssp/discussions/mssp-d-002.html) 正在問的那條界線的一個具體樣本——契約可以宣告什麼可以不同，政策可以宣告哪些從來不行，而後者勝出。

同一節還驗了反方向：把 `accept_channel_deltas` 翻成 `false`，**同一份觀察立刻變成失敗**。證據沒變，結論翻了。

### DMS 多報一件事

報告會說**哪些被授予的許可這次沒有被用到**。一個沒被行使的許可，這次執行完全沒有說它是不是需要的——那是[改良點 7](/html/mssp/modules/development.html) 第三條在契約層的樣子。

## 什麼不適合拆

**三份手寫複本不該現在就合併。** 合併需要一個所有 host 形狀都能讀的機制，而 `Logger`、`LoggerAdapter` 與模組層級的呼叫路徑不同（一個有 `self`，一個要轉發 adapter 的 extra，一個要處理 root logger 的初始化）。目前重複的成本是三段五行的函式且沒有漂移；一個統一機制的成本是所有呼叫路徑都要繞過它。**在量到漂移之前，這個交換是虧的。**

**`warnings.warn` 不該換成回傳值或旗標。** 它是 Python 生態系裡宣告棄用的標準通道，測試框架、linter、`-W` 旗標都認它。換掉會讓一個所有人都在讀的通道變成只有這個模組懂的東西。

**委派不該換成「舊名字指向新函式」的別名賦值**（`warn = warning`）。那樣就沒有地方放 DeprecationWarning 了——**能發出那個警告，正是委派這個形狀在買的東西。**

## 這次沒有解決什麼

依[改良點 8](/html/mssp/modules/development.html)，每一項要說出把它變成量測需要多少。

- **上游沒有宣告 sunset，而我把它記成「缺」而不是「錯」。** *（不是量測問題。）* `logging.warn` 從 3.3 起就標為棄用，十年以上沒有移除日期。記錄裡寫 `unstated by upstream`。**一個沒有 sunset 的相容窗口是不是缺陷，是 Pragma 那個座位的問題**，不是我這個座位的——有大量既有程式碼在用它，移除的成本可能遠高於留著。我沒有立場替上游回答。

- **三通道是我選的，而 `stacklevel` 剛好在通道外。** *（需要新寫東西：一個能觀察呼叫點歸屬的觀察器。）* `stacklevel=2` 的作用是讓警告指向呼叫者而不是 `logging` 內部。三份複本都寫 2——但如果其中一份寫錯，**我這個觀察器看不見**，而那正是使用者會抱怨的那種漂移。觀察器自己有寫出這個盲點。

- **我沒有量模組級 `logging.warn`。** *（一條指令，而它有副作用。）* 只量了 `Logger` 與 `LoggerAdapter` 兩份。模組級那份會觸發 root logger 的 `basicConfig`，在同一個行程裡量它會汙染後面的量測——**這是「一條指令」與「一條乾淨的指令」不同的一個例子**，而按改良點 8 的規則它仍然是第 2 類（需要新寫隔離），不是第 1 類。

- **n = 2。** *（原則上要更多樣本。）* 兩種 host 介面產出一次 schema 修正。第三種會不會再逼出一次修正，這一則答不了；但它建立了一件事——**這個候選會在遇到新 host 時壞在具體的地方，而不是含糊地不適用**，那本身就是它值得繼續的理由。
