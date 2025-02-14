import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AnnotationService } from './annotation.service';

export type ProjectExportFormat = 'JSON' | 'CSV' | 'PASCAL_VOC' | 'COCO';

@Injectable({
  providedIn: 'root'
})
export class ProjectExportService {
  private readonly apiUrl = 'http://localhost:3000/projects';

  constructor(
    private http: HttpClient,
    private annotationService: AnnotationService
  ) {}

  /**
   * Exporte un projet dans le format spécifié
   * @param projectId ID du projet à exporter
   * @param format Format d'export souhaité
   * @returns Observable du blob contenant les données exportées
   */
  exportProject(projectId: string, format: ProjectExportFormat): Observable<Blob> {
    return this.annotationService.getAnnotationGroups(projectId).pipe(
      switchMap(groups => {
        const params = new HttpParams()
          .set('format', format)
          .set('includeAnnotations', 'true')
          .set('annotationGroups', groups.map(g => g._id).join(','));

        return this.http.get(`${this.apiUrl}/${projectId}/export`, {
          params,
          responseType: 'blob',
          headers: {
            'Accept': this.getContentType(format)
          }
        });
      })
    );
  }

  /**
   * Retourne le type MIME approprié pour le format d'export
   */
  private getContentType(format: ProjectExportFormat): string {
    switch (format) {
      case 'JSON':
      case 'COCO':
        return 'application/json';
      case 'CSV':
        return 'text/csv';
      case 'PASCAL_VOC':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Retourne l'extension de fichier appropriée pour le format d'export
   */
  getFileExtension(format: ProjectExportFormat): string {
    switch (format) {
      case 'JSON':
      case 'COCO':
        return 'json';
      case 'CSV':
        return 'csv';
      case 'PASCAL_VOC':
        return 'xml';
      default:
        return 'txt';
    }
  }

  /**
   * Télécharge le projet exporté
   */
  downloadProject(projectId: string, format: ProjectExportFormat, projectName: string = 'project'): void {
    this.exportProject(projectId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_${new Date().toISOString()}.${this.getFileExtension(format)}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export du projet:', error);
        alert('Une erreur est survenue lors de l\'export du projet');
      }
    });
  }
}
