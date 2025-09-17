import { CommonModule,  } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true
})
export class App implements AfterViewInit {
  hideHeader = false;
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.hideHeader = this.router.url === '/register';
    });
  }
  ngAfterViewInit() {
    // Add any view initialization logic here if needed
  }
}
