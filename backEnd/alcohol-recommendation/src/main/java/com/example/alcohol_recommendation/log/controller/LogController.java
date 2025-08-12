package com.example.alcohol_recommendation.log.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.log.model.ErrorLog;
import com.example.alcohol_recommendation.log.repository.ErrorLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class LogController {

    private final ErrorLogRepository errorLogRepository;

    @PostMapping("/error")
    public ResponseEntity<Void> logError(@RequestBody Map<String, Object> payload) {
        log.error("[FE Error Log] {}", payload); // 파일/콘솔 로그

        try {
            ErrorLog entity = ErrorLog.builder()
                .message((String) payload.get("message"))
                .stack((String) payload.get("stack"))
                .componentStack((String) payload.getOrDefault("componentStack",""))
                .url((String) payload.get("url"))
                .userAgent((String) payload.get("userAgent"))
                .timestamp(LocalDateTime.now())
                .build();
            errorLogRepository.save(entity);      // ✅ DB 적재
        } catch (Exception e) {
            log.error("saving FE error failed", e); // ✅ 실패 시 서버 로그에 이유 남김
        }
        return ResponseEntity.ok().build();
    }
}
