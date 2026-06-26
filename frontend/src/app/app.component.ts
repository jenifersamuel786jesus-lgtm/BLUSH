import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly cart = inject(CartService);
  protected menuOpen = false;

  protected closeMenu(): void {
    this.menuOpen = false;
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
