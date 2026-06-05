import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Vendor } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {
  vendors: Vendor[] = [];
  loading = false;

  showModal = false;
  editingVendor: Vendor | null = null;
  saving = false;

  form: any = { firstName: '', lastName: '', email: '', password: '', role: 'SALES' };
  roles = ['SALES', 'MARKETING', 'ADMIN', 'VIEWER'];

  constructor(private userService: UserService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.findAll().subscribe({
      next: (res) => { this.vendors = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingVendor = null;
    this.form = { firstName: '', lastName: '', email: '', password: '', role: 'SALES' };
    this.showModal = true;
  }

  openEdit(v: Vendor): void {
    this.editingVendor = v;
    this.form = { firstName: v.firstName, lastName: v.lastName, email: v.email, password: '', role: v.role };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    this.saving = true;
    const obs = this.editingVendor
      ? this.userService.update(this.editingVendor.userId, this.form)
      : this.userService.create(this.form);

    obs.subscribe({
      next: () => {
        this.toast.show(this.editingVendor ? 'Vendedor actualizado' : 'Vendedor creado');
        this.saving = false;
        this.closeModal();
        this.load();
      },
      error: () => { this.saving = false; this.toast.show('Error al guardar', 'error'); }
    });
  }

  deactivate(v: Vendor): void {
    if (!confirm(`¿Desactivar a ${v.firstName} ${v.lastName}?`)) return;
    this.userService.deactivate(v.userId).subscribe({
      next: () => { this.toast.show('Vendedor desactivado'); this.load(); },
      error: () => this.toast.show('Error al desactivar', 'error')
    });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = { ADMIN: 'Admin', SALES: 'Ventas', MARKETING: 'Marketing', VIEWER: 'Viewer' };
    return map[role] ?? role;
  }

  roleColor(role: string): string {
    const map: Record<string, string> = { ADMIN: '#7C3AED', SALES: '#1A73E8', MARKETING: '#059669', VIEWER: '#6B7280' };
    return map[role] ?? '#6B7280';
  }
}
