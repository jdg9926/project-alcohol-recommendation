package com.example.alcohol_recommendation.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);

	Optional<User> findByUserId(String userId);
	
	Optional<User> findByUserIdAndEmail(String userId, String email);
	
	boolean existsByUserId(String userId);

	boolean existsByNickname(String nickname);
	
	boolean existsByEmail(String email);
}
