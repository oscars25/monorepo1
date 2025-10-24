package com.chatwidget.controller;

import com.chatwidget.entity.ChatSession;
import com.chatwidget.entity.User;
import com.chatwidget.security.JwtService;
import com.chatwidget.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public ResponseEntity<Map<String, Object>> createSession(
            @RequestBody CreateSessionRequest request,
            Authentication authentication) {

        // No requerimos autenticación para crear una sesión de visitante

        ChatSession session = chatSessionService.createSession(
                request.getWebsiteUrl(),
                request.getVisitorName(),
                request.getVisitorEmail()
        );
        
        // Crear un mapa con los datos necesarios para el frontend
        Map<String, Object> response = new HashMap<>();
        response.put("id", session.getSessionId()); // Usar sessionId como id
        response.put("sessionId", session.getSessionId());
        response.put("websiteUrl", session.getWebsiteUrl());
        response.put("visitorName", session.getVisitorName());
        response.put("visitorEmail", session.getVisitorEmail());
        response.put("status", session.getStatus().toString());
        response.put("createdAt", session.getCreatedAt().toString());
        response.put("updatedAt", session.getUpdatedAt().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(
            @PathVariable String sessionId,
            Authentication authentication) {
        // No requerimos autenticación para obtener una sesión de chat
        return chatSessionService.getSessionById(sessionId)
                .map(session -> {
                    // Crear un mapa con los datos necesarios para el frontend
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", session.getSessionId()); // Usar sessionId como id
                    response.put("sessionId", session.getSessionId());
                    response.put("websiteUrl", session.getWebsiteUrl());
                    response.put("visitorName", session.getVisitorName());
                    response.put("visitorEmail", session.getVisitorEmail());
                    response.put("status", session.getStatus().toString());
                    response.put("createdAt", session.getCreatedAt().toString());
                    response.put("updatedAt", session.getUpdatedAt().toString());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ChatSession>> getActiveSessions(Authentication authentication) {
        // No requerimos autenticación para obtener las sesiones activas
        List<ChatSession> sessions = chatSessionService.getActiveSessions();

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ChatSession>> searchSessions(
            @RequestParam String keyword,
            Authentication authentication) {

        // No requerimos autenticación para buscar sesiones
        List<ChatSession> sessions = chatSessionService.searchSessions(keyword);

        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/{sessionId}/assign")
    public ResponseEntity<ChatSession> assignAgent(
            @PathVariable String sessionId,
            @RequestBody AssignAgentRequest request,
            Authentication authentication) {

        // No requerimos autenticación para asignar un agente
        ChatSession session = chatSessionService.assignAgentToSession(sessionId, request.getAgent());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{sessionId}/close")
    public ResponseEntity<ChatSession> closeSession(
            @PathVariable String sessionId,
            Authentication authentication) {

        // No requerimos autenticación para cerrar una sesión
        ChatSession session = chatSessionService.closeSession(sessionId);
        return ResponseEntity.ok(session);
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<ChatSession> updateSession(
            @PathVariable String sessionId,
            @RequestBody UpdateSessionRequest request,
            Authentication authentication) {

        // No requerimos autenticación para actualizar información básica de la sesión

        ChatSession session = chatSessionService.updateSessionVisitorInfo(
                sessionId,
                request.getVisitorName(),
                request.getVisitorEmail()
        );

        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable String sessionId,
            Authentication authentication) {

        // No requerimos autenticación para obtener mensajes de una sesión
        List<Map<String, Object>> messages = chatSessionService.getMessagesBySessionId(sessionId)
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

    public static class UpdateSessionRequest {
        private String visitorName;
        private String visitorEmail;

        // Getters y setters
        public String getVisitorName() { return visitorName; }
        public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

        public String getVisitorEmail() { return visitorEmail; }
        public void setVisitorEmail(String visitorEmail) { this.visitorEmail = visitorEmail; }
    }
}
