package com.example.alcohol_recommendation.auth.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 아이디 중복 확인 */
    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkUserId(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(userService.existsByUserId(userId));
    }

    /** 닉네임 중복 확인 */
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
        return ResponseEntity.ok(userService.existsByNickname(nickname));
    }

    /** 현재 로그인 사용자 정보 */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Principal principal) {
        User me = userService.meByPrincipalName(principal.getName());
        return ResponseEntity.ok(Map.of(
                "userId", me.getUserId(),
                "nickname", me.getNickname(),
                "email", me.getEmail()
        ));
    }
}
