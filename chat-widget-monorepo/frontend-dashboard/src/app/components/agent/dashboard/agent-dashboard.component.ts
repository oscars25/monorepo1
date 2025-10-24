import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ChatSessionService } from '../../../services/chat-session.service';
import { MessageService } from '../../../services/message.service';
import { ChatSession } from '../../../services/chat-session.service';
import { Message } from '../../../services/message.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
// MatCommonModule no es necesario en versiones recientes de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    CommonModule,
    FormsModule,
    HeaderComponent
  ],
  providers: [],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss']
})
export class AgentDashboardComponent implements OnInit {
  @Input() user: any;
  sessions: ChatSession[] = [];
  selectedSession: ChatSession | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = true;
  sessionLoading = false;
  messageLoading = false;
  displayedColumns: string[] = ['id', 'websiteUrl', 'visitorName', 'visitorEmail', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private chatSessionService: ChatSessionService,
    private messageService: MessageService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.chatSessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        // Filtrar solo las sesiones asignadas a este agente
        this.sessions = sessions.filter(session => 
          session.assignedAgent && session.assignedAgent.id === this.user.id
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectSession(session: ChatSession): void {
    this.selectedSession = session;
    this.sessionLoading = true;

    this.chatSessionService.getSession(session.id).subscribe({
      next: (sessionData) => {
        this.selectedSession = sessionData;
        this.loadMessages();
      },
      error: () => {
        this.sessionLoading = false;
      }
    });
  }

  loadMessages(): void {
    if (!this.selectedSession) return;

    this.messageLoading = true;
    this.messageService.getMessagesBySessionId(this.selectedSession.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.messageLoading = false;
      },
      error: () => {
        this.messageLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedSession || !this.newMessage.trim()) return;

    this.messageService.createMessage({
      sessionId: this.selectedSession.id,
      content: this.newMessage,
      isFromAgent: true
    }).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadMessages();
      }
    });
  }

  closeSession(): void {
    if (!this.selectedSession) return;

    this.chatSessionService.closeSession(this.selectedSession.id).subscribe({
      next: () => {
        this.selectedSession = null;
        this.messages = [];
        this.loadSessions();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
