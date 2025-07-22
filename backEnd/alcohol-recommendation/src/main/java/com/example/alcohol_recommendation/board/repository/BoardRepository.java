package com.example.alcohol_recommendation.board.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
	Page<Board> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author, Pageable pageable);
	List<Board> findAllByUser(User user);
	List<Board> findByUser(User user);
}
