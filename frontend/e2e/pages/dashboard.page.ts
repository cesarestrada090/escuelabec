import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly totalLeadsNumber: Locator;
  readonly funnelCards: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.totalLeadsNumber = page.locator('.stat-card.total .stat-number');
    this.funnelCards = page.locator('.funnel-card');
    this.spinner = page.locator('.spinner-border');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  async expectTitle() {
    await expect(this.title).toContainText('Dashboard');
  }

  async expectFunnelStagesCount(count: number) {
    await expect(this.funnelCards).toHaveCount(count);
  }

  async getTotalLeads(): Promise<number> {
    const text = await this.totalLeadsNumber.textContent();
    return parseInt(text?.trim() || '0', 10);
  }

  async getStageCount(stageName: string): Promise<number> {
    const card = this.funnelCards.filter({ hasText: stageName });
    const countText = await card.locator('.stage-count').textContent();
    return parseInt(countText?.trim() || '0', 10);
  }
}
