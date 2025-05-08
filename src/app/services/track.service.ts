import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Track, TrackResponse } from '../interfaces/track.interface';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = `${environment.apiUrl}/track`;

  constructor(private http: HttpClient) {}

  getUserTracks(): Observable<TrackResponse> {
    console.log('Fetching tracks from:', `${this.apiUrl}/getUserTrack`);
    return this.http.get<TrackResponse>(`${this.apiUrl}/getUserTrack`).pipe(
      tap(response => {
        console.log('Raw API response:', response);
      }),
      catchError(error => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  getTrack(id: string): Observable<TrackResponse> {
    return this.http.get<TrackResponse>(`${this.apiUrl}/${id}`);
  }

  createTrack(trackData: FormData): Observable<TrackResponse> {
    return this.http.post<TrackResponse>(`${this.apiUrl}`, trackData);
  }

  updateTrack(id: string, trackData: FormData): Observable<TrackResponse> {
    return this.http.put<TrackResponse>(`${this.apiUrl}/${id}`, trackData);
  }

  deleteTrack(id: string): Observable<TrackResponse> {
    return this.http.delete<TrackResponse>(`${this.apiUrl}/${id}`);
  }

  shareTrack(id: string): Observable<TrackResponse> {
    return this.http.post<TrackResponse>(`${this.apiUrl}/${id}/share`, {});
  }
}
