import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface UserProfile {
  displayName: string;
  socialLinks: Record<string, string>;
  genrePreferences: any;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  collaborationStatus: 'OPEN' | 'CLOSED';
  primaryGenre: string;
  dawPreference: string;
  skills: string[];
  likes: number;
  followers: number;
  plays: number;
}

interface UserData {
  username: string;
  email: string;
  provider: string;
  profile: UserProfile;
  role: string;
  skills: string[];
  badges: string[];
  createdAt: string;
  noOfTracks: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.styles.css']
})
export class ProfileComponent implements OnInit {
  userData: UserData | null = null;
  errorMessage: string = '';
  recentActivities: any[] = []; // Initialize empty array for recent activities

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadRecentActivities();
  }

  loadUserProfile() {
    this.authService.getCurrentUser().subscribe(
      response => {
        if (response) {
          this.userData = response;
        }
      },
      error => {
        this.errorMessage = 'Failed to load profile data';
        console.error('Error loading profile:', error);
      }
    );
  }

  loadRecentActivities() {
    // TODO: Implement loading recent activities from a service
    this.recentActivities = []; // Will be populated when backend endpoint is ready
  }
}
