// src/app/services/auth-pocketbase.service.ts
import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';

export type UserType = 'cliente' | 'proveedor';

export interface RegisterMinimalPayload {
  username: string;   // nombre visible
  email: string;
  phone: string;
  type: UserType;     // 'cliente' | 'proveedor'
}

@Injectable({ providedIn: 'root' })
export class AuthPocketbaseService {
  public pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.com:8090');
  }

  private randomPassword(len = 18): string {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=';
    return Array.from(bytes, b => chars[b % chars.length]).join('');
  }

// src/app/services/auth-pocketbase.service.ts
async registerMinimal(payload: RegisterMinimalPayload): Promise<RecordModel> {
    const password = this.randomPassword();
  
    // Mapear UI → schema PB
    const rolwMap: Record<UserType, 'client' | 'provider'> = {
      cliente: 'client',
      proveedor: 'provider',
    };
    const rolwValue = rolwMap[payload.type];
  
    // ✅ status booleano según el tipo
    const isActive = payload.type === 'cliente';
  
    const record = await this.pb.collection('users').create({
      // auth
      email: payload.email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
  
      // datos
      username: payload.username,
      name: payload.username,
      phone: payload.phone,
  
      // roles/categorización
      type: payload.type,   // 'cliente' | 'proveedor' (tu etiquetado)
      rolw: rolwValue,      // 'client' | 'provider'
      status: isActive,     // 👈 cliente=true, proveedor=false
    });
  
    // Autologin solo si es cliente (activo)
    if (isActive) {
      await this.pb.collection('users').authWithPassword(payload.email, password);
    }
  
    // (Opcional) crear perfil
    try {
      const userId = this.pb.authStore.model?.id ?? record.id;
      if (userId) {
        if (payload.type === 'proveedor') {
          await this.pb.collection('proveedores').create({ user: userId, estado: 'incompleto' });
        } else {
          await this.pb.collection('clientes').create({ user: userId });
        }
      }
    } catch (e) {
      console.warn('Perfil post-registro no creado:', e);
    }
  
    return record;
  }
  
}
