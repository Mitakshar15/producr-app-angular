import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, SimpleChanges, OnChanges, Renderer2, Output, EventEmitter } from '@angular/core';
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
  templateUrl: './track-player.component.html',
  styleUrls: ['./track-player.component.scss']
})
export class TrackPlayerComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() track!: Track;
  @ViewChild('waveform') waveformElement!: ElementRef;
  @Output() playStateChange = new EventEmitter<boolean>();

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

  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2) {}

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
    this.updateVolumeSliderGradient(input, newVolume);
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
    
    // Update the volume slider gradient
    const volumeSlider = document.querySelector('.volume-slider') as HTMLInputElement;
    if (volumeSlider) {
      this.updateVolumeSliderGradient(volumeSlider, this.volume);
    }
    
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
        waveColor: '#9d46ff',
        progressColor: '#6200ea',
        cursorColor: '#03dac6',
        barWidth: 2,
        barGap: 1,
        height: 64,
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
      
      // Initialize volume slider gradient
      setTimeout(() => {
        const volumeSlider = document.querySelector('.volume-slider') as HTMLInputElement;
        if (volumeSlider) {
          this.updateVolumeSliderGradient(volumeSlider, this.volume);
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
    }
  }

  /**
   * Set up all event listeners for WaveSurfer
   */
  private setupWaveSurferEvents(): void {
    if (!this.wavesurfer) return;
    
    // Ready event
    this.wavesurfer.on('ready', () => {
      this.isWaveformReady = true;
      if (this.wavesurfer) {
        this.duration = this.wavesurfer.getDuration();
      }
      this.cdr.detectChanges();
    });
    
    // Play event
    this.wavesurfer.on('play', () => {
      this.isPlaying = true;
      this.startTimeUpdateTimer();
      this.playStateChange.emit(true);
      this.cdr.detectChanges();
    });
    
    // Pause event
    this.wavesurfer.on('pause', () => {
      this.isPlaying = false;
      this.stopTimeUpdateTimer();
      this.playStateChange.emit(false);
      this.cdr.detectChanges();
    });
    
    // Finish event
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
      this.stopTimeUpdateTimer();
      this.playStateChange.emit(false);
      this.cdr.detectChanges();
    });
    
    // Error event
    this.wavesurfer.on('error', (error: any) => {
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

  /**
   * Update the volume slider gradient based on current volume
   */
  private updateVolumeSliderGradient(slider: HTMLInputElement, value: number): void {
    const percent = value * 100;
    this.renderer.setStyle(
      slider, 
      'background', 
      `linear-gradient(to right, #6200ea 0%, #6200ea ${percent}%, rgba(0, 0, 0, 0.1) ${percent}%)`
    );
  }
}
