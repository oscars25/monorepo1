package com.chatwidget.controller;

import com.chatwidget.entity.Message;
import com.chatwidget.entity.User;
import com.chatwidget.security.JwtService;
import com.chatwidget.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;
    private final JwtService jwtService;

    public MessageController(MessageService messageService, JwtService jwtService) {
        this.messageService = messageService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<Message> createMessage(
            @RequestBody CreateMessageRequest request,
            Authentication authentication) {

        // Para visitantes, creamos un usuario temporal sin persistir en la base de datos
        User visitorUser = new User();
        visitorUser.setId(0L); // ID temporal
        visitorUser.setUsername(request.getVisitorName() != null ? request.getVisitorName() : "Visitante");
        visitorUser.setFullName(request.getVisitorName() != null ? request.getVisitorName() : "Visitante");
        visitorUser.setEmail("visitor@example.com"); // Email genérico para visitantes
        visitorUser.setPassword(""); // Sin contraseña para visitantes
        visitorUser.setEnabled(true);

        Message message = messageService.createMessageForVisitor(
                request.getSessionId(),
                visitorUser,
                request.getContent(),
                request.getIsFromAgent(),
                request.getVisitorName() != null ? request.getVisitorName() : "Visitante"
        );

        return ResponseEntity.ok(message);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Map<String, Object>>> getMessagesBySession(
            @PathVariable String sessionId,
            Authentication authentication) {

        // No requerimos autenticación para obtener mensajes de una sesión

        // Obtener todos los mensajes de la sesión
        List<Map<String, Object>> messages = messageService.getMessagesBySessionId(sessionId)
                .stream()
                .map(message -> {
                    // Para mensajes de visitantes, usar el nombre del visitante si está disponible
                    String displayName = message.getVisitorName() != null ? 
                            message.getVisitorName() : 
                            message.getUser().getFullName();

                    return Map.of(
                            "id", message.getId(),
                            "content", message.getContent(),
                            "isFromAgent", message.isFromAgent(),
                            "createdAt", message.getCreatedAt(),
                            "user", Map.of(
                                    "id", message.getUser().getId(),
                                    "username", message.getUser().getUsername(),
                                    "fullName", displayName
                            )
                    );
                })
                .toList();

        return ResponseEntity.ok(messages);
    }

    @GetMapping("/session/{sessionId}/agent")
    public ResponseEntity<List<Map<String, Object>>> getAgentMessages(
            @PathVariable String sessionId,
            Authentication authentication) {

        String username = authentication.getName();

        // Obtener solo los mensajes del agente
        List<Map<String, Object>> messages = messageService.getAgentMessagesBySessionId(sessionId)
                .stream()
                .map(message -> Map.of(
                        "id", message.getId(),
                        "content", message.getContent(),
                        "isFromAgent", message.isFromAgent(),
                        "createdAt", message.getCreatedAt(),
                        "user", Map.of(
                                "id", message.getUser().getId(),
                                "username", message.getUser().getUsername(),
                                "fullName", message.getUser().getFullName()
                        )
                ))
                .toList();

        return ResponseEntity.ok(messages);
    }

    @GetMapping("/session/{sessionId}/visitor")
    public ResponseEntity<List<Map<String, Object>>> getVisitorMessages(
            @PathVariable String sessionId,
            Authentication authentication) {

        String username = authentication.getName();

        // Obtener solo los mensajes del visitante
        List<Map<String, Object>> messages = messageService.getVisitorMessagesBySessionId(sessionId)
                .stream()
                .map(message -> Map.of(
                        "id", message.getId(),
                        "content", message.getContent(),
                        "isFromAgent", message.isFromAgent(),
                        "createdAt", message.getCreatedAt(),
                        "user", Map.of(
                                "id", message.getUser().getId(),
                                "username", message.getUser().getUsername(),
                                "fullName", message.getUser().getFullName()
                        )
                ))
                .toList();

        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<Message> updateMessage(
            @PathVariable Long messageId,
            @RequestBody UpdateMessageRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        // En una implementación real, verificaríamos si el usuario tiene permiso para editar el mensaje

        Message message = messageService.updateMessage(messageId, request.getContent());
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication) {

        String username = authentication.getName();

        // En una implementación real, verificaríamos si el usuario tiene permiso para eliminar el mensaje

        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

    public static class CreateMessageRequest {
        private String sessionId;
        private String content;
        private boolean isFromAgent;
        private String visitorName;

        // Getters y setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public boolean getIsFromAgent() { return isFromAgent; }
        public void setIsFromAgent(boolean isFromAgent) { this.isFromAgent = isFromAgent; }

        public String getVisitorName() { return visitorName; }
        public void setVisitorName(String visitorName) { this.visitorName = visitorName; }
    }

    public static class UpdateMessageRequest {
        private String content;

        // Getters y setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
