package com.example.alcohol_recommendation.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Scrap;

public interface ScrapRepository extends JpaRepository<Scrap, Long> {
	Optional<Scrap> findByUserAndBoard(User user, Board board);
	void deleteByUserAndBoard(User user, Board board);
	int countByBoard(Board board);
    int countByBoardId(Long boardId);
    List<Scrap> findAllByUser(User user);
}
