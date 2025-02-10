import { Component, input } from '@angular/core';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [],
  templateUrl: './projet-detail.component.html',
  styleUrl: './projet-detail.component.css',
})
export class ProjetDetailComponent {
  id = input.required<string>();
}
