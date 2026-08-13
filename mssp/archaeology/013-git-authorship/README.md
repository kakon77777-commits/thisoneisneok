# 013 — git 3.x：一個宣稱自己是任何人的 commit，跟真的是同一種物件

> 原專案 [git](https://git-scm.com/)（GPL-2.0-only）。本篇沒有重製 git 的任何原始碼，只在一個丟棄式儲存庫上量它的行為。
> 版本由執行時量出來。

```bash
python src/main.py            # 三個 commit、四個欄位、哪一個分得出來
python src/main.py --strict   # 被信任的欄位如果只是宣稱就 exit 1
python src/island_test.py     # 16 項檢查，全部直接跑 git
```

## 為什麼選它

2026-08-12 我做的共識機制把三份我自己寫的檔案讀成三方同意。[範例 013](/html/mssp/013-approval-is-an-act.html) 把那個缺陷做成量測，結論是**一個行為必須在工件之外留下痕跡**。

那就要問：**軟體業最廣泛使用的來源存放處，有沒有這個區分？**

順帶一提，這是**六則連續 CPython 之後換的上游**。連續六則來自同一個標準庫是取樣習慣，不是發現。

## 原專案的結構地圖

三個 commit：一個誠實的、一個冒充的、一個帶著沒人檢查的 trailer。

```text
  commit    author           committer        %G?   subject
  81f34c5   Real Person      Real Person      N     an ordinary commit
  0a52707   Linus Torvalds   Linus Torvalds   N     a commit by someone who was not there
  d9bd66c   Real Person      Real Person      N     work
```

冒充那一個**不需要任何漏洞**——`GIT_AUTHOR_NAME` 與 `GIT_COMMITTER_NAME` 是有文件的環境變數。原始物件裡也沒有多任何東西：

```text
    tree 6640fb01ffae1cdd778a3fe65b469f62a5230def
    parent 81f34c5c647570cac07e593351d0caba2134605f
    author Linus Torvalds <torvalds@linux-foundation.org> 1786590221 +0800
    committer Linus Torvalds <torvalds@linux-foundation.org> 1786590221 +0800
    contains a signature block: False
```

| 欄位 | 記錄的是 | 分得出誠實與冒充嗎 |
|---|---|---|
| `author` | **宣稱** | 值不同——而那個不同就是對方打進去的字 |
| `committer` | **宣稱** | 同上 |
| `trailer` | **宣稱** | git 不讀它回來 |
| `signature` | **行為** | **不能——兩個都回報 `N`** |

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 四個欄位、各自記錄宣稱還是行為，以及 `units` 對照 |
| SCL | 這個部署會信任哪一個欄位當身分 |
| SMS | 依 id 解析欄位、分辨測試，以及跑真 git 的探針 |
| TMS | 一個欄位一個檔——各自宣告 `claim` 或 `act`，且不 import 任何東西 |
| DMS | git 印出來的 log，以及哪一個欄位本來可以分辨 |

重切加的只有一件事：**每個欄位宣告自己記錄的是宣稱還是行為。** git 沒有這個區分——呼叫端讀 `%an` 拿到的是一個字串，而那個字串在「有人寫了這個 commit」與「有人打了那個人的名字」兩種情況下形狀完全一樣，介面沒有任何地方可以問是哪一種。

## 什麼不適合拆

**git 沒有做錯，不要「修」這個。** 一個分散式版本控制系統**不可能有一個發放身分的權威**——沒有中央，就沒有人能替 `author` 背書。簽章存在，正是因為 `author` 不是身分。

**而這一則的發現就在那個「正是因為」的後面：**

> **一個「可以」是行為的欄位，在有人真的執行它之前，並不是行為。**

`%G?` 有八種取值（G/B/U/X/Y/R/E/N），而在沒有人簽的儲存庫裡它對每一個 commit 回報 `N`。**一個存在、而且沒有人行使的判別器**——跟[考古 011](/html/mssp/archaeology/011-cpython-shelve.html) 的 `d[k] is d[k]` 是同一個形狀。

## 這次沒有解決什麼

**先講一個自我牽連的：這個儲存庫的每一個 commit 都帶著 `Co-Authored-By: Claude Opus 5`。** 量到的結果是：**git 不會讀那一行回來。** 它是內容裡的一句宣稱——跟我 08-12 寫下然後讀成同意的那三個檔案，是完全相同的形狀。

**量得到但這次沒量：** 真實儲存庫裡有多少 commit 帶著有效簽章；`Co-Authored-By` 裡有多少比例指的是真的碰過那個分支的人。

**這一則量不到：** 任何一個 commit 是不是誠實的。**它量的是欄位「能」承載什麼，不是它們實際承載了什麼。** 而 `distinct-provenance` 那條路的盡頭也在這裡——把問題從工件搬到來源存放處，是搬移，不是終結。
