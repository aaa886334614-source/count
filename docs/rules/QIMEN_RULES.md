# 奇門規則索引

| Rule ID | 內容 | 來源 | 版本 | 測試 |
|---------|------|------|------|------|
| SP-PARSE-01 | 六位逐位解析，0 依位置語意 | 教材 | 1.0 | `selfCheck.ts`, `treatments.test.ts` |
| SP-HARM-01 | 門迫／擊刑／入墓／空無（六位 0 空無） | 教材 | 1.0 | `selfCheck.ts` |
| SP-HARM-02 | 四害優先級保留全部成立項 | 教材 | 1.0 | 艮庚雙害 |
| TC-ENGINE-01 | 陰盤時刻 v0.4 算法 | Downloads/qimen_workspace | 0.4 | `yinpan-v04.test.ts` |
| TC-EMPTY-01 | 旬空 ≠ 六位碼 0 空無 | 整合決策 | 1.0 | `mapPalaceToSingle.ts` |
| ENV-OPP-01 | 對宮映射 乾↔巽 坤↔艮 坎↔離 震↔兌 | 教材 | 1.0 | `treatments.test.ts` |
| ENV-BLOCK-01 | 對宮白虎／庚金／入墓／空無 → 本宮 | 教材 | 1.0 | `treatments.test.ts` |
| ENV-VOID-01 | 空無現場 unknown / falseEmpty / trueEmpty | 教材 | 1.0 | `treatments.test.ts` |
| TALISMAN-01 | 麒麟符（白虎）— 介面預留，未完整規則 | 待確認 | — | 未實作計算 |

未找到 `qimen_workspace_yinpan_v04.zip`；以 `/Users/shijingtang/Downloads/qimen_workspace` 目錄作為 v0.4 來源。
