package com.example.alcohol_recommendation.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
	/*
		@NotBlank - null / 빈 문자열 금지
		@Size - 길이 제한
		@Email - 이메일 형식 검증
	*/
	@NotBlank(message = "username must not be blank")
	@Size(min = 6, max = 16, message = "userId length must be between 6 and 16")
	private String userId;
	
	@NotBlank(message = "username must not be blank") 
	@Size(min = 2, max = 16, message = "nickname length must be between 2 and 16")
	private String nickname;
	
    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be a well-formed email address")
	private String email;
    
    @NotBlank(message = "password must not be blank")
    @Size(min = 8, message = "password must be at least 8 characters long")
	private String password;
}
