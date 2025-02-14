import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);


  login(user: User) {
    return this.http
      .post<{ access_token: string }>('http://localhost:3000/auth/login', user)
      .pipe(tap((v) => localStorage.setItem('token', v.access_token)));
  }

}
