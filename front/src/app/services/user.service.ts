import { effect, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  readonly user = signal<undefined | User>(undefined)

  constructor() {
    effect(() => {
      console.log('user set: ', this.user())
    })
  }

  getProfile() {
    const token = localStorage.getItem('token');
    return this.http
      .get<User>('http://localhost:3000/auth/profile', {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`, // Add the Bearer token here
        }),
      })
      .pipe(tap((v) => this.user.set(v)));
  }

  logout() {
    localStorage.removeItem('token');
    this.user.set(undefined);
  }
}
