import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LeadService, Lead } from '../../../core/services/lead.service';
import { FunnelService } from '../../../core/services/funnel.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService, Vendor } from '../../../core/services/user.service';
import { LeadSourceService, LeadSource } from '../../../core/services/lead-source.service';

const PAGE_SIZE = 20;

interface StageData {
  leads: Lead[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
}

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent implements OnInit {
  stages: any[] = [];
  stageData: Record<number, StageData> = {};
  loading = true;

  // Filtros globales
  searchQuery = '';
  filterSource = '';
  sources: LeadSource[] = [];

  dragging: Lead | null = null;

  // Drawer
  selectedLead: Lead | null = null;
  drawerOpen = false;
  form: any = {};
  saving = false;
  deleting = false;

  private search$ = new Subject<string>();

  vendors: Vendor[] = [];
  drawerTab: 'data' | 'history' = 'data';
  history: any[] = [];
  loadingHistory = false;

  constructor(private leadService: LeadService, private funnelService: FunnelService, private toast: ToastService, private userService: UserService, private leadSourceService: LeadSourceService) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.resetAndLoad();
    });
    this.funnelService.getStages().subscribe({
      next: (res) => {
        this.stages = res.data;
        this.resetAndLoad();
      }
    });
    this.userService.findAll().subscribe({ next: (res) => this.vendors = res.data });
    this.leadSourceService.findAll().subscribe({ next: (res) => this.sources = res.data });
  }

  onSearchInput(): void { this.search$.next(this.searchQuery); }
  onFilterChange(): void { this.resetAndLoad(); }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterSource = '';
    this.resetAndLoad();
  }

  get hasFilters(): boolean {
    return !!this.searchQuery || !!this.filterSource;
  }

  private resetAndLoad(): void {
    this.loading = true;
    const total = this.stages.length;
    let loaded = 0;
    this.stages.forEach(stage => {
      this.stageData[stage.stageId] = { ...(this.stageData[stage.stageId] || {}), loading: true } as StageData;
      this.loadStage(stage.stageId, 0, () => {
        loaded++;
        if (loaded === total) this.loading = false;
      });
    });
  }

  private loadStage(stageId: number, page: number, done?: () => void): void {
    const q = this.searchQuery || undefined;
    const src = this.filterSource || undefined;
    this.leadService.findByStage(stageId, q, page, PAGE_SIZE, src).subscribe({
      next: (res) => {
        const p = res.data;
        this.stageData[stageId] = {
          leads: p.content,
          total: p.totalElements,
          totalPages: p.totalPages,
          currentPage: page,
          loading: false,
        };
        done?.();
      },
      error: () => {
        const d = this.stageData[stageId];
        if (d) this.stageData[stageId] = { ...d, loading: false };
        done?.();
      }
    });
  }

  private buildQuery(): string {
    // Combine text search + source filter into one query string
    // Backend searches firstName/lastName/email — source filter is client-side via separate param
    return this.searchQuery;
  }

  getLeads(stageId: number): Lead[] {
    return this.stageData[stageId]?.leads || [];
  }

  getTotal(stageId: number): number {
    return this.stageData[stageId]?.total ?? 0;
  }

  getCurrentPage(stageId: number): number {
    return this.stageData[stageId]?.currentPage ?? 0;
  }

  getTotalPages(stageId: number): number {
    return this.stageData[stageId]?.totalPages ?? 0;
  }

  isLoadingStage(stageId: number): boolean {
    return !!this.stageData[stageId]?.loading;
  }

  goToPage(stageId: number, page: number): void {
    const data = this.stageData[stageId];
    if (!data || page < 0 || page >= data.totalPages) return;
    this.stageData[stageId] = { ...data, loading: true };
    this.loadStage(stageId, page);
  }

  // Drawer
  openDrawer(lead: Lead, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedLead = lead;
    this.form = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || '',
      source: lead.source || '',
      funnelStageId: lead.funnelStageId,
      assignedTo: lead.assignedTo || '',
      notes: lead.notes || '',
    };
    this.drawerTab = 'data';
    this.history = [];
    this.drawerOpen = true;
  }

  openHistoryTab(): void {
    this.drawerTab = 'history';
    if (!this.selectedLead || this.history.length > 0) return;
    this.loadingHistory = true;
    this.leadService.getHistory(this.selectedLead.leadId).subscribe({
      next: (res) => { this.history = res.data; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedLead = null;
  }

  saveDrawer(): void {
    if (!this.selectedLead) return;
    this.saving = true;
    this.leadService.update(this.selectedLead.leadId, this.form).subscribe({
      next: (res) => {
        const updated: Lead = res.data;
        this.saving = false;
        this.toast.show('Lead actualizado correctamente');
        const oldStageId = this.selectedLead!.funnelStageId;
        const newStageId = updated.funnelStageId;
        if (oldStageId !== newStageId) {
          this.loadStage(oldStageId, this.stageData[oldStageId]?.currentPage ?? 0);
          this.loadStage(newStageId, this.stageData[newStageId]?.currentPage ?? 0);
        } else {
          const d = this.stageData[oldStageId];
          if (d) {
            this.stageData[oldStageId] = {
              ...d,
              leads: d.leads.map(l => l.leadId === updated.leadId ? updated : l),
            };
          }
        }
        this.closeDrawer();
      },
      error: () => { this.saving = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  deleteDrawer(): void {
    if (!this.selectedLead || !confirm('¿Eliminar este lead?')) return;
    this.deleting = true;
    const stageId = this.selectedLead.funnelStageId;
    const leadId = this.selectedLead.leadId;
    this.leadService.delete(leadId).subscribe({
      next: () => {
        this.deleting = false;
        this.toast.show('Lead eliminado');
        this.closeDrawer();
        const d = this.stageData[stageId];
        const page = d && d.leads.length === 1 && d.currentPage > 0
          ? d.currentPage - 1
          : d?.currentPage ?? 0;
        this.loadStage(stageId, page);
      },
      error: () => { this.deleting = false; this.toast.show('Error al eliminar', 'error'); }
    });
  }

  // Drag & drop
  onDragStart(lead: Lead, event: DragEvent): void {
    this.dragging = lead;
    event.dataTransfer?.setData('text/plain', String(lead.leadId));
  }

  onDrop(stageId: number): void {
    if (!this.dragging || this.dragging.funnelStageId === stageId) {
      this.dragging = null;
      return;
    }
    const lead = this.dragging;
    const oldStageId = lead.funnelStageId;
    this.dragging = null;

    this.leadService.moveStage(lead.leadId, stageId).subscribe({
      next: () => {
        this.loadStage(oldStageId, this.stageData[oldStageId]?.currentPage ?? 0);
        this.loadStage(stageId, this.stageData[stageId]?.currentPage ?? 0);
      },
      error: () => {}
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}
