import { test, expect, TEST_USERS } from '../fixtures/base.fixture';
import { LoginPage } from '../pages/login.page';

test.describe('Auth - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('muestra el formulario de login', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bienvenido');
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('login exitoso con credenciales correctas', async ({ page }) => {
    await loginPage.loginAndWait(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('muestra error con contraseña incorrecta', async () => {
    await loginPage.login(TEST_USERS.admin.email, 'WrongPassword123');
    await loginPage.expectError('Credenciales inválidas');
  });

  test('muestra error con email inexistente', async () => {
    await loginPage.login('noexiste@test.com', 'Password123');
    await loginPage.expectError('Usuario no encontrado');
  });

  test('redirige a login si no está autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('redirige a login si no está autenticado en leads', async ({ page }) => {
    await page.goto('/leads');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
