package com.example.alcohol_recommendation.board.dto;

import java.time.LocalDateTime;

import com.example.alcohol_recommendation.board.model.Comment;

import lombok.Data;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private String author;
    private LocalDateTime createdAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.author = comment.getUser().getNickname();
        this.createdAt = comment.getCreatedAt();
    }
}
