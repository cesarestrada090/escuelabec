import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { LeadService } from '../../../core/services/lead.service';
import { ToastService } from '../../../core/services/toast.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  loading = false;

  filterType   = '';
  filterStatus = '';

  currentPage   = 0;
  totalPages    = 0;
  totalElements = 0;
  pageSize      = PAGE_SIZE;

  showModal    = false;
  saving       = false;
  editingId: number | null = null;

  leads: any[] = [];
  form: any = { leadId: '', eventType: 'CALL', title: '', description: '', eventDate: '', status: 'PENDING' };

  eventTypes = [
    { value: 'CALL',    label: 'Llamada' },
    { value: 'EMAIL',   label: 'Email' },
    { value: 'MEETING', label: 'Reunión' },
    { value: 'NOTE',    label: 'Nota' },
    { value: 'TASK',    label: 'Tarea' },
  ];

  constructor(
    private eventService: EventService,
    private leadService: LeadService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
    this.leadService.search('', 0, 200).subscribe({ next: (res) => this.leads = res.data.content });
  }

  load(): void {
    this.loading = true;
    this.eventService.findAll(this.currentPage, this.pageSize, this.filterType || undefined, this.filterStatus || undefined).subscribe({
      next: (res) => {
        this.events        = res.data.content;
        this.totalPages    = res.data.totalPages;
        this.totalElements = res.data.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.load();
  }

  get endRow(): number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }

  get pages(): number[] {
    const range: number[] = [];
    for (let i = Math.max(0, this.currentPage - 2); i <= Math.min(this.totalPages - 1, this.currentPage + 2); i++) {
      range.push(i);
    }
    return range;
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { leadId: '', eventType: 'CALL', title: '', description: '', eventDate: '', status: 'PENDING' };
    this.showModal = true;
  }

  openEdit(ev: any): void {
    this.editingId = ev.eventId;
    this.form = {
      leadId:      ev.leadId,
      eventType:   ev.eventType,
      title:       ev.title,
      description: ev.description || '',
      eventDate:   ev.eventDate ? ev.eventDate.slice(0, 16) : '',
      status:      ev.status
    };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.title.trim() || !this.form.leadId) return;
    this.saving = true;
    const payload = {
      ...this.form,
      eventDate: this.form.eventDate ? new Date(this.form.eventDate + ':00').toISOString().slice(0, 19) : null
    };
    const req = this.editingId
      ? this.eventService.update(this.editingId, payload)
      : this.eventService.create(payload);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.load();
        this.toast.show(this.editingId ? 'Actividad actualizada' : 'Actividad creada');
      },
      error: () => { this.saving = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.eventService.delete(id).subscribe({
      next: () => { this.load(); this.toast.show('Actividad eliminada'); },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }

  typeLabel(t: string): string {
    return this.eventTypes.find(e => e.value === t)?.label ?? t;
  }
}
