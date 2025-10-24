package com.chatwidget.controller;

import com.chatwidget.entity.Message;
import com.chatwidget.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
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
}
