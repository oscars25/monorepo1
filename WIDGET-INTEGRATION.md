# 📱 Guía de Integración del Chat Widget

##  Cómo Insertar el Widget en Página Web demo

### Método 1: Dentro de la Aplicación Angular (Actual)

El widget ya está integrado en la aplicación Angular. Para verlo:

1. **Página de Demostración**: 
   - Navega a: `http://localhost/demo`
   - El widget aparecerá automáticamente en la esquina inferior derecha

2. **En cualquier componente Angular**:
   ```typescript
   import { ChatWidgetComponent } from './components/widget/chat-widget/chat-widget.component';
   
   @Component({
     selector: 'app-my-page',
     standalone: true,
     imports: [ChatWidgetComponent],
     template: `
       <div>
         <!-- Tu contenido aquí -->
         <h1>Mi Página</h1>
       </div>
       
       <!-- Widget de chat -->
       <app-chat-widget></app-chat-widget>
     `
   })
   export class MyPageComponent {}
   ```

---

### Método 2: Como Script Externo (Para Cualquier Sitio Web)

Para insertar el widget en cualquier página web (HTML, WordPress, PHP, etc.):

#### Paso 1: Crear el archivo del widget como script independiente

Primero necesitas compilar el widget de Angular como un script standalone. Por ahora, aquí está el código HTML que puedes usar:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Sitio con Chat Widget</title>
    
    <!-- Estilos del widget -->
    <style>
        /* Botón flotante del chat */
        .chat-widget-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            z-index: 1000;
        }
        
        .chat-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        /* Contenedor del widget */
        .chat-widget-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            max-height: 600px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            z-index: 999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .chat-widget-container.active {
            display: flex;
        }
        
        /* Header del chat */
        .chat-widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px 15px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-widget-title {
            font-weight: bold;
            font-size: 16px;
        }
        
        .chat-widget-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Mensajes */
        .chat-widget-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            max-height: 400px;
            background: #f8f9fa;
        }
        
        .chat-message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 10px;
            max-width: 80%;
            word-wrap: break-word;
        }
        
        .chat-message.visitor {
            background: #e3f2fd;
            margin-left: auto;
            text-align: right;
        }
        
        .chat-message.agent {
            background: #f1f3f5;
        }
        
        /* Input del chat */
        .chat-widget-input {
            padding: 15px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        
        .chat-widget-input input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 25px;
            outline: none;
            font-size: 14px;
        }
        
        .chat-widget-input input:focus {
            border-color: #667eea;
        }
        
        .chat-widget-send {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        
        .chat-widget-send:hover {
            transform: scale(1.05);
        }
        
        .chat-widget-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
            .chat-widget-container {
                width: calc(100% - 40px);
                max-width: 380px;
            }
        }
    </style>
