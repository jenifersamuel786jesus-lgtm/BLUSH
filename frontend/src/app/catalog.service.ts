import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { Category, categories } from './product-data';

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/categories`).pipe(
      catchError(() => of(categories))
    );
  }

  getCategory(slug: string | null | undefined): Observable<Category | undefined> {
    if (!slug) {
      return of(undefined);
    }

    return this.http.get<Category>(`${API_URL}/categories/${slug}`).pipe(
      catchError(() => of(categories.find((category) => category.slug === slug)))
    );
  }
}
