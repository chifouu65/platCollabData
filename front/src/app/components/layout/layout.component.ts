import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormDirective } from '../../directives/form.directive';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, NgClass, FormDirective, FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly router = inject(Router)
  private readonly search = inject(SearchService);

  formValues = signal({ search: '' });
  menuMobileOpen = signal(false);

   readonly userService = inject(UserService)

  toggleMobileMenu() {
    console.log('rez');
    this.menuMobileOpen.set(!this.menuMobileOpen());
  }

  constructor() {
    effect(() => {
      this.onSearch();
    });
  }

  onSearch() {
    const value = this.formValues().search;
    this.search.setSearch(value);
  }


  logout() {
    this.userService.logout()
    this.router.navigate(['/login'])
  }

}

