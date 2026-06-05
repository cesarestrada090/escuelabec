import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewChecked {
  @ViewChild('trendChart') trendChartEl!: ElementRef;
  @ViewChild('funnelChart') funnelChartEl!: ElementRef;

  loading = true;
  summary: any = {};
  funnel: any[] = [];

  selectedMonth = '';
  availableMonths: { value: string; label: string }[] = [];

  private trendMonthly: any[] = [];
  private funnelData: any[] = [];
  private trendRendered = false;
  private funnelRendered = false;
  private trendInstance: ApexCharts | null = null;
  private funnelInstance: ApexCharts | null = null;

  constructor(private reportService: ReportService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildMonthOptions();
    this.loadAll();
  }

  ngAfterViewChecked(): void {
    if (!this.trendRendered && this.trendChartEl && this.trendMonthly.length > 0) {
      this.trendRendered = true;
      this.renderTrend();
    }
    if (!this.funnelRendered && this.funnelChartEl && this.funnelData.length > 0) {
      this.funnelRendered = true;
      this.renderFunnel();
    }
  }

  buildMonthOptions(): void {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      this.availableMonths.push({ value, label: this.shortMonth(value) });
    }
  }

  onMonthChange(): void {
    this.loading = true;
    this.trendRendered = false;
    this.funnelRendered = false;
    this.destroyCharts();
    this.loadAll();
  }

  private destroyCharts(): void {
    if (this.trendInstance) { this.trendInstance.destroy(); this.trendInstance = null; }
    if (this.funnelInstance) { this.funnelInstance.destroy(); this.funnelInstance = null; }
    if (this.trendChartEl) this.trendChartEl.nativeElement.innerHTML = '';
    if (this.funnelChartEl) this.funnelChartEl.nativeElement.innerHTML = '';
  }

  private loadAll(): void {
    const month = this.selectedMonth || undefined;
    let pending = 3;
    const done = () => { if (--pending === 0) { this.loading = false; this.cdr.detectChanges(); } };

    this.reportService.getDashboard(month).subscribe({
      next: (res) => { this.summary = res.data; done(); },
      error: () => done()
    });

    // Trend: si hay mes seleccionado no tiene sentido mostrar la curva mensual,
    // mostramos los últimos 6 meses igual para contexto
    this.reportService.getLeadsByMonth(6).subscribe({
      next: (res) => { this.trendMonthly = res.data; done(); },
      error: () => done()
    });

    this.reportService.getFunnel(month).subscribe({
      next: (res) => { this.funnelData = res.data; this.funnel = res.data; done(); },
      error: () => done()
    });
  }

  private renderTrend(): void {
    const months = this.trendMonthly.map(d => this.shortMonth(d.month));
    this.trendInstance = new ApexCharts(this.trendChartEl.nativeElement, {
      series: [
        { name: 'Leads', data: this.trendMonthly.map(d => d.count) },
        { name: 'Convertidos', data: this.trendMonthly.map(d => d.converted) }
      ],
      chart: { type: 'area', height: 240, toolbar: { show: false }, zoom: { enabled: false } },
      colors: ['#1A73E8', '#27AE60'],
      xaxis: { categories: months, labels: { style: { fontSize: '11px' } } },
      yaxis: { min: 0, labels: { style: { fontSize: '11px' } } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#F3F4F6', strokeDashArray: 3 },
      tooltip: { x: { show: true } },
      legend: { position: 'top', fontSize: '12px' }
    });
    this.trendInstance.render();
  }

  private renderFunnel(): void {
    this.funnelInstance = new ApexCharts(this.funnelChartEl.nativeElement, {
      series: [{ name: 'Leads', data: this.funnelData.map(s => s.count) }],
      chart: { type: 'bar', height: 220, toolbar: { show: false } },
      colors: ['#9B59B6','#3498DB','#1ABC9C','#F39C12','#E74C3C','#27AE60'],
      xaxis: { categories: this.funnelData.map(s => s.stageName), labels: { style: { fontSize: '10px' } } },
      plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '60%' } },
      dataLabels: { enabled: true, style: { fontSize: '11px' } },
      grid: { borderColor: '#F3F4F6', strokeDashArray: 3 },
      legend: { show: false }
    });
    this.funnelInstance.render();
  }

  shortMonth(m: string): string {
    const [y, mo] = m.split('-');
    const names = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${names[parseInt(mo)]} ${y.slice(2)}`;
  }

  get selectedMonthLabel(): string {
    return this.availableMonths.find(m => m.value === this.selectedMonth)?.label ?? '';
  }

  get growthPositive(): boolean { return (this.summary.growthRate ?? 0) >= 0; }
}
