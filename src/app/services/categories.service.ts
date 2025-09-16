// src/app/services/categories.service.ts
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { pb } from '@app/core/pocketbase.client';
import { Category } from '@app/interfaces/category.interface';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private collection = 'categories'; // cambia al nombre real (ej: camiwaCategories)

// categories.service.ts
listTop(limit = 8) {
    return from(
      pb.collection('categories').getList(1, limit, {
        sort: 'order,name',
        // importante:
        expand: 'image',                 // <- para tener el/los records de images
        fields: 'id,collectionId,collectionName,name,slug,order,active,image,expand.image'
      })
    ).pipe(map((res: any) => res.items as Category[]));
  }
  
// categories.service.ts
buildIconUrl(cat: any): string {
    // cat.image es un ID (relación). El archivo está en expand.image.image (sí, dos veces "image").
    const rel = cat?.expand?.image;
  
    // si la relación admite múltiples, toma el primero
    const imgRec = Array.isArray(rel) ? rel[0] : rel;
  
    // nombre del archivo (file field del record en la colección 'images')
    const fileName = imgRec?.image; // ajusta si tu campo file se llama distinto
  
    if (!imgRec || !fileName) return 'assets/img/placeholder-cat.png';
  
    // ¡OJO! getUrl recibe el record que posee el file field
    return pb.files.getUrl(imgRec, fileName, { thumb: '96x96' });
  }
  
//   listTop(limit = 8): Observable<Category[]> {
//     return from(
//       pb.collection(this.collection).getList(1, limit, {
//         sort: 'name', // o el campo que prefieras
//         fields: 'id,collectionId,collectionName,name,slug,icon,image'
//       })
//     ).pipe(
//       map((res: any) => res.items as Category[])
//     );
//   }

  // helper: si tu campo de imagen se llama distinto, detectamos ambos
//   buildIconUrl(cat: Category): string {
//     const filesField = (cat as any).icon ?? (cat as any).image;
//     const file = Array.isArray(filesField) ? filesField[0] : filesField;
//     if (!file) return 'assets/img/placeholder-cat.png';
//     return pb.files.getUrl(cat as any, file); // admite { thumb:'100x100' } si quieres
//   }

  // Realtime (opcional): notificar cambios
  async subscribe(onChange: () => void) {
    await pb.collection(this.collection).subscribe('*', () => onChange());
  }
  async unsubscribe() {
    await pb.collection(this.collection).unsubscribe('*');
  }
}
