package com.chatwidget.repository;

import com.chatwidget.entity.ChatSession;
import com.chatwidget.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findBySessionId(String sessionId);

    List<ChatSession> findByAgent(User agent);

    List<ChatSession> findByWebsiteUrl(String websiteUrl);

    List<ChatSession> findByStatusOrderByCreatedAtDesc(ChatSession.SessionStatus status);

    @Query("SELECT cs FROM ChatSession cs WHERE " +
           "(cs.visitorName LIKE %:keyword% OR " +
           "cs.visitorEmail LIKE %:keyword% OR " +
           "cs.websiteUrl LIKE %:keyword%) " +
           "ORDER BY cs.createdAt DESC")
    List<ChatSession> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.agent = :agent ORDER BY cs.updatedAt DESC")
    List<ChatSession> findActiveSessionsByAgent(@Param("agent") User agent);
}
