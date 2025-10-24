package com.chatwidget.repository;

import com.chatwidget.entity.Message;
import com.chatwidget.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    List<Message> findByUserOrderByCreatedAtAsc(User user);

    @Query("SELECT m FROM Message m WHERE m.isFromAgent = true ORDER BY m.createdAt ASC")
    List<Message> findAgentMessages();

    @Query("SELECT m FROM Message m WHERE m.session.id = :sessionId ORDER BY m.createdAt ASC")
    List<Message> findMessagesBySessionId(@Param("sessionId") String sessionId);

    @Query("SELECT m FROM Message m WHERE m.session.id = :sessionId AND m.isFromAgent = true ORDER BY m.createdAt ASC")
    List<Message> findAgentMessagesBySessionId(@Param("sessionId") String sessionId);

    @Query("SELECT m FROM Message m WHERE m.session.id = :sessionId AND m.isFromAgent = false ORDER BY m.createdAt ASC")
    List<Message> findVisitorMessagesBySessionId(@Param("sessionId") String sessionId);

    // Cambiado: buscar por session.sessionId (campo String en ChatSession)
    @Query("SELECT m FROM Message m WHERE m.session.sessionId = :sessionUuid ORDER BY m.createdAt ASC")
    List<Message> findMessagesBySessionUuid(@Param("sessionUuid") String sessionUuid);
}
