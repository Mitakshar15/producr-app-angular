import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="fas fa-wave-square"></i>
            <span class="logo-text">Producr</span>
          </div>
        </div>

        <div class="user-info">
          <div class="avatar">
            <img [src]="user?.avatar || 'assets/default-avatar.png'" alt="User avatar">
            <span class="status-dot" [class.online]="user?.profile?.availabilityStatus === 'AVAILABLE'"></span>
          </div>
          <div class="user-details">
            <h3>{{ user?.username || 'User' }}</h3>
            <span class="user-role">{{ user?.role || 'Producer' }}</span>
          </div>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="./profile" routerLinkActive="active">
              <div class="nav-icon">
                <i class="fas fa-user"></i>
              </div>
              <span>Profile</span>
            </a>
          </li>
          <li>
            <a routerLink="./tracks" routerLinkActive="active">
              <div class="nav-icon">
                <i class="fas fa-music"></i>
              </div>
              <span>My Tracks</span>
              <div class="track-count" *ngIf="user?.noOfTracks">{{ user?.noOfTracks }}</div>
            </a>
          </li>
          <li>
            <a routerLink="./settings" routerLinkActive="active">
              <div class="nav-icon">
                <i class="fas fa-cog"></i>
              </div>
              <span>Settings</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <div class="nav-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-container">
        <header class="top-header">
          <div class="header-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search tracks...">
          </div>
          <div class="header-actions">
            <button class="action-btn notification">
              <i class="fas fa-bell"></i>
              <span class="notification-dot"></span>
            </button>
            <button class="action-btn new-track">
              <i class="fas fa-plus"></i>
              <span>New Track</span>
            </button>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Dashboard Container */
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1a1c20 0%, #2c3e50 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      z-index: 1000;
      transition: all 0.3s ease;
    }

    /* Logo Styles */
    .sidebar-header {
      padding: 1.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo i {
      font-size: 1.75rem;
      background: linear-gradient(45deg, #3498db, #2ecc71);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 600;
      background: linear-gradient(45deg, #3498db, #2ecc71);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* User Info */
    .user-info {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      position: relative;
      width: 48px;
      height: 48px;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.1);
    }

    .status-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #6c757d;
      border: 2px solid #2c3e50;
      transition: all 0.3s ease;
    }

    .status-dot.online {
      background: #2ecc71;
      box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
    }

    .user-details {
      flex: 1;
    }

    .user-details h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.7);
      display: block;
      margin-top: 0.25rem;
    }

    /* Navigation */
    .nav-links {
      list-style: none;
      padding: 1rem 0;
      margin: 0;
      flex: 1;
    }

    .nav-links li a {
      display: flex;
      align-items: center;
      padding: 0.875rem 1.75rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      gap: 1rem;
    }

    .nav-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      transition: all 0.3s ease;
    }

    .nav-links li a:hover {
      color: white;
      background: rgba(255,255,255,0.05);
    }

    .nav-links li a:hover .nav-icon {
      background: #3498db;
      transform: translateY(-2px);
    }

    .nav-links li a.active {
      color: white;
      background: rgba(255,255,255,0.05);
    }

    .nav-links li a.active .nav-icon {
      background: #3498db;
      box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
    }

    .track-count {
      position: absolute;
      right: 1.75rem;
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .logout-btn {
      width: 100%;
      padding: 0.875rem;
      border: none;
      background: rgba(255,255,255,0.05);
      color: white;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(220, 53, 69, 0.2);
    }

    .logout-btn:hover .nav-icon {
      background: #dc3545;
    }

    /* Main Content Area */
    .main-container {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
    }

    /* Top Header */
    .top-header {
      height: 70px;
      background: white;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-search {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8f9fa;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      width: 300px;
      transition: all 0.3s ease;
    }

    .header-search:focus-within {
      background: white;
      box-shadow: 0 0 0 2px #3498db20;
    }

    .header-search i {
      color: #6c757d;
    }

    .header-search input {
      border: none;
      background: none;
      outline: none;
      font-size: 0.875rem;
      width: 100%;
      color: #2c3e50;
    }

    .header-search input::placeholder {
      color: #adb5bd;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .action-btn.notification {
      background: transparent;
      color: #6c757d;
      position: relative;
      padding: 0.75rem;
    }

    .notification-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background: #dc3545;
      border-radius: 50%;
      border: 2px solid white;
    }

    .action-btn.new-track {
      background: #3498db;
      color: white;
    }

    .action-btn.new-track:hover {
      background: #2980b9;
      transform: translateY(-1px);
    }

    .action-btn.notification:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }

    /* Content Area */
    .content {
      padding: 2rem;
      flex: 1;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .sidebar {
        width: 80px;
      }

      .main-container {
        margin-left: 80px;
      }

      .logo-text, 
      .user-details, 
      .nav-links li a span,
      .logout-btn span {
        display: none;
      }

      .nav-links li a {
        justify-content: center;
        padding: 0.75rem;
      }

      .nav-icon {
        margin: 0;
      }

      .track-count {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
      }

      .logout-btn {
        padding: 0.75rem;
        justify-content: center;
      }

      .header-search {
        width: 200px;
      }
    }

    @media (max-width: 768px) {
      .top-header {
        padding: 0 1rem;
      }

      .header-search {
        display: none;
      }

      .action-btn.new-track span {
        display: none;
      }

      .action-btn.new-track {
        padding: 0.75rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(
      response => this.user = response
    );
  }

  logout() {
    // Implement logout logic
    console.log('Logout clicked');
  }
}