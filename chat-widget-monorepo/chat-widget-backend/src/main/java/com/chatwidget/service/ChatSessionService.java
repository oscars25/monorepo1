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
import java.util.UUID;

@Service
@Transactional
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;

    public ChatSessionService(ChatSessionRepository chatSessionRepository, MessageRepository messageRepository) {
        this.chatSessionRepository = chatSessionRepository;
        this.messageRepository = messageRepository;
    }

    public ChatSession createSession(String websiteUrl, String visitorName, String visitorEmail) {
        String sessionId = UUID.randomUUID().toString();

        ChatSession session = new ChatSession();
        session.setSessionId(sessionId);
        session.setWebsiteUrl(websiteUrl);
        session.setVisitorName(visitorName);
        session.setVisitorEmail(visitorEmail);
        session.setStatus(ChatSession.SessionStatus.ACTIVE);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());

        return chatSessionRepository.save(session);
    }

    public Optional<ChatSession> getSessionById(String sessionId) {
        return chatSessionRepository.findBySessionId(sessionId);
    }

    public List<ChatSession> getSessionsByAgent(User agent) {
        return chatSessionRepository.findByAgent(agent);
    }

    public List<ChatSession> getActiveSessions() {
        return chatSessionRepository.findByStatusOrderByCreatedAtDesc(ChatSession.SessionStatus.ACTIVE);
    }

    public List<ChatSession> searchSessions(String keyword) {
        return chatSessionRepository.searchByKeyword(keyword);
    }

    public ChatSession assignAgentToSession(String sessionId, User agent) {
        Optional<ChatSession> sessionOpt = chatSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            ChatSession session = sessionOpt.get();
            session.setAgent(agent);
            session.setUpdatedAt(LocalDateTime.now());
            return chatSessionRepository.save(session);
        }
        throw new IllegalArgumentException("Sesión no encontrada");
    }

    public ChatSession closeSession(String sessionId) {
        Optional<ChatSession> sessionOpt = chatSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            ChatSession session = sessionOpt.get();
            session.setStatus(ChatSession.SessionStatus.CLOSED);
            session.setUpdatedAt(LocalDateTime.now());
            return chatSessionRepository.save(session);
        }
        throw new IllegalArgumentException("Sesión no encontrada");
    }

    public List<Message> getMessagesBySessionId(String sessionId) {
        return messageRepository.findMessagesBySessionId(sessionId);
    }

    public ChatSession updateSessionVisitorInfo(String sessionId, String visitorName, String visitorEmail) {
        Optional<ChatSession> sessionOpt = chatSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            ChatSession session = sessionOpt.get();
            session.setVisitorName(visitorName);
            session.setVisitorEmail(visitorEmail);
            session.setUpdatedAt(LocalDateTime.now());
            return chatSessionRepository.save(session);
        }
        throw new IllegalArgumentException("Sesión no encontrada");
    }
}
