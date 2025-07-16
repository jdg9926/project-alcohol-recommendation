package com.example.alcohol_recommendation.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.auth.service.EmailVerificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class EmailVerificationController {
    private final EmailVerificationService emailService;

    // 인증번호 발송
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerification(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        emailService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // 인증번호 확인
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String code = req.get("code");
        boolean ok = emailService.verifyCode(email, code);

        return ResponseEntity.ok(Map.of("success", ok));
    }
    
    // /test/sendMail?email=본인@naver.com
    @GetMapping("/test/sendMail")
    public ResponseEntity<?> testSendMail(@RequestParam("email") String email) {
    	emailService.sendVerificationCode(email);
        return ResponseEntity.ok("전송 완료!");
    }
}

