import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { MatBadgeModule } from '@angular/material/badge';
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
    MatBadgeModule,
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
export class AgentDashboardComponent implements OnInit, OnDestroy {
  @Input() user: any;
  sessions: ChatSession[] = [];
  selectedSession: ChatSession | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = true;
  sessionLoading = false;
  messageLoading = false;
  displayedColumns: string[] = ['id', 'websiteUrl', 'visitorName', 'visitorEmail', 'status', 'actions'];
  private refreshInterval: any;

  constructor(
    private authService: AuthService,
    private chatSessionService: ChatSessionService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadSessions();
    
    // Auto-refresh de mensajes cada 3 segundos si hay una sesión seleccionada
    this.refreshInterval = setInterval(() => {
      if (this.selectedSession && !this.messageLoading) {
        this.refreshMessages();
      }
    }, 3000);

    // Si llegamos con un sessionId por query param, seleccionar esa sesión
    this.route.queryParams.subscribe(params => {
      const qp = params['session'];
      if (qp) {
        this.chatSessionService.getSession(qp).subscribe({
          next: (sessionData) => {
            this.selectedSession = sessionData as any;
            // Limpiar el badge al abrir el chat desde query param
            const sessionId = (sessionData as any).sessionId || (sessionData as any).id;
            this.sessionMessageCounts.set(sessionId, 0);
            this.loadMessages();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadSessions(): void {
    this.chatSessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        // Mostrar TODAS las sesiones activas (no solo las asignadas)
        // para que los agentes puedan responder cualquier mensaje
        this.sessions = sessions;
        this.loading = false;
        console.log('✅ Sesiones cargadas en dashboard:', this.sessions.length);
        
        // Cargar el conteo de mensajes para mostrar badges
        this.loadMessageCounts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectSession(session: ChatSession): void {
    this.selectedSession = session;
    this.sessionLoading = true;

    // Limpiar el badge al abrir el chat (el agente ya está viendo los mensajes)
    const sessionId = session.sessionId || session.id;
    this.sessionMessageCounts.set(sessionId, 0);

    const id = session.sessionId || (session as any).id;
    this.chatSessionService.getSession(id).subscribe({
      next: (sessionData) => {
        this.selectedSession = sessionData;
        this.loadMessages();
      },
      error: () => {
        // Si falla cargar por API, intentar con el objeto existente
        this.sessionLoading = false;
        this.loadMessages();
      }
    });
  }

  loadMessages(): void {
    if (!this.selectedSession) return;

    this.messageLoading = true;
    this.messageService.getMessagesBySessionId(this.selectedSession.sessionId || this.selectedSession.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.messageLoading = false;
          console.log('✅ Mensajes cargados:', this.messages.length);
      },
      error: () => {
        this.messageLoading = false;
      }
    });
  }

    refreshMessages(): void {
      if (!this.selectedSession) return;

      // Refrescar sin mostrar spinner (para no molestar al usuario)
      this.messageService.getMessagesBySessionId(this.selectedSession.sessionId || this.selectedSession.id).subscribe({
        next: (messages) => {
          this.messages = messages;
          console.log('🔄 Mensajes refrescados:', this.messages.length);
        },
        error: (error) => {
          console.error('Error al refrescar mensajes:', error);
        }
      });
    }

  sendMessage(): void {
    if (!this.selectedSession || !this.newMessage.trim()) return;

      console.log('📤 Enviando mensaje desde dashboard...');
    this.messageService.createMessage({
      sessionId: this.selectedSession.sessionId || this.selectedSession.id,
      content: this.newMessage,
      isFromAgent: true
    }).subscribe({
      next: () => {
          console.log('✅ Mensaje enviado exitosamente');
        this.newMessage = '';
        this.loadMessages();
      }
    });
  }

  editMessage(message: Message): void {
    const updated = window.prompt('Editar mensaje', message.content);
    if (updated !== null && updated.trim() !== '' && updated !== message.content) {
      this.messageService.updateMessage(message.id, { content: updated }).subscribe({
        next: (res) => {
          // Actualizar localmente para evitar otra carga completa
          const idx = this.messages.findIndex(m => m.id === message.id);
          if (idx > -1) {
            this.messages[idx] = { ...this.messages[idx], content: res.content } as any;
          }
        }
      });
    }
  }

  deleteMessage(message: Message): void {
    if (!confirm('¿Eliminar este mensaje?')) return;
    this.messageService.deleteMessage(message.id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== message.id);
      }
    });
  }

  closeSession(): void {
    if (!this.selectedSession) return;

    const id = this.selectedSession.sessionId || (this.selectedSession as any).id;
    this.chatSessionService.closeSession(id).subscribe({
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

  // Mapa para almacenar el conteo de mensajes por sesión
  private sessionMessageCounts: Map<string, number> = new Map();

  // Verifica si una sesión tiene mensajes nuevos
  hasNewMessages(session: ChatSession): boolean {
    const sessionId = session.sessionId || session.id;
    const count = this.sessionMessageCounts.get(sessionId) || 0;
    return count > 0;
  }

  // Obtiene el badge a mostrar (número o vacío)
  getSessionBadge(session: ChatSession): string {
    const sessionId = session.sessionId || session.id;
    const count = this.sessionMessageCounts.get(sessionId) || 0;
    return count > 0 ? (count > 9 ? '9+' : count.toString()) : '';
  }

  // Carga el conteo de mensajes para todas las sesiones
  private loadMessageCounts(): void {
    this.sessions.forEach(session => {
      const sessionId = session.sessionId || session.id;
      this.messageService.getMessagesBySessionId(sessionId).subscribe({
        next: (messages) => {
          this.sessionMessageCounts.set(sessionId, messages.length);
        }
      });
    });
  }
}
