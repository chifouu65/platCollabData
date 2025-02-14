import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export type ExportFormat = 'COCO' | 'PASCAL_VOC' | 'CSV' | 'JSON';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  exportProject(projectId: string, format: string): Observable<Blob> {
    console.log('Service - Début export projet:', { projectId, format });
    return this.http.get(`${this.apiUrl}/projects/${projectId}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  exportAnnotations(groupIds: string[], format: string): Observable<Blob> {
    console.log('Service - Début export annotations:', { groupIds, format });
    return this.http.post(`${this.apiUrl}/annotations/export`, {
      groupIds,
      format
    }, {
      responseType: 'blob'
    });
  }
}
