import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  linkedSignal,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom, forkJoin, map, switchMap, tap } from 'rxjs';
import { ProjetService } from '../../services/projet.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Project } from '../../models/project.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ProjectStats } from '../../models/project-stats.model';
import { ProjectExportService, ProjectExportFormat } from '../../services/project-export.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ProjectExportDialogComponent } from '../../components/project-export-dialog/project-export-dialog.component';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, MatTooltipModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Projets</h1>
        <button
          mat-raised-button
          color="primary"
          [routerLink]="['/projet/create']"
        >
          <mat-icon>add</mat-icon>
          Nouveau projet
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (projet of filteredProjects(); track projet._id) {
          <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-2">{{ projet.nom }}</h2>
            <p class="text-gray-600 mb-4">{{ projet.description }}</p>
            <div class="flex gap-4 mb-4 text-sm text-gray-500">
              <div>
                <mat-icon class="align-middle mr-1">dataset</mat-icon>
                {{ projet.datasets.length }} datasets
              </div>
              <div>
                <mat-icon class="align-middle mr-1">edit_note</mat-icon>
                {{ projet.stats?.annotationsCount || 0 }} annotations
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <button
                mat-button
                color="primary"
                (click)="exportProject(projet)"
                matTooltip="Exporter le projet"
              >
                <mat-icon>download</mat-icon>
                Exporter
              </button>
              @if(userService.user()) {
                <a [routerLink]="['/projects', projet._id, 'annotations']">
                <button mat-button color="primary">
                  <mat-icon>edit</mat-icon>
                  Annotations
                </button>
              </a>
                <a [routerLink]="['/projects', projet._id]">
                <button mat-button color="primary">
                  <mat-icon>edit</mat-icon>
                  Éditer
                </button>
              </a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ProjetListComponent {
  private readonly projectService = inject(ProjetService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly search = inject(SearchService);
  readonly userService = inject(UserService);
  readonly projects = resource({
    loader: () => firstValueFrom(this.projectService.getProjects()),
  });

  readonly filteredProjects = computed(() => {
    if(this.search.searchValue !== '') {
      return this.projects.value()?.filter(project => project.nom.toLowerCase().includes(this.search.searchValue.toLowerCase()));
    } else {
      return this.projects.value();
    }
  });


  readonly idEdit = signal<undefined | Project>(undefined);

  projectStats = new Map<string, ProjectStats>();


  getProjectStats(projectId: string): ProjectStats {
    return this.projectStats.get(projectId) || { annotationsCount: 0, datasetsCount: 0 };
  }

  viewProject(id: string) {
    this.router.navigate([`projet/${id}`]);
  }

  createProject() {
    this.idEdit.set(undefined);
    this.router.navigate([`projet/create`]);
  }

  exportProject(project: Project) {
    this.dialog.open(ProjectExportDialogComponent, {
      width: '400px',
      data: {
        projectId: project._id,
        projectName: project.nom
      }
    });
  }
}
