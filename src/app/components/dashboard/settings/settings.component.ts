import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Settings</h1>
          <button class="btn-save" (click)="saveChanges()" [disabled]="!hasChanges">
            <i class="fas fa-save"></i>
            Save Changes
          </button>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Account Settings -->
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-user-circle"></i> Account Settings</h2>
          </div>
          <div class="card-content">
            <div class="settings-form">
              <div class="form-group">
                <label>
                  <i class="fas fa-envelope"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  [(ngModel)]="settings.email"
                  (ngModelChange)="checkChanges()"
                  placeholder="Enter your email"
                >
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-user"></i>
                  Display Name
                </label>
                <input
                  type="text"
                  [(ngModel)]="settings.displayName"
                  (ngModelChange)="checkChanges()"
                  placeholder="Enter display name"
                >
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-globe"></i>
                  Language
                </label>
                <select [(ngModel)]="settings.language" (ngModelChange)="checkChanges()">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-clock"></i>
                  Time Zone
                </label>
                <select [(ngModel)]="settings.timezone" (ngModelChange)="checkChanges()">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="IST">Indian Standard Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-bell"></i> Notification Settings</h2>
          </div>
          <div class="card-content">
            <div class="settings-list">
              <div class="settings-item">
                <div class="item-info">
                  <h3>Email Notifications</h3>
                  <p>Receive updates about your tracks and followers</p>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.notifications.email"
                    (ngModelChange)="checkChanges()"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Push Notifications</h3>
                  <p>Get instant updates in your browser</p>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.notifications.push"
                    (ngModelChange)="checkChanges()"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Marketing Emails</h3>
                  <p>Stay updated with our latest features</p>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.notifications.marketing"
                    (ngModelChange)="checkChanges()"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-shield-alt"></i> Privacy Settings</h2>
          </div>
          <div class="card-content">
            <div class="settings-list">
              <div class="settings-item">
                <div class="item-info">
                  <h3>Profile Visibility</h3>
                  <p>Control who can see your profile</p>
                </div>
                <select 
                  [(ngModel)]="settings.privacy.profileVisibility"
                  (ngModelChange)="checkChanges()"
                  class="select-inline"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Track Downloads</h3>
                  <p>Allow others to download your tracks</p>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.privacy.allowDownloads"
                    (ngModelChange)="checkChanges()"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Show Activity Status</h3>
                  <p>Let others see when you're online</p>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.privacy.showActivity"
                    (ngModelChange)="checkChanges()"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-lock"></i> Security</h2>
          </div>
          <div class="card-content">
            <div class="settings-list">
              <div class="settings-item">
                <div class="item-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security</p>
                </div>
                <button class="btn-secondary" (click)="setup2FA()">
                  <i class="fas fa-key"></i>
                  Setup 2FA
                </button>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
                <button class="btn-secondary" (click)="changePassword()">
                  <i class="fas fa-lock"></i>
                  Change
                </button>
              </div>
              <div class="settings-item">
                <div class="item-info">
                  <h3>Active Sessions</h3>
                  <p>Manage your logged-in devices</p>
                </div>
                <button class="btn-secondary" (click)="viewSessions()">
                  <i class="fas fa-desktop"></i>
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card danger-zone">
          <div class="card-header">
            <h2><i class="fas fa-exclamation-triangle"></i> Danger Zone</h2>
          </div>
          <div class="card-content">
            <div class="settings-list">
              <div class="settings-item">
                <div class="item-info">
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and all data</p>
                </div>
                <button class="btn-danger" (click)="confirmDeleteAccount()">
                  <i class="fas fa-trash-alt"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Page Layout */
    .page-container {
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    /* Settings Grid */
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    /* Card Styles */
    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .card-header {
      padding: 1.25rem;
      border-bottom: 1px solid #eee;
      background: white;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.125rem;
      color: #2c3e50;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-header h2 i {
      color: #3498db;
      font-size: 1.25rem;
    }

    .card-content {
      padding: 1.5rem;
    }

    /* Form Styles */
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #2c3e50;
    }

    label i {
      color: #6c757d;
    }

    input,
    select {
      padding: 0.75rem 1rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #2c3e50;
      transition: all 0.3s ease;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.762L10.825 4z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }

    .select-inline {
      width: auto;
      min-width: 150px;
    }

    /* Settings List */
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .item-info {
      flex: 1;
    }

    .item-info h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .item-info p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #6c757d;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #dee2e6;
      transition: .4s;
      border-radius: 24px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: #3498db;
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }

    /* Buttons */
    .btn-save {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-save:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-1px);
    }

    .btn-save:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      color: #2c3e50;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .btn-danger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #fff5f5;
      color: #dc3545;
      border: 1px solid #fcc;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-danger:hover {
      background: #ffe9e9;
      transform: translateY(-1px);
    }

    /* Danger Zone */
    .danger-zone {
      border: 1px solid #fcc;
    }

    .danger-zone .card-header h2 i {
      color: #dc3545;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .settings-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .select-inline {
        width: 100%;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings = {
    email: '',
    displayName: '',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      allowDownloads: true,
      showActivity: true
    }
  };

  originalSettings: any;
  hasChanges = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Load user settings
    this.loadSettings();
  }

  loadSettings() {
    // Mock loading settings
    this.authService.getCurrentUser().subscribe(
      user => {
        this.settings.email = user.email;
        this.settings.displayName = user.username;
        this.originalSettings = JSON.stringify(this.settings);
      }
    );
  }

  checkChanges() {
    this.hasChanges = JSON.stringify(this.settings) !== this.originalSettings;
  }

  saveChanges() {
    // Implement save changes
    console.log('Saving changes:', this.settings);
    this.originalSettings = JSON.stringify(this.settings);
    this.hasChanges = false;
  }

  setup2FA() {
    console.log('Setting up 2FA');
  }

  changePassword() {
    console.log('Changing password');
  }

  viewSessions() {
    console.log('Viewing active sessions');
  }

  confirmDeleteAccount() {
    console.log('Confirming account deletion');
  }
}
