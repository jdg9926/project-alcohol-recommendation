package com.example.alcohol_recommendation.board.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long>  {
    List<Comment> findByBoardOrderByCreatedAtAsc(Board board);
    long countByBoard(Board board);
    List<Comment> findAllByUserOrderByCreatedAtDesc(User user);
}
