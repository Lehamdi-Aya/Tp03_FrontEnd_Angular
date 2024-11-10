import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, { email, password });
  }
  

  register(user: User): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, user);
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
 
}