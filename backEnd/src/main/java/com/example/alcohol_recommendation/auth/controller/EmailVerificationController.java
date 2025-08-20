package com.example.alcohol_recommendation.auth.controller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.auth.service.EmailVerificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class EmailVerificationController {
    private final EmailVerificationService emailService;
    private final UserRepository userRepository;

    // 인증번호 발송
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerification(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        
        // 이메일 중복 체크
        boolean exists = userRepository.existsByEmail(email);
        if (exists) {
            // 이미 존재하는 이메일일 때 에러 리턴
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", "이미 가입된 이메일입니다."));
        }

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
    
    // 이력서 파일 메일 첨부 전송 (public S3 URL 기반)
    @PostMapping("/send-resume")
    public ResponseEntity<?> sendResume(@RequestBody Map<String, String> req) {
    	System.out.println("req :::" + req);
        String toEmail = req.get("email");
        try {
            // S3 public URL & 첨부파일명
            String fileUrl = "https://psy-mail-post.s3.ap-northeast-2.amazonaws.com/%EB%B0%95%EC%84%B8%ED%98%84+%EC%9E%90%EA%B8%B0%EC%86%8C%EA%B0%9C%EC%84%9C.pdf";
            String fileName = "박세현 자기소개서.pdf";

            // URL에서 파일 다운로드
            @SuppressWarnings("deprecation")
            URL url = new URL(fileUrl);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (InputStream in = url.openStream()) {
                byte[] buffer = new byte[4096];
                int len;
                while ((len = in.read(buffer)) > 0) {
                    baos.write(buffer, 0, len);
                }
            }
            byte[] fileBytes = baos.toByteArray();

            // 메일 첨부 전송
            emailService.sendResumeWithAttachment(toEmail, fileBytes, fileName);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}

