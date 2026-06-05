import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrmEvent {
  eventId: number;
  leadId: number;
  leadName: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: string;
  status: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  findByLeadId(leadId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lead/${leadId}`);
  }

  findAll(page = 0, size = 20, type?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type)   params = params.set('type', type);
    if (status) params = params.set('status', status);
    return this.http.get<any>(this.apiUrl, { params });
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
