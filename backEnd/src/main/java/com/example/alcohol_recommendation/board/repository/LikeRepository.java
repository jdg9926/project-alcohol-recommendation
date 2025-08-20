package com.example.alcohol_recommendation.board.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Like;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findAllByUser(User user);
}
