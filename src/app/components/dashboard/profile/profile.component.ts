import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.styles.css']
})
export class ProfileComponent implements OnInit {
  userData: any = null;
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          this.userData = user;
        }
      },
      error => {
        this.errorMessage = 'Failed to load profile data';
        console.error('Error loading profile:', error);
      }
    );
  }
}
