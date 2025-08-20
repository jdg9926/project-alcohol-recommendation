package com.example.alcohol_recommendation.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long receiverId;  // 받는 사람 seq
    private String title;
    private String content;
}
