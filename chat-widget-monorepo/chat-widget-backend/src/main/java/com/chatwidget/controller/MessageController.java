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

        String username = authentication.getName();
        // En una implementación real, obtendríamos el usuario completo desde la base de datos
        User user = new User();
        user.setUsername(username);

        Message message = messageService.createMessage(
                request.getSessionId(),
                user,
                request.getContent(),
                request.getIsFromAgent()
        );

        return ResponseEntity.ok(message);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Map<String, Object>>> getMessagesBySession(
            @PathVariable String sessionId,
            Authentication authentication) {

        String username = authentication.getName();

        // Obtener todos los mensajes de la sesión
        List<Map<String, Object>> messages = messageService.getMessagesBySessionId(sessionId)
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

        // Getters y setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public boolean getIsFromAgent() { return isFromAgent; }
        public void setIsFromAgent(boolean isFromAgent) { this.isFromAgent = isFromAgent; }
    }

    public static class UpdateMessageRequest {
        private String content;

        // Getters y setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
