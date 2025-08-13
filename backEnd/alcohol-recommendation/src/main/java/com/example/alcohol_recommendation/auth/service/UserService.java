package com.example.alcohol_recommendation.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean existsByUserId(String userId) {
        return userRepository.existsByUserId(userId);
    }

    public boolean existsByNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }
    
    public void changePassword(Long userSeq, String oldPw, String newPw) {
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(oldPw, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }

        // (선택) 새 비밀번호 유효성 검사
        if (newPw.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "새 비밀번호는 6자 이상이어야 합니다.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPw));
        userRepository.save(user);
    }
    
	@Transactional
	public User updateProfileImageByPrincipalName(String principalName, String imageUrl) {
		User user = findUserByPrincipalName(principalName);
		user.setProfileImageUrl(imageUrl); // JPA Dirty Checking
		return user; // 변경 감지로 자동 저장
	}

	@Transactional(readOnly = true)
	public User meByPrincipalName(String principalName) {
		return findUserByPrincipalName(principalName);
	}

	/* ===================== 내부 유틸 ===================== */

	private User findUserByPrincipalName(String principalName) {
		if (principalName == null || principalName.isBlank()) {
			throw new IllegalArgumentException("principal is empty");
		}
		// 전부 숫자면 PK로 간주 (예: "2")
		if (principalName.chars().allMatch(Character::isDigit)) {
			Long id = Long.parseLong(principalName);
			return userRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found by id: " + id));
		}
		// 그 외는 로그인 아이디(예: userId/username/email)로 간주
		return userRepository.findByUserId(principalName)
			.orElseThrow(() -> new IllegalArgumentException("User not found by userId: " + principalName));
	}
}
