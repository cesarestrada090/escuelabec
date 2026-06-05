import { test, expect, apiCreateLead, apiDeleteLead } from '../fixtures/base.fixture';

test.describe('Pipeline - Kanban', () => {
  const createdLeadIds: number[] = [];

  test.afterAll(async ({ adminToken }) => {
    for (const id of createdLeadIds) {
      await apiDeleteLead(adminToken, id).catch(() => {});
    }
  });

  test('muestra el pipeline con 6 columnas', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    await expect(authenticatedPage.locator('h1')).toContainText('Pipeline');
    await expect(authenticatedPage.locator('.kanban-column')).toHaveCount(6);
  });

  test('muestra los nombres correctos de las columnas', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const expectedColumns = [
      'Atracción', 'Captura de Leads', 'Nutrición',
      'Interés / Consideración', 'Conversión', 'Preparado para CRM'
    ];

    for (const col of expectedColumns) {
      await expect(authenticatedPage.locator('.kanban-column', { hasText: col })).toBeVisible();
    }
  });

  test('un lead aparece en su columna correcta', async ({ authenticatedPage, adminToken }) => {
    const lead = await apiCreateLead(adminToken, {
      firstName: 'Pipeline', lastName: 'Test', email: `pipeline-${Date.now()}@test.com`,
      funnelStageId: 3
    });
    createdLeadIds.push(lead.leadId);

    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const nutricionCol = authenticatedPage.locator('.kanban-column', { hasText: 'Nutrición' });
    await expect(nutricionCol.locator('.lead-card', { hasText: 'Pipeline Test' })).toBeVisible();
  });

  test('el badge de conteo muestra la cantidad correcta de leads', async ({ authenticatedPage, adminToken }) => {
    const lead = await apiCreateLead(adminToken, {
      firstName: 'Count', lastName: 'Test', email: `count-${Date.now()}@test.com`,
      funnelStageId: 1
    });
    createdLeadIds.push(lead.leadId);

    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const atraccionCol = authenticatedPage.locator('.kanban-column', { hasText: 'Atracción' });
    const countBadge = atraccionCol.locator('.column-count');
    const countText = await countBadge.textContent();
    expect(parseInt(countText?.trim() || '0')).toBeGreaterThan(0);
  });

  test('drag & drop mueve el lead a otra columna', async ({ authenticatedPage, adminToken }) => {
    const lead = await apiCreateLead(adminToken, {
      firstName: 'DragDrop', lastName: 'Test', email: `drag-${Date.now()}@test.com`,
      funnelStageId: 1
    });
    createdLeadIds.push(lead.leadId);

    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const card = authenticatedPage.locator('.lead-card', { hasText: 'DragDrop Test' });
    const targetColumn = authenticatedPage.locator('.kanban-column', { hasText: 'Captura de Leads' }).locator('.column-header');

    await card.dragTo(targetColumn);
    await authenticatedPage.waitForTimeout(2000);

    // Verificar que está en Captura de Leads (la verificación positiva es suficiente)
    const capturaCards = authenticatedPage.locator('.kanban-column', { hasText: 'Captura de Leads' })
      .locator('.lead-card', { hasText: 'DragDrop Test' });
    await expect(capturaCards).toBeVisible();

    // Verificar que ya no está en Atracción (tras el optimistic update)
    const atraccionCards = authenticatedPage.locator('.kanban-column', { hasText: 'Atracción' })
      .locator('.lead-card', { hasText: 'DragDrop Test' });
    await expect(atraccionCards).toHaveCount(0);
  });
});
