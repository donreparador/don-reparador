// src/app/core/pocketbase.client.ts
import PocketBase from 'pocketbase';

export const PB_URL = 'https://db.donreparador.com:8090'; // ej: https://db.camiwa.com:250
export const pb = new PocketBase(PB_URL);
