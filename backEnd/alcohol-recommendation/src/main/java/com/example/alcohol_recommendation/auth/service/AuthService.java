package com.example.alcohol_recommendation.auth.service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.alcohol_recommendation.auth.dto.LoginRequest;
import com.example.alcohol_recommendation.auth.dto.LoginResponse;
import com.example.alcohol_recommendation.auth.dto.SignupRequest;
import com.example.alcohol_recommendation.auth.dto.UserResponse;
import com.example.alcohol_recommendation.auth.model.PasswordResetToken;
import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.PasswordResetTokenRepository;
import com.example.alcohol_recommendation.auth.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {
	private final UserRepository userRepo;
	private final BCryptPasswordEncoder pwEncoder = new BCryptPasswordEncoder();
	
	private final JavaMailSender mailSender;
	private final PasswordResetTokenRepository tokenRepo;

	@Value("${jwt.secret}") private String jwtSecret;
	@Value("${jwt.expiration}") private long jwtExpiration;

	public AuthService(UserRepository userRepo, JavaMailSender mailSender, PasswordResetTokenRepository tokenRepo){
		this.userRepo=userRepo; 
		this.mailSender=mailSender; 
		this.tokenRepo=tokenRepo;
	}

	public User signup(SignupRequest req) {
	    String hash = pwEncoder.encode(req.getPassword());
	    User u = new User();
	    u.setUserId(req.getUserId());
	    u.setNickname(req.getNickname());
	    u.setEmail(req.getEmail());
	    u.setPasswordHash(hash);
	    return userRepo.save(u);
	}

	public LoginResponse login(LoginRequest req) {
		User u = userRepo.findByUserId(req.getUserId())
				.orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 잘못되었습니다."));
		if (!pwEncoder.matches(req.getPassword(), u.getPasswordHash())) {
			throw new RuntimeException("아이디 또는 비밀번호가 잘못되었습니다.");			
		}

		byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
		String token = Jwts.builder()
				.setSubject(u.getUserId().toString())
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
				.signWith(Keys.hmacShaKeyFor(keyBytes), SignatureAlgorithm.HS512)
				.compact();

		UserResponse ur = new UserResponse(
			u.getSeq(),
		    u.getUserId(), 
		    u.getNickname(), 
		    u.getEmail(), 
		    u.getPasswordHash(), // 숨길거면 주석
	    	u.getCreatedAt()
    	);
		
		return new LoginResponse(token, ur);
	}

	public User getMe(String userId) {
		return userRepo.findByUserId(userId)
				.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
	}
	
    // ① 이메일로 아이디 찾기
	public String findUsernameByUserId(String email) {
		User u = userRepo.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("등록된 이메일이 없습니다."));
		return u.getUserId();
	}

	// ② 비밀번호 재설정 요청
	@Transactional
	public void requestPasswordReset(String userId, String email) {
		User u = userRepo.findByUserIdAndEmail(userId, email)
				.orElseThrow(() -> new RuntimeException("아이디/이메일이 일치하지 않습니다."));

	    // 기존 토큰 삭제
	    tokenRepo.deleteByUser(u);
		
		String token = UUID.randomUUID().toString();
		PasswordResetToken prt = new PasswordResetToken(token, u, LocalDateTime.now().plusHours(1));
		tokenRepo.save(prt);

		String link = "http://localhost:3000/reset-password?token="+token;
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setTo(email);
		msg.setSubject("비밀번호 재설정 링크");
		msg.setText("아래 링크를 클릭해 비밀번호를 재설정하세요:\n"+link);
		mailSender.send(msg);
	}

	  // ③ 비밀번호 재설정
	public void resetPassword(String token, String newPassword) {
		PasswordResetToken prt = tokenRepo.findByToken(token)
				.orElseThrow(() -> new RuntimeException("유효하지 않거나 만료된 토큰입니다."));
		if (prt.getExpiry().isBefore(LocalDateTime.now()))
			throw new RuntimeException("토큰이 만료되었습니다.");
		User u = prt.getUser();
		u.setPasswordHash(pwEncoder.encode(newPassword));
		userRepo.save(u);
		tokenRepo.delete(prt);
	}
}
