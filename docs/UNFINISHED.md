# 未完成／待驗證

## 需 Supabase 連線後驗證

- Email 全流程（註冊、驗證信、重設密碼連結）於正式網域
- RLS 跨使用者 A/B 整合測試
- 雲端存盤／備註 E2E

## 功能待補（不阻擋核心）

- 時刻盤：十二長生 UI（引擎 `longLife` 已有）
- Playwright 主要流程 E2E
- 匯入 JSON 直接寫入雲端（目前僅驗證格式 + 舊版 localStorage 匯入）
- 完整逐欄位快照 diff UI（目前已有簡要比對 + 確認更新）

## 已在本分支完成（程式）

- AuthProvider（signIn / signUp / signOut / reset / updatePassword）
- 時刻／單宮「儲存盤面」對話框 + 防連點 + 登入後返回續存
- ChartSnapshot 版本化模型
- 我的排盤：搜尋、類型篩選、排序、開啟詳情、重新命名、備註 CRUD、匯出 JSON
- 歷史詳情：九宮／單宮快照還原、重新計算預覽
