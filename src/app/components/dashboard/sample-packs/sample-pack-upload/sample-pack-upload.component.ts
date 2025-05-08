import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SamplePackService } from '../../../../services/sample-pack.service';
import { UploadProgressService } from '../../../../services/upload-progress.service';
import { SamplePackUploadRequest, SamplePackResponse } from '../../../../interfaces/sample-pack.interface';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sample-pack-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressBarModule
  ],
  templateUrl: './sample-pack-upload.component.html',
  styleUrls: ['./sample-pack-upload.component.scss']
})
export class SamplePackUploadComponent implements OnInit, OnDestroy {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  fileName = '';
  fileSize = 0;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  
  // Maximum file size (100MB)
  private maxFileSize = 1000 * 1024 * 1024;
  private progressSubscription?: Subscription;
  private uploadUrl = `${environment.apiBaseUrl}/v1/sample-packs`;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SamplePackUploadComponent>,
    private samplePackService: SamplePackService,
    private uploadProgressService: UploadProgressService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeToProgress();
  }

  ngOnDestroy(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  /**
   * Initialize the upload form
   */
  private initForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      enablePreviews: [true]
    });
  }

  /**
   * Subscribe to upload progress updates
   */
  private subscribeToProgress(): void {
    this.progressSubscription = this.uploadProgressService
      .getProgress(this.uploadUrl)
      .subscribe(progress => {
        this.uploadProgress = progress;
      });
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      this.fileSize = this.selectedFile.size;
      
      // Validate file type (must be ZIP)
      if (!this.selectedFile.name.toLowerCase().endsWith('.zip')) {
        this.errorMessage = 'Only ZIP files are allowed.';
        this.selectedFile = null;
        this.fileName = '';
        this.fileSize = 0;
        return;
      }
      
      // Validate file size
      if (this.fileSize > this.maxFileSize) {
        this.errorMessage = 'File size exceeds the maximum limit of 100MB.';
        this.selectedFile = null;
        this.fileName = '';
        this.fileSize = 0;
      } else {
        this.errorMessage = '';
      }
    }
  }

  /**
   * Remove selected file
   */
  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = 0;
    this.errorMessage = '';
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
   * Submit the form and upload the sample pack
   */
  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }
    
    this.isUploading = true;
    this.errorMessage = '';
    
    const formValues = this.uploadForm.value;
    
    const uploadData: SamplePackUploadRequest = {
      file: this.selectedFile,
      title: formValues.title,
      description: formValues.description,
      price: formValues.price,
      enablePreviews: formValues.enablePreviews
    };
    
    console.log('Uploading sample pack with data:', {
      fileName: this.selectedFile.name,
      fileSize: this.selectedFile.size,
      fileType: this.selectedFile.type,
      title: uploadData.title,
      description: uploadData.description,
      price: uploadData.price,
      enablePreviews: uploadData.enablePreviews
    });
    
    this.samplePackService.uploadSamplePack(uploadData).subscribe({
      next: (response: SamplePackResponse) => {
        console.log('Upload successful:', response);
        // Upload completed successfully
        setTimeout(() => {
          this.isUploading = false;
          this.dialogRef.close(response.data);
        }, 500);
      },
      error: (error: unknown) => {
        console.error('Error uploading sample pack:', error);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.errorMessage = 'Failed to upload sample pack. Please try again.';
      }
    });
  }

  /**
   * Close the dialog
   */
  onCancel(): void {
    if (this.isUploading) {
      if (confirm('Upload in progress. Are you sure you want to cancel?')) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }
}
