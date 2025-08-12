package com.example.alcohol_recommendation.auth.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
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
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class User {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long seq;
	
	@Column(nullable = false) 
	private String userId;
	  
	@Column(nullable = false) 
	private String nickname;
	  
	@Column(nullable = false, unique = true)
	private String email;
	  
	@Column(nullable = false) 
	private String passwordHash;

    @Column(name = "profile_image_url")
    private String profileImageUrl;
	
	@Builder.Default
	private LocalDateTime createdAt = LocalDateTime.now();
}
