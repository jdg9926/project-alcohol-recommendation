package com.example.alcohol_recommendation.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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
import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
	private final AuthService authService;
	public AuthController(AuthService authService) { this.authService = authService; }
	
    @Value("${app.cookie.secure:false}") // 배포에서 true로
    private boolean cookieSecure;
    @Value("${app.cookie.domain:}")      // 필요시 도메인 지정 (예: api.example.com)
    private String cookieDomain;

    @PostMapping("/signup")
    public User signup(@RequestBody @Valid SignupRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest req, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(req);

        // refresh 토큰 발급(사용자 식별자: seq 사용)
        String refreshToken = authService.generateRefreshToken(String.valueOf(loginResponse.getUser().getSeq()));

        // ✅ HttpOnly Refresh 쿠키 세팅
        addRefreshCookie(response, refreshToken);

        return loginResponse; // { token, user } 형태 유지 (프론트는 body.token 사용)
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // ✅ Refresh 쿠키 삭제
        clearRefreshCookie(response);
        return ResponseEntity.ok().build();
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
    public Map<String, String> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        LoginResponse resp = authService.refreshAccessToken(refreshToken);
        return Map.of("accessToken", resp.getToken()); // ✅ token 필드에서 문자열만 꺼냄
    }

    /* ================== Cookie Helpers ================== */

    private void addRefreshCookie(HttpServletResponse response, String value) {
        // Servlet Cookie API는 SameSite 속성 직접 지원이 들쭉날쭉하니, Set-Cookie 헤더로 수동 세팅
        StringBuilder sb = new StringBuilder();
        sb.append("refresh_token=").append(value).append(";");
        sb.append(" Path=/api/auth/refresh;");                 // refresh 호출 경로와 일치
        sb.append(" HttpOnly;");

        // 배포 환경에서 반드시 Secure + SameSite=None
        if (cookieSecure) {
            sb.append(" Secure;");
            sb.append(" SameSite=None;");
        } else {
            // 로컬 개발환경(HTTP)에서는 Secure 못 씀: SameSite=Lax로 두는게 안전
            sb.append(" SameSite=Lax;");
        }

        // 유효기간(예: 14일). 세션쿠키로 쓰려면 Max-Age 빼도 됨
        int maxAge = 14 * 24 * 60 * 60;
        sb.append(" Max-Age=").append(maxAge).append(";");

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            sb.append(" Domain=").append(cookieDomain).append(";");
        }

        response.addHeader("Set-Cookie", sb.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("refresh_token=;");                           // 빈 값
        sb.append(" Path=/api/auth/refresh;");
        sb.append(" HttpOnly;");
        sb.append(" Max-Age=0;");                               // ✅ 즉시 만료

        if (cookieSecure) {
            sb.append(" Secure;");
            sb.append(" SameSite=None;");
        } else {
            sb.append(" SameSite=Lax;");
        }
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            sb.append(" Domain=").append(cookieDomain).append(";");
        }

        response.addHeader("Set-Cookie", sb.toString());
    }
}
