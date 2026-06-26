import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { CartService } from '../cart.service';
import { CatalogService } from '../catalog.service';
import { Product } from '../product-data';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category.component.html'
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  protected readonly cart = inject(CartService);

  protected readonly category = toSignal(
    this.route.paramMap.pipe(switchMap((params) => this.catalog.getCategory(params.get('slug'))))
  );

  protected addToCart(product: Product): void {
    this.cart.add(product);
    this.router.navigate(['/cart']);
  }
}
