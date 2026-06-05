# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pipeline.spec.ts >> Pipeline - Kanban >> el badge de conteo muestra la cantidad correcta de leads
- Location: e2e/tests/pipeline.spec.ts:51:7

# Error details

```
TimeoutError: locator.textContent: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.kanban-column').filter({ hasText: 'Atracción' }).locator('.column-count')

```

# Test source

```ts
  1  | import { test, expect, apiCreateLead, apiDeleteLead } from '../fixtures/base.fixture';
  2  | 
  3  | test.describe('Pipeline - Kanban', () => {
  4  |   const createdLeadIds: number[] = [];
  5  | 
  6  |   test.afterAll(async ({ adminToken }) => {
  7  |     for (const id of createdLeadIds) {
  8  |       await apiDeleteLead(adminToken, id).catch(() => {});
  9  |     }
  10 |   });
  11 | 
  12 |   test('muestra el pipeline con 6 columnas', async ({ authenticatedPage }) => {
  13 |     await authenticatedPage.goto('/pipeline');
  14 |     await authenticatedPage.waitForLoadState('networkidle');
  15 |     await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});
  16 | 
  17 |     await expect(authenticatedPage.locator('h1')).toContainText('Pipeline');
  18 |     await expect(authenticatedPage.locator('.kanban-column')).toHaveCount(6);
  19 |   });
  20 | 
  21 |   test('muestra los nombres correctos de las columnas', async ({ authenticatedPage }) => {
  22 |     await authenticatedPage.goto('/pipeline');
  23 |     await authenticatedPage.waitForLoadState('networkidle');
  24 |     await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});
  25 | 
  26 |     const expectedColumns = [
  27 |       'Atracción', 'Captura de Leads', 'Nutrición',
  28 |       'Interés / Consideración', 'Conversión', 'Preparado para CRM'
  29 |     ];
  30 | 
  31 |     for (const col of expectedColumns) {
  32 |       await expect(authenticatedPage.locator('.kanban-column', { hasText: col })).toBeVisible();
  33 |     }
  34 |   });
  35 | 
  36 |   test('un lead aparece en su columna correcta', async ({ authenticatedPage, adminToken }) => {
  37 |     const lead = await apiCreateLead(adminToken, {
  38 |       firstName: 'Pipeline', lastName: 'Test', email: `pipeline-${Date.now()}@test.com`,
  39 |       funnelStageId: 3
  40 |     });
  41 |     createdLeadIds.push(lead.leadId);
  42 | 
  43 |     await authenticatedPage.goto('/pipeline');
  44 |     await authenticatedPage.waitForLoadState('networkidle');
  45 |     await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});
  46 | 
  47 |     const nutricionCol = authenticatedPage.locator('.kanban-column', { hasText: 'Nutrición' });
  48 |     await expect(nutricionCol.locator('.lead-card', { hasText: 'Pipeline Test' })).toBeVisible();
  49 |   });
  50 | 
  51 |   test('el badge de conteo muestra la cantidad correcta de leads', async ({ authenticatedPage, adminToken }) => {
  52 |     const lead = await apiCreateLead(adminToken, {
  53 |       firstName: 'Count', lastName: 'Test', email: `count-${Date.now()}@test.com`,
  54 |       funnelStageId: 1
  55 |     });
  56 |     createdLeadIds.push(lead.leadId);
  57 | 
  58 |     await authenticatedPage.goto('/pipeline');
  59 |     await authenticatedPage.waitForLoadState('networkidle');
  60 |     await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});
  61 | 
  62 |     const atraccionCol = authenticatedPage.locator('.kanban-column', { hasText: 'Atracción' });
  63 |     const countBadge = atraccionCol.locator('.column-count');
> 64 |     const countText = await countBadge.textContent();
     |                                        ^ TimeoutError: locator.textContent: Timeout 15000ms exceeded.
  65 |     expect(parseInt(countText?.trim() || '0')).toBeGreaterThan(0);
  66 |   });
  67 | 
  68 |   test('drag & drop mueve el lead a otra columna', async ({ authenticatedPage, adminToken }) => {
  69 |     const lead = await apiCreateLead(adminToken, {
  70 |       firstName: 'DragDrop', lastName: 'Test', email: `drag-${Date.now()}@test.com`,
  71 |       funnelStageId: 1
  72 |     });
  73 |     createdLeadIds.push(lead.leadId);
  74 | 
  75 |     await authenticatedPage.goto('/pipeline');
  76 |     await authenticatedPage.waitForLoadState('networkidle');
  77 |     await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});
  78 | 
  79 |     const card = authenticatedPage.locator('.lead-card', { hasText: 'DragDrop Test' });
  80 |     const targetColumn = authenticatedPage.locator('.kanban-column', { hasText: 'Captura de Leads' }).locator('.column-body');
  81 | 
  82 |     await card.dragTo(targetColumn);
  83 |     await authenticatedPage.waitForTimeout(1500);
  84 | 
  85 |     // Verificar que el lead ya no está en Atracción
  86 |     const atraccionCards = authenticatedPage.locator('.kanban-column', { hasText: 'Atracción' })
  87 |       .locator('.lead-card', { hasText: 'DragDrop Test' });
  88 |     await expect(atraccionCards).toHaveCount(0);
  89 | 
  90 |     // Verificar que está en Captura de Leads
  91 |     const capturaCards = authenticatedPage.locator('.kanban-column', { hasText: 'Captura de Leads' })
  92 |       .locator('.lead-card', { hasText: 'DragDrop Test' });
  93 |     await expect(capturaCards).toBeVisible();
  94 |   });
  95 | });
  96 | 
```