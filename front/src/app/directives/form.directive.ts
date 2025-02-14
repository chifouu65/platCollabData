import { Directive, inject, input, WritableSignal } from '@angular/core';
import { NgForm } from '@angular/forms';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Ensure this import is correct

@Directive({
  selector: 'form',
  standalone: true,
})
export class FormDirective<T> {
  readonly formValue = input.required<WritableSignal<T>>();
  readonly ngForm = inject(NgForm, { self: true });

  handleFormUpdate = this.ngForm.form.valueChanges
    .pipe(
      filter((changes) => !!changes),
      tap((changes) => this.formValue().set(changes)),
      tap(() => console.log('tap')),
      takeUntilDestroyed()
    )
    .subscribe();
}
