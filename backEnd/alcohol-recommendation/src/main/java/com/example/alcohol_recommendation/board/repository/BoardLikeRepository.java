package com.example.alcohol_recommendation.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.BoardLike;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
    Optional<BoardLike> findByBoardAndUser(Board board, User user);
    boolean existsByBoardAndUser(Board board, User user);
    List<BoardLike> findAllByUser(User user);
}
