# 020 — Rust `Result` 與 `#[must_use]`：取值被強制，丟棄沒有

> 上游是 Rust 的 [`Result`](https://doc.rust-lang.org/std/result/) 與 `unused_must_use` lint，
> 用**真的跑 rustc** 量出來（Apache-2.0 / MIT 雙授權）。版本由執行時量出來。
> 這一則需要本機有 rust 工具鏈；沒有的時候它**拒絕回報**，不猜。

```bash
node src/main.mjs            # 五種寫法，每一列都是真的跑過的 cargo build
node src/main.mjs --strict   # 這個部署的 lint 設定有缺口就 exit 1
node src/island_test.mjs     # 39 項檢查，數字由它自己印
```

## 為什麼選它

同日的[範例 020](/html/mssp/020-declare-capacity-not-state.html) 主張**宣告你能觀察什麼，不要宣告你是什麼**，理由是**能力宣告可以被測試**。

`Result<T, E>` 就是那句話變成結構：它是一份**「我可能是錯的」的能力宣告**，而編譯器在**值被使用的地方**強制執行它。這是這 20 則裡唯一一個上游把宣告變成**編譯期義務**的例子——所以它適合當最後一則。

## 原專案的結構地圖

```text
    route                compiles   must_use warning   error
    bare call            yes        yes                -
    let _ = ...          yes        -                  -
    .unwrap_or(0)        yes        -                  -
    let v: i32 = ...     NO         -                  E0308
    match { Ok, Err }    yes        -                  -
```

**對照組是最後一列。** 把處理寫出來，編過、沒有警告。沒有它，「`let _ = ...` 編過而且乾淨」跟「所有寫法都編過而且乾淨」一模一樣，不構成任何主張。

**界線是兩句話：**

- **取值被強制。** `let v: i32 = fallible();` **編不過**——`E0308`，型別錯誤，不需要任何 lint。你不可能在不對 `Err` 說點什麼的情況下把 `T` 拿出來。
- **丟棄沒有。** 整個丟掉是一個警告；`let _ = ...` **連警告都沒有**。

而最有意思的一列在下面：

```text
  and with the consumer's own deny(unused_must_use):
    bare call            NO         as an ERROR        -
    let _ = ...          yes        -                  -
```

**`let _ = ...` 在語言提供的最嚴設定底下照樣編過，而且什麼都沒說。** 也就是說：剩下那個訊號有多強，是**消費者的設定**決定的——那正是[改良點 16](/html/mssp/modules/development.html)（宣告的方向由消費它的政策決定）出現在一個型別系統裡面。

## 儀器自己錯過，而且我對它的第二個診斷是編的

這一則的第一版**每一個編得過的寫法都報「沒有警告」**。原因：**cargo 的診斷寫在 stderr，而且警告時 exit 0**，`execFileSync` 的回傳值只有 stdout。改用 `spawnSync` 就對了。

**然後我在旁邊寫了第二個原因，而它不是真的。** 我寫「共用一個 package 名 + 共用 target 目錄會讓 cargo 用快取單元回答，於是後面的探針全都安靜」。把那個缺陷**加回去的變異保持綠色**——這一輪第一次有變異沒有變紅。去量才知道為什麼：

```text
  PASS  building the same directory twice really does hit the cache the second time - first Compiling, second Finished
  PASS  and the cached build REPLAYS the warning rather than going quiet
```

**快取命中的建置會把診斷重播出來。** 那個危害不存在。第 2 節現在**量它**，而不是斷言它。

（順帶量到第三件事：第一版的快取探針**每次都重寫 `main.rs`**，所以檔案 mtime 一直變、cargo 永遠重編，那支探針從來沒看過一次快取命中。要觀察快取，就不能碰來源。）

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 每種寫法宣告什麼、量到什麼，**儀器自己的失敗模式**，以及 `units` 對照 |
| SCL | 這個部署的 lint 設定，以及那個設定**伸不到哪裡** |
| SMS | 編譯器探針——每一列都是真的跑過的 `cargo build` |
| TMS | 一種寫法一個檔——各自帶著自己的片段與**它對編譯器的宣稱**，而且 import 任何東西都沒有 |
| DMS | `compiles` 跟警告欄**一起印**，不單獨出現 |

重切加的是**範例 020 的挑戰，把 rustc 當 oracle**：每種寫法宣告「編譯器會不會強制我處理」，然後去問編譯器。第 6 節逐條驗，加一個鑽孔——一個宣稱被強制、實際沒有的寫法必須被抓到。

## 什麼不適合拆

**`#[must_use]` 有在做事。** 五列裡只有 bare call 那一列會因為它移動，而那正是它的用途。

**`let _ = ...` 也不該被拿掉。** 它是「我是故意忽略的」這句話的寫法，而那句話有時候是對的。缺陷不在任何一邊，在於**故意忽略跟疏忽忽略最後長得一樣**，而語言沒有留下判別它們的地方。

## 這次沒有解決什麼

**這一則只量了一個型別、一個語言、一套工具鏈**（rustc 1.96）。它**示範**了那個界線，沒有**證明**任何關於型別系統的一般命題。

**沒有比較的：** checked exceptions、`Option`、`Either`。每一個都需要新的探針，不是重讀既有輸出。

**沒有處理的：** clippy 有沒有辦法把 `let _ =` 也擋下來，以及一個團隊用 review 把它擋掉算不算「機械化」。這一則量的是**編譯器做什麼**，不是專案能在它周圍安排什麼。

---

**這是這一輪的最後一則考古。** 20 個範例、20 個考古之後，照 Neo 定的路線，接下來是真實市場應用。
