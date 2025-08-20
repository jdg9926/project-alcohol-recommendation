package com.example.alcohol_recommendation.message.dto;

import java.time.LocalDateTime;

import com.example.alcohol_recommendation.message.model.Message;

import lombok.Data;

@Data
public class MessageListDto {
    private Long id;
    private String otherUser;  // 받은함이면 발신자, 보낸함이면 수신자
    private String title;
    private boolean readFlag;
    private LocalDateTime createdAt;
    
    public MessageListDto(Message message, boolean isInbox) {
        this.id = message.getId();
        this.otherUser = isInbox ? message.getSender().getNickname() : message.getReceiver().getNickname();
        this.title = message.getTitle();
        this.readFlag = message.isReadFlag();
        this.createdAt = message.getCreatedAt();
    }
}
