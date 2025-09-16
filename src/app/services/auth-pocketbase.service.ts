// src/app/services/auth-pocketbase.service.ts
import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';

export type UserType = 'cliente' | 'proveedor';

export interface RegisterMinimalPayload {
  username: string;  // lo usas como "nombre" visible
  email: string;
  phone: string;
  type: UserType;    // cliente | proveedor
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

  async registerMinimal(payload: RegisterMinimalPayload): Promise<RecordModel> {
    const password = this.randomPassword();

    const displayName = payload.username?.trim();   // <- name visible
    const roleValue   = payload.type;               // <- mismo valor para role y type

    const record = await this.pb.collection('users').create({
      // Auth/required
      email: payload.email,
      emailVisibility: true,
      password,
      passwordConfirm: password,

      // Tu schema
      username: payload.username,   // si usas username como slug/alias
      name: displayName,            // ✅ llena "name"
      phone: payload.phone,
      type: roleValue,              // ✅ si existe campo "type"
      role: roleValue,              // ✅ si existe campo "role" (o "rolw" si así se llama)
      // avatar: ... (si luego lo subes)
    });

    await this.pb.collection('users').authWithPassword(payload.email, password);

    try {
      const userId = this.pb.authStore.model?.id;
      if (userId) {
        if (payload.type === 'proveedor') {
          await this.pb.collection('proveedores').create({ user: userId, estado: 'incompleto' });
        } else {
          await this.pb.collection('clientes').create({ user: userId });
        }
      }
    } catch (e) {
      console.warn('No se pudo crear el perfil por tipo:', e);
    }

    return record;
  }
}
