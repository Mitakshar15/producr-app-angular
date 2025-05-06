import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = `${environment.apiUrl}/tracks`;

  constructor(private http: HttpClient) {}

  getUserTracks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user`);
  }

  getTrack(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTrack(trackData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, trackData);
  }

  updateTrack(id: string, trackData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trackData);
  }

  deleteTrack(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publishTrack(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishTrack(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/unpublish`, {});
  }
}
