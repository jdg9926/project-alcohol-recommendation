package com.example.alcohol_recommendation.board.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.board.model.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
	Page<Board> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author, Pageable pageable);
}
