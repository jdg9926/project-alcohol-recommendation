package com.example.alcohol_recommendation.board.dto;

import lombok.Data;

@Data
public class PwChangeRequest {
    private String oldPassword;
    private String newPassword;
}
