import { Routes } from '@angular/router';

import { CategoryComponent } from './category/category.component';
import { CartComponent } from './cart/cart.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:slug', component: CategoryComponent },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' }
];
