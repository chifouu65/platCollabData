import { Routes } from '@angular/router';
import { MainComponent } from './views/main/main.component';
import { ProjetListComponent } from './views/projet-list/projet-list.component';
import { ProjetDetailComponent } from './views/projet-detail/projet-detail.component';
import { AnnotationsComponent } from './views/annotations/annotations.component';
import { StatistiqueComponent } from './views/statistique/statistique.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
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
    path: 'annotations',
    component: AnnotationsComponent,
  },
  {
    path: 'statistique',
    component: StatistiqueComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
