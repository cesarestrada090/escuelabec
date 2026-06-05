import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FunnelService {
  constructor(private http: HttpClient) {}

  getStages(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/funnel/stages`);
  }
}
