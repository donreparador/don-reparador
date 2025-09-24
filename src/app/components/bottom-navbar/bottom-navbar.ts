import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-navbar',
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './bottom-navbar.html',
  styleUrls: ['./bottom-navbar.scss'],
  standalone: true
})
export class BottomNavbar {
  hideHeader = false;
  
  constructor(public router: Router) {
    this.router.events.subscribe(() => {
      this.hideHeader = this.router.url === '/register';
    });
  }

  // Función para verificar si la ruta está activa
  isActive(route: string): boolean {
    return this.router.url === route || 
           (route === '/profile' && this.router.url.startsWith('/profile'));
  }
}