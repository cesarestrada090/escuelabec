import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadSourceService, LeadSource } from '../../../core/services/lead-source.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-lead-sources',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-sources.component.html',
  styleUrls: ['./lead-sources.component.scss']
})
export class LeadSourcesComponent implements OnInit {
  sources: LeadSource[] = [];
  loading = false;

  showModal = false;
  saving = false;
  editingId: number | null = null;
  form = { name: '', position: 0 };

  constructor(private leadSourceService: LeadSourceService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.leadSourceService.findAll().subscribe({
      next: (res) => { this.sources = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { name: '', position: this.sources.length + 1 };
    this.showModal = true;
  }

  openEdit(src: LeadSource): void {
    this.editingId = src.sourceId;
    this.form = { name: src.name, position: src.position };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.name.trim()) return;
    this.saving = true;
    const req = this.editingId
      ? this.leadSourceService.update(this.editingId, this.form)
      : this.leadSourceService.create(this.form);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.toast.show(this.editingId ? 'Fuente actualizada' : 'Fuente creada');
        this.closeModal();
        this.load();
      },
      error: () => { this.saving = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  delete(src: LeadSource): void {
    if (!confirm(`¿Desactivar la fuente "${src.name}"?`)) return;
    this.leadSourceService.delete(src.sourceId).subscribe({
      next: () => { this.toast.show('Fuente desactivada'); this.load(); },
      error: () => { this.toast.show('Error al desactivar', 'error'); }
    });
  }
}
