export function verificationEmailHtml(url: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-Hant">
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2>奇門遁甲 — 驗證您的 Email</h2>
  <p>感謝註冊。請點選下方連結完成 Email 驗證，驗證後即可登入使用雲端存盤。</p>
  <p><a href="${url}">完成 Email 驗證</a></p>
  <p style="font-size: 14px; color: #666;">若您未申請帳號，可忽略此信。</p>
  <p style="font-size: 14px; color: #666;">連結若無法點選，請複製至瀏覽器：<br>${url}</p>
</body>
</html>`
}

export function resetPasswordEmailHtml(url: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-Hant">
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2>奇門遁甲 — 重設密碼</h2>
  <p>我們收到重設密碼的請求。請在有效時間內開啟以下連結設定新密碼。</p>
  <p><a href="${url}">重設密碼</a></p>
  <p style="font-size: 14px; color: #666;">若您未提出請求，可忽略此信，密碼不會變更。</p>
  <p style="font-size: 14px; color: #666;">連結：<br>${url}</p>
</body>
</html>`
}
