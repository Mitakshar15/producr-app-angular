import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackService } from '../../../services/track.service';

interface Track {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: Date;
  status: 'draft' | 'published';
}

@Component({
  selector: 'app-tracks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracks-container">
      <div class="tracks-header">
        <h2>My Tracks</h2>
        <button class="create-btn" (click)="createNewTrack()">Create New Track</button>
      </div>

      <div class="tracks-filter">
        <button 
          [class.active]="currentFilter === 'all'"
          (click)="filterTracks('all')">
          All
        </button>
        <button 
          [class.active]="currentFilter === 'published'"
          (click)="filterTracks('published')">
          Published
        </button>
        <button 
          [class.active]="currentFilter === 'draft'"
          (click)="filterTracks('draft')">
          Drafts
        </button>
      </div>

      <div class="tracks-grid">
        <div *ngFor="let track of filteredTracks" class="track-card">
          <div class="track-image">
            <img [src]="track.coverImage || 'assets/default-track.png'" [alt]="track.title">
            <span class="status-badge" [class]="track.status">{{track.status}}</span>
          </div>
          <div class="track-info">
            <h3>{{track.title}}</h3>
            <p>{{track.description}}</p>
            <div class="track-meta">
              <span>Created: {{track.createdAt | date}}</span>
            </div>
            <div class="track-actions">
              <button (click)="editTrack(track)">Edit</button>
              <button (click)="deleteTrack(track)" class="delete">Delete</button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredTracks.length === 0" class="no-tracks">
          No tracks found. Create your first track!
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracks-container {
      padding: 1rem;
    }

    .tracks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .create-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .tracks-filter {
      margin-bottom: 2rem;
    }

    .tracks-filter button {
      background: none;
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .tracks-filter button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .track-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .track-card:hover {
      transform: translateY(-4px);
    }

    .track-image {
      position: relative;
      height: 200px;
    }

    .track-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      text-transform: capitalize;
    }

    .status-badge.published {
      background: #28a745;
      color: white;
    }

    .status-badge.draft {
      background: #ffc107;
      color: black;
    }

    .track-info {
      padding: 1.5rem;
    }

    .track-info h3 {
      margin: 0 0 0.5rem;
    }

    .track-meta {
      font-size: 0.875rem;
      color: #666;
      margin: 1rem 0;
    }

    .track-actions {
      display: flex;
      gap: 0.5rem;
    }

    .track-actions button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .track-actions button:first-child {
      background: #007bff;
      color: white;
    }

    .track-actions button.delete {
      background: #dc3545;
      color: white;
    }

    .no-tracks {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class TracksComponent implements OnInit {
  tracks: Track[] = [];
  filteredTracks: Track[] = [];
  currentFilter: 'all' | 'published' | 'draft' = 'all';

  constructor(private trackService: TrackService) {}

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks() {
    this.trackService.getUserTracks().subscribe(
      tracks => {
        this.tracks = tracks;
        this.filterTracks(this.currentFilter);
      },
      error => {
        console.error('Error loading tracks:', error);
      }
    );
  }

  filterTracks(filter: 'all' | 'published' | 'draft') {
    this.currentFilter = filter;
    if (filter === 'all') {
      this.filteredTracks = this.tracks;
    } else {
      this.filteredTracks = this.tracks.filter(track => track.status === filter);
    }
  }

  createNewTrack() {
    // Navigate to track creation page
  }

  editTrack(track: Track) {
    // Navigate to track edit page
  }

  deleteTrack(track: Track) {
    if (confirm('Are you sure you want to delete this track?')) {
      this.trackService.deleteTrack(track.id).subscribe(
        () => {
          this.tracks = this.tracks.filter(t => t.id !== track.id);
          this.filterTracks(this.currentFilter);
        },
        error => {
          console.error('Error deleting track:', error);
        }
      );
    }
  }
}
