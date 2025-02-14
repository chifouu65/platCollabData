import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ExportFormat, ExportService } from '../../services/export.service';
import { EXPORT_FORMATS } from '../../models/export-format.model';

export interface ExportDialogData {
  projectId: string;
  groups: Array<{id: string, name: string, selected: boolean}>;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Exporter les annotations</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="mb-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Format d'export</mat-label>
          <mat-select [(ngModel)]="selectedFormat">
            @for (format of exportFormats; track format.value) {
              <mat-option [value]="format.value">
                <div class="flex items-center gap-3">
                  <div class="icon-container">
                    <mat-icon>{{ format.icon }}</mat-icon>
                  </div>
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

      <div class="groups-selection">
        <h3>Groupes à exporter</h3>
        @for(group of groups; track group.id) {
          <mat-checkbox [(ngModel)]="group.selected">
            {{ group.name }}
          </mat-checkbox>
        }
      </div>
    </div>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!selectedFormat || isExporting"
        (click)="exportProject()"
      >
        {{ isExporting ? 'Export en cours...' : 'Exporter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .groups-selection {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExportDialogComponent {
  private dialogRef = inject(MatDialogRef<ExportDialogComponent>);
  private exportService = inject(ExportService);
  private data: ExportDialogData = inject(MAT_DIALOG_DATA);

  selectedFormat: string = 'JSON';
  exportFormats = EXPORT_FORMATS;
  isExporting = false;
  groups = this.data.groups;
  projectId = this.data.projectId;

  exportProject() {
    console.log('Dialog - Début export, projectId:', this.projectId);

    this.isExporting = true;

    // Vérifions si nous avons des groupes sélectionnés pour l'export
    const selectedGroups = this.groups.filter(g => g.selected);
    console.log('Selected groups:', selectedGroups);

    if (selectedGroups.length > 0) {
      // Export d'annotations
      const groupIds = selectedGroups.map(g => g.id);
      console.log('Exporting groups:', groupIds);

      this.exportService.exportAnnotations(
        groupIds,
        this.selectedFormat as ExportFormat
      ).subscribe({
        next: (blob: Blob) => this.handleExportSuccess(blob),
        error: (error) => this.handleExportError(error)
      });
    } else {
      // Export de projet
      this.exportService.exportProject(
        this.projectId,
        this.selectedFormat as ExportFormat
      ).subscribe({
        next: (blob: Blob) => this.handleExportSuccess(blob),
        error: (error) => this.handleExportError(error)
      });
    }
  }

  private handleExportSuccess(blob: Blob) {
    console.log('Dialog - Blob reçu:', blob);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const prefix = this.groups.some(g => g.selected) ? 'annotations' : 'project';
    a.download = `${prefix}_${this.selectedFormat.toLowerCase()}_${new Date().getTime()}.${this.getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.dialogRef.close();
    this.isExporting = false;
    console.log('Dialog - Export terminé');
  }

  private handleExportError(error: any) {
    console.error('Dialog - Erreur:', error);
    alert('Une erreur est survenue lors de l\'export');
    this.isExporting = false;
  }

  private getFileExtension(): string {
    switch (this.selectedFormat) {
      case 'COCO':
      case 'JSON':
        return 'json';
      case 'PASCAL_VOC':
        return 'xml';
      case 'CSV':
        return 'csv';
      default:
        return 'txt';
    }
  }
}
