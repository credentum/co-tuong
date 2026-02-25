import { test, expect } from '@playwright/test'

test.describe('Cờ Tướng Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('board renders with 32 pieces', async ({ page }) => {
    const board = page.locator('svg[role="grid"]')
    await expect(board).toBeVisible()

    const pieces = board.locator('g[role="img"]')
    await expect(pieces).toHaveCount(32)
  })

  test('turn indicator shows red first', async ({ page }) => {
    await expect(page.getByText("Red's turn")).toBeVisible()
  })

  test('tap red Xe selects it and shows legal moves', async ({ page }) => {
    const xeButton = page.getByRole('button', { name: /Red Chariot at 1, 1/ })
    await xeButton.click()

    const selectionRing = page.locator('circle[stroke="#2563eb"]')
    await expect(selectionRing).toHaveCount(1)
  })

  test('tap opponent piece on red turn is silently ignored', async ({ page }) => {
    const blackXe = page.getByRole('button', { name: /Black Chariot at 1, 10/ })
    await blackXe.click()

    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(0)

    await page.getByRole('button', { name: /Red Chariot at 1, 1/ }).click()
    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(1)
  })

  test('move red Xe and turn switches to black', async ({ page }) => {
    await page.getByRole('button', { name: /Red Chariot at 1, 1/ }).click()
    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(1)

    const greenDots = page.locator('circle[fill="#16a34a"]')
    await expect(greenDots).toHaveCount(2)

    await page.getByRole('button', { name: /Empty at 1, 2/ }).click()

    await expect(page.getByText("Black's turn")).toBeVisible()
    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(0)
  })

  test('tap same piece again deselects', async ({ page }) => {
    await page.getByRole('button', { name: /Red Chariot at 1, 1/ }).click()
    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(1)

    await page.getByRole('button', { name: /Red Chariot at 1, 1/ }).click()
    await expect(page.locator('circle[stroke="#2563eb"]')).toHaveCount(0)
  })

  test('new game button resets board', async ({ page }) => {
    await page.getByRole('button', { name: /Red Chariot at 1, 1/ }).click()
    await page.getByRole('button', { name: /Empty at 1, 2/ }).click()
    await expect(page.getByText("Black's turn")).toBeVisible()

    await page.getByText('New game').click()
    await expect(page.getByText("Red's turn")).toBeVisible()
  })

  test('language toggle switches to Vietnamese', async ({ page }) => {
    await expect(page.getByText("Red's turn")).toBeVisible()

    await page.getByText('VI').click()

    await expect(page.getByText('Lượt Đỏ')).toBeVisible()
    await expect(page.getByText('EN')).toBeVisible()
  })
})
