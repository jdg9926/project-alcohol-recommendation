package com.example.alcohol_recommendation.auth.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.alcohol_recommendation.auth.model.EmailVerification;
import com.example.alcohol_recommendation.auth.repository.EmailVerificationRepository;

import jakarta.activation.DataSource;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final EmailVerificationRepository repository;
    private final JavaMailSender mailSender;
    
    @Transactional
    public void sendVerificationCode(String email) {
        String code = makeRandomCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(3);

        // 이전 데이터 있으면 삭제
        repository.deleteByEmail(email);

        // 저장
        repository.save(new EmailVerification(null, email, code, expiresAt));

        // 이메일 전송
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("이메일 인증번호");
        message.setText("인증번호: " + code + "\n(3분 이내 입력)");

        mailSender.send(message);
    }

    @Transactional
    public boolean verifyCode(String email, String code) {
        Optional<EmailVerification> opt = repository.findByEmail(email);
        if(opt.isEmpty()) return false;

        EmailVerification ev = opt.get();
        if(ev.getExpiresAt().isBefore(LocalDateTime.now())) return false; // 만료
        return ev.getCode().equals(code); // 코드 일치 확인
    }

    @Transactional
    private String makeRandomCode() {
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<6; i++) sb.append(r.nextInt(10));
        return sb.toString();
    }
    
    // 이력서 첨부 메일 전송
    public void sendResumeWithAttachment(String toEmail, byte[] fileBytes, String fileName) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(toEmail);
        helper.setSubject("박세현 자기소개서 파일입니다.");
        helper.setText("안녕하세요 자기소개서를 첨부합니다.\n\n감사합니다.");

        DataSource dataSource = new ByteArrayDataSource(fileBytes, "application/pdf");
        helper.addAttachment(fileName, dataSource);

        mailSender.send(message);
    }
}

