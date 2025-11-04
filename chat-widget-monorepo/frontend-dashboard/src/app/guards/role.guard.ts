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
    const expectedRole = route.data['expectedRole'] as string | undefined;
    const expectedRoles = (route.data['expectedRoles'] as string[] | undefined) || (expectedRole ? [expectedRole] : undefined);
    
    if (this.authService.isAuthenticated()) {
      if (!expectedRoles || expectedRoles.length === 0) {
        return true; // No role restriction specified
      }

      // Check if user has any of the allowed roles
      const user = this.authService.getCurrentUser();
      const role = user?.role;
      if (role && expectedRoles.includes(role)) {
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
