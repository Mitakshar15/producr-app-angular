import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SamplePackService } from '../../../services/sample-pack.service';
import { SamplePack, PublishedSamplePackResponse } from '../../../interfaces/sample-pack.interface';
import { SamplePackUploadComponent } from './sample-pack-upload/sample-pack-upload.component';
import { SamplePackDetailComponent } from './sample-pack-detail/sample-pack-detail.component';

@Component({
  selector: 'app-sample-packs',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatPaginatorModule,
    SamplePackDetailComponent,
    SamplePackUploadComponent
  ],
  templateUrl: './sample-packs.component.html',
  styleUrls: ['./sample-packs.component.scss']
})
export class SamplePacksComponent implements OnInit {
  samplePacks: SamplePack[] = [];
  userSamplePacks: SamplePack[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 12;
  pageIndex = 0;
  showUserPacks = false;

  constructor(
    private samplePackService: SamplePackService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSamplePacks();
  }

  /**
   * Load sample packs based on current view (all or user's packs)
   */
  loadSamplePacks(): void {
    this.isLoading = true;
    
    if (this.showUserPacks) {
      this.loadUserSamplePacks();
    } else {
      this.loadPublishedSamplePacks();
    }
  }

  /**
   * Load published sample packs
   */
  loadPublishedSamplePacks(): void {
    this.samplePackService.getPublishedSamplePacks(this.pageIndex, this.pageSize).subscribe({
      next: (response: PublishedSamplePackResponse) => {
        if (response.status.statusCode === 200 && response.data) {
          this.samplePacks = response.data;
          this.totalItems = response.data.length; // This should be updated if the API provides a total count
          console.log('Sample packs loaded:', this.samplePacks);
        } else {
          console.error('Invalid response format:', response);
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading sample packs:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Load user's sample packs
   */
  loadUserSamplePacks(): void {
    this.samplePackService.getUserSamplePacks(this.pageIndex, this.pageSize).subscribe({
      next: (response: PublishedSamplePackResponse) => {
        if (response.status.statusCode === 200 && response.data) {
          this.userSamplePacks = response.data;
          this.totalItems = response.data.length; // This should be updated if the API provides a total count
          console.log('User sample packs loaded:', this.userSamplePacks);
        } else {
          console.error('Invalid response format:', response);
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading user sample packs:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle page change event
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSamplePacks();
  }

  /**
   * Toggle between all sample packs and user's sample packs
   */
  toggleView(): void {
    this.showUserPacks = !this.showUserPacks;
    this.pageIndex = 0; // Reset to first page
    this.loadSamplePacks();
  }

  /**
   * Open sample pack upload dialog
   */
  openUploadDialog(): void {
    const dialogRef = this.dialog.open(SamplePackUploadComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the list if a new sample pack was uploaded
        this.loadSamplePacks();
      }
    });
  }

  /**
   * Open sample pack detail dialog
   */
  viewSamplePack(samplePack: SamplePack): void {
    this.dialog.open(SamplePackDetailComponent, {
      width: '800px',
      data: { samplePack }
    });
  }

  /**
   * Delete a sample pack
   */
  deleteSamplePack(id: string): void {
    if (confirm('Are you sure you want to delete this sample pack?')) {
      this.samplePackService.deleteSamplePack(id).subscribe({
        next: () => {
          // Remove the deleted pack from the list
          this.userSamplePacks = this.userSamplePacks.filter(pack => pack.id !== id);
          if (this.showUserPacks) {
            this.loadUserSamplePacks();
          }
        },
        error: (error: unknown) => {
          console.error('Error deleting sample pack:', error);
        }
      });
    }
  }

  /**
   * Toggle publish status of a sample pack
   */
  togglePublishStatus(id: string, currentStatus: boolean): void {
    this.samplePackService.togglePublishStatus(id, !currentStatus).subscribe({
      next: () => {
        // Update the pack's status in the list
        const pack = this.userSamplePacks.find(p => p.id === id);
        if (pack) {
          pack.published = !currentStatus;
        }
      },
      error: (error: unknown) => {
        console.error('Error updating publish status:', error);
      }
    });
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
}
