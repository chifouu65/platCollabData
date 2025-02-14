import { NgIf } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDirective } from '../../directives/form.directive';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [FormDirective, FormsModule, NgIf, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService)

  formValues = signal({} as User);
  formSubmitted = signal<undefined | string>(undefined);

  validationErrors = signal<{
    username: string | null;
    password: string | null;
  }>({
    username: null,
    password: null,
  });

  constructor() {
    effect(() => {
      this.usernameValidator();
      // this.passwordValidator();
    });
  }

  login() {
    return this.authService
      .login(this.formValues())
      .subscribe((access_token) => {
        this.formSubmitted.set(`access_token: ${access_token}`);
        this.userService.getProfile().subscribe(() => {
          this.router.navigate(['/projet']);
        })
      });
  }

  submit() {
    if (
      !this.validationErrors().username &&
      !this.validationErrors().password
    ) {
      this.login();
    } else {
      // Create an alert message for validation errors
      const errorMessages = [];
      if (this.validationErrors().username) {
        errorMessages.push(this.validationErrors().username);
      }
      if (this.validationErrors().password) {
        errorMessages.push(this.validationErrors().password);
      }
      alert('Please fix the following errors:\n' + errorMessages.join('\n'));
    }
  }

  private usernameValidator() {
    const username = this.formValues().username;
    const minLength = 2;

    const isValid = username && username.length >= minLength;

    this.validationErrors.update((prev) => ({
      ...prev,
      password: isValid
        ? null
        : 'Password must be at least 2 characters long and include',
    }));
  }

  private passwordValidator() {
    const password = this.formValues().password;
    const minLength = 8; // Minimum length for password
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid =
      password &&
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar;

    this.validationErrors.update((prev) => ({
      ...prev,
      password: isValid
        ? null
        : 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    }));
  }
}
