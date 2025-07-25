package com.example.alcohol_recommendation.board.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.alcohol_recommendation.auth.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "board")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private String author;

    @Column(nullable = false)
    @Builder.Default
    private int likeCount = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoardType boardType;

    @ElementCollection
    @Builder.Default
    private List<String> fileNames = new ArrayList<>();

    @ElementCollection
    @Builder.Default
    private List<String> originFileNames = new ArrayList<>();

    // 댓글 - 삭제 시 cascade, orphanRemoval
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // BoardLike(좋아요) - 삭제 시 cascade, orphanRemoval
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<BoardLike> likes = new ArrayList<>();

    // Scrap(스크랩) - 삭제 시 cascade, orphanRemoval
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Scrap> scraps = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // 첨부파일 추가 메서드
    public void addFile(String saveName, String originName) {
        this.fileNames.add(saveName);
        this.originFileNames.add(originName);
    }
    
    public void setFiles(List<String> fileNames, List<String> originFileNames) {
        this.fileNames = fileNames;
        this.originFileNames = originFileNames;
    }
}
