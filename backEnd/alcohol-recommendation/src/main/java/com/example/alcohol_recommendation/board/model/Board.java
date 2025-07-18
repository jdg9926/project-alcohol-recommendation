package com.example.alcohol_recommendation.board.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "board")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Board {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

	@Builder.Default
	private LocalDateTime createdAt = LocalDateTime.now();
	
    private String author;
    
    @ElementCollection
    @Builder.Default
    private List<String> fileNames = new ArrayList<>();

    // 파일 추가 헬퍼 메소드
    public void addFileName(String fileName) {
        this.fileNames.add(fileName);
    }
}
