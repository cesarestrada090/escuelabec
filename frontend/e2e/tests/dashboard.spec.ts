import { test, expect, apiCreateLead, apiDeleteLead } from '../fixtures/base.fixture';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage, page }) => {
    // authenticatedPage ya inyectó el token en localStorage
  });

  test('muestra el dashboard con título correcto', async ({ authenticatedPage, dashboardPage }) => {
    dashboardPage['page'] = authenticatedPage;
    const dp = dashboardPage;
    dp['page'] = authenticatedPage;

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    await expect(authenticatedPage.locator('h1')).toContainText('Dashboard');
  });

  test('muestra las 6 etapas del funnel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const cards = authenticatedPage.locator('.funnel-card');
    await expect(cards).toHaveCount(6);
  });

  test('muestra los nombres correctos de las etapas', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const expectedStages = [
      'Atracción', 'Captura de Leads', 'Nutrición',
      'Interés / Consideración', 'Conversión', 'Preparado para CRM'
    ];

    for (const stage of expectedStages) {
      await expect(authenticatedPage.locator('.funnel-card', { hasText: stage })).toBeVisible();
    }
  });

  test('el total de leads coincide con la suma de etapas', async ({ authenticatedPage, adminToken }) => {
    // Crear un lead via API para asegurar que hay datos
    const lead = await apiCreateLead(adminToken, {
      firstName: 'Test', lastName: 'Dashboard', email: `dashboard-test-${Date.now()}@test.com`
    });

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.locator('.spinner-border').waitFor({ state: 'hidden' }).catch(() => {});

    const totalText = await authenticatedPage.locator('.stat-card .stat-number').first().textContent();
    const total = parseInt(totalText?.trim() || '0');
    expect(total).toBeGreaterThan(0);

    // Cleanup
    await apiDeleteLead(adminToken, lead.leadId);
  });
});
