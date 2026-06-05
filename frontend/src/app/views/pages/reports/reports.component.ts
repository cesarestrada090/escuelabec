import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, AfterViewChecked {
  @ViewChild('monthChart') monthChartEl!: ElementRef;
  @ViewChild('sourceChart') sourceChartEl!: ElementRef;

  loading = true;
  vendors: any[] = [];
  sourceData: any[] = [];

  selectedMonth = '';
  availableMonths: { value: string; label: string }[] = [];

  private monthlyData: any[] = [];
  private sourceRaw: any[] = [];
  private monthRendered = false;
  private sourceRendered = false;
  private sourceChartInstance: ApexCharts | null = null;

  constructor(private reportService: ReportService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildMonthOptions();

    this.reportService.getLeadsByMonth(6).subscribe({
      next: (res) => {
        this.monthlyData = res.data;
        this.cdr.detectChanges();
      }
    });

    this.loadSourceChart();

    this.reportService.getVendors().subscribe({
      next: (res) => {
        this.vendors = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.monthRendered && this.monthChartEl && this.monthlyData.length > 0) {
      this.monthRendered = true;
      this.renderMonthChart();
    }
    if (!this.sourceRendered && this.sourceChartEl && this.sourceRaw.length > 0) {
      this.sourceRendered = true;
      this.renderSourceChart();
    }
  }

  buildMonthOptions(): void {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = this.shortMonth(value);
      this.availableMonths.push({ value, label });
    }
  }

  onMonthChange(): void {
    this.sourceRendered = false;
    if (this.sourceChartInstance) {
      this.sourceChartInstance.destroy();
      this.sourceChartInstance = null;
      this.sourceChartEl.nativeElement.innerHTML = '';
    }
    this.loadSourceChart();
  }

  private loadSourceChart(): void {
    const month = this.selectedMonth || undefined;
    this.reportService.getLeadsBySource(month).subscribe({
      next: (res) => {
        this.sourceRaw = res.data;
        const total = res.data.reduce((s: number, d: any) => s + d.count, 0);
        this.sourceData = res.data.map((d: any) => ({
          ...d,
          pct: total > 0 ? Math.round(d.count / total * 100) : 0
        }));
        this.cdr.detectChanges();
      }
    });
  }

  private renderMonthChart(): void {
    const months = this.monthlyData.map(d => this.shortMonth(d.month));
    new ApexCharts(this.monthChartEl.nativeElement, {
      series: [
        { name: 'Leads', data: this.monthlyData.map(d => d.count) },
        { name: 'Convertidos', data: this.monthlyData.map(d => d.converted) }
      ],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      colors: ['#1A73E8', '#27AE60'],
      xaxis: { categories: months, labels: { style: { fontSize: '11px' } } },
      yaxis: { min: 0, labels: { style: { fontSize: '11px' } } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#F3F4F6', strokeDashArray: 3 },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      tooltip: { shared: true, intersect: false },
      legend: { position: 'top', fontSize: '12px' }
    }).render();
  }

  private renderSourceChart(): void {
    if (!this.sourceChartEl) return;
    const colors = ['#1A73E8','#3498DB','#9B59B6','#27AE60','#F39C12','#E74C3C','#1ABC9C','#FBBC04','#EA4335','#34A853','#FF6D00','#607D8B'];
    this.sourceChartInstance = new ApexCharts(this.sourceChartEl.nativeElement, {
      series: [{ name: 'Leads', data: this.sourceRaw.map(d => d.count) }],
      chart: { type: 'bar', height: Math.max(220, this.sourceRaw.length * 36), toolbar: { show: false } },
      colors,
      xaxis: { categories: this.sourceRaw.map(d => d.source), labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, barHeight: '60%', distributed: true, dataLabels: { position: 'top' } }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val,
        offsetX: 18,
        style: { fontSize: '11px', colors: ['#374151'] }
      },
      grid: { borderColor: '#F3F4F6', strokeDashArray: 3, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      legend: { show: false },
      tooltip: { y: { formatter: (val: number) => `${val} leads` } }
    });
    this.sourceChartInstance.render();
  }

  shortMonth(m: string): string {
    const [y, mo] = m.split('-');
    const names = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${names[parseInt(mo)]} ${y.slice(2)}`;
  }

  get selectedMonthLabel(): string {
    return this.availableMonths.find(m => m.value === this.selectedMonth)?.label ?? '';
  }

  convBar(rate: number): number { return Math.min(rate, 100); }
}
