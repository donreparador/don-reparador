import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
  hideHeader = false;
  constructor(public router: Router) {
    this.router.events.subscribe(() => {
      this.hideHeader = this.router.url === '/register';
    });
  }

}
