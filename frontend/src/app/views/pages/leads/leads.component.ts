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
import { EventService } from '../../../core/services/event.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  stages: any[] = [];
  loading = false;
  searchQuery = '';

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = PAGE_SIZE;

  sources: LeadSource[] = [];

  // Crear modal
  showModal = false;
  saving = false;
  createForm: any = { firstName: '', lastName: '', email: '', phone: '', source: '', funnelStageId: 1, notes: '' };

  // Editar drawer
  drawerOpen = false;
  selectedLead: Lead | null = null;
  editForm: any = {};
  editSaving = false;
  editDeleting = false;

  private search$ = new Subject<string>();

  vendors: Vendor[] = [];
  drawerTab: 'data' | 'history' | 'activities' = 'data';
  history: any[] = [];
  loadingHistory = false;
  activities: any[] = [];
  loadingActivities = false;
  showActivityForm = false;
  savingActivity = false;
  editingActivityId: number | null = null;
  activityForm: any = { eventType: 'CALL', title: '', description: '', eventDate: '', status: 'PENDING' };

  constructor(private leadService: LeadService, private funnelService: FunnelService, private toast: ToastService, private userService: UserService, private leadSourceService: LeadSourceService, private eventService: EventService) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadLeads();
    });
    this.funnelService.getStages().subscribe(res => this.stages = res.data);
    this.userService.findAll().subscribe({ next: (res) => this.vendors = res.data });
    this.leadSourceService.findAll().subscribe({ next: (res) => this.sources = res.data });
    this.loadLeads();
  }

  onSearchInput(): void { this.search$.next(this.searchQuery); }

  loadLeads(): void {
    this.loading = true;
    this.leadService.search(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        const page = res.data;
        this.leads = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadLeads();
  }

  get endRow(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    const range: number[] = [];
    for (let i = Math.max(0, cur - 2); i <= Math.min(total - 1, cur + 2); i++) {
      range.push(i);
    }
    return range;
  }

  // Crear
  openModal(): void {
    this.createForm = { firstName: '', lastName: '', email: '', phone: '', source: '', funnelStageId: 1, notes: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    this.saving = true;
    this.leadService.create(this.createForm).subscribe({
      next: () => {
        this.toast.show('Lead creado correctamente');
        this.closeModal(); this.currentPage = 0; this.loadLeads(); this.saving = false;
      },
      error: () => { this.saving = false; this.toast.show('Error al crear el lead', 'error'); }
    });
  }

  // Editar drawer
  openDrawer(lead: Lead): void {
    this.selectedLead = lead;
    this.editForm = {
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
    this.activities = [];
    this.showActivityForm = false;
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

  openActivitiesTab(): void {
    this.drawerTab = 'activities';
    if (!this.selectedLead || this.activities.length > 0) return;
    this.loadActivities();
  }

  loadActivities(): void {
    if (!this.selectedLead) return;
    this.loadingActivities = true;
    this.eventService.findByLeadId(this.selectedLead.leadId).subscribe({
      next: (res) => { this.activities = res.data; this.loadingActivities = false; },
      error: () => { this.loadingActivities = false; }
    });
  }

  openActivityForm(activity?: any): void {
    if (activity) {
      this.editingActivityId = activity.eventId;
      this.activityForm = {
        eventType: activity.eventType,
        title: activity.title,
        description: activity.description || '',
        eventDate: activity.eventDate ? activity.eventDate.slice(0, 16) : '',
        status: activity.status
      };
    } else {
      this.editingActivityId = null;
      this.activityForm = { eventType: 'CALL', title: '', description: '', eventDate: '', status: 'PENDING' };
    }
    this.showActivityForm = true;
  }

  closeActivityForm(): void {
    this.showActivityForm = false;
    this.editingActivityId = null;
  }

  saveActivity(): void {
    if (!this.selectedLead || !this.activityForm.title.trim()) return;
    this.savingActivity = true;
    const payload = {
      ...this.activityForm,
      leadId: this.selectedLead.leadId,
      eventDate: this.activityForm.eventDate ? new Date(this.activityForm.eventDate + ':00').toISOString().slice(0, 19) : null
    };
    const req = this.editingActivityId
      ? this.eventService.update(this.editingActivityId, payload)
      : this.eventService.create(payload);
    req.subscribe({
      next: () => {
        this.savingActivity = false;
        this.closeActivityForm();
        this.activities = [];
        this.loadActivities();
        this.toast.show(this.editingActivityId ? 'Actividad actualizada' : 'Actividad creada');
      },
      error: () => { this.savingActivity = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  deleteActivity(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.eventService.delete(id).subscribe({
      next: () => {
        this.activities = this.activities.filter(a => a.eventId !== id);
        this.toast.show('Actividad eliminada');
      },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedLead = null;
  }

  saveDrawer(): void {
    if (!this.selectedLead) return;
    this.editSaving = true;
    this.leadService.update(this.selectedLead.leadId, this.editForm).subscribe({
      next: (res) => {
        this.editSaving = false;
        this.toast.show('Lead actualizado correctamente');
        const updated: Lead = res.data;
        this.leads = this.leads.map(l => l.leadId === updated.leadId ? updated : l);
        this.closeDrawer();
      },
      error: () => { this.editSaving = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  deleteDrawer(): void {
    if (!this.selectedLead || !confirm('¿Eliminar este lead?')) return;
    this.editDeleting = true;
    const id = this.selectedLead.leadId;
    this.leadService.delete(id).subscribe({
      next: () => {
        this.editDeleting = false;
        this.toast.show('Lead eliminado');
        this.closeDrawer();
        this.loadLeads();
      },
      error: () => { this.editDeleting = false; this.toast.show('Error al eliminar', 'error'); }
    });
  }
}
