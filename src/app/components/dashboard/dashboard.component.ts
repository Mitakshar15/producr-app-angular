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
      <nav class="sidebar">
        <div class="user-info">
          <div class="avatar">
            <img [src]="user?.avatar || 'assets/default-avatar.png'" alt="User avatar">
          </div>
          <h3>{{ user?.name || 'User' }}</h3>
        </div>
        <ul class="nav-links">
          <li><a routerLink="./profile" routerLinkActive="active">Profile</a></li>
          <li><a routerLink="./tracks" routerLinkActive="active">My Tracks</a></li>
          <li><a routerLink="./settings" routerLinkActive="active">Settings</a></li>
        </ul>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      height: 100vh;
    }
    
    .sidebar {
      width: 250px;
      background: #1a1a1a;
      color: white;
      padding: 2rem;
    }
    
    .user-info {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      overflow: hidden;
    }
    
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .nav-links {
      list-style: none;
      padding: 0;
    }
    
    .nav-links li {
      margin-bottom: 0.5rem;
    }
    
    .nav-links a {
      color: #fff;
      text-decoration: none;
      padding: 0.5rem 1rem;
      display: block;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .nav-links a:hover, .nav-links a.active {
      background-color: #333;
    }
    
    .content {
      flex: 1;
      padding: 2rem;
      background: #f5f5f5;
      overflow-y: auto;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Get user profile data
    this.authService.getCurrentUser().subscribe(
      user => this.user = user
    );
  }
}
