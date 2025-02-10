import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProjetService } from '../../services/projet.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projet-list',
  imports: [MatSidenavModule, MatButtonModule, ProjectFormComponent],
  templateUrl: './projet-list.component.html',
  styleUrl: './projet-list.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjetListComponent {
  private readonly drawer = viewChild<any>('drawerEditCreate');

  private readonly projectService = inject(ProjetService);

  readonly projects = resource({
    loader: () => firstValueFrom(this.projectService.getProjects()),
  });

  readonly idEdit = signal<undefined | Project>(undefined);

  deleteProject(id: string) {
    this.projectService
      .deleteProject(id)
      .subscribe(() => this.projects.reload());
  }

  editProject(project: Project) {
    this.drawer().toggle();
    this.idEdit.set(project);
  }

  createProject() {
    this.idEdit.set(undefined);
    this.drawer().toggle();
  }
}
