import { Routes } from '@angular/router';
import { ProjetListComponent } from './views/projet-list/projet-list.component';
import { ProjetDetailComponent } from './views/projet-detail/projet-detail.component';
import { AnnotationsComponent } from './views/annotations/annotations.component';
import { StatistiqueComponent } from './views/statistique/statistique.component';
import { LoginComponent } from './views/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projet',
    pathMatch: 'full',
  },
  {
    path: 'projet',
    component: ProjetListComponent,
  },
  {
    path: 'projet/:id',
    component: ProjetDetailComponent,
  },
  {
    path: 'projet/create',
    component: ProjetDetailComponent,
  },
  {
    path: 'projects/:id/annotations',
    component: AnnotationsComponent
  },
  {
    path: 'statistique',
    component: StatistiqueComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'projects/:id',
    component: ProjetDetailComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];
