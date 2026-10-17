# 奇門遁甲整合工作台

分支：`integrate-qimen-workspace`（Git  repo：`奇門遁甲算`）

Vite + React + TypeScript：六位數單宮斷、陰盤時刻 v0.4 九宮、環境化解決策、Supabase 會員／雲端存盤（需自行連線）。

- 架構：`docs/architecture/ARCHITECTURE.md`
- 規則索引：`docs/rules/QIMEN_RULES.md`
- 環境變數：`docs/ENV.example.md`
- v0.4 原始包：`/Users/shijingtang/Downloads/qimen_workspace`（未找到 `qimen_workspace_yinpan_v04.zip`）

## 本機執行

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
npm run self-check
npm run test
npm run typecheck
```

## 導覽

| 路徑 | 功能 |
|------|------|
| `/` | 首頁 |
| `/time-chart` | 時盤／刻盤（v0.4 引擎） |
| `/single-palace` | 六位數單宮斷 |
| `/harms` | 四害快速查詢 |
| `/charts` | 本機／雲端排盤 |
| `/account` | 會員登入 |

## 六位碼順序（左→右）

1. 宮位  
2. 八神  
3. 九星  
4. 八門  
5. 天盤干  
6. 地盤干  

支援半形／全形數字、英文字母（AJS=1 … IR=9）、自動去除空白。

### 0 在各位置的意義

| 位置 | 意義 |
|------|------|
| 第1位 0 | 坤宮（標準宮號 2）；畫面顯示「0 坤」 |
| 第2位 0 | 沿用第1位數字查八神；若第1位亦為0則錯誤 |
| 第3位 0 | 天芮（非空無） |
| 第4位 0 | 死門（非空無） |
| 第5／6位 0 | 空無：干位留白、右上一個 ○ |

### 宮位

- 1坎 2坤 3震 4巽 **5坤** 6乾 7兌 8艮 9離；**0亦為坤**  
- 內部四害／補空用標準宮號（0／5 → 2）  
- 畫面與歷史保留原始輸入數字（如「5 坤」「0 坤」）

### 天干

- `0`：空無  
- `1`：須選甲／戊／癸（天地盤分開）；**未選完不排盤、不算四害、不儲存**  
- `2–9`：乙…壬  

## 四害（教材）

嚴重度：門迫(4) > 擊刑(3) > 入墓(2) = 空無(2)

- **門迫**：白名單宮×門；化解動物見 `DOOR_REMEDY_ANIMALS`（儲存如「豬」）  
- **擊刑／入墓**：`STEM_HARM_RULES`（類型＋宮＋干 → 動物）  
- **空無**：僅第5／6位為0  
- **化解提示顯示**：一律 `地支（動物）`，由 `formatRemedyAnimal` 產生（如豬→亥（豬））；localStorage 仍只存動物名  

規則檔：`src/constants/harmRules.ts`｜顯示：`src/utils/formatRemedyAnimal.ts`

## 儲存

- 排盤後勾選「儲存到歷史紀錄」並按「儲存」才寫入  
- 備註選填，最多100字  
- Key：`consciousness-qimen-history-v1`  
- 最多100筆，超出刪最舊  

## 對照表檔案

- `src/constants/mappings.ts`：六位碼對照、補空、字母  
- `src/constants/originalPalaces.ts`：待機原始宮位圖  
- `src/constants/harmRules.ts`：四害與化解  

## Vercel

Framework：Vite｜Build：`npm run build`｜Output：`dist`（已含 `vercel.json`）
