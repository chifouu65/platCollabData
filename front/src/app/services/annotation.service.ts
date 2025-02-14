import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Annotation, AnnotationGroup } from '../views/annotations/canvas.component';
import { Comment } from '../models/comment.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private apiUrl = 'http://localhost:3000/annotations'; // URL de votre API backend

  constructor(private http: HttpClient) {}

  saveMetadata(metadata: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/metadata`, metadata).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  saveAnnotationGroup(group: AnnotationGroup): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups`, group).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  getAnnotationGroups(projectId?: string): Observable<AnnotationGroup[]> {
    const url = projectId
      ? `${this.apiUrl}/groups?projectId=${projectId}`
      : `${this.apiUrl}/groups`;
    return this.http.get<AnnotationGroup[]>(url);
  }

  getAnnotationGroup(id: string): Observable<AnnotationGroup> {
    return this.http.get<AnnotationGroup>(`${this.apiUrl}/groups/${id}`);
  }

  deleteAnnotationGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${id}`).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  deleteAnnotation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  addComment(annotationId: string, comment: Comment) {
    return this.http.post<Annotation>(`${this.apiUrl}/${annotationId}/comments`, comment);
  }

  getComments(annotationId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${annotationId}/comments`);
  }

  createGroup(groupData: {
    name: string;
    projectId: string;
    annotations: Annotation[];
  }): Observable<any> {
    console.log('Annotation Service - Creating group with data:', JSON.stringify(groupData, null, 2));

    if (!groupData.projectId) {
      console.error('Annotation Service - Project ID is missing');
      throw new Error('Project ID is required');
    }

    if (!groupData.annotations || groupData.annotations.length === 0) {
      console.warn('Annotation Service - No annotations in group data');
    }

    return this.http.post(`${this.apiUrl}/groups`, groupData).pipe(
      tap(response => console.log('Annotation Service - Group created successfully:', response)),

        catchError((error) => {
          alert('Erreur lors de la mise à jour du projet: ' + error.message);
          return throwError(() => error);
        })

    );
  }

  getGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups`);
  }

  getGroupById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/groups/${id}`);
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/groups/${id}`).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }
}
