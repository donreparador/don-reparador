import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthPocketbaseService, UserType, RegisterMinimalPayload } from '../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthPocketbaseService);
  private router = inject(Router);
  private email = inject(EmailService);

  loading = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);
  success = signal(false);

  // preview del avatar
  avatarPreview = signal<string | null>(null);

  // Validador de archivo (tipo y tamaño); valida solo si el valor es un File
  private fileValidator = (control: AbstractControl): ValidationErrors | null => {
    const val = control.value as unknown;
    const file = val instanceof File ? val : null;
    if (!file) return null; // si no hay archivo (o no es File), otros validators decidirán (required condicional)
    const okType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
    if (!okType) return { fileType: true };
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) return { fileSize: true };
    return null;
  };

  form = this.fb.group({
    type: ['cliente' as UserType, [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [
      '',
      [
        Validators.required,
        // E.164 o dígitos con separadores básicos
        Validators.pattern(/^\+?\d[\d\s-]{6,19}\d$/),
      ],
    ],
    dni: [
      '',
      [
        // requerido solo si proveedor (se aplica en setType)
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9.-]+$/), // letras, números, punto y guion
      ],
    ],
    // ⚠️ importante: usar undefined en lugar de null para ser compatible con el tipo del servicio
    avatar: [undefined as File | string | undefined, [this.fileValidator]], // required condicional si proveedor
  });

  get f() {
    return this.form.controls;
  }

  // Imagen seleccionada
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    // setValue con undefined si no hay archivo
    this.form.get('avatar')?.setValue(file ?? undefined);
    this.form.get('avatar')?.updateValueAndValidity();

    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = () => this.avatarPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.avatarPreview.set(null);
    }
  }

  async onSubmit() {
    this.submitted.set(true);
    this.errorMsg.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const v = this.form.value;

      // Construye el payload usando la interfaz del servicio
      const payload: RegisterMinimalPayload = {
        username: v.username!,
        email: v.email!,
        phone: v.phone!,
        type: v.type!,
        dni: v.dni || undefined,
        // El servicio espera: string | Blob | undefined
        avatar: (v.avatar ?? undefined) as string | Blob | undefined,
      };

      await this.auth.registerMinimal(payload);

      this.success.set(true);

      // Emails
      const createdAt = new Date().toISOString();
      try {
        if (v.type === 'cliente') {
          await this.email.sendBienvenidaCliente(v.email!, v.username!, {
            name: v.username!,
            email: v.email!,
            type: v.type!,
            phone: v.phone!,
            created: createdAt,
          });
        } else {
          await this.email.sendBienvenidaProveedor(v.email!, v.username!, {
            name: v.username!,
            email: v.email!,
            type: v.type!,
            phone: v.phone!,
            created: createdAt,
          });
          await this.email.notifyAdminNuevoProveedor({
            name: v.username!,
            email: v.email!,
            type: v.type!,
            created: createdAt,
            phone: v.phone!,
          });
        }
      } catch (mailErr: any) {
        console.error('Fallo envío de email:', mailErr?.message || mailErr);
      }

      if (v.type === 'cliente') {
        Swal.fire({
          title: '¡Cuenta creada!',
          text: `Bienvenido ${v.username}, tu cuenta de cliente fue activada correctamente.`,
          icon: 'success',
          confirmButtonText: 'Ir al inicio',
        }).then(() => this.router.navigate(['/home']));
      } else {
        Swal.fire({
          title: 'Cuenta en revisión',
          text: `Gracias ${v.username}. Tu cuenta de proveedor será revisada por el equipo antes de activarse.`,
          icon: 'info',
          confirmButtonText: 'Entendido',
        });
      }
    } catch (e: any) {
      const msg = e?.response?.message ?? e?.message ?? 'No se pudo crear la cuenta.';
      this.errorMsg.set(msg);
      Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'Revisar' });
    } finally {
      this.loading.set(false);
    }
  }

  // Selector visual de tipo
  setType(t: UserType) {
    this.form.get('type')?.setValue(t);

    // ✅ Reglas condicionales para proveedor
    const dniCtrl = this.form.get('dni')!;
    const avatarCtrl = this.form.get('avatar')!;

    if (t === 'proveedor') {
      dniCtrl.addValidators([Validators.required]);
      avatarCtrl.addValidators([Validators.required, this.fileValidator]);
    } else {
      dniCtrl.removeValidators([Validators.required]);
      avatarCtrl.removeValidators([Validators.required]);
    }

    dniCtrl.updateValueAndValidity();
    avatarCtrl.updateValueAndValidity();
  }

  isType(t: UserType) {
    return this.form.get('type')?.value === t;
  }
}
