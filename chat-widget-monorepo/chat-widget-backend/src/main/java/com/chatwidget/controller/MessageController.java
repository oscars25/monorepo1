package com.chatwidget.controller;

import com.chatwidget.entity.Message;
import com.chatwidget.entity.User;
import com.chatwidget.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Message>> getMessagesBySession(@PathVariable("sessionId") String sessionId) {
        List<Message> messages = messageService.getMessagesBySessionUuid(sessionId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/session/{sessionId}/agent")
    public ResponseEntity<List<Message>> getAgentMessages(@PathVariable("sessionId") String sessionId) {
        List<Message> messages = messageService.getAgentMessagesBySessionId(sessionId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/session/{sessionId}/visitor")
    public ResponseEntity<List<Message>> getVisitorMessages(@PathVariable("sessionId") String sessionId) {
        List<Message> messages = messageService.getVisitorMessagesBySessionId(sessionId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<Message> createMessage(@RequestBody CreateMessageRequest request, Authentication authentication) {
        User agent = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            agent = (User) authentication.getPrincipal();
        }
        Message saved = messageService.createMessage(request.getSessionId(), request.getContent(), request.isFromAgent(), agent, request.getVisitorName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String content = body.get("content");
        Optional<Message> updated = messageService.updateMessage(id, content);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    public static class CreateMessageRequest {
        private String sessionId;
        private String content;
        private boolean isFromAgent;
        private String visitorName;

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public boolean isFromAgent() { return isFromAgent; }
        public void setFromAgent(boolean fromAgent) { isFromAgent = fromAgent; }
        public String getVisitorName() { return visitorName; }
        public void setVisitorName(String visitorName) { this.visitorName = visitorName; }
    }
}
