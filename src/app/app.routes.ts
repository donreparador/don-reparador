import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Don Reparador | Reparaciones y servicios a domicilio',
    data: {
      description: 'Solicita reparaciones a domicilio: plomería, electricidad, pintura y más.',
      canonical: '/',
    },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(c => c.Register),
    title: 'Register | Don Reparador',
    data: { description: 'Register to get started.' },
  },

  // listado de servicios
  {
    path: 'servicios',
    loadComponent: () =>
      import('./pages/services/services').then(c => c.Services),
    title: 'Servicios | Don Reparador',
    data: { description: 'Explora todas las categorías y servicios disponibles.' },
  },

  // detalle con slug: /servicio/tal-cosa
  {
    path: 'servicio/:slug',
    loadComponent: () =>
      import('@app/pages/service-detail/service-detail')
        .then(c => c.ServiceDetail),
    title: 'Detalle de servicio | Don Reparador',
    data: { description: 'Descripción, precio y agenda de tu servicio.' },
  },

  { path: '**', redirectTo: '' },
];
