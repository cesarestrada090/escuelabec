import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of items; track toast.id) {
        <div class="toast-item" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'" (click)="dismiss(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.14);
      cursor: pointer;
      pointer-events: all;
      animation: toastIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 320px;
    }
    .toast-success { background: #111827; color: #fff; }
    .toast-success .toast-icon { color: #34D399; }
    .toast-error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
    .toast-error .toast-icon { color: #EF4444; }
    .toast-icon { display: flex; flex-shrink: 0; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
  private svc: ToastService = inject(ToastService);

  get items(): Toast[] {
    return this.svc.toasts();
  }

  dismiss(id: number): void {
    this.svc.remove(id);
  }
}
