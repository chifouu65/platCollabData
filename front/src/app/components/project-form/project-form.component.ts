import { Component, inject, input, output, ViewChildren, QueryList } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconAnchor } from '@angular/material/button';
import { DatasetComponent } from './dataset/dataset.component';
import { effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    DatasetComponent,
    MatIconModule
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent {
  private projetService = inject(ProjetService);
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);

  project = input<any>();
  save = output<any>();
  cancel = output<void>();
  delete = output<void>();

  form = this.fb.group({
    _id: [{value: '', disabled: true}],
    nom: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    datasets: this.fb.array([])
  });

  uploadProgress: { [key: number]: number } = {};

  @ViewChildren(DatasetComponent) datasetsComponents!: QueryList<DatasetComponent>;

  constructor() {
    effect(() => {
      const project = this.project();
      if (project) {
        this.form.patchValue({
          _id: project._id,
          nom: project.nom,
          description: project.description,
        });
        this.datasets.clear();
        project.datasets?.forEach((dataset: any) => this.addDataset(dataset));
      }
    });
  }

  get datasets() {
    return this.form.get('datasets') as FormArray;
  }

  addDataset(dataset: any = { type: 'image', url: '', metadata: {} }) {
    this.datasets.push(this.fb.group({
      _id: [dataset._id || null],
      type: [dataset.type || 'image'],
      url: [dataset.url || ''],
      metadata: this.fb.group({
        duration: [dataset.metadata?.duration || ''],
        format: [dataset.metadata?.format || '']
      }),
      texte: [dataset.texte || '']
    }));
  }

  removeDataset(index: number) {
    this.datasets.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = {
        ...this.form.getRawValue(),
        _id: this.project()?._id,
        datasets: this.form.getRawValue().datasets
      };

      this.save.emit(formValue);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }

    if (control.hasError('minlength')) {
      return `Le nom doit contenir au moins ${control.getError('minlength').requiredLength} caractères`;
    }

    if (control.hasError('maxlength')) {
      return `La description ne peut pas dépasser ${control.getError('maxlength').requiredLength} caractères`;
    }

    return '';
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  onFileSelected(file: File, index: number) {
    const dataset = this.datasets.at(index);
    const type = dataset?.get('type')?.value;

    if (!file || !type) return;

    if (type === 'audio' && !file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('Veuillez sélectionner un fichier vidéo');
      return;
    }

    const datasetComponent = this.datasetsComponents.get(index);
    if (datasetComponent) {
      this.uploadService.uploadFile(file, type).subscribe({
        next: (result) => {
          datasetComponent.updateProgress(result.progress);
          if (result.url) {
            dataset?.patchValue({ url: result.url });
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload:', error);
          alert('Une erreur est survenue lors de l\'upload du fichier');
          datasetComponent.isUploading = false;
        }
      });
    }
  }
}
