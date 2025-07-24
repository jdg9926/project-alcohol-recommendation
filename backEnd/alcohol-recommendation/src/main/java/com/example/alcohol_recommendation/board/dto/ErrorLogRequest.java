package com.example.alcohol_recommendation.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorLogRequest {
    private String title;
    private String content;
    private String author;
}
