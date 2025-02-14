import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjetListComponent } from './views/projet-list/projet-list.component';
import { ProjetDetailComponent } from './views/projet-detail/projet-detail.component';

const routes: Routes = [
  { path: 'projects', component: ProjetListComponent },
  { path: 'projet/create', component: ProjetDetailComponent },
  { path: 'projet/:id', component: ProjetDetailComponent },
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
