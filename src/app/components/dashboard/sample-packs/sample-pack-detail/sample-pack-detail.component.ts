import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SamplePack, AudioSample } from '../../../../interfaces/sample-pack.interface';
import { TrackPlayerComponent } from '../../../shared/track-player/track-player.component';
import { Track } from '../../../../interfaces/track.interface';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';

interface DialogData {
  samplePack: SamplePack;
}

@Component({
  selector: 'app-sample-pack-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TrackPlayerComponent
  ],
  templateUrl: './sample-pack-detail.component.html',
  styleUrls: ['./sample-pack-detail.component.scss']
})
export class SamplePackDetailComponent implements OnInit, OnDestroy {
  @ViewChild(TrackPlayerComponent) trackPlayer!: TrackPlayerComponent;
  
  samplePack: SamplePack;
  selectedSample: AudioSample | null = null;
  isPlaying = false;
  currentTrack: Track | null = null;
  
  private playerStateSubscription?: Subscription;
  
  constructor(
    public dialogRef: MatDialogRef<SamplePackDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.samplePack = data.samplePack;
  }

  ngOnInit(): void {
    // Select the first sample by default if available
    if (this.samplePack.samples && this.samplePack.samples.length > 0) {
      this.selectSample(this.samplePack.samples[0]);
    }
  }

  ngOnDestroy(): void {
    // Clean up any resources
    if (this.playerStateSubscription) {
      this.playerStateSubscription.unsubscribe();
    }
  }

  /**
   * Select a sample to preview
   */
  selectSample(sample: AudioSample): void {
    // If the same sample is already selected, don't reset
    if (this.selectedSample?.id === sample.id) {
      return;
    }
    
    this.selectedSample = sample;
    
    // Create a track object for the TrackPlayerComponent
    if (sample.previewUrl) {
      this.currentTrack = this.createTrackFromSample(sample);
      this.isPlaying = false; // Reset playing state when changing samples
    } else {
      this.currentTrack = null;
      this.isPlaying = false;
    }
  }

  /**
   * Create a Track object from an AudioSample
   */
  private createTrackFromSample(sample: AudioSample): Track {
    return {
      id: sample.id,
      title: sample.name,
      description: `Preview of ${sample.name}`,
      audioFileUrl: this.getFullAudioUrl(sample.previewUrl || ''),
      trackLengthSeconds: sample.durationSeconds,
      producer: this.samplePack.producer,
      playsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: sample.createdAt,
      updatedAt: sample.updatedAt
    };
  }

  /**
   * Get the full audio URL
   */
  private getFullAudioUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    } else {
      return `${environment.audioBaseUrl}/${url}`;
    }
  }

  /**
   * Play a sample preview
   */
  playSample(sample: AudioSample): void {
    if (!sample.previewUrl) {
      return;
    }
    
    // If this is the currently selected sample, toggle play/pause
    if (this.selectedSample?.id === sample.id) {
      this.togglePlayback();
    } else {
      // Select the new sample and play it
      this.selectSample(sample);
      // Wait for the next tick to ensure the player is initialized
      setTimeout(() => {
        if (this.trackPlayer) {
          this.trackPlayer.togglePlayback();
          this.isPlaying = true;
        }
      }, 100);
    }
  }

  /**
   * Toggle playback of the current sample
   */
  togglePlayback(): void {
    if (this.trackPlayer) {
      this.trackPlayer.togglePlayback();
      this.isPlaying = !this.isPlaying;
    }
  }

  /**
   * Close the dialog
   */
  close(): void {
    // Stop playback before closing
    if (this.trackPlayer && this.isPlaying) {
      this.trackPlayer.togglePlayback();
    }
    this.dialogRef.close();
  }

  /**
   * Purchase the sample pack
   */
  purchasePack(): void {
    // TODO: Implement purchase functionality
    console.log('Purchase sample pack:', this.samplePack.id);
    // This would typically redirect to a checkout page or open a payment dialog
  }

  /**
   * Download the sample pack
   */
  downloadPack(): void {
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = this.samplePack.zipFileUrl;
    link.download = `${this.samplePack.title.replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get file extension from URL
   */
  getFileExtension(url: string): string {
    return url.split('.').pop()?.toUpperCase() || '';
  }
}
