// front/src/app/projet.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Project } from '../models/project.model';
import { CreateProjectDto, Dataset } from '../models/create-project.model';
import { Comment } from '../models/comment.model';
import { catchError as rxjsCatchError } from 'rxjs/operators';

export interface ProjectStats {
  annotationsCount: number;
  datasetsCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjetService {
  private readonly apiUrl = 'http://localhost:3000/projects'; // Remplacez par l'URL de votre API
  private readonly token = localStorage.getItem('token');
  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

   // Récupérer tous les projets de l'utilisateur
   getProjectsUser(id:string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/user/${id}`);
  }

  // Récupérer un projet par son ID
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Créer un projet
  createProject(project: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project,{
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      }),
     });
  }

  // Mettre à jour un projet
  updateProject(id: string, project: CreateProjectDto): Observable<Project> {
    return this.http.patch<Project>(
      `${this.apiUrl}/${id}`,
      project,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
        }),
      }
    ).pipe(
      catchError((error) => {
        alert('Erreur lors de la mise à jour du projet: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  // Supprimer un projet
  deleteProject(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `http://localhost:3000/project/delete/${id}`,
      {},{
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
        }),
       }).pipe(
        catchError((error) => {
          alert('Erreur lors de la mise à jour du projet: ' + error.message);
          return throwError(() => error);
        })
      );
  }

  // Ajouter un dataset à un projet
  addDataset(id: string, dataset: Dataset): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${id}/add-dataset`, dataset,{
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      }),
     });
  }

  addComment(projectId: string, comment: Comment): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/add-comment`, comment, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      }),
    });
  }

  getComments(projectId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${projectId}/comments`);
  }

  deleteComment(projectId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/comments/${commentId}`);
  }

  getProjectStats(projectId: string): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.apiUrl}/stats/${projectId}`);
  }

  getAllProjectStats(): Observable<{ [key: string]: ProjectStats }> {
    return this.http.get<{ [key: string]: ProjectStats }>(`${this.apiUrl}/stats`);
  }

}
