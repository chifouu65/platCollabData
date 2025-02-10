import { Component } from '@angular/core';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [],
  templateUrl: './projet-list.component.html',
  styleUrl: './projet-list.component.css',
})
export class ProjetListComponent {
  projects = resource();
}
