package com.example.alcohol_recommendation.board.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Scrap;

import lombok.Data;

@Data
public class BoardResponse {
    private Long id;
    private String title;
    private String author;
    private String content;
    private LocalDateTime createdAt;
    private int commentCount;
    private int likeCount;
    private boolean liked;
    
    private Long scrapId;
    private boolean scrapped;
    private LocalDateTime scrapDate;
    
    private List<String> fileNames;
    private List<String> originFileNames;
    
    // Board만 받는 생성자 추가 (기존 liked는 false로 초기화)
    public BoardResponse(Board board) {
        this.id = board.getId();
        this.title = board.getTitle();
        this.author = board.getAuthor();
        this.content = board.getContent();
        this.createdAt = board.getCreatedAt();
        this.commentCount = board.getComments() != null ? board.getComments().size() : 0;
        this.likeCount = board.getLikeCount();
        this.liked = false;
        this.fileNames = board.getFileNames();
        this.originFileNames = board.getOriginFileNames();
    }

    // Board + liked 받는 생성자
    public BoardResponse(Board board, boolean liked) {
        this(board);
        this.liked = liked;
    }
    
    // Board + Scrap 받는 생성자
    public BoardResponse(Board board, Scrap scrap) {
        this(board);
        if (scrap != null) {
            this.scrapId = scrap.getId();
            this.scrapDate = scrap.getCreatedAt();
            this.scrapped = true;
        }
    }
    
    // Board + liked + Scrap 받는 생성자
    public BoardResponse(Board board, boolean liked, boolean scrapped) {
        this(board);
        this.liked = liked;
        this.scrapped = scrapped;
    }
}
