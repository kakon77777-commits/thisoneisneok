# 011 — CPython `shelve` 3.14.5：一個旗標改變了每一次讀取的意義

> 原專案 [CPython `Lib/shelve.py`](https://github.com/python/cpython/blob/main/Lib/shelve.py)，PSF-2.0。本篇考察 3.14.5，250 行。
> 所有數字都是在這台機器上對這個直譯器量出來的。

```bash
python src/main.py            # 兩種模式、快取成長，以及重切與真 shelve 的逐格比對
python src/main.py --strict   # 重切跟真 shelve 不一致就 exit 1
python src/island_test.py     # 19 項檢查，其中 9 項直接跑 CPython 本體
```

## 為什麼選它

同日的[範例 011](/html/mssp/011-store-boundary.html) 是這個實驗室**第一則有狀態活得比行程久**的範例。九天後路線轉向真實市場應用——電商、報表——而目前每一個機制都假設 `src/` 底下一支沒有 UI、沒有持久化的程式。

`shelve` 是標準庫裡最小的持久化映射，三十年歷史，而**它的一個旗標會改變每一次讀取的意義**。

```text
  writeback    d[k].append(x) survives    d[k] is d[k]   objects held
  False        ['apple']                  False          0
  True         ['apple', 'pear']          True           1
```

同一個 API、同一個呼叫、相反的語義。**唯一能分辨的觀察是 `d[k] is d[k]`**——一行，而且沒有任何呼叫端會去看它。

## 原專案的結構地圖

| | |
|---|---|
| `shelve.py` | **250 行** |
| `Shelf.__getitem__` | 9 行 |
| `Shelf.__setitem__` | 7 行 |
| 公開類別 | `Shelf`、`BsdDbShelf`、`DbfilenameShelf` |
| `writeback` 預設 | **False** |

上面五個數字由 `main.py` 對正在跑的直譯器重新量一次再跟 FMS 比對。**第一次跑就抓到一個**：我把 `__setitem__` 宣告成 5 行，量到 7。那一列現在留著更正註記，因為它是整篇裡唯一能證明「重量測會失敗」的證據。

決定一切的是 9 行裡的 3 行：

```python
def __getitem__(self, key):
    try:
        value = self.cache[key]
    except KeyError:
        f = BytesIO(self.dict[key.encode(self.keyencoding)])
        value = Unpickler(f).load()
        if self.writeback:
            self.cache[key] = value
    return value
```

**`if self.writeback: self.cache[key] = value` 在一次讀取裡。** 旗標叫做 writeback，而它做的第一件事是決定一次讀取要不要把東西留下來。

## MSSP 重切

| 集合 | 裡面是什麼 |
|---|---|
| FMS | 旗標、它實際改變的四件事，以及 `main.py` 會重新量的五個數字 |
| SCL | 這個部署用哪一種交付策略，以及宣告是否必須被行為證明 |
| SMS | 重切的 `Shelf`、依名字解析、identity 探針，以及跑真 shelve 的探針 |
| TMS | 一種策略一個檔——各自宣告交回什麼、變動會不會存活，且不取用任何兄弟集合 |
| DMS | 兩種模式並排、與真 shelve 的比對，以及看不到的部分 |

唯一的結構改動是把布林旗標換成兩個具名單元，各自**宣告自己交回什麼**——而那份宣告是用跑的驗，不是用讀的：

```text
  PASS  cached-reference: declared mutation_survives=True, measured True
  PASS  copy-on-read: declared mutation_survives=False, measured False
  PASS  a handout declaring copy semantics while caching is caught - declared False, measured True
```

第三列是鑽孔：一個宣告自己是複製語義、實作卻是快取的策略必須被抓到。沒有那一列，前兩列只是兩份互相同意的宣告——[`mssp-d-003`](/html/mssp/discussions/mssp-d-003.html) 整串在講的形狀。

重切與真 shelve 每次執行都逐格比對，而第 3b 節故意用錯策略去證明那個比對會失敗：

```text
  PASS  all 4 cells agree - 4/4
  PASS  using the wrong strategy for writeback=False breaks cells - so section 3 is a measurement, not a formality
```

## 什麼不適合拆

**`writeback=True` 本身不是缺陷，不要修掉它。** 它預設關閉、有寫文件，而且對知道自己在做什麼的呼叫端是對的——你要就地變動大結構時，它省掉一整輪讀出、改、寫回。

這跟昨天[考古 010](/html/mssp/archaeology/010-cpython-pyc-invalidation.html) 的 `UNCHECKED_HASH` 是同一個判斷：**一個永遠不拒絕、或永遠不複製的模式，只要它把這件事說出來，就不是缺陷。** 兩則的差別在說出來的方式——CPython 把 `.pyc` 的選擇寫進標頭的 flag bits，任何東西都讀得到；`shelve` 的選擇只存在於**開檔那一行的呼叫端**，而拿到 `d` 的人看不到它。

**pickle 的來回也不適合拆掉。** 它就是「複製」之所以可能的原因。

## 這次沒有解決什麼

**第三個發現是在修掉我自己一個寫死的檢查時掉出來的。**

第 4 節原本有一行 `check("and nothing was written during them", True, ...)`——一個斷言「這個讀取迴圈沒有寫任何東西」。那正是這個實驗室 2026-08-08 對[考古 008](/html/mssp/archaeology/008-cpython-logging-warn.html) 自己提出的缺陷：**在量測漂移的那一節裡寫死 `True`。**

改成真的量它，答案跟我的斷言不一樣：

```text
  PASS  a READ-ONLY session under writeback rewrites the medium at close - 1 of 1 files changed: store
  PASS  the same read-only session under the default does not - 1 of 1 files unchanged
  PASS  so the two differ, which is what makes either mean anything
```

**`writeback=True` 下，一個只讀不寫的 session 在關閉時會把媒介整個重寫一次。** 200 次純讀取留下 200 個物件，然後 `close()` 把它們全部寫回去。旗標的名字描述的是第四層後果，而第一層是「一次讀取會保留」。

**量得到但這次沒量：** 真實程式碼多常變動 shelf 交回來的東西；那些被保留的物件在一個 session 大小的工作量上實際佔多少。

**這一則量不到：** 預設是不是錯的——它是關的、有文件，而打開它要花的記憶體多數呼叫端不想付。以及野外的發生率——**重現一次無聲的遺失，跟這件事多常發生，是兩回事。**
