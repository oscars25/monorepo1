import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['expectedRole'] as string;
    
    if (this.authService.isAuthenticated()) {
      if (this.authService.hasRole(expectedRole)) {
        return true;
      } else {
        // Redirigir a página de no autorizado
        this.router.navigate(['/unauthorized']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
