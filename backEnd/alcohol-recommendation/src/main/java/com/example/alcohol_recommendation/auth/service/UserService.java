package com.example.alcohol_recommendation.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
}
