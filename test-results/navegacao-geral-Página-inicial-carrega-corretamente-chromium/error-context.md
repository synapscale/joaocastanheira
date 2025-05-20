# Test info

- Name: Página inicial carrega corretamente
- Location: /workspaces/joaocastanheira/tests/playwright-tests/navegacao-geral.spec.tsx:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /workspaces/joaocastanheira/tests/playwright-tests/navegacao-geral.spec.tsx:4:14
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('Página inicial carrega corretamente', async ({ page }) => {
> 4 |   await page.goto('/');
    |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  5 |   const title = await page.title();
  6 |   expect(title).toBe('Título Esperado');
  7 | });
```