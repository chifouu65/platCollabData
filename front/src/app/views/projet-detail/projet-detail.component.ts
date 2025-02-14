import { UserService } from './../../services/user.service';
import { Component, computed, inject, input, resource } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogComponent } from '../../components/export-dialog/export-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AnnotationsComponent } from '../annotations/annotations.component';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [ProjectFormComponent, MatIconModule],
  template: `
    <div class="container">
      <div class="flex justify-between items-center mb-4">
        <h2>{{ isEditMode() ? "Modifier" : "Créer" }} un projet</h2>
        @if (isEditMode()) {
          <button
            mat-raised-button
            color="primary"
            (click)="openExportDialog()"
          >
            <mat-icon>download</mat-icon>
            Exporter
          </button>*
        }
      </div>
      <app-project-form
        [project]="project.value()"
        (save)="saveProject($event)"
        (cancel)="back()"
        (delete)="deleteProject()"
      />
    </div>
  `,
  styles: [`
    .container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class ProjetDetailComponent {
  private projectService = inject(ProjetService);
  private location = inject(Location);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  id = input.required<string>();
  isEditMode = computed(() => this.id() !== 'create');

  project = resource({
    request: () => this.id(),
    loader: ({request}) => {
      if (this.isEditMode()) {
        return firstValueFrom(this.projectService.getProjectById(request));
      }
      return Promise.resolve(null);
    }
  });

  async saveProject(projectData: any) {
    try {
      if (this.isEditMode()) {
        await firstValueFrom(this.projectService.updateProject(this.id()!, projectData));
      } else {
        await firstValueFrom(this.projectService.createProject(projectData));
      }
      this.back()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  back() {
    this.location.back();
  }

  async deleteProject() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await firstValueFrom(this.projectService.deleteProject(this.id()!));
        this.router.navigate(['/projet']);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }

  openExportDialog() {
    const projectId = this.id();
    console.log('Opening export dialog with project ID:', projectId);
    if (!projectId) {
      console.error('No project ID available');
      return;
    }

    this.dialog.open(ExportDialogComponent, {
      width: '500px',
      data: {
        projectId: projectId,
        groups: []
      }
    });
  }
}
