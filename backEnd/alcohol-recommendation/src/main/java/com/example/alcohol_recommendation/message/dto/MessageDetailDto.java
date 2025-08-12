package com.example.alcohol_recommendation.message.dto;

import java.time.LocalDateTime;

import com.example.alcohol_recommendation.message.model.Message;

import lombok.Data;

@Data
public class MessageDetailDto {
    private Long id;
    private String sender;
    private String receiver;
    private String senderId;
    private String receiverId;
    private String title;
    private String content;
    private boolean readFlag;
    private LocalDateTime createdAt;

    public MessageDetailDto(Message message) {
        this.id = message.getId();
        this.sender = message.getSender().getNickname();
        this.receiver = message.getReceiver().getNickname();
        this.senderId = message.getSender().getUserId();
        this.receiverId = message.getReceiver().getUserId();
        this.title = message.getTitle();
        this.content = message.getContent();
        this.readFlag = message.isReadFlag();
        this.createdAt = message.getCreatedAt();
    }
}