</head>
<body>
    <!-- Tu contenido de la página aquí -->
    <h1>Bienvenido a Mi Sitio Web</h1>
    <p>Este es un ejemplo de cómo insertar el chat widget en cualquier página.</p>
    
    <!-- Botón flotante del chat -->
    <button class="chat-widget-button" onclick="toggleChat()" id="chatButton">
        💬
    </button>
    
    <!-- Widget de chat -->
    <div class="chat-widget-container" id="chatWidget">
        <div class="chat-widget-header">
            <div class="chat-widget-title">💬 Soporte en Línea</div>
            <button class="chat-widget-close" onclick="toggleChat()">×</button>
        </div>
        
        <div class="chat-widget-messages" id="chatMessages">
            <div class="chat-message agent">
                ¡Hola! 👋 ¿En qué puedo ayudarte hoy?
            </div>
        </div>
        
        <div class="chat-widget-input">
            <input 
                type="text" 
                id="messageInput" 
                placeholder="Escribe tu mensaje..." 
                onkeypress="handleKeyPress(event)"
            >
            <button class="chat-widget-send" onclick="sendMessage()" id="sendButton">
                ➤
            </button>
        </div>
    </div>
    
    <!-- Script del widget -->
    <script>
        // Configuración
        const API_URL = 'https://monorepo1-caqf.onrender.com';  // Cambia esto en producción
        let chatSession = null;
        let messages = [];
        
        // Toggle del chat
        function toggleChat() {
            const widget = document.getElementById('chatWidget');
            widget.classList.toggle('active');
            
            // Crear sesión si no existe
            if (!chatSession && widget.classList.contains('active')) {
                createSession();
            }
        }
        
        // Crear sesión
        async function createSession() {
            try {
                const response = await fetch(`${API_URL}/api/sessions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        websiteUrl: window.location.href,
                        visitorName: 'Visitante',
                        visitorEmail: ''
                    })
                });
                
                chatSession = await response.json();
                console.log('Sesión creada:', chatSession);
                localStorage.setItem('chat_session_id', chatSession.sessionId || chatSession.id);
                
                // Cargar mensajes
                loadMessages();
                
                // Actualizar mensajes cada 3 segundos
                setInterval(loadMessages, 3000);
            } catch (error) {
                console.error('Error al crear sesión:', error);
            }
        }
        
        // Cargar mensajes
        async function loadMessages() {
            if (!chatSession) return;
            
            try {
                const sessionId = chatSession.sessionId || chatSession.id;
                const response = await fetch(`${API_URL}/api/messages/session/${sessionId}`);
                const newMessages = await response.json();
                
                // Solo actualizar si hay nuevos mensajes
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    messages = newMessages;
                    renderMessages();
                }
            } catch (error) {
                console.error('Error al cargar mensajes:', error);
            }
        }
        
        // Renderizar mensajes
        function renderMessages() {
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = `chat-message ${msg.isFromAgent ? 'agent' : 'visitor'}`;
                div.textContent = msg.content;
                container.appendChild(div);
            });
            
            // Scroll al final
            container.scrollTop = container.scrollHeight;
        }
        
        // Enviar mensaje
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message || !chatSession) return;
            
            const sendButton = document.getElementById('sendButton');
            sendButton.disabled = true;
            
            try {
                const sessionId = chatSession.sessionId || chatSession.id;
                await fetch(`${API_URL}/api/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        content: message,
                        isFromAgent: false,
                        visitorName: 'Visitante'
                    })
                });
                
                input.value = '';
                loadMessages();
            } catch (error) {
                console.error('Error al enviar mensaje:', error);
            } finally {
                sendButton.disabled = false;
            }
        }
        
        // Manejar Enter para enviar
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        // Cargar sesión guardada al cargar la página
        window.addEventListener('load', () => {
            const savedSessionId = localStorage.getItem('chat_session_id');
            if (savedSessionId) {
                // Intentar cargar la sesión guardada
                fetch(`${API_URL}/api/sessions/${savedSessionId}`)
                    .then(response => response.json())
                    .then(session => {
                        chatSession = session;
                        loadMessages();
                        setInterval(loadMessages, 3000);
                    })
                    .catch(() => {
                        // Si falla, eliminar la sesión guardada
                        localStorage.removeItem('chat_session_id');
                    });
            }
        });
    </script>
</body>
</html>
```

---

## Cómo Usar

### Opción 1: Página de Demostración Incluida
- Ve a: `http://localhost/demo`
- El widget ya está integrado y funcionando

### Opción 2: Usar el Código HTML Standalone
1. Copia el código HTML completo de arriba
2. Guárdalo como `mi-pagina.html`
3. Cambia `API_URL` si tu backend no está en `localhost:8080`
4. Abre el archivo en tu navegador

### Opción 3: Insertar en Sitio Existente
1. Copia solo la sección de estilos (`<style>...</style>`)
2. Copia el HTML del widget (desde `<!-- Botón flotante...` hasta `</div>`)
3. Copia el JavaScript (la sección `<script>...</script>`)
4. Pégalos en tu página antes del cierre de `</body>`

---

##  Configuración

### Cambiar la URL del Backend

```javascript
const API_URL = 'https://tu-dominio.com';  // Tu backend en producción
```

### Personalizar Colores

Busca estos valores en los estilos y cámbialos:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Cambia `#667eea` y `#764ba2` por tus colores de marca.

---

##  Verificar que Funciona

1. Abre la consola del navegador (F12)
2. Haz clic en el botón del chat
3. Deberá ver: `"Sesión creada: {id: '...', ...}"`
4. Escribe un mensaje y envíalo
5. El mensaje debería aparecer en la ventana del chat
