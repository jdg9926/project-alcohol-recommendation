package com.example.alcohol_recommendation.message.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.message.dto.MessageDetailDto;
import com.example.alcohol_recommendation.message.dto.MessageListDto;
import com.example.alcohol_recommendation.message.dto.MessageSendRequest;
import com.example.alcohol_recommendation.message.model.Message;
import com.example.alcohol_recommendation.message.repository.MessageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    // 받은 쪽지함
    public List<MessageListDto> getInbox(Long userSeq) {
        return messageRepository.findInbox(userSeq)
                .stream()
                .map(m -> new MessageListDto(m, true))
                .collect(Collectors.toList());
    }

    // 보낸 쪽지함
    public List<MessageListDto> getSent(Long userSeq) {
        return messageRepository.findSent(userSeq)
                .stream()
                .map(m -> new MessageListDto(m, false))
                .collect(Collectors.toList());
    }

    // 쪽지 상세 보기
    @Transactional
    public MessageDetailDto getMessage(Long messageId, Long userSeq) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("쪽지를 찾을 수 없습니다."));

        if (message.getReceiver().getSeq().equals(userSeq) && !message.isReadFlag()) {
            message.setReadFlag(true);
        }
        return new MessageDetailDto(message);
    }

    // 쪽지 보내기
    public void sendMessage(Long senderSeq, MessageSendRequest request) {
        User sender = userRepository.findById(senderSeq)
                .orElseThrow(() -> new RuntimeException("보내는 사용자를 찾을 수 없습니다."));
        User receiver = userRepository.findByUserId(request.getReceiverUserId())
                .orElseThrow(() -> new RuntimeException("받는 사용자를 찾을 수 없습니다."));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        messageRepository.save(message);
    }

    // 쪽지 삭제
    @Transactional
    public void deleteMessage(Long messageId, Long userSeq) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("쪽지를 찾을 수 없습니다."));

        if (message.getSender().getSeq().equals(userSeq)) {
            message.setDeletedBySender(true);
        }
        if (message.getReceiver().getSeq().equals(userSeq)) {
            message.setDeletedByReceiver(true);
        }

        if (message.isDeletedBySender() && message.isDeletedByReceiver()) {
            messageRepository.delete(message);
        }
    }

    // 미읽음 개수
    public Long countUnread(Long userSeq) {
        return messageRepository.countUnread(userSeq);
    }
}
