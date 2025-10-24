import { Injectable, Inject, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CustomCookieService {
  private isBrowser: boolean;
  
  constructor(@Optional() @Inject(DOCUMENT) private document: any) {
    // Verificar si estamos en el navegador o en el servidor
    try {
      this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    } catch (e) {
      // En caso de error, asumimos que estamos en el servidor
      this.isBrowser = false;
    }
  }

  get(name: string): string {
    if (!this.isBrowser) {
      // En servidor, devolver vacío o implementar lógica de cookies del servidor
      return '';
    }
    
    const cookies = this.document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return '';
  }

  set(name: string, value: string, expires?: number): void {
    if (!this.isBrowser) {
      // En servidor, no podemos establecer cookies directamente
      return;
    }
    
    let cookie = `${name}=${value}`;
    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }
    cookie += '; path=/';
    this.document.cookie = cookie;
  }

  delete(name: string): void {
    if (!this.isBrowser) {
      return;
    }
    this.set(name, '', -1);
  }
}
