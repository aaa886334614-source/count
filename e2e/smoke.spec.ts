import { test, expect } from '@playwright/test'

const hasStaging = Boolean(process.env.E2E_BASE_URL)

test.describe('Staging E2E（需 E2E_BASE_URL）', () => {
  test.skip(!hasStaging, '未設定 E2E_BASE_URL，跳過 Staging 真實測試')

  test('首頁與 API health', async ({ page, request }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const health = await request.get('/api/health')
    expect(health.ok()).toBeTruthy()
    const body = (await health.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  test('未登入無法讀取私人 charts API', async ({ request }) => {
    const res = await request.get('/api/charts')
    expect(res.status()).toBe(401)
  })

  test('時刻排盤頁可開啟', async ({ page }) => {
    await page.goto('/time-chart')
    await expect(page.getByRole('heading', { name: /時盤|刻盤|排盤/i })).toBeVisible()
  })

  test('六位數單宮頁可開啟', async ({ page }) => {
    await page.goto('/single-palace')
    await expect(page.getByText(/六位|單宮/i).first()).toBeVisible()
  })
})
