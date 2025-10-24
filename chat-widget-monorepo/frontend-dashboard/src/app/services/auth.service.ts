import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { CustomCookieService } from './cookie.service';
import { DOCUMENT } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: User | null = null;
  private currentUserSubject$ = new BehaviorSubject<User | null>(null);
  public user$ = this.currentUserSubject$.asObservable();

  private isBrowser: boolean;
  
  constructor(
    private http: HttpClient,
    private cookieService: CustomCookieService,
    @Optional() @Inject(DOCUMENT) private document: any
  ) {
    // Verificar si estamos en el navegador o en el servidor
    try {
      this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
      
      // Intentar cargar el usuario desde las cookies o el token al iniciar
      // Solo en el navegador, en el servidor no podemos acceder a las cookies
      if (this.isBrowser) {
        setTimeout(() => {
          this.loadUserFromToken();
        }, 0);
      }
    } catch (e) {
      // En caso de error, asumimos que estamos en el servidor
      this.isBrowser = false;
    }
  }

  private loadUserFromToken(): void {
    // En Angular, usamos el cookieService para manejar cookies
    // Solo en el navegador, en el servidor no podemos acceder a las cookies
    if (!this.isBrowser) {
      return;
    }
    
    try {
    
    const token = this.cookieService.get('auth_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        // Verificar si el token tiene todos los campos necesarios
        if (decodedToken.id && decodedToken.username && decodedToken.role) {
          this.updateUser({
            id: decodedToken.id,
            username: decodedToken.username,
            email: decodedToken.email || '',
            role: decodedToken.role,
            fullName: decodedToken.fullName || decodedToken.username
          });
        } else {
          console.error('Token inválido:缺少必要字段');
          this.updateUser(null);
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.updateUser(null);
      }
    }
    } catch (e) {
      console.error('Error en loadUserFromToken:', e);
      this.updateUser(null);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        try {
          if (this.isBrowser) {
            this.cookieService.set('auth_token', response.token, 1);
          }
          this.updateUser(response.user);
        } catch (e) {
          console.error('Error en login tap:', e);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        try {
          if (this.isBrowser) {
            this.cookieService.set('auth_token', response.token, 1);
          }
          this.updateUser(response.user);
        } catch (e) {
          console.error('Error en register tap:', e);
        }
      })
    );
  }

  logout(): void {
    try {
      if (this.isBrowser) {
        this.cookieService.delete('auth_token');
      }
      this.updateUser(null);
      console.log('Sesión cerrada correctamente');
    } catch (e) {
      console.error('Error en logout:', e);
      this.updateUser(null);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject;
  }

  // Método para actualizar el usuario y notificar los cambios
  private updateUser(user: User | null): void {
    this.currentUserSubject = user;
    this.currentUserSubject$.next(user);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    
    const hasUser = this.currentUserSubject !== null;
    
    // Si ya tenemos un usuario, no necesitamos verificar el token
    if (hasUser) {
      return true;
    }
    
    // Si no tenemos un usuario, intentar cargarlo desde el token
    const token = this.getToken();
    if (token) {
      try {
        this.loadUserFromToken();
        return this.currentUserSubject !== null;
      } catch (e) {
        console.error('Error al cargar usuario desde token:', e);
        return false;
      }
    }
    
    return false;
  }

  hasRole(role: string): boolean {
    if (!this.isBrowser || !role) {
      return false;
    }
    
    const user = this.currentUserSubject;
    if (!user) {
      // Si no hay usuario, intentar cargarlo desde el token
      if (this.getToken()) {
        this.loadUserFromToken();
        // Después de cargar, obtener el usuario actualizado
        const updatedUser = this.currentUserSubject;
        if (updatedUser) {
          return updatedUser.role === role;
        }
      }
      return false;
    }
    
    return user.role === role;
  }

  getToken(): string | null {
    try {
      if (!this.isBrowser) {
        return null;
      }
      
      const token = this.cookieService.get('auth_token');
      
      // Si el token está vacío, devolver null
      if (!token || token.trim() === '') {
        return null;
      }
      
      return token;
    } catch (e) {
      console.error('Error en getToken:', e);
      return null;
    }
  }
}
