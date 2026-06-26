import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { Product } from './product-data';

const API_URL = '/_/backend/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface OrderConfirmation {
  id: string;
  details: CustomerDetails;
  items: CartItem[];
  total: number;
  deliveryWindow: string;
  placedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>([]);

  constructor(private readonly http: HttpClient) {}

  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((total, item) => total + this.priceValue(item.product.price) * item.quantity, 0));

  add(product: Product): void {
    this.itemsSignal.update((items) => {
      const existing = items.find((item) => item.product.name === product.name);

      if (existing) {
        return items.map((item) =>
          item.product.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, { product, quantity: 1 }];
    });
  }

  decrease(productName: string): void {
    this.itemsSignal.update((items) =>
      items
        .map((item) =>
          item.product.name === productName
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  remove(productName: string): void {
    this.itemsSignal.update((items) => items.filter((item) => item.product.name !== productName));
  }

  clear(): void {
    this.itemsSignal.set([]);
  }

  placeOrder(details: CustomerDetails): Observable<OrderConfirmation> {
    const payload = {
      details,
      items: this.items().map((item) => ({ ...item }))
    };

    return this.http.post<OrderConfirmation>(`${API_URL}/orders`, payload).pipe(
      tap(() => this.clear())
    );
  }

  private priceValue(price: string): number {
    return Number(price.replace(/\D/g, '')) || 0;
  }
}
