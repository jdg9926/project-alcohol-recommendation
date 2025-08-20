package com.example.alcohol_recommendation.message.dto;

import lombok.Data;

@Data
public class MessageSendRequest {
    private String receiverUserId; // 받는 사람의 userId
    private String title;
    private String content;
}
