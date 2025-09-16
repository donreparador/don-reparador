import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthPocketbaseService, RegisterMinimalPayload, UserType } from '../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthPocketbaseService);

  loading = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    type: ['cliente' as UserType, [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [
      Validators.required,
      /^\+?\d[\d\s-]{6,19}\d$/.test.bind(/^\+?\d[\d\s-]{6,19}\d$/) as any
    ]],
  });

  get f() { return this.form.controls; }

  async onSubmit() {
    this.submitted.set(true);
    this.errorMsg.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const v = this.form.value as Required<RegisterMinimalPayload>;
      await this.auth.registerMinimal({
        username: v.username,
        email: v.email,
        phone: v.phone,
        type: v.type,
      });

      this.success.set(true);

      // 👉 Aquí lanzamos el SweetAlert
      Swal.fire({
        title: '¡Cuenta creada!',
        text: `Bienvenido ${v.username}, tu cuenta de ${v.type} fue creada correctamente.`,
        icon: 'success',
        confirmButtonText: 'Continuar'
      });

      // Ejemplo: redirigir según tipo
      // if (v.type === 'proveedor') this.router.navigate(['/proveedor/onboarding']);
      // else this.router.navigate(['/cliente/home']);

    } catch (e: any) {
      const msg = e?.response?.message ?? e?.message ?? 'No se pudo crear la cuenta.';
      this.errorMsg.set(msg);

      // También puedes mostrar error con SweetAlert
      Swal.fire({
        title: 'Error',
        text: msg,
        icon: 'error',
        confirmButtonText: 'Revisar'
      });

    } finally {
      this.loading.set(false);
    }
  }

  setType(t: UserType) { this.form.get('type')?.setValue(t); }
  isType(t: UserType)  { return this.form.get('type')?.value === t; }
}
