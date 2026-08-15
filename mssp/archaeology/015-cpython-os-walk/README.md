# 015 — CPython `os.walk` 3.14.5：一次半途壞掉的走訪，跟一次完整的走訪，是同一個值

> 原專案 [CPython `Lib/os.py`](https://github.com/python/cpython/blob/main/Lib/os.py)，PSF-2.0。版本由執行時量出來。
> 這一則不需要任何權限操作：一個不存在的路徑，以及一個在走訪途中消失的子目錄——兩個在運行中的系統裡都是日常。

```bash
python src/main.py            # 兩個原因、兩種模式
python src/main.py --strict   # 這個部署如果安靜地走就 exit 1
python src/island_test.py     # 17 項檢查，全部直接跑 CPython
```

## 為什麼選它

同日的[範例 015](/html/mssp/015-present-and-failing.html) 主張**能用與不存在不是兩個選項**——一個能力可以在那裡、被呼叫、而且失敗。

`os.walk` 是那個第三狀態被大量製造、卻沒有任何名字的地方：**它的預設吞掉錯誤、繼續走，然後交回一份看起來完整的結果。**

## 原專案的結構地圖

`os.walk(top, topdown=True, onerror=None, followlinks=False)`

一個子目錄在頂層列出之後、被走訪之前消失——刪除、權限變更、另一個行程移走它，都會這樣：

```text
    mode         files                      errors
    silent       ['a.txt', 'c.txt']         none reported
    reporting    ['a.txt', 'c.txt']         ['FileNotFoundError on ...b']
```

**同樣的檔案。差別只在有沒有人被告知。**

那跟[範例 012](/html/mssp/012-two-writers.html) 在遺失更新上量到的是同一個形狀：兩種結果停在同一個數字，其中一個說了。

而原始碼裡處理這件事的只有一個分支：

```python
    if onerror is not None:
```

沒有它，錯誤被丟掉，走訪繼續。

## 第二個發現：判別器存在，而慣用寫法把它銷毀

「走訪什麼都沒找到」有兩個原因，而它們**確實不同**：

```text
                           rows yielded   files collected
    empty                  1              0
    missing                0              0
```

空目錄 yield 一列，不存在的路徑 yield 零列。**但沒有人是這樣用的**——大家寫的是 `for _, _, files in os.walk(top)` 然後收集 `files`，而那個數字兩邊都是 0。

**判別器在產生器裡，而它在被正常使用的那一刻消失。** 這跟[考古 011](/html/mssp/archaeology/011-cpython-shelve.html) 的 `d[k] is d[k]` 是同一族：一個存在、而沒有人行使的判別器。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 兩種模式、各自回報什麼，以及 `units` 對照 |
| SCL | 這個部署用哪一種，以及安靜地走是不是致命的 |
| SMS | 依 id 解析模式，與跑真 `os.walk` 的探針 |
| TMS | 一種模式一個檔——各自宣告**有沒有人被告知**，且不 import 任何東西 |
| DMS | 兩個原因、兩種模式，以及看不到的部分 |

重切加的只有一件事：**模式要宣告有沒有人被告知**，而那份宣告用跑的驗。第 3b 節是鑽孔——一個宣稱會回報、實際上沒裝 callback 的模式，必須被抓到。

## 什麼不適合拆

**預設不適合改。** 一個對每個讀不到的目錄都拋例外的走訪，在真實檔案系統上沒辦法用——掃一棵大樹一定會遇到權限、競態與符號連結。`onerror` 存在，正是因為**沒有一個預設適合所有人**。

缺陷不在預設吞掉錯誤，在於**吞掉之後的結果，跟沒有錯誤的結果長得一模一樣**，而呼叫端沒有任何辦法事後問。

## 這次沒有解決什麼

**量得到但這次沒量：** 真實的走訪多常因為權限錯誤掉一個目錄；有多少呼叫端真的傳了 `onerror`。

**這一則量不到：** 任何一位呼叫端當初以為「空結果」是什麼意思。**它量的是介面讓什麼通過，不是誰誤解了什麼。**
