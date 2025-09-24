import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-expert',
  imports: [],
  templateUrl: './expert.html',
  styleUrl: './expert.scss'
})
export class Expert {
  constructor(private authService: AuthPocketbaseService, private router: Router) {}
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
      customClass: {
        popup: 'dr-swal',              // opcional
        confirmButton: 'dr-confirm',   // <-- clase propia
        cancelButton: 'dr-cancel',     // <-- clase propia
      },
    });

    if (!result.isConfirmed) return;

    try {
      // cierra sesión en PB
      this.authService.logout?.(); // si el método existe
      // (si tu logout no es síncrono, puedes await this.authService.logout())
      await this.router.navigate(['/login']);
      // feedback breve
      await Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo cerrar sesión',
        text: (e as any)?.message ?? 'Intenta de nuevo.',
      });
    }
  }
}
