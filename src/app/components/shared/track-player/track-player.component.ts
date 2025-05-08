import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { Track } from '../../../interfaces/track.interface';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-track-player',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSliderModule, FormsModule],
  template: `
    <div class="track-player">
      <div class="player-controls">
        <button class="play-btn" (click)="togglePlayback()">
          <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
      </div>
      
      <div class="player-content">
        <div class="waveform-container" (click)="onWaveformClick($event)">
          <div #waveform class="waveform"></div>
          <div *ngIf="!isWaveformReady" class="loading-indicator">
            <div class="loading-spinner"></div>
            <span>Loading audio...</span>
          </div>
        </div>
        
        <div class="player-info">
          <div class="time-info">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="duration">{{ formatTime(duration) }}</span>
          </div>
          
          <div class="volume-control">
            <button class="volume-btn" (click)="toggleMute()">
              <mat-icon>{{ isMuted ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down' }}</mat-icon>
            </button>
            <input 
              type="range" 
              class="volume-slider" 
              min="0" 
              max="1" 
              step="0.01" 
              [value]="volume" 
              (input)="onVolumeChange($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-player {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(145deg, #f8f9fa, #e9ecef);
      border-radius: 16px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
    }

    .player-controls {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .play-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: linear-gradient(145deg, #3498db, #2980b9);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .play-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }

    .play-btn:active {
      transform: scale(0.95);
    }

    .play-btn mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .player-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .waveform-container {
      width: 100%;
      height: 80px;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: rgba(0,0,0,0.05);
      cursor: pointer;
    }

    .waveform {
      width: 100%;
      height: 100%;
      background: transparent;
    }

    .loading-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 0.5rem;
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #3498db;
      border-top-color: #fff;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .player-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #495057;
      font-weight: 500;
      min-width: 80px;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .volume-btn {
      background: transparent;
      border: none;
      color: #495057;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
    }

    .volume-btn:hover {
      color: #3498db;
    }

    .volume-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .volume-slider {
      width: 80px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #ddd;
      outline: none;
      border-radius: 2px;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: #3498db;
      border-radius: 50%;
      cursor: pointer;
    }
    
    .volume-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: #3498db;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    @media (max-width: 576px) {
      .track-player {
        flex-direction: column;
        align-items: center;
        padding: 1rem;
      }

      .player-info {
        width: 100%;
      }
    }
  `]
})
export class TrackPlayerComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() track!: Track;
  @ViewChild('waveform') waveformElement!: ElementRef;

  // WaveSurfer instance
  private wavesurfer: WaveSurfer | null = null;
  
  // Track the current audio URL to prevent unnecessary reinitialization
  private currentAudioUrl = '';
  
  // UI state
  isPlaying = false;
  isMuted = false;
  isWaveformReady = false;
  currentTime = 0;
  duration = 0;
  volume = 0.8;
  private savedVolume = 0.8;
  
  // Timer for updating current time display
  private updateTimer: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize component state here if needed
  }

  ngAfterViewInit(): void {
    // Wait for the DOM to be ready
    setTimeout(() => {
      this.initializePlayer();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['track'] && !changes['track'].firstChange) {
      // Only reinitialize if the track has actually changed
      const newAudioUrl = this.track?.audioFileUrl ? this.getAudioUrl(this.track.audioFileUrl) : '';
      if (newAudioUrl !== this.currentAudioUrl) {
        this.cleanupPlayer();
        setTimeout(() => {
          this.initializePlayer();
        }, 100);
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupPlayer();
  }

  /**
   * Toggle play/pause state
   */
  togglePlayback(): void {
    if (!this.wavesurfer) return;
    
    if (this.isPlaying) {
      this.wavesurfer.pause();
    } else {
      this.wavesurfer.play();
    }
  }

  /**
   * Handle volume change from slider
   */
  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newVolume = parseFloat(input.value);
    
    if (isNaN(newVolume) || !this.wavesurfer) return;
    
    this.volume = newVolume;
    this.isMuted = newVolume === 0;
    
    if (newVolume > 0) {
      this.savedVolume = newVolume;
    }
    
    this.wavesurfer.setVolume(newVolume);
    this.cdr.detectChanges();
  }

  /**
   * Toggle mute/unmute
   */
  toggleMute(): void {
    if (!this.wavesurfer) return;
    
    if (this.isMuted) {
      // Unmute
      this.volume = this.savedVolume;
      this.isMuted = false;
    } else {
      // Mute
      this.savedVolume = this.volume;
      this.volume = 0;
      this.isMuted = true;
    }
    
    this.wavesurfer.setVolume(this.volume);
    this.cdr.detectChanges();
  }

  /**
   * Format seconds to MM:SS
   */
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Initialize the WaveSurfer player
   */
  private initializePlayer(): void {
    if (!this.track || !this.track.audioFileUrl || !this.waveformElement) {
      return;
    }
    
    const audioUrl = this.getAudioUrl(this.track.audioFileUrl);
    this.currentAudioUrl = audioUrl;
    
    // Create WaveSurfer instance
    this.createWaveSurfer(audioUrl);
  }

  /**
   * Create and configure WaveSurfer instance
   */
  private createWaveSurfer(audioUrl: string): void {
    // Make sure we have a valid element
    if (!this.waveformElement || !this.waveformElement.nativeElement) {
      return;
    }
    
    try {
      // Destroy any existing instance
      if (this.wavesurfer) {
        this.wavesurfer.destroy();
      }
      
      // Reset state
      this.isWaveformReady = false;
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = this.track.trackLengthSeconds || 0;
      
      // Create new instance
      this.wavesurfer = WaveSurfer.create({
        container: this.waveformElement.nativeElement,
        waveColor: '#A8DBA8',
        progressColor: '#3498db',
        cursorColor: '#2980b9',
        barWidth: 2,
        barGap: 1,
        height: 80,
        barRadius: 3,
        normalize: true,
        fillParent: true,
        interact: true,
        backend: 'MediaElement',
        mediaControls: false
      });
      
      // Set initial volume
      this.wavesurfer.setVolume(this.volume);
      
      // Set up event listeners
      this.setupWaveSurferEvents();
      
      // Load the audio file
      this.wavesurfer.load(audioUrl);
    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
    }
  }

  /**
   * Set up all event listeners for WaveSurfer
   */
  private setupWaveSurferEvents(): void {
    if (!this.wavesurfer) return;
    
    // When audio is ready to play
    this.wavesurfer.on('ready', () => {
      this.isWaveformReady = true;
      
      // Get duration from wavesurfer
      if (this.wavesurfer) {
        this.duration = this.wavesurfer.getDuration();
      }
      
      this.startTimeUpdateTimer();
      this.cdr.detectChanges();
    });
    
    // When playback starts
    this.wavesurfer.on('play', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });
    
    // When playback pauses
    this.wavesurfer.on('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
    
    // When playback ends
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
    
    // When seeking occurs
    this.wavesurfer.on('seeking', (position: number) => {
      if (this.wavesurfer) {
        this.currentTime = position * this.wavesurfer.getDuration();
        this.cdr.detectChanges();
      }
    });
    
    // Handle errors
    this.wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      this.isWaveformReady = false;
      this.cdr.detectChanges();
    });
  }

  /**
   * Start timer to update current time display
   */
  private startTimeUpdateTimer(): void {
    // Clear any existing timer
    this.stopTimeUpdateTimer();
    
    // Update current time every 100ms
    this.updateTimer = setInterval(() => {
      if (this.wavesurfer && this.isPlaying) {
        this.currentTime = this.wavesurfer.getCurrentTime();
        this.cdr.detectChanges();
      }
    }, 100);
  }

  /**
   * Stop the time update timer
   */
  private stopTimeUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Clean up all resources
   */
  private cleanupPlayer(): void {
    // Stop the timer
    this.stopTimeUpdateTimer();
    
    // Destroy WaveSurfer instance
    if (this.wavesurfer) {
      this.wavesurfer.pause();
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    }
    
    // Reset state
    this.isPlaying = false;
    this.isWaveformReady = false;
    this.currentTime = 0;
    this.duration = 0;
    this.currentAudioUrl = '';
  }

  /**
   * Get the proper URL for the audio file
   */
  private getAudioUrl(originalUrl: string): string {
    if (originalUrl.startsWith('/')) {
      // This is a local file path, use our audio server
      const encodedPath = encodeURIComponent(originalUrl);
      const filename = originalUrl.split('/').pop() || '';
      return `http://localhost:3000/audio/${filename}?path=${encodedPath}`;
    } else {
      // This is a regular URL
      return originalUrl;
    }
  }

  /**
   * Handle click on waveform to seek
   */
  onWaveformClick(event: MouseEvent): void {
    if (!this.wavesurfer || !this.isWaveformReady || !this.duration) return;
    
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;
    
    // Seek to the clicked position
    this.wavesurfer.seekTo(percent);
  }
}
