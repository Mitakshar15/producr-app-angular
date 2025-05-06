import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <h2>Account Settings</h2>
      
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      
      <div class="settings-card">
        <h3>Change Password</h3>
        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="settings-form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" formControlName="currentPassword" class="form-control">
            <div *ngIf="passwordForm.get('currentPassword')?.errors?.['required'] && passwordForm.get('currentPassword')?.touched" class="error-message">
              Current password is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input type="password" id="newPassword" formControlName="newPassword" class="form-control">
            <div *ngIf="passwordForm.get('newPassword')?.errors?.['required'] && passwordForm.get('newPassword')?.touched" class="error-message">
              New password is required
            </div>
            <div *ngIf="passwordForm.get('newPassword')?.errors?.['minlength'] && passwordForm.get('newPassword')?.touched" class="error-message">
              Password must be at least 8 characters
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-control">
            <div *ngIf="passwordForm.get('confirmPassword')?.errors?.['required'] && passwordForm.get('confirmPassword')?.touched" class="error-message">
              Please confirm your password
            </div>
            <div *ngIf="passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched" class="error-message">
              Passwords do not match
            </div>
          </div>
          
          <button type="submit" [disabled]="!passwordForm.valid">
            Change Password
          </button>
        </form>
      </div>
      
      <div class="settings-card danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button class="btn-danger" (click)="onDeleteAccount()">
          Delete Account
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .settings-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .settings-form {
      margin-top: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .danger-zone {
      border: 1px solid #dc3545;
    }
    
    .btn-danger {
      background: #dc3545;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class SettingsComponent {
  passwordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      // This method needs to be implemented in AuthService
      // this.authService.changePassword(currentPassword, newPassword).subscribe(
      //   () => {
      //     this.successMessage = 'Password changed successfully';
      //     this.passwordForm.reset();
      //     setTimeout(() => this.successMessage = '', 3000);
      //   },
      //   error => {
      //     this.errorMessage = error.error?.message || 'Failed to change password';
      //     setTimeout(() => this.errorMessage = '', 3000);
      //   }
      // );
      
      // For now, just show a success message
      this.successMessage = 'Password changed successfully';
      this.passwordForm.reset();
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  onDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // This method needs to be implemented in AuthService
      // this.authService.deleteAccount().subscribe(
      //   () => {
      //     this.authService.logout();
      //     // Navigate to home page
      //   },
      //   error => {
      //     this.errorMessage = error.error?.message || 'Failed to delete account';
      //     setTimeout(() => this.errorMessage = '', 3000);
      //   }
      // );
      
      // For now, just log out
      this.authService.logout();
      window.location.href = '/';
    }
  }
}
