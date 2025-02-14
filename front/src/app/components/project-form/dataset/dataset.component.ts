import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dataset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div [formGroup]="formGroup" class="bg-white drop-shadow-lg p-4 rounded-2xl">
      <mat-form-field class="w-full">
        <mat-label>Type de dataset</mat-label>
        <mat-select formControlName="type">
          <mat-option value="image">Image</mat-option>
          <mat-option value="audio">Audio</mat-option>
          <mat-option value="video">Vidéo</mat-option>
          <mat-option value="text">Texte</mat-option>
        </mat-select>
      </mat-form-field>

      @if (formGroup.get('type')?.value !== 'text') {
        <div class="flex flex-col gap-4">
          <mat-form-field class="w-full">
            <mat-label>URL</mat-label>
            <input matInput formControlName="url" placeholder="http://example.com/file" required />
          </mat-form-field>

          @if (formGroup.get('type')?.value === 'image') {
            <div class="preview-container">
              @if (formGroup.get('url')?.value) {
                <img
                  [src]="formGroup.get('url')?.value"
                  alt="Aperçu"
                  class="preview-image"
                />
              }
              <div class="upload-controls">
                <input
                  #fileInput
                  type="file"
                  class="hidden"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                />
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="fileInput.click()"
                  [disabled]="isUploading"
                >
                  <mat-icon>{{ isUploading ? 'hourglass_empty' : 'upload' }}</mat-icon>
                  {{ isUploading ? 'Upload en cours...' : 'Upload Image' }}
                </button>
              </div>
              @if (isUploading) {
                <div class="upload-progress">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
                  <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
              }
            </div>
          }

          @if (formGroup.get('type')?.value === 'video') {
            <div class="preview-container">
              @if (formGroup.get('url')?.value) {
                <video
                  controls
                  class="media-preview"
                  preload="metadata"
                >
                  <source [src]="formGroup.get('url')?.value" type="video/mp4">
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              }
              <div class="upload-controls">
                <input
                  #fileInput
                  type="file"
                  class="hidden"
                  [accept]="getAcceptTypes()"
                  (change)="onFileSelected($event)"
                />
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="fileInput.click()"
                  [disabled]="isUploading"
                >
                  <mat-icon>{{ isUploading ? 'hourglass_empty' : 'upload' }}</mat-icon>
                  {{ isUploading ? 'Upload en cours...' : 'Upload Vidéo' }}
                </button>
              </div>
              @if (isUploading) {
                <div class="upload-progress">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
                  <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
              }
            </div>
          }

          @if (formGroup.get('type')?.value === 'audio') {
            <div class="preview-container">
              @if (formGroup.get('url')?.value) {
                <audio
                  controls
                  class="media-preview"
                  preload="metadata"
                >
                  <source [src]="formGroup.get('url')?.value" type="audio/mpeg">
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              }
              <div class="upload-controls">
                <input
                  #fileInput
                  type="file"
                  class="hidden"
                  [accept]="getAcceptTypes()"
                  (change)="onFileSelected($event)"
                />
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="fileInput.click()"
                  [disabled]="isUploading"
                >
                  <mat-icon>{{ isUploading ? 'hourglass_empty' : 'upload' }}</mat-icon>
                  {{ isUploading ? 'Upload en cours...' : 'Upload Audio' }}
                </button>
              </div>
              @if (isUploading) {
                <div class="upload-progress">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
                  <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (formGroup.get('type')?.value === 'text') {
        <mat-form-field class="w-full">
          <mat-label>Texte</mat-label>
          <textarea matInput formControlName="texte" placeholder="Votre texte ici..." rows="4"></textarea>
        </mat-form-field>
      }

      <div formGroupName="metadata" class="metadata-container">
        @if (formGroup.get('type')?.value === 'audio' || formGroup.get('type')?.value === 'video') {
          <mat-form-field class="w-full">
            <mat-label>Durée</mat-label>
            <input matInput formControlName="duration" placeholder="00:00:00"/>
            <mat-hint>Format: HH:MM:SS</mat-hint>
          </mat-form-field>
        }

        <mat-form-field class="w-full">
          <mat-label>Format</mat-label>
          <input matInput formControlName="format" [placeholder]="getFormatPlaceholder()"/>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .hidden {
      display: none;
    }
    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    .preview-image {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .upload-controls {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .metadata-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    .upload-progress {
      width: 100%;
      margin-top: 1rem;
      text-align: center;
    }
    .progress-text {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.5rem;
      display: block;
    }
    .media-preview {
      width: 100%;
      max-width: 100%;
      margin-bottom: 1rem;
      border-radius: 4px;
      background-color: #f3f4f6;
    }

    video.media-preview {
      max-height: 300px;
      object-fit: contain;
    }

    audio.media-preview {
      height: 40px;
    }
  `]
})
export class DatasetComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() fileSelected = new EventEmitter<{file: File, index: number}>();

  isUploading = false;
  uploadProgress = 0;

  getAcceptTypes(): string {
    const type = this.formGroup.get('type')?.value;
    switch (type) {
      case 'audio': return 'audio/*';
      case 'video': return 'video/*';
      case 'image': return 'image/*';
      default: return '';
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.uploadProgress = 0;

      // Extraire les métadonnées avant l'upload
      await this.extractMetadata(file);

      this.fileSelected.emit({file, index: 0});
    }
  }

  private async extractMetadata(file: File) {
    const metadata = this.formGroup.get('metadata') as FormGroup;
    const type = this.formGroup.get('type')?.value;

    // Définir le format basé sur le type MIME
    metadata.patchValue({
      format: file.type.split('/')[1].toUpperCase()
    });

    if (type === 'audio' || type === 'video') {
      try {
        const duration = await this.getMediaDuration(file);
        metadata.patchValue({
          duration: this.formatDuration(duration)
        });
      } catch (error) {
        console.error('Erreur lors de l\'extraction de la durée:', error);
      }
    }

    if (type === 'image') {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.patchValue({
          format: `${file.type.split('/')[1].toUpperCase()} (${dimensions.width}x${dimensions.height})`
        });
      } catch (error) {
        console.error('Erreur lors de l\'extraction des dimensions:', error);
      }
    }
  }

  private getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('audio');

      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };

      media.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement du média'));
      };

      media.src = url;
    });
  }

  private getImageDimensions(file: File): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [hours, minutes, remainingSeconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  }

  getFormatPlaceholder(): string {
    const type = this.formGroup.get('type')?.value;
    switch (type) {
      case 'image': return 'ex: PNG, JPEG, etc.';
      case 'audio': return 'ex: MP3, WAV, etc.';
      case 'video': return 'ex: MP4, AVI, etc.';
      case 'text': return 'ex: TXT, PDF, etc.';
      default: return '';
    }
  }

  updateProgress(progress: number) {
    this.uploadProgress = progress;
    if (progress >= 100) {
      setTimeout(() => {
        this.isUploading = false;
      }, 500);
    }
  }
}
