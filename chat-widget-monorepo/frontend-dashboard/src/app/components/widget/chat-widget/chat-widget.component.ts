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

  constructor(
    private http: HttpClient,
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
    console.log('Creando nueva sesión de chat...');
    this.loading = true;
    
    // Crear una sesión sin autenticación para visitantes
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // No incluir token de autenticación para visitantes
    });
    
    this.http.post<any>('http://localhost:8080/api/sessions', {
      websiteUrl: this.websiteUrl,
      visitorName: 'Visitante',
      visitorEmail: ''
    }, { headers }).subscribe({
      next: (session) => {
        console.log('Sesión creada exitosamente:', session);
        this.session = session;
        if (this.isBrowser) {
          localStorage.setItem('chat_session_id', session.sessionId || session.id);
        }
        this.loading = false;
        // Cargar los mensajes después de crear la sesión
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error al crear sesión de chat:', error);
        this.loading = false;
        // Si hay un error, intentamos crear una sesión de emergencia
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

    this.http.get<any>(`http://localhost:8080/api/sessions/${sessionId}`, { headers }).subscribe({
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
    
    this.http.get<any[]>(`http://localhost:8080/api/messages/session/${this.session.sessionId || this.session.id}`, { headers }).subscribe({
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
    
    this.http.get<any[]>(`http://localhost:8080/api/messages/session/${this.session.sessionId || this.session.id}`, { headers }).subscribe({
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

    console.log(`Enviando mensaje: "${this.newMessage}" a la sesión: ${this.session.sessionId || this.session.id}`);
    
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
    
    this.http.post<any>('http://localhost:8080/api/messages', {
      sessionId: this.session.sessionId || this.session.id,
      content: messageContent,
      isFromAgent: false,
      visitorName: 'Visitante'
    }, { headers }).subscribe({
      next: (response) => {
        console.log('Mensaje enviado exitosamente:', response);
        this.messageLoading = false;
        // Recargar mensajes para obtener el estado actualizado
        setTimeout(() => this.loadMessages(), 500);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.messageLoading = false;
        // Mostrar mensaje de error
        // Aquí podrías agregar una notificación de error
        
        // Si hay un error al enviar el mensaje, lo mostramos como enviado de todos modos
        // para que el usuario no piense que no se ha enviado
        console.log('Mensaje mostrado localmente a pesar del error');
      }
    });
  }

  toggleWidget(): void {
    this.widgetVisible = !this.widgetVisible;

    // Si se está abriendo el widget y no hay una sesión activa, crear una nueva
    if (this.widgetVisible && !this.session) {
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
    console.log('Creando sesión de emergencia...');
    const emergencySession = {
      id: 'emergency-' + Date.now(),
      sessionId: 'emergency-' + Date.now(),
      websiteUrl: this.websiteUrl,
      visitorName: 'Visitante',
      visitorEmail: '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.session = emergencySession;
    if (this.isBrowser) {
      localStorage.setItem('chat_session_id', emergencySession.sessionId);
    }
    this.loading = false;
    console.log('Sesión de emergencia creada:', emergencySession);
    
    // Forzar la detección de cambios para actualizar la vista
    setTimeout(() => {
      console.log('Sesión activa después de crear sesión de emergencia:', this.session);
    }, 100);
  }


}
