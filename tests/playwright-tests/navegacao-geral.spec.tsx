import { test, expect } from '@playwright/test';

test('Página inicial carrega corretamente', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toBe('Título Esperado');
});