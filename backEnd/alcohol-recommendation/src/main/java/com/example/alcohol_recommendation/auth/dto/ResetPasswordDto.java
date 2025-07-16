// src/main/java/com/teamProject/UKA/auth/dto/ResetPasswordDto.java
package com.example.alcohol_recommendation.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 비밀번호 재설정 요청에서
 * - token: 이메일로 발송된 토큰
 * - newPassword: 새로 설정할 비밀번호
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordDto {

    @NotBlank(message = "토큰이 필요합니다.")
    private String token;

    @NotBlank(message = "새 비밀번호를 입력해주세요.")
    @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.")
    private String newPassword;
}
