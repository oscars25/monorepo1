import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ChatSessionService } from '../../../services/chat-session.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
// MatCommonModule no es necesario en versiones recientes de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { ChatSession } from '../../../services/chat-session.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule,
    CommonModule,
    FormsModule,
    HeaderComponent
  ],
  providers: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  @Input() user: any;
  sessions: ChatSession[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'websiteUrl', 'visitorName', 'visitorEmail', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private chatSessionService: ChatSessionService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.chatSessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  assignAgent(sessionId: string): void {
    // Aquí podrías abrir un modal para seleccionar el agente
    // Por ahora, usaremos un agente fijo
    const agentId = 1; // ID del agente
    this.chatSessionService.assignAgentToSession(sessionId, { agent: { id: agentId } }).subscribe({
      next: () => {
        this.loadSessions();
      }
    });
  }

  closeSession(sessionId: string): void {
    this.chatSessionService.closeSession(sessionId).subscribe({
      next: () => {
        this.loadSessions();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
