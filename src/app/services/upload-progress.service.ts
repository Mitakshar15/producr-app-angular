import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadProgressService {
  private progressMap = new Map<string, BehaviorSubject<number>>();

  /**
   * Get the progress observable for a specific upload URL
   * @param url The upload URL
   * @returns Observable of the upload progress (0-100)
   */
  getProgress(url: string): Observable<number> {
    if (!this.progressMap.has(url)) {
      this.progressMap.set(url, new BehaviorSubject<number>(0));
    }
    return this.progressMap.get(url)!.asObservable();
  }

  /**
   * Update the progress for a specific upload URL
   * @param url The upload URL
   * @param progress The progress value (0-100)
   */
  updateProgress(url: string, progress: number): void {
    if (!this.progressMap.has(url)) {
      this.progressMap.set(url, new BehaviorSubject<number>(progress));
    } else {
      this.progressMap.get(url)!.next(progress);
    }

    // If the upload is complete, clean up after a delay
    if (progress === 100) {
      setTimeout(() => {
        this.progressMap.delete(url);
      }, 5000);
    }
  }

  /**
   * Reset the progress for a specific upload URL
   * @param url The upload URL
   */
  resetProgress(url: string): void {
    if (this.progressMap.has(url)) {
      this.progressMap.get(url)!.next(0);
    }
  }
}
