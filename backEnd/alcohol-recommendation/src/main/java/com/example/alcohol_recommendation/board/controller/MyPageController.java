package com.example.alcohol_recommendation.board.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.board.dto.BoardResponse;
import com.example.alcohol_recommendation.board.dto.CommentResponse;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Comment;
import com.example.alcohol_recommendation.board.model.Like;
import com.example.alcohol_recommendation.board.model.Scrap;
import com.example.alcohol_recommendation.board.repository.BoardRepository;
import com.example.alcohol_recommendation.board.repository.CommentRepository;
import com.example.alcohol_recommendation.board.repository.LikeRepository;
import com.example.alcohol_recommendation.board.repository.ScrapRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/myPage")
@RequiredArgsConstructor
public class MyPageController {
    private final UserRepository userRepository;
    private final ScrapRepository scrapRepository;
    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    
    // 내 글 목록 조회
    @GetMapping("/myPosts")
    public List<BoardResponse> getMyPosts(Principal principal) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        List<Board> boards = boardRepository.findAllByUser(user);
        return boards.stream().map(board -> new BoardResponse(board, null)).toList();
    }
    
    // 내 스크랩 정보
    @GetMapping("/myScrap")
    public List<BoardResponse> getMyScrap(Principal principal) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new RuntimeException("사용자를  찾을 수 없습니다."));
        List<Scrap> scraps = scrapRepository.findAllByUser(user);
        return scraps.stream().map(scrap -> new BoardResponse(scrap.getBoard(), scrap)).toList();
    }
    
    // 내 댓글 정보
    @GetMapping("/myComments")
    public List<CommentResponse> getMyComments(Principal principal) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        List<Comment> comments = commentRepository.findAllByUserOrderByCreatedAtDesc(user);

        return comments.stream()
            .map(CommentResponse::new)
            .toList();
    }
    
    @GetMapping("/myLikes")
    public List<BoardResponse> getMyLikes(Principal principal) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        List<Like> likes = likeRepository.findAllByUser(user);

        // 좋아요한 Board만 추출
        return likes.stream().map(like -> new BoardResponse(like.getBoard(), true)).toList();
    }
}
