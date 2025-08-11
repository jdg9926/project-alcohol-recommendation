package com.example.alcohol_recommendation.auth.dto;

import java.time.LocalDateTime;

import com.example.alcohol_recommendation.auth.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
	private long seq;
	private String userId;
	private String nickname;
	private String email;
	private String password; // 숨길거면 주석
	private LocalDateTime createdAt;
	
    public UserResponse(User user) {
        this.seq = user.getSeq();
        this.userId = user.getUserId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.createdAt = user.getCreatedAt();
    }
}