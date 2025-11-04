import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DOCUMENT } from '@angular/common';
import { ApiConfigService } from '../../../services/api-config.service';

// Interfaces definidas localmente para el widget
interface ChatSession {
  id: string;
  sessionId: string;
  websiteUrl: string;
  visitorName: string;
  visitorEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  content: string;
  isFromAgent: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  widgetVisible = false;
  minimized = true;
  session: ChatSession | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = false;
  messageLoading = false;
  intervalId: any;

  // Datos del visitante
  websiteUrl = '';
  private isBrowser: boolean;
  private apiBase: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    @Optional() @Inject(DOCUMENT) private document: any
  ) {
    // Verificar si estamos en el navegador o en el servidor
    try {
      this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
      if (this.isBrowser) {
        this.websiteUrl = window.location.href;
      }
    } catch (e) {
      // En caso de error, asumimos que estamos en el servidor
      this.isBrowser = false;
    }
    
    // Obtener la URL base del API desde el servicio de configuración
    this.apiBase = this.apiConfig.getApiUrl();
  }

  ngOnInit(): void {
    // Configurar un intervalo para verificar nuevos mensajes
    // Solo en el navegador, en el servidor no podemos usar setInterval
    if (this.isBrowser) {
      // Configurar un intervalo para verificar nuevos mensajes
      this.intervalId = setInterval(() => {
        if (this.session && !this.messageLoading) {
          this.refreshMessages();
        }
      }, 3000);
      
      // Inicializar el widget
      this.initializeWidget();
    }
  }
  
  // Método para inicializar el widget
  initializeWidget(): void {
    console.log('Inicializando widget de chat...');
    
    // Verificar si hay una sesión guardada en localStorage
    const savedSessionId = localStorage.getItem('chat_session_id');
    if (savedSessionId) {
      console.log('Sesión guardada encontrada:', savedSessionId);
      this.loadSession(savedSessionId);
    } else {
      // Crear una sesión de emergencia inmediatamente
      this.createEmergencySession();
    }
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  createNewSession(): void {
    console.log('🔵 Creando nueva sesión de chat...');
    console.log('🔵 URL del API:', `${this.apiBase}/api/sessions`);
    console.log('🔵 Website URL:', this.websiteUrl);
    this.loading = true;
    
    // Crear una sesión sin autenticación para visitantes
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });
    
    const payload = {
      websiteUrl: this.websiteUrl,
      visitorName: 'Visitante',
      visitorEmail: ''
    };
    
    console.log('🔵 Payload:', payload);
    
  this.http.post<any>(`${this.apiBase}/api/sessions`, payload, { headers }).subscribe({
      next: (session) => {
        console.log('✅ Sesión creada exitosamente:', session);
        this.session = session;
        if (this.isBrowser) {
          localStorage.setItem('chat_session_id', session.sessionId || session.id);
          console.log('✅ SessionId guardado en localStorage:', session.sessionId || session.id);
        }
        this.loading = false;
        // Cargar los mensajes después de crear la sesión
        this.loadMessages();
      },
      error: (error) => {
        console.error('❌ Error al crear sesión de chat:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        this.loading = false;
        // Si hay un error, mostrar alerta
        this.createEmergencySession();
      }
    });
  }

  loadSession(sessionId: string): void {
    console.log('Cargando sesión existente:', sessionId);

    // Cargar sesión sin autenticación para visitantes
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });

  this.http.get<any>(`${this.apiBase}/api/sessions/${sessionId}`, { headers }).subscribe({
      next: (session) => {
        console.log('Sesión cargada exitosamente:', session);
        this.session = session;
        this.loading = false;
        // Cargar los mensajes después de cargar la sesión
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error al cargar sesión de chat:', error);
        this.loading = false;
        // Si no se puede cargar la sesión, crear una nueva
        this.createNewSession();
      }
    });
  }

  loadMessages(): void {
    if (!this.session) {
      console.warn('No hay sesión activa para cargar mensajes');
      return;
    }

    console.log(`Cargando mensajes para la sesión: ${this.session.sessionId || this.session.id}`);
    
    // Cargar mensajes sin autenticación
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });
    
  this.http.get<any[]>(`${this.apiBase}/api/messages/session/${this.session.sessionId || this.session.id}`, { headers }).subscribe({
      next: (messages) => {
        console.log(`Mensajes cargados: ${messages.length} mensajes`);
        // Verificar si hay nuevos mensajes
        const hasNewMessages = messages.length > this.messages.length;
        
        // Actualizar la lista de mensajes
        this.messages = messages;
        this.loading = false;
        
        // Solo desplazar hacia abajo si hay nuevos mensajes
        if (hasNewMessages) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
        this.loading = false;
      }
    });
  }
  
  // Método para refrescar mensajes sin afectar la experiencia del usuario
  refreshMessages(): void {
    if (!this.session) {
      console.warn('No hay sesión activa para refrescar mensajes');
      return;
    }
    
    console.log(`Refrescando mensajes para la sesión: ${this.session.sessionId || this.session.id}`);
    
    // Refrescar mensajes sin autenticación
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });
    
  this.http.get<any[]>(`${this.apiBase}/api/messages/session/${this.session.sessionId || this.session.id}`, { headers }).subscribe({
      next: (messages) => {
        console.log(`Mensajes refrescados: ${messages.length} mensajes`);
        // Actualizar la lista de mensajes
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error al refrescar mensajes:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.session) {
      console.log('No hay sesión activa, creando una nueva...');
      // Guardar el mensaje para enviarlo después de crear la sesión
      const messageToSave = this.newMessage;
      this.newMessage = '';
      
      this.createNewSession();
      
      // Esperar a que se cree la sesión y luego enviar el mensaje
      const checkSession = setInterval(() => {
        if (this.session) {
          clearInterval(checkSession);
          this.newMessage = messageToSave;
          this.sendMessage();
        }
      }, 500);
      return;
    }
    
    if (!this.newMessage.trim()) {
      console.warn('El mensaje está vacío');
      return;
    }

    // Ya no es necesario verificar el nombre del visitante

    console.log(`🟢 Enviando mensaje: "${this.newMessage}" a la sesión: ${this.session.sessionId || this.session.id}`);
    console.log('🟢 Session object:', this.session);
    
    // Mostrar indicador de carga
    this.messageLoading = true;
    
    // Guardar el mensaje temporalmente para mostrarlo inmediatamente
    const tempMessage = {
      id: Date.now(), // ID temporal
      content: this.newMessage,
      isFromAgent: false,
      createdAt: new Date().toISOString(),
      user: {
        id: 0,
        username: 'Visitante',
        fullName: 'Visitante'
      }
    };
    
    // Agregar el mensaje a la lista temporalmente
    this.messages = [...this.messages, tempMessage];
    
    // Limpiar el campo de entrada
    const messageContent = this.newMessage;
    this.newMessage = '';
    
    // Desplazar hacia abajo
    this.scrollToBottom();
    
    // Enviar el mensaje al servidor sin autenticación
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });
    
    const payload = {
      sessionId: this.session.sessionId || this.session.id,
      content: messageContent,
      isFromAgent: false,
      visitorName: 'Visitante'
    };
    
    console.log('🟢 Payload del mensaje:', payload);
    console.log('🟢 URL:', `${this.apiBase}/api/messages`);
    
  this.http.post<any>(`${this.apiBase}/api/messages`, payload, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Mensaje enviado exitosamente:', response);
        this.messageLoading = false;
        
        // Agregar el mensaje real a la lista inmediatamente (reemplazar el temporal)
        const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id);
        if (messageIndex !== -1) {
          this.messages[messageIndex] = response;
        } else {
          this.messages.push(response);
        }
        
        // Desplazar hacia abajo
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (error) => {
        console.error('❌ Error al enviar mensaje:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        this.messageLoading = false;
        
        // Eliminar el mensaje temporal si hay error
        const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id);
        if (messageIndex !== -1) {
          this.messages.splice(messageIndex, 1);
        }
        
        // Mostrar mensaje de error al usuario
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      }
    });
  }

  toggleWidget(): void {
    this.widgetVisible = !this.widgetVisible;

    // Si se está abriendo el widget, expandirlo automáticamente
    if (this.widgetVisible) {
      this.minimized = false;
      
      // Si no hay una sesión activa, crear una nueva
      if (!this.session) {
        // Verificar si hay una sesión guardada en localStorage
        if (this.isBrowser) {
          const savedSessionId = localStorage.getItem('chat_session_id');
          if (savedSessionId) {
            console.log('Cargando sesión guardada:', savedSessionId);
            this.loadSession(savedSessionId);
          } else {
            // Crear una sesión de emergencia inmediatamente para que el usuario pueda empezar a chatear
            // sin tener que esperar a que se conecte con el backend
            this.createEmergencySession();
            // También intentar crear una sesión normal en segundo plano
            this.createNewSession();
          }
        } else {
          this.createEmergencySession();
          this.createNewSession();
        }
      }
    }
  }

  toggleMinimize(): void {
    this.minimized = !this.minimized;
  }

  scrollToBottom(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const container = this.document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (e) {
      console.error('Error en scrollToBottom:', e);
    }
  }

  // Método de emergencia para crear una sesión si el backend no está disponible
  createEmergencySession(): void {
    console.error('⚠️ NO SE PUDO CONECTAR CON EL SERVIDOR - El chat no funcionará correctamente');
    console.error('⚠️ Por favor verifica que el backend esté corriendo en:', this.apiBase);
    
    // NO crear sesión de emergencia - esto solo causará más errores
    this.session = null;
    this.loading = false;
    
    // Mostrar mensaje de error al usuario
    alert('Error: No se pudo conectar con el servidor de chat. Por favor, recarga la página o contacta al administrador.');
  }


}
