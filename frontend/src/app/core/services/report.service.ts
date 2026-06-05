import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getDashboard(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : undefined;
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { params });
  }

  getLeadsByMonth(months = 6): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leads-by-month?months=${months}`);
  }

  getLeadsBySource(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : undefined;
    return this.http.get<any>(`${this.apiUrl}/leads-by-source`, { params });
  }

  getFunnel(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : undefined;
    return this.http.get<any>(`${this.apiUrl}/funnel`, { params });
  }

  getVendors(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : undefined;
    return this.http.get<any>(`${this.apiUrl}/vendors`, { params });
  }
}
