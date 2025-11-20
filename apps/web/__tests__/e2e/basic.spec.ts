import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3001/')
  await expect(page).toHaveTitle(/QuickCal AI/)
})

test('dashboard requires authentication', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard')
  // Should redirect to sign-in or show auth required
  await expect(page).toHaveURL(/.*sign-in.*/)
})