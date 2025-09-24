import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { Client } from './sections/client/client';
import { Expert } from './sections/expert/expert';

type Role = 'client' | 'provider';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Expert, Client],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {
  private auth = inject(AuthPocketbaseService);
  private router = inject(Router);

  // estado
  isLoggedIn = false;
  user: any = null;
  role: Role = 'client';

  // avatar
  readonly defaultAvatar = 'assets/images/profile/profile.png';
  avatarSrc = signal<string>(this.defaultAvatar);

  async ngOnInit() {
    await this.checkAuthStatus(); // 👈 si no hay sesión, redirige y no muestra nada
  }

  private async checkAuthStatus() {
    try {
      this.isLoggedIn = this.auth.isLoggedIn();
      if (!this.isLoggedIn) {
        // Redirige sin mostrar mensajes
        await this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }

      // Usuario autenticado
      this.user = this.auth.currentUser();

      // Rol UI
      this.role = this.user?.type === 'proveedor' ? 'provider' : 'client';

      // Avatar desde PB (campo File "avatar")
      const url =
        this.auth.fileUrl(this.user, (this.user as any)?.avatar, '128x128') ||
        this.auth.fileUrl(this.user, (this.user as any)?.avatar) ||
        (typeof (this.user as any)?.avatarUrl === 'string' &&
        (this.user as any).avatarUrl.startsWith('http')
          ? (this.user as any).avatarUrl
          : null);

      this.avatarSrc.set(url || this.defaultAvatar);
    } catch (err) {
      console.error('Error al verificar autenticación:', err);
      await this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  async onRoleToggle(event: Event) {
    // Solo proveedores pueden alternar a 'provider'
    if (!this.user || this.user.type !== 'proveedor') {
      (event.target as HTMLInputElement).checked = false;
      return;
    }
    const input = event.target as HTMLInputElement;
    this.role = input.checked ? 'provider' : 'client';
  }

  get userName(): string {
    return this.user?.username || 'Usuario';
  }
  get userEmail(): string {
    return this.user?.email || '';
  }

  async logout() {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Vas a salir de Don Reparador.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      this.auth.logout();
      await this.router.navigate(['/login'], { replaceUrl: true });
    } catch (e: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo cerrar sesión',
        text: e?.message ?? 'Intenta de nuevo.',
      });
    }
  }
}
