package com.chatwidget.service;

import com.chatwidget.entity.ChatSession;
import com.chatwidget.entity.Message;
import com.chatwidget.entity.User;
import com.chatwidget.repository.ChatSessionRepository;
import com.chatwidget.repository.MessageRepository;
import com.chatwidget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          ChatSessionRepository chatSessionRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesBySessionUuid(String sessionUuid) {
        return messageRepository.findMessagesBySessionUuid(sessionUuid);
    }

    @Transactional(readOnly = true)
    public List<Message> getAgentMessagesBySessionId(String sessionId) {
        return messageRepository.findAgentMessagesBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public List<Message> getVisitorMessagesBySessionId(String sessionId) {
        return messageRepository.findVisitorMessagesBySessionId(sessionId);
    }

    @Transactional
    public Message createMessage(String sessionId, String content, boolean isFromAgent, User agentOrNull, String visitorName) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada"));

        User author;
        if (isFromAgent) {
            // Si es un agente, usar el usuario autenticado si viene; si no, fallback a admin
            if (agentOrNull != null) {
                author = agentOrNull;
            } else {
                author = userRepository.findByUsername("admin").orElseGet(() ->
                        userRepository.findAll().stream().findFirst()
                                .orElseThrow(() -> new IllegalStateException("No hay usuarios para asociar el mensaje"))
                );
            }
        } else {
            // Mensaje de visitante: asociar a usuario 'visitor' (creado en el init), si existe; si no, admin
            author = userRepository.findByUsername("visitor")
                    .orElseGet(() -> userRepository.findByUsername("admin").orElseThrow());
        }

        Message msg = new Message();
        msg.setSession(session);
        msg.setUser(author);
        msg.setContent(content);
        msg.setFromAgent(isFromAgent);
        msg.setVisitorName(!isFromAgent ? (visitorName != null ? visitorName : session.getVisitorName()) : null);
        msg.setCreatedAt(LocalDateTime.now());
        msg.setUpdatedAt(LocalDateTime.now());

        return messageRepository.save(msg);
    }

    @Transactional
    public Optional<Message> updateMessage(Long id, String newContent) {
        return messageRepository.findById(id).map(m -> {
            m.setContent(newContent);
            m.setUpdatedAt(LocalDateTime.now());
            return messageRepository.save(m);
        });
    }

    @Transactional
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
