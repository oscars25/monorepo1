package com.chatwidget.service;

import com.chatwidget.entity.ChatSession;
import com.chatwidget.entity.Message;
import com.chatwidget.entity.User;
import com.chatwidget.repository.ChatSessionRepository;
import com.chatwidget.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatSessionRepository chatSessionRepository;

    public MessageService(MessageRepository messageRepository, ChatSessionRepository chatSessionRepository) {
        this.messageRepository = messageRepository;
        this.chatSessionRepository = chatSessionRepository;
    }

    public Message createMessage(String sessionId, User user, String content, boolean isFromAgent) {
        // Buscar la sesión existente en lugar de crear una nueva
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada: " + sessionId));

        Message message = new Message();
        message.setSession(session);
        message.setUser(user);
        message.setContent(content);
        message.setIsFromAgent(isFromAgent);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public Message createMessageForVisitor(String sessionId, User user, String content, boolean isFromAgent, String visitorName) {
        // Buscar la sesión existente en lugar de crear una nueva
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada: " + sessionId));

        Message message = new Message();
        message.setSession(session);
        message.setUser(user);
        message.setContent(content);
        message.setIsFromAgent(isFromAgent);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        // Guardar el nombre del visitante directamente en el mensaje
        message.setVisitorName(visitorName);

        return messageRepository.save(message);
    }

    public List<Message> getMessagesBySessionId(String sessionId) {
        return messageRepository.findMessagesBySessionId(sessionId);
    }

    public List<Message> getAgentMessagesBySessionId(String sessionId) {
        return messageRepository.findAgentMessagesBySessionId(sessionId);
    }

    public List<Message> getVisitorMessagesBySessionId(String sessionId) {
        return messageRepository.findVisitorMessagesBySessionId(sessionId);
    }

    public Message updateMessage(Long messageId, String content) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));

        message.setContent(content);
        message.setUpdatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public void deleteMessage(Long messageId) {
        if (!messageRepository.existsById(messageId)) {
            throw new IllegalArgumentException("Mensaje no encontrado");
        }
        messageRepository.deleteById(messageId);
    }
}
