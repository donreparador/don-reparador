import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BottomNavbar } from './components/bottom-navbar/bottom-navbar';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { ConfigMobileService } from './core/config-mobile.service';
declare const iconsax: any;
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    BottomNavbar,
    Header,
    Sidebar
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true
})
export class App implements AfterViewInit {
  hideHeader = false;
  
  constructor(public router: Router,private cfg: ConfigMobileService) {
    this.cfg.load();
// app.component.ts


    this.router.events.subscribe(() => {
      this.hideHeader = this.router.url === '/register';
    });
  }

  ngAfterViewInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => {
        if (typeof iconsax?.replace === 'function') iconsax.replace();
      });
    });
  }
}