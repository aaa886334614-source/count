# 奇門遁甲六位數字單宮排盤

專案名稱：`qimen-single-palace`

純前端 Vite + React + TypeScript + Tailwind CSS 工具。輸入六位碼解析單宮奇門，歷史紀錄存於瀏覽器 `localStorage`。

## 本機執行

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的位址（通常為 http://localhost:5173/）。

## Build

```bash
npm run build
npm run preview
```

自我檢查（字母轉換／解析／排盤）：

```bash
npm run self-check
```

## Vercel 部署

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com) Import Repository
3. Framework Preset：`Vite`
4. Build Command：`npm run build`
5. Output Directory：`dist`
6. 部署

專案已含 `vercel.json` SPA rewrites。

## 六位碼規則

由左至右：

1. 宮位（1–9，不可為 0）
2. 八神
3. 九星
4. 八門
5. 天盤干
6. 地盤干

支援半形／全形數字、英文字母（AJS=1 … IR=9）、自動去除空白。

天干：`0` 空亡（留白 + ○）、`1` 選甲／戊／癸、`2–9` 乙…壬。

## 對照表所在檔案

- `src/constants/mappings.ts`：宮位、八神、九星、八門、天干、補空、字母轉換
- `src/constants/harmRules.ts`：門迫／擊刑／入墓規則

## 四害規則如何新增

編輯 `src/constants/harmRules.ts`，新增例如：

```ts
{
  type: '門迫',
  palace: 2,
  targetType: 'door',
  targetValue: '死門',
  remedyBranches: ['巳'],
  remedyAnimals: ['蛇'],
  description: '依教材說明',
}
```

僅當宮位與目標同時符合時才會判定。空亡依數字 `0` 自動判斷，不需寫入此表。

## localStorage Key

```
consciousness-qimen-history-v1
```

最多 100 筆；超過時刪除最舊資料。
