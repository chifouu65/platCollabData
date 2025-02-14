import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ProjectExportService, ProjectExportFormat } from '../../services/project-export.service';
import { EXPORT_FORMATS } from '../../models/export-format.model';

interface DialogData {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-project-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Exporter le projet {{ data.projectName }}</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="mb-6">
        <mat-form-field class="w-full">
          <mat-label>Format d'export</mat-label>
          <mat-select [(ngModel)]="selectedFormat">
            @for (format of exportFormats; track format.value) {
              <mat-option [value]="format.value">
                <div class="flex items-center gap-3">
                  <div>
                    <div class="font-medium">{{ format.label }}</div>
                    <div class="text-sm text-gray-600">{{ format.description }}</div>
                  </div>
                </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="flex justify-end gap-2">
        <button mat-stroked-button mat-dialog-close>
          Annuler
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!selectedFormat"
          (click)="exportProject()"
        >
          <mat-icon class="mr-2">download</mat-icon>
          Exporter
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background-color: rgba(0, 0, 0, 0.04);
    }
    ::ng-deep .mat-mdc-select-panel {
      max-height: 400px !important;
    }
    ::ng-deep .mat-mdc-option {
      min-height: 60px !important;
    }
  `]
})
export class ProjectExportDialogComponent {
  selectedFormat: ProjectExportFormat = 'JSON';
  exportFormats = EXPORT_FORMATS;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<ProjectExportDialogComponent>,
    private projectExportService: ProjectExportService
  ) {}

  exportProject() {
    if (!this.selectedFormat) return;

    this.projectExportService.downloadProject(
      this.data.projectId,
      this.selectedFormat,
      this.data.projectName
    );
    this.dialogRef.close();
  }
}
