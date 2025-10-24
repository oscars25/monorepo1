import { Component, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CustomCookieService } from '../../services/cookie.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() logout = new EventEmitter<void>();
  @Input() user: any;

  constructor(
    public authService: AuthService,
    private cookieService: CustomCookieService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  onLogout(): void {
    this.authService.logout();

    // Redirigir a la página de login después del cierre de sesión
    this.router.navigate(['/login']).then(() => {
      this.logout.emit();
    });
  }

  goToDashboard(): void {
    // Redirigir al panel de administración según el rol del usuario
    if (this.user?.role === 'ADMIN') {
      this.router.navigate(['/admin/users']);
    } else if (this.user?.role === 'AGENT') {
      this.router.navigate(['/agent/dashboard']);
    }
  }
}