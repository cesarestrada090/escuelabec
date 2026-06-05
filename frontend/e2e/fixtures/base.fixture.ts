import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LeadsPage } from '../pages/leads.page';
import { PipelinePage } from '../pages/pipeline.page';

export const TEST_USERS = {
  admin: {
    email: 'admin@escuelabec.com',
    password: 'Admin123*',
    name: 'Admin BEC',
    role: 'ADMIN',
  },
} as const;

export const API_URL = 'http://localhost:8085/api';

// ─── Helpers de API directos (más rápidos que UI para setup) ───────────────
export async function apiLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login API falló: ${data.message}`);
  return data.data.token;
}

export async function apiCreateLead(token: string, lead: {
  firstName: string; lastName: string; email: string;
  phone?: string; source?: string; funnelStageId?: number;
}) {
  const res = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ funnelStageId: 1, ...lead }),
  });
  return (await res.json()).data;
}

export async function apiDeleteLead(token: string, leadId: number) {
  await fetch(`${API_URL}/leads/${leadId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function apiCleanupLeadsByEmail(token: string, email: string) {
  const res = await fetch(`${API_URL}/leads?q=${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  const leads = data.data?.content || [];
  for (const lead of leads) {
    await apiDeleteLead(token, lead.leadId);
  }
}

// ─── Helpers de UI ──────────────────────────────────────────────────────────
export async function uiLoginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWait(TEST_USERS.admin.email, TEST_USERS.admin.password);
}

export async function setAuthInBrowser(page: Page, email: string, password: string) {
  const token = await apiLogin(email, password);
  const user = {
    email,
    firstName: 'Admin',
    lastName: 'BEC',
    role: 'ADMIN',
    active: true,
  };
  // Inyectar token en localStorage para evitar el flujo de login en cada test
  await page.goto('/');
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, { t: token, u: user });
}

// ─── Tipo de fixtures extendidas ────────────────────────────────────────────
type CrmFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  leadsPage: LeadsPage;
  pipelinePage: PipelinePage;
  adminToken: string;
  authenticatedPage: Page;
};

export const test = base.extend<CrmFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  leadsPage: async ({ page }, use) => {
    await use(new LeadsPage(page));
  },

  pipelinePage: async ({ page }, use) => {
    await use(new PipelinePage(page));
  },

  adminToken: async ({}, use) => {
    const token = await apiLogin(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(token);
  },

  // Página ya autenticada como admin via localStorage (evita el flow UI de login)
  authenticatedPage: async ({ page }, use) => {
    const token = await apiLogin(TEST_USERS.admin.email, TEST_USERS.admin.password);
    const user = {
      userId: 2,
      email: TEST_USERS.admin.email,
      firstName: 'Admin',
      lastName: 'BEC',
      role: 'ADMIN',
      active: true,
    };
    // Ir a la app primero para que el dominio esté activo, luego inyectar
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    }, { t: token, u: user });
    await use(page);
  },
});

export { expect } from '@playwright/test';
