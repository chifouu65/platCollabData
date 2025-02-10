import { Component, effect, inject, input, output } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { CreateProjectDto } from '../../models/create-project.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent {
  private readonly fb = inject(FormBuilder);
  private projetService = inject(ProjetService);

  project = input.required<Project>();
  reload = output<void>();

  readonly form = this.fb.group({
    nom: this.fb.control<string | undefined>(undefined, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255),
    ]),
    description: this.fb.control<string | undefined>(undefined, [
      Validators.required,
      Validators.maxLength(255),
    ]),
  });

  constructor() {
    effect(() => {
      if (this.project()) {
        this.form.patchValue({
          nom: this.project()?.nom,
          description: this.project()?.description,
        });
      } else {
        this.form.reset();
      }
    });
  }

  onSubmit() {
    const project = this.form.getRawValue() as unknown as CreateProjectDto;
    if (this.project()) {
      this.projetService
        .updateProject(this.project()._id, project)
        .subscribe(() => this.reload.emit());
    } else {
      this.projetService
        .createProject(project)
        .subscribe(() => this.reload.emit());
    }
    this.form.reset();
  }
}
