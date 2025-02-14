import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private readonly search = signal<string>('');

  get searchValue() {
    return this.search();
  }

   setSearch(value: string) {
    this.search.set(value);
  }

}
