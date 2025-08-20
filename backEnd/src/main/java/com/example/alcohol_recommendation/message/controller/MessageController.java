package com.example.alcohol_recommendation.message.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.alcohol_recommendation.message.dto.MessageDetailDto;
import com.example.alcohol_recommendation.message.dto.MessageListDto;
import com.example.alcohol_recommendation.message.dto.MessageSendRequest;
import com.example.alcohol_recommendation.message.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    // 받은 쪽지 목록
    @GetMapping
    public List<MessageListDto> getInbox(@AuthenticationPrincipal String userId) {
        return messageService.getInbox(Long.parseLong(userId));
    }

    // 보낸 쪽지 목록
    @GetMapping("/sent")
    public List<MessageListDto> getSent(@AuthenticationPrincipal String userId) {
        return messageService.getSent(Long.parseLong(userId));
    }

    // 쪽지 상세
    @GetMapping("/{id}")
    public MessageDetailDto getMessage(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal String userId) {
        return messageService.getMessage(id, Long.parseLong(userId));
    }

    // 쪽지 보내기
    @PostMapping("/send")
    public Map<String, String> sendMessage(
            @AuthenticationPrincipal String userId,
            @RequestBody MessageSendRequest request) {
        messageService.sendMessage(Long.parseLong(userId), request);
        return Map.of("message", "쪽지를 보냈습니다.");
    }

    // 쪽지 삭제
    @DeleteMapping("/{id}")
    public Map<String, String> deleteMessage(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal String userId) {
        messageService.deleteMessage(id, Long.parseLong(userId));
        return Map.of("message", "쪽지를 삭제했습니다.");
    }

    // 미읽음 개수
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal String userId) {
        Long count = messageService.countUnread(Long.parseLong(userId));
        return Map.of("count", count);
    }
}
