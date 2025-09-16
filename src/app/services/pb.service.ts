import PocketBase, { RecordModel } from 'pocketbase';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PbService {
  readonly pb = new PocketBase(environment.pbUrl);
  /** URL absoluta para un archivo de un record (iconos, fotos, etc.) */
  fileUrl(record: RecordModel, filename?: string) {
    if (!filename) return '';
    return this.pb.files.getUrl(record, filename);
  }
}
