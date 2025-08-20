package com.example.alcohol_recommendation.message.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.alcohol_recommendation.message.model.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // 받은 쪽지함 (삭제 안 한 것만)
    @Query("""
            SELECT m FROM Message m
            WHERE m.receiver.seq = :userSeq
              AND m.deletedByReceiver = false
            ORDER BY m.createdAt DESC
            """)
    List<Message> findInbox(@Param("userSeq") Long userSeq);

    // 보낸 쪽지함 (삭제 안 한 것만)
    @Query("""
            SELECT m FROM Message m
            WHERE m.sender.seq = :userSeq
              AND m.deletedBySender = false
            ORDER BY m.createdAt DESC
            """)
    List<Message> findSent(@Param("userSeq") Long userSeq);

    // 미읽음 개수
    @Query("""
            SELECT COUNT(m) FROM Message m
            WHERE m.receiver.seq = :userSeq
              AND m.readFlag = false
              AND m.deletedByReceiver = false
            """)
    Long countUnread(@Param("userSeq") Long userSeq);
}
