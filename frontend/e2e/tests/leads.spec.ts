import { test, expect, apiCreateLead, apiDeleteLead, apiCleanupLeadsByEmail } from '../fixtures/base.fixture';

const TEST_EMAIL = `e2e-lead-${Date.now()}@test.com`;

test.describe('Leads - CRUD', () => {
  let createdLeadId: number | null = null;

  test.afterEach(async ({ adminToken }) => {
    if (createdLeadId) {
      await apiDeleteLead(adminToken, createdLeadId).catch(() => {});
      createdLeadId = null;
    }
    await apiCleanupLeadsByEmail(adminToken, TEST_EMAIL).catch(() => {});
  });

  test('muestra la página de leads con tabla', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    await expect(authenticatedPage.locator('h1')).toContainText('Gestión de Leads');
    await expect(authenticatedPage.locator('button', { hasText: '+ Nuevo Lead' })).toBeVisible();
  });

  test('abre el modal de nuevo lead', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    await authenticatedPage.locator('button', { hasText: '+ Nuevo Lead' }).click();
    await expect(authenticatedPage.locator('.modal-overlay')).toBeVisible();
    await expect(authenticatedPage.locator('.modal-header-custom h5')).toContainText('Nuevo Lead');
  });

  test('crea un lead nuevo exitosamente', async ({ authenticatedPage, leadsPage }) => {
    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    const email = `lead-create-${Date.now()}@test.com`;

    await authenticatedPage.locator('button', { hasText: '+ Nuevo Lead' }).click();
    await expect(authenticatedPage.locator('.modal-overlay')).toBeVisible();

    // Llenar formulario
    await authenticatedPage.locator('input[name="firstName"]').fill('María');
    await authenticatedPage.locator('input[name="lastName"]').fill('López');
    await authenticatedPage.locator('input[name="email"]').fill(email);
    await authenticatedPage.locator('input[name="phone"]').fill('999888777');
    await authenticatedPage.locator('.modal-body-custom select').first().selectOption('Instagram');

    await authenticatedPage.locator('.modal-footer-custom .btn-primary').click();
    await expect(authenticatedPage.locator('.modal-overlay')).toBeHidden({ timeout: 10000 });
    await authenticatedPage.waitForLoadState('networkidle');

    // Verificar que aparece en la tabla
    await expect(authenticatedPage.locator('tbody tr', { hasText: 'María López' })).toBeVisible();

    // Cleanup via API
    const res = await fetch(`http://localhost:8085/api/leads?q=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${await getAdminToken()}` }
    });
    const data = await res.json();
    createdLeadId = data.data?.content?.[0]?.leadId;
  });

  test('busca leads por nombre', async ({ authenticatedPage, adminToken }) => {
    const uniqueName = `BuscableE2E${Date.now()}`;
    const lead = await apiCreateLead(adminToken, {
      firstName: uniqueName, lastName: 'Test', email: `buscar-${Date.now()}@test.com`
    });
    createdLeadId = lead.leadId;

    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    await authenticatedPage.locator('input[placeholder*="Buscar"]').fill(uniqueName);
    await authenticatedPage.waitForTimeout(600);
    await authenticatedPage.waitForLoadState('networkidle');

    await expect(authenticatedPage.locator('tbody tr', { hasText: uniqueName })).toBeVisible();
  });

  test('busqueda sin resultados muestra tabla vacía', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    await authenticatedPage.locator('input[placeholder*="Buscar"]').fill('XYZNoExisteJamas999');
    await authenticatedPage.waitForTimeout(600);
    await authenticatedPage.waitForLoadState('networkidle');

    // Debe mostrar 0 filas o estado vacío
    const rowCount = await authenticatedPage.locator('tbody tr').count();
    const emptyState = authenticatedPage.locator('.empty-state');
    expect(rowCount === 0 || await emptyState.isVisible()).toBeTruthy();
  });

  test('cancela el modal sin crear lead', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    const initialCount = await authenticatedPage.locator('tbody tr').count();

    await authenticatedPage.locator('button', { hasText: '+ Nuevo Lead' }).click();
    await expect(authenticatedPage.locator('.modal-overlay')).toBeVisible();
    await authenticatedPage.locator('.modal-footer-custom .btn-secondary').click();
    await expect(authenticatedPage.locator('.modal-overlay')).toBeHidden();

    const finalCount = await authenticatedPage.locator('tbody tr').count();
    expect(finalCount).toBe(initialCount);
  });

  test('el lead creado aparece con la etapa correcta', async ({ authenticatedPage, adminToken }) => {
    const lead = await apiCreateLead(adminToken, {
      firstName: 'Etapa', lastName: 'Test', email: `etapa-${Date.now()}@test.com`,
      funnelStageId: 2
    });
    createdLeadId = lead.leadId;

    await authenticatedPage.goto('/leads');
    await authenticatedPage.waitForLoadState('networkidle');

    const row = authenticatedPage.locator('tbody tr', { hasText: 'Etapa Test' });
    await expect(row).toBeVisible();
    await expect(row.locator('.stage-badge')).toContainText('Captura de Leads');
  });
});

async function getAdminToken(): Promise<string> {
  const res = await fetch('http://localhost:8085/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@escuelabec.com', password: 'Admin123*' }),
  });
  return (await res.json()).data.token;
}
