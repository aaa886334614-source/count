# ADR 001：Supabase 與盤面快照

- **決策**：Auth + PostgreSQL 使用 Supabase；盤面存 `chart_snapshot` + `calculation_context`。
- **原因**：RLS 內建、避免自製密碼邏輯、利於長期保存與匯出。
- **後果**：需使用者自建 Supabase 專案；未連線時雲端功能標示為「程式已完成、尚未驗證連線」。

# ADR 002：四害與環境化解分離

- **決策**：`detectHarms` 與 `buildEnvironmentActions` 分開。
- **原因**：偵測可單測；化解可疊對宮／現場狀態而不改偵測結果。
