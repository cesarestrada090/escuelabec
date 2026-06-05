import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeadSource {
  sourceId: number;
  name: string;
  active: boolean;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class LeadSourceService {
  private apiUrl = `${environment.apiUrl}/lead-sources`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  create(data: { name: string; position?: number }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: { name: string; position?: number; active?: boolean }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
