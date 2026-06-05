import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lead {
  leadId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  funnelStageId: number;
  stageName: string;
  stageColor: string;
  notes: string;
  assignedTo: number;
  assignedToName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelStage {
  stageId: number;
  name: string;
  description: string;
  position: number;
  color: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  search(q?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<any>(this.apiUrl, { params });
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  findByStage(stageId: number, q?: string, page = 0, size = 20, source?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    if (source) params = params.set('source', source);
    return this.http.get<any>(`${this.apiUrl}/stage/${stageId}`, { params });
  }

  create(lead: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, lead);
  }

  update(id: number, lead: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, lead);
  }

  moveStage(id: number, funnelStageId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/stage`, { funnelStageId });
  }

  getHistory(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/history`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStatsByStage(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/by-stage`);
  }
}
