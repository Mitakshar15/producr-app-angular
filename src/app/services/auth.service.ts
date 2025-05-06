import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  profile: Profile;
  role:string;
  skills:any;
  badges:any;
  createdAt: any;
  noOfTracks:any;
}
interface Profile{
  displayName:string;
  socialLinks: any;
  genrePreference:any;
  availabilityStatus:any;
  collaborationPreference:any;
}

interface UserResponse{
  respType:any;
  status:any;
  data:any;
}

interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    // Fix JSON parse error by checking if the item exists and is not "undefined"
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, { email, password })
      .pipe(
        tap(response => {
          if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  register(userData: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData)
      .pipe(
        tap(response => {
          if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('token');
    return of(!!token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/user/profile`).pipe(
      map(response => {
        const user = response.data;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, userData).pipe(
      map(response => {
        const user = response.data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  updateAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/avatar`, formData).pipe(
      map(response => {
        const user = response.data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }
}
