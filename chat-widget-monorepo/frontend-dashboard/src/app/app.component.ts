import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthService } from './services/auth.service';
import { CustomCookieService } from './services/cookie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, UnauthorizedComponent, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend-dashboard';
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Cargar el usuario al iniciar
    this.loadUser();
    
    // Escuchar cambios en el estado de autenticación
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  private loadUser(): void {
    // Solo cargar el usuario si estamos en el navegador
    if (typeof window !== 'undefined') {
      this.user = this.authService.getCurrentUser();
    }
  }
}
