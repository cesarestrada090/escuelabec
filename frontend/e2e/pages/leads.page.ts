import { Page, Locator, expect } from '@playwright/test';

export class LeadsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newLeadButton: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;
  readonly spinner: Locator;

  // Modal
  readonly modal: Locator;
  readonly modalFirstName: Locator;
  readonly modalLastName: Locator;
  readonly modalEmail: Locator;
  readonly modalPhone: Locator;
  readonly modalSource: Locator;
  readonly modalStage: Locator;
  readonly modalNotes: Locator;
  readonly modalSaveButton: Locator;
  readonly modalCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.newLeadButton = page.locator('button', { hasText: '+ Nuevo Lead' });
    this.searchInput = page.locator('input[placeholder*="Buscar"]');
    this.tableRows = page.locator('tbody tr');
    this.emptyState = page.locator('.empty-state');
    this.spinner = page.locator('.spinner-border');

    this.modal = page.locator('.modal-overlay');
    this.modalFirstName = this.modal.locator('input').nth(0);
    this.modalLastName = this.modal.locator('input').nth(1);
    this.modalEmail = this.modal.locator('input[type="email"]');
    this.modalPhone = this.modal.locator('input').nth(3);
    this.modalSource = this.modal.locator('select').first();
    this.modalStage = this.modal.locator('select').last();
    this.modalNotes = this.modal.locator('textarea');
    this.modalSaveButton = this.modal.locator('button.btn-primary');
    this.modalCancelButton = this.modal.locator('button.btn-secondary');
  }

  async goto() {
    await this.page.goto('/leads');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  async openNewLeadModal() {
    await this.newLeadButton.click();
    await expect(this.modal).toBeVisible({ timeout: 5000 });
  }

  async fillLeadForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source?: string;
    stageId?: string;
    notes?: string;
  }) {
    await this.modalFirstName.fill(data.firstName);
    await this.modalLastName.fill(data.lastName);
    await this.modalEmail.fill(data.email);
    if (data.phone) await this.modalPhone.fill(data.phone);
    if (data.source) await this.modalSource.selectOption(data.source);
    if (data.stageId) await this.modalStage.selectOption(data.stageId);
    if (data.notes) await this.modalNotes.fill(data.notes);
  }

  async saveModal() {
    await this.modalSaveButton.click();
    await expect(this.modal).toBeHidden({ timeout: 10000 });
    await this.waitForLoad();
  }

  async createLead(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source?: string;
    stageId?: string;
    notes?: string;
  }) {
    await this.openNewLeadModal();
    await this.fillLeadForm(data);
    await this.saveModal();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
    await this.waitForLoad();
  }

  async expectLeadInTable(name: string) {
    const row = this.tableRows.filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async expectLeadNotInTable(name: string) {
    const row = this.tableRows.filter({ hasText: name });
    await expect(row).toHaveCount(0);
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async deleteLead(name: string) {
    const row = this.tableRows.filter({ hasText: name });
    await row.locator('button.btn-outline-danger').click();
    this.page.once('dialog', d => d.accept());
    await this.waitForLoad();
  }
}
