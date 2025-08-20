package com.example.alcohol_recommendation.message.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private String title;
    private String content;
    private String senderNickname;
    private String receiverNickname;
    private LocalDateTime createdAt;
    private boolean read;
}
