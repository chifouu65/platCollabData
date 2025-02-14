import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface UploadResponse {
  url: string;
}

type FileType = 'audio' | 'video' | 'image';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly apiUrl = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, type: FileType): Observable<{progress: number, url?: string}> {
    if (!this.validateFileType(file, type)) {
      throw new Error(`Invalid file type. Expected ${type}`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const req = new HttpRequest('POST', `${this.apiUrl}/${type}`, formData, {
      reportProgress: true
    });

    return this.http.request<UploadResponse>(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return { progress };
          case HttpEventType.Response:
            return {
              progress: 100,
              url: (event.body as UploadResponse)?.url
            };
          default:
            return { progress: 0 };
        }
      })
    );
  }

  private validateFileType(file: File, type: FileType): boolean {
    switch (type) {
      case 'audio':
        return file.type.startsWith('audio/');
      case 'video':
        return file.type.startsWith('video/');
      case 'image':
        return file.type.startsWith('image/');
      default:
        return false;
    }
  }
}
