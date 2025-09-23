import { CommonModule,  } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink,  } from '@angular/router';
 
@Component({
  selector: 'app-bottom-navbar',
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './bottom-navbar.html',
  styleUrl: './bottom-navbar.scss',
  standalone: true
})
export class BottomNavbar {
  hideHeader = false;
  constructor(public router: Router) {
    this.router.events.subscribe(() => {
      this.hideHeader = this.router.url === '/register';
    });
  }
}
