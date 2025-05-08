import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TrackService } from '../../../services/track.service';
import { Track, TrackResponse } from '../../../interfaces/track.interface';
import { TrackPlayerComponent } from '../../shared/track-player/track-player.component';

@Component({
  selector: 'app-tracks',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    TrackPlayerComponent
  ],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit {
  tracks: Track[] = [];

  constructor(private trackService: TrackService) {}

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks() {
    console.log('Loading tracks...');
    this.trackService.getUserTracks().subscribe({
      next: (response: TrackResponse) => {
        console.log('Track response:', response);
        if (response.status.statusCode === 200 && response.data) {
          this.tracks = response.data;
          console.log('Tracks loaded:', this.tracks);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error: unknown) => {
        console.error('Error loading tracks:', error);
      }
    });
  }

  uploadTrack() {
    // TODO: Implement track upload dialog
    console.log('Upload track clicked');
  }

  editTrack(track: Track) {
    // TODO: Implement track edit dialog
    console.log('Edit track clicked:', track);
  }

  deleteTrack(trackId: string) {
    if (confirm('Are you sure you want to delete this track?')) {
      this.trackService.deleteTrack(trackId).subscribe({
        next: (response: TrackResponse) => {
          if (response.status.statusCode === 200) {
            this.tracks = this.tracks.filter(t => t.id !== trackId);
          }
        },
        error: (error: unknown) => {
          console.error('Error deleting track:', error);
        }
      });
    }
  }

  shareTrack(track: Track) {
    this.trackService.shareTrack(track.id).subscribe({
      next: (response: TrackResponse) => {
        if (response.status.statusCode === 200) {
          // TODO: Show share dialog with URL
          console.log('Share URL:', response.data);
        }
      },
      error: (error: unknown) => {
        console.error('Error sharing track:', error);
      }
    });
  }
}
