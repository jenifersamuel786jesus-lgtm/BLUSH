import { Component, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { HttpClient } from '@angular/common/http';

import { CatalogService } from '../catalog.service';
import { categories } from '../product-data';

const API_URL = 'https://blush-1-31cq.onrender.com/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private readonly catalog = inject(CatalogService);
  private readonly http = inject(HttpClient);

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: categories });
  protected readonly subscribeMessage = signal('');

  protected onSubscribe(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();

    if (!email) {
      this.subscribeMessage.set('Please enter a valid email.');
      return;
    }

    this.http.post<{ message?: string } | unknown>(`${API_URL}/subscriptions`, { email }).subscribe({
      next: () => {
        this.subscribeMessage.set('Subscribed successfully!');
        form.reset();
      },
      error: () => {
        this.subscribeMessage.set('Subscription failed. Please try again.');
      }
    });
  }
}

