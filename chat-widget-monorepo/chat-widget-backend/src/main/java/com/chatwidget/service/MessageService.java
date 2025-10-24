package com.chatwidget.service;

import com.chatwidget.entity.Message;
import com.chatwidget.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesBySessionUuid(String sessionUuid) {
        return messageRepository.findMessagesBySessionUuid(sessionUuid);
    }

    // Parche temporal: métodos que espera el controlador
    @Transactional(readOnly = true)
    public List<Message> getAgentMessagesBySessionId(String sessionId) {
        // actualmente devuelve todos los mensajes de la sesión;
        // si prefieres filtrar por autor/agente, pega Message.java y lo implemento.
        return messageRepository.findMessagesBySessionUuid(sessionId);
    }

    @Transactional(readOnly = true)
    public List<Message> getVisitorMessagesBySessionId(String sessionId) {
        // actualmente devuelve todos los mensajes de la sesión;
        // si prefieres filtrar por visitante, lo ajustamos después.
        return messageRepository.findMessagesBySessionUuid(sessionId);
    }
}
