import { Component, Input, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { Track } from '../../../interfaces/track.interface';
import { Howl } from 'howler';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-track-player',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSliderModule, FormsModule],
  template: `
    <div class="track-player">
      <div class="player-controls">
        <button class="play-btn" (click)="togglePlay()">
          <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
      </div>
      
      <div class="player-content">
        <div class="waveform-container" (click)="seekToPosition($event)">
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

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
      }

      &:active {
        transform: scale(0.95);
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
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
    }

    .waveform {
      width: 100%;
      height: 100%;
      background: transparent;
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

      &:hover {
        color: #3498db;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .volume-slider {
      width: 80px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #ddd;
      outline: none;
      border-radius: 2px;
      
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: #3498db;
        border-radius: 50%;
        cursor: pointer;
      }
      
      &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: #3498db;
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
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
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
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

  private sound: Howl | null = null;
  private wavesurfer: WaveSurfer | null = null;
  isPlaying = false;
  isMuted = false;
  currentTime = 0;
  duration = 0;
  volume = 0.8;
  previousVolume = 0.8;
  private updateTimer: any = null;
  public isWaveformReady = false;
  private isInitialized = false;
  private currentAudioUrl: string | null = null;

  constructor(
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // We'll initialize after the view is ready
  }

  ngAfterViewInit() {
    // Initialize the player after the view is ready
    setTimeout(() => {
      this.initializeAudio();
    }, 100);
  }

  ngOnDestroy() {
    this.cleanupAudio();
  }

  ngOnChanges(changes: SimpleChanges) {
    // If the track changes, reinitialize the audio
    if (changes['track'] && !changes['track'].firstChange) {
      console.log('Track changed, reinitializing audio');
      
      // Clean up first
      this.cleanupAudio();
      
      // Wait a bit to ensure cleanup is complete
      setTimeout(() => {
        this.initializeAudio();
      }, 100);
    }
  }

  private initializeWaveSurfer() {
    try {
      // Create WaveSurfer instance
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
        interact: true
      });

      // Set up event listeners
      this.wavesurfer.on('ready', () => {
        console.log('Waveform is ready');
        this.isWaveformReady = true;
        
        // Update duration from the waveform
        if (this.wavesurfer) {
          this.duration = this.wavesurfer.getDuration();
          console.log('Duration from waveform:', this.duration);
          
          // If we still don't have a duration, use the track length from the API
          if (!this.duration && this.track?.trackLengthSeconds) {
            this.duration = this.track.trackLengthSeconds;
          }
        }
        
        this.cdr.detectChanges();
      });

      // Use the interaction event for seeking
      this.wavesurfer.on('interaction', (progress: number) => {
        if (this.sound) {
          const seekTime = progress * this.duration;
          this.sound.seek(seekTime);
          this.currentTime = seekTime;
          this.cdr.detectChanges();
        }
      });

      this.wavesurfer.on('error', (error: any) => {
        console.error('Waveform error:', error);
        
        // If waveform fails, we'll still have the basic player functionality
        if (this.track?.trackLengthSeconds) {
          this.duration = this.track.trackLengthSeconds;
          this.cdr.detectChanges();
        }
      });
    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
    }
  }

  private cleanupAudio() {
    // Stop and unload any existing audio
    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
      this.sound = null;
    }
    
    // Stop any existing update timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    // Destroy any existing waveform
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    }
    
    // Reset state
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.isWaveformReady = false;
    this.isInitialized = false;
  }

  private initializeAudio() {
    if (!this.track || !this.track.audioFileUrl) {
      console.error('No audio URL available for this track');
      return;
    }

    // Generate the audio URL
    const audioUrl = this.getAudioUrl(this.track.audioFileUrl);
    
    // Check if we're already playing this audio
    if (this.currentAudioUrl === audioUrl && this.sound) {
      console.log('Audio already loaded, skipping initialization');
      return;
    }
    
    // Clean up any existing sound
    this.cleanupAudio();

    console.log('Original audio path:', this.track.audioFileUrl);
    
    // Store the current audio URL
    this.currentAudioUrl = audioUrl;
    
    console.log('Initializing audio with URL:', audioUrl);
    
    // Set a default duration if available from the track data
    if (this.track.trackLengthSeconds) {
      this.duration = this.track.trackLengthSeconds;
      this.cdr.detectChanges();
    }
    
    // Initialize WaveSurfer first
    this.initializeWaveSurfer();
    
    // Load the waveform
    if (this.wavesurfer) {
      try {
        this.wavesurfer.load(audioUrl);
      } catch (error) {
        console.error('Error loading waveform:', error);
        this.isWaveformReady = false;
      }
    }
    
    // Load with Howler
    this.loadWithHowler(audioUrl);
    
    this.isInitialized = true;
  }

  private getAudioUrl(originalUrl: string): string {
    // For local file paths, we need to use our audio server
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

  private loadWithHowler(audioUrl: string) {
    try {
      // If we already have a sound instance, unload it first
      if (this.sound) {
        this.sound.unload();
      }
      
      // Create a new Howl instance with a single source
      this.sound = new Howl({
        src: [audioUrl],
        html5: true, // Force HTML5 Audio to handle streaming
        preload: true,
        format: ['mp3', 'wav', 'ogg'],
        volume: this.volume,
        autoplay: false, // Prevent autoplay
        pool: 1, // Limit to a single audio instance
        onplay: () => {
          this.isPlaying = true;
          this.startProgressUpdate();
          
          // Also play the waveform if it's ready
          if (this.wavesurfer && this.isWaveformReady && !this.wavesurfer.isPlaying()) {
            try {
              this.wavesurfer.play();
            } catch (error) {
              console.error('Error playing waveform:', error);
            }
          }
          
          this.cdr.detectChanges();
        },
        onpause: () => {
          this.isPlaying = false;
          this.stopProgressUpdate();
          
          // Also pause the waveform if it's playing
          if (this.wavesurfer && this.isWaveformReady && this.wavesurfer.isPlaying()) {
            try {
              this.wavesurfer.pause();
            } catch (error) {
              console.error('Error pausing waveform:', error);
            }
          }
          
          this.cdr.detectChanges();
        },
        onstop: () => {
          this.isPlaying = false;
          this.stopProgressUpdate();
          this.currentTime = 0;
          
          // Also stop the waveform
          if (this.wavesurfer && this.isWaveformReady) {
            try {
              this.wavesurfer.stop();
            } catch (error) {
              console.error('Error stopping waveform:', error);
            }
          }
          
          this.cdr.detectChanges();
        },
        onend: () => {
          this.isPlaying = false;
          this.stopProgressUpdate();
          this.currentTime = this.duration;
          
          // Also stop the waveform
          if (this.wavesurfer && this.isWaveformReady) {
            try {
              this.wavesurfer.stop();
            } catch (error) {
              console.error('Error stopping waveform:', error);
            }
          }
          
          this.cdr.detectChanges();
        },
        onload: () => {
          // Update duration when loaded
          if (this.sound) {
            this.duration = this.sound.duration();
            console.log('Duration from Howler:', this.duration);
            this.cdr.detectChanges();
          }
        },
        onloaderror: (id, error) => {
          console.error('Error loading audio:', error);
          
          // If we have a track length from the API, use that for the duration display
          if (this.track?.trackLengthSeconds) {
            this.duration = this.track.trackLengthSeconds;
            this.cdr.detectChanges();
          }
        }
      });
    } catch (error) {
      console.error('Error creating Howl instance:', error);
    }
  }

  private startProgressUpdate() {
    // Clear any existing timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // Update progress every 100ms
    this.updateTimer = setInterval(() => {
      this.updateProgress();
    }, 100);
  }

  private stopProgressUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private updateProgress() {
    if (!this.sound || !this.isPlaying) return;
    
    try {
      const currentTime = this.sound.seek() as number;
      if (!isNaN(currentTime)) {
        this.currentTime = currentTime;
        
        // Update waveform position if needed
        if (this.wavesurfer && this.isWaveformReady && this.duration > 0) {
          const progress = this.currentTime / this.duration;
          // Only update if the difference is significant to avoid too many updates
          const currentProgress = this.wavesurfer.getCurrentTime() / this.wavesurfer.getDuration();
          if (Math.abs(progress - currentProgress) > 0.01) {
            try {
              this.wavesurfer.seekTo(progress);
            } catch (error) {
              console.error('Error updating waveform progress:', error);
            }
          }
        }
        
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  togglePlay() {
    if (!this.sound) {
      console.error('No audio loaded');
      return;
    }
    
    try {
      if (this.isPlaying) {
        // Pause the audio
        this.sound.pause();
        
        // Also pause the waveform if it's ready
        if (this.wavesurfer && this.isWaveformReady) {
          try {
            this.wavesurfer.pause();
          } catch (error) {
            console.error('Error pausing waveform:', error);
          }
        }
      } else {
        // Play the audio
        this.sound.play();
        
        // Also play the waveform if it's ready
        if (this.wavesurfer && this.isWaveformReady) {
          try {
            this.wavesurfer.play();
          } catch (error) {
            console.error('Error playing waveform:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
    }
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newVolume = parseFloat(input.value);
    
    if (isNaN(newVolume)) return;
    
    this.volume = newVolume;
    this.previousVolume = newVolume;
    this.isMuted = newVolume === 0;
    
    if (this.sound) {
      try {
        this.sound.volume(newVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }

  toggleMute() {
    try {
      if (this.isMuted) {
        // Unmute - restore previous volume
        this.volume = this.previousVolume > 0 ? this.previousVolume : 0.8;
        this.isMuted = false;
      } else {
        // Mute - save current volume and set to 0
        this.previousVolume = this.volume;
        this.volume = 0;
        this.isMuted = true;
      }
      
      // Apply volume to sound
      if (this.sound) {
        this.sound.volume(this.volume);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }

  seekToPosition(event: MouseEvent) {
    if (!this.sound || !this.duration) return;
    
    try {
      const container = event.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percent = x / rect.width;
      
      // Ensure percent is between 0 and 1
      const clampedPercent = Math.max(0, Math.min(1, percent));
      
      // Calculate the seek time
      const seekTime = this.duration * clampedPercent;
      
      // Seek in both Howler and WaveSurfer
      this.sound.seek(seekTime);
      
      if (this.wavesurfer && this.isWaveformReady) {
        try {
          this.wavesurfer.seekTo(clampedPercent);
        } catch (error) {
          console.error('Error seeking in waveform:', error);
        }
      }
      
      this.currentTime = seekTime;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error in seekToPosition:', error);
    }
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) {
      // If we have a track length from the API, use that for the duration display
      if (this.track?.trackLengthSeconds && this.duration === 0) {
        seconds = this.track.trackLengthSeconds;
      } else {
        return '0:00';
      }
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
