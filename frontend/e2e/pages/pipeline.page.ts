import { Page, Locator, expect } from '@playwright/test';

export class PipelinePage {
  readonly page: Page;
  readonly title: Locator;
  readonly columns: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.columns = page.locator('.kanban-column');
    this.spinner = page.locator('.spinner-border');
  }

  async goto() {
    await this.page.goto('/pipeline');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  async expectTitle() {
    await expect(this.title).toContainText('Pipeline');
  }

  async expectColumnsCount(count: number) {
    await expect(this.columns).toHaveCount(count);
  }

  async getColumnByName(name: string): Promise<Locator> {
    return this.columns.filter({ hasText: name });
  }

  async getLeadCountInColumn(columnName: string): Promise<number> {
    const col = this.columns.filter({ hasText: columnName });
    const badge = col.locator('.column-count');
    const text = await badge.textContent();
    return parseInt(text?.trim() || '0', 10);
  }

  async expectLeadInColumn(columnName: string, leadName: string) {
    const col = this.columns.filter({ hasText: columnName });
    const card = col.locator('.lead-card', { hasText: leadName });
    await expect(card).toBeVisible({ timeout: 10000 });
  }

  async dragLeadToColumn(leadName: string, targetColumnName: string) {
    const card = this.page.locator('.lead-card', { hasText: leadName });
    const targetCol = this.columns.filter({ hasText: targetColumnName }).locator('.column-body');

    await card.dragTo(targetCol);
    await this.page.waitForTimeout(1000);
  }
}
