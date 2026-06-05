import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./views/pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./views/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () => import('./views/pages/leads/leads.component').then(m => m.LeadsComponent)
      },
      {
        path: 'pipeline',
        loadComponent: () => import('./views/pages/pipeline/pipeline.component').then(m => m.PipelineComponent)
      },
      {
        path: 'vendors',
        loadComponent: () => import('./views/pages/vendors/vendors.component').then(m => m.VendorsComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./views/pages/events/events.component').then(m => m.EventsComponent)
      },
      {
        loadComponent: () => import('./views/pages/lead-sources/lead-sources.component').then(m => m.LeadSourcesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./views/pages/reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
