package com.example.alcohol_recommendation.auth.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.auth.dto.LoginRequest;
import com.example.alcohol_recommendation.auth.dto.LoginResponse;
import com.example.alcohol_recommendation.auth.dto.ResetPasswordDto;
import com.example.alcohol_recommendation.auth.dto.SignupRequest;
import com.example.alcohol_recommendation.auth.dto.UserResponse;
import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.service.AuthService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
	private final AuthService authService;
	public AuthController(AuthService authService) { this.authService = authService; }

	@PostMapping("/signup")
	public User signup(@RequestBody @Valid SignupRequest req) {
		return authService.signup(req);
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody @Valid LoginRequest req, HttpServletResponse response) {
	    // 기존 로그인 로직 (Access 토큰 발급 + 유저 정보)
		System.out.println(req);
	    LoginResponse loginResponse = authService.login(req);

	    // Refresh 토큰 발급
	    String refreshToken = authService.generateRefreshToken(
	            String.valueOf(loginResponse.getUser().getSeq())
	    );

	    // HttpOnly 쿠키에 저장
	    Cookie cookie = new Cookie("refresh_token", refreshToken);
	    cookie.setHttpOnly(true);
	    cookie.setPath("/api/auth/refresh");
	    response.addCookie(cookie);

	    return loginResponse;
	}

	@GetMapping("/me")
	public User me(@AuthenticationPrincipal String userId) {
		return authService.getMe(String.valueOf(userId));
	}
	
	@PostMapping("/find-userId")
	public Map<String,String> findUsername(@RequestBody Map<String,String> req) {
		String email = req.get("email");
		String userId = authService.findUsernameByUserId(email);
		return Map.of("userId", userId);
  	}

	@PostMapping("/reset-password-request")
	public Map<String,String> requestReset(@RequestBody Map<String, String> req) {
		String userId = req.get("userId");
		String email = req.get("email");
		authService.requestPasswordReset(userId, email);
		return Map.of("message", "Reset link sent");
	}

	@PostMapping("/reset-password")
	public Map<String,String> resetPassword(@RequestBody @Valid ResetPasswordDto dto) {
		authService.resetPassword(dto.getToken(), dto.getNewPassword());
		return Map.of("message", "Password updated");
	}
	
	@PostMapping("/refresh")
	public LoginResponse refresh(
	        @CookieValue(value = "refresh_token", required = false) String refreshToken) {
	    return authService.refreshAccessToken(refreshToken);
	}
}
