import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly API_BASE_URL: string;

  constructor() {
    // Permite configurar la URL base del API desde variables de entorno o usar localhost por defecto
    // También soporta configuración desde window para scripts embebidos
    if (typeof window !== 'undefined') {
      // Verificar si estamos en producción (mismo origen) o desarrollo
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      console.log('[ApiConfigService] Hostname:', window.location.hostname);
      console.log('[ApiConfigService] Is Production:', isProduction);
      
      // Si existe una variable global CHAT_API_URL, usarla
      if ((window as any).CHAT_API_URL) {
        this.API_BASE_URL = (window as any).CHAT_API_URL;
        console.log('[ApiConfigService] Usando CHAT_API_URL:', this.API_BASE_URL);
      } 
      // En producción (Docker), usar path relativo que será proxeado por nginx
      else if (isProduction) {
        this.API_BASE_URL = '';  // Usará paths relativos como /api/...
        console.log('[ApiConfigService] Modo producción - usando paths relativos');
      } 
      // En desarrollo local, usar localhost directo
      else {
        // IMPORTANTE: Cuando accedemos vía nginx en localhost, también debemos usar paths relativos
        // porque nginx hace el proxy hacia el backend
        this.API_BASE_URL = '';
        console.log('[ApiConfigService] Modo localhost - usando paths relativos (proxeado por nginx)');
      }
    } else {
      this.API_BASE_URL = 'http://localhost:8080';
      console.log('[ApiConfigService] Modo servidor SSR');
    }
  }

  getApiUrl(): string {
    return this.API_BASE_URL;
  }

  getFullUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.API_BASE_URL}${cleanEndpoint}`;
  }
}
