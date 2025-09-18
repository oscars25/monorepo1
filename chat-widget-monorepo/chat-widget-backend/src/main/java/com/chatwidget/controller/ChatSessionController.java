package com.chatwidget.controller;

import com.chatwidget.entity.ChatSession;
import com.chatwidget.entity.User;
import com.chatwidget.security.JwtService;
import com.chatwidget.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class ChatSessionController {

    private final ChatSessionService chatSessionService;
    private final JwtService jwtService;

    public ChatSessionController(ChatSessionService chatSessionService, JwtService jwtService) {
        this.chatSessionService = chatSessionService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<ChatSession> createSession(
            @RequestBody CreateSessionRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        // El usuario se obtendría a través del servicio de autenticación o usuario
        // Por ahora, lo dejamos como null para evitar errores

        ChatSession session = chatSessionService.createSession(
                request.getWebsiteUrl(),
                request.getVisitorName(),
                request.getVisitorEmail()
        );

        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<ChatSession> getSession(@PathVariable String sessionId) {
        return chatSessionService.getSessionById(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ChatSession>> getActiveSessions(Authentication authentication) {
        String username = authentication.getName();

        // El usuario se obtendría a través del servicio de autenticación o usuario
        // Por ahora, lo dejamos como null para evitar errores

        // Por ahora, mostramos todas las sesiones activas
        // En una implementación real, verificaríamos el rol del usuario
        List<ChatSession> sessions = chatSessionService.getActiveSessions();

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ChatSession>> searchSessions(
            @RequestParam String keyword,
            Authentication authentication) {

        String username = authentication.getName();
        List<ChatSession> sessions = chatSessionService.searchSessions(keyword);

        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/{sessionId}/assign")
    public ResponseEntity<ChatSession> assignAgent(
            @PathVariable String sessionId,
            @RequestBody AssignAgentRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        // Verificar si el usuario actual es admin
        // En una implementación real, verificaríamos el rol del usuario

        ChatSession session = chatSessionService.assignAgentToSession(sessionId, request.getAgent());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{sessionId}/close")
    public ResponseEntity<ChatSession> closeSession(
            @PathVariable String sessionId,
            Authentication authentication) {

        String username = authentication.getName();
        // Verificar si el usuario actual es admin o agente de la sesión
        // En una implementación real, verificaríamos el rol y la asignación

        ChatSession session = chatSessionService.closeSession(sessionId);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable String sessionId,
            Authentication authentication) {

        String username = authentication.getName();
        List<Map<String, Object>> messages = chatSessionService.getMessagesBySessionId(sessionId)
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

    public static class CreateSessionRequest {
        private String sessionId;
        private String websiteUrl;
        private String visitorName;
        private String visitorEmail;

        // Getters y setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getWebsiteUrl() { return websiteUrl; }
        public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

        public String getVisitorName() { return visitorName; }
        public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

        public String getVisitorEmail() { return visitorEmail; }
        public void setVisitorEmail(String visitorEmail) { this.visitorEmail = visitorEmail; }
    }

    public static class AssignAgentRequest {
        private User agent;

        // Getters y setters
        public User getAgent() { return agent; }
        public void setAgent(User agent) { this.agent = agent; }
    }
}
