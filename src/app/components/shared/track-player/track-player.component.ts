import { Component, Input, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Track } from '../../../interfaces/track.interface';
import { Howl } from 'howler';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-track-player',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="track-player">
      <div class="player-controls">
        <button class="play-btn" (click)="togglePlay()">
          <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
      </div>
      
      <div class="waveform-container">
        <div class="progress-container" (click)="seek($event)">
          <div class="progress-bar" [style.width.%]="progressPercent"></div>
          <div class="progress-handle" [style.left.%]="progressPercent"></div>
        </div>
        <div class="time-info">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="duration">{{ formatTime(duration) }}</span>
        </div>
      </div>
      
      <!-- Fallback audio element that will be used if Howler fails -->
      <audio #audioElement [src]="audioSrc" style="display: none;"></audio>
    </div>
  `,
  styles: [`
    .track-player {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .player-controls {
      flex-shrink: 0;
    }

    .play-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #3498db;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

      &:hover {
        background: #2980b9;
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .waveform-container {
      flex: 1;
      min-width: 0;
    }

    .progress-container {
      width: 100%;
      height: 60px;
      background: #e9ecef;
      border-radius: 6px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(to right, #3498db, #2ecc71);
      width: 0%;
      position: absolute;
      top: 0;
      left: 0;
      transition: width 0.1s linear;
    }

    .progress-handle {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      z-index: 2;
      pointer-events: none;
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class TrackPlayerComponent implements OnInit, OnDestroy {
  @Input() track!: Track;

  private sound: Howl | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  private updateTimer: any = null;
  audioSrc: SafeUrl | null = null;

  constructor(
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeAudio();
  }

  ngOnDestroy() {
    this.cleanupAudio();
  }

  private initializeAudio() {
    if (!this.track || !this.track.audioFileUrl) {
      console.error('No audio URL available for this track');
      return;
    }

    // Clean up any existing sound
    this.cleanupAudio();

    console.log('Original audio path:', this.track.audioFileUrl);
    
    // For local file paths, we need to use our audio server
    if (this.track.audioFileUrl.startsWith('/')) {
      // This is a local file path, use our audio server
      const encodedPath = encodeURIComponent(this.track.audioFileUrl);
      const filename = this.track.audioFileUrl.split('/').pop();
      const serverUrl = `http://localhost:3000/audio/${filename}?path=${encodedPath}`;
      
      console.log('Using audio server URL:', serverUrl);
      this.loadWithHowler(serverUrl);
    } else {
      // This is a regular URL
      this.loadWithHowler(this.track.audioFileUrl);
    }
  }
  
  private loadLocalFile(filePath: string) {
    console.log('Attempting to load local file:', filePath);
    
    // Create a safe URL for the audio element
    this.audioSrc = this.sanitizer.bypassSecurityTrustUrl(filePath);
    
    // Create a simple audio element to play the file
    const audio = new Audio();
    audio.src = filePath;
    
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      this.ngZone.run(() => {
        this.duration = audio.duration;
        console.log('Audio duration:', this.duration);
        this.cdr.detectChanges();
      });
    });
    
    audio.addEventListener('timeupdate', () => {
      this.ngZone.run(() => {
        this.currentTime = audio.currentTime;
        this.progressPercent = (audio.currentTime / audio.duration) * 100;
        this.cdr.detectChanges();
      });
    });
    
    audio.addEventListener('ended', () => {
      this.ngZone.run(() => {
        this.isPlaying = false;
        this.cdr.detectChanges();
      });
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      
      // Try with file:// protocol
      this.tryWithFileProtocol(filePath);
    });
    
    // Store the audio element
    this.sound = {
      play: () => {
        audio.play();
        this.isPlaying = true;
      },
      pause: () => {
        audio.pause();
        this.isPlaying = false;
      },
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        this.isPlaying = false;
      },
      seek: (position: number) => {
        audio.currentTime = position;
        return audio.currentTime;
      },
      duration: () => audio.duration,
      unload: () => {
        audio.pause();
        audio.src = '';
      }
    } as unknown as Howl;
    
    // Preload the audio
    audio.load();
  }
  
  private tryWithFileProtocol(filePath: string) {
    console.log('Trying with file:// protocol');
    
    // Remove any leading slashes
    const cleanPath = filePath.replace(/^\/+/, '');
    const fileUrl = `file:///${cleanPath}`;
    
    console.log('Using file URL:', fileUrl);
    
    // Try loading with file:// protocol
    this.loadWithHowler(fileUrl);
  }

  private loadWithHowler(audioUrl: string) {
    console.log('Loading audio with Howler:', audioUrl);
    
    // Create new Howl instance with optimized settings
    this.sound = new Howl({
      src: [audioUrl],
      html5: true, // Force HTML5 Audio for better compatibility
      preload: true,
      format: ['mp3', 'wav', 'ogg'],
      xhr: {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-',
          'Cache-Control': 'no-cache'
        },
        withCredentials: false
      },
      onload: () => {
        this.ngZone.run(() => {
          if (this.sound) {
            this.duration = this.sound.duration();
            console.log('Audio loaded successfully. Duration:', this.duration);
            this.cdr.detectChanges();
          }
        });
      },
      onplay: () => {
        this.ngZone.run(() => {
          this.isPlaying = true;
          this.startProgressUpdates();
          this.cdr.detectChanges();
        });
      },
      onpause: () => {
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.cdr.detectChanges();
        });
      },
      onstop: () => {
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.currentTime = 0;
          this.progressPercent = 0;
          this.cdr.detectChanges();
        });
      },
      onend: () => {
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.cdr.detectChanges();
        });
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error);
        
        // Try with a different approach if loading fails
        this.tryAlternativeLoading();
      },
      onplayerror: (id, error) => {
        console.error('Error playing audio:', error);
        
        // Try to recover by reloading
        if (this.sound) {
          this.sound.once('unlock', () => {
            this.sound?.play();
          });
        }
      }
    });
  }

  private tryAlternativeLoading() {
    if (!this.track || !this.track.audioFileUrl) return;
    
    console.log('Trying alternative loading method...');
    
    // If the original loading failed, try with HTML5 Audio directly
    this.loadLocalFile(this.track.audioFileUrl);
  }

  private startProgressUpdates() {
    // Clear any existing timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // Update progress every 100ms
    this.updateTimer = setInterval(() => {
      if (this.sound && this.isPlaying) {
        this.ngZone.run(() => {
          this.currentTime = this.sound?.seek() as number;
          this.progressPercent = (this.currentTime / this.duration) * 100;
          this.cdr.detectChanges();
        });
      }
    }, 100);
  }

  private cleanupAudio() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
      this.sound = null;
    }

    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.progressPercent = 0;
  }

  togglePlay() {
    if (!this.sound) return;

    if (this.isPlaying) {
      this.sound.pause();
    } else {
      this.sound.play();
    }
  }

  seek(event: MouseEvent) {
    if (!this.sound || !this.duration) return;

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;
    
    const seekTime = this.duration * percent;
    this.sound.seek(seekTime);
    
    this.currentTime = seekTime;
    this.progressPercent = percent * 100;
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
