import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService, CustomerDetails, OrderConfirmation } from '../cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  protected readonly cart = inject(CartService);
  protected readonly confirmation = signal<OrderConfirmation | null>(null);
  protected readonly orderError = signal('');
  protected readonly submitting = signal(false);
  protected readonly hasItems = computed(() => this.cart.itemCount() > 0);

  protected decrease(productName: string): void {
    this.cart.decrease(productName);
  }

  protected remove(productName: string): void {
    this.cart.remove(productName);
  }

  protected placeOrder(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    if (!form.checkValidity() || !this.hasItems()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const details: CustomerDetails = {
      name: String(formData.get('name') ?? '').trim(),
      address: String(formData.get('address') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim()
    };

    this.submitting.set(true);
    this.orderError.set('');

    this.cart.placeOrder(details).subscribe({
      next: (confirmation) => {
        this.confirmation.set(confirmation);
        this.submitting.set(false);
        form.reset();
      },
      error: () => {
        this.orderError.set('We could not place your order right now. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}
