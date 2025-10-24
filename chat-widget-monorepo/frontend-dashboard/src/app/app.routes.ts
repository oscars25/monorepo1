import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoginComponent } from './components/auth/login/login.component';
import { AdminDashboardComponent } from './components/admin/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { AgentDashboardComponent } from './components/agent/dashboard/agent-dashboard.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CustomCookieService } from './services/cookie.service';
import { provideHttpClient } from '@angular/common/http';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin/dashboard',
    component: UserManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' },
    resolve: {
      user: () => {
        const token = inject(CustomCookieService).get('auth_token');
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            return {
              id: decodedToken.id,
              username: decodedToken.username,
              email: decodedToken.email,
              role: decodedToken.role,
              fullName: decodedToken.fullName
            };
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
          }
        }
        return null;
      }
    }
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' },
    resolve: {
      user: () => {
        const token = inject(CustomCookieService).get('auth_token');
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            return {
              id: decodedToken.id,
              username: decodedToken.username,
              email: decodedToken.email,
              role: decodedToken.role,
              fullName: decodedToken.fullName
            };
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
          }
        }
        return null;
      }
    }
  },
  {
    path: 'agent/dashboard',
    component: UserManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'AGENT' },
    resolve: {
      user: () => {
        const token = inject(CustomCookieService).get('auth_token');
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            return {
              id: decodedToken.id,
              username: decodedToken.username,
              email: decodedToken.email,
              role: decodedToken.role,
              fullName: decodedToken.fullName
            };
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
          }
        }
        return null;
      }
    }
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
