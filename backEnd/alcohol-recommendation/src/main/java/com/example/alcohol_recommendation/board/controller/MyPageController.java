package com.example.alcohol_recommendation.board.controller;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.alcohol_recommendation.auth.dto.UserResponse;
import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.auth.service.UserService;
import com.example.alcohol_recommendation.board.dto.BoardResponse;
import com.example.alcohol_recommendation.board.dto.CommentResponse;
import com.example.alcohol_recommendation.board.dto.PwChangeRequest;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.BoardLike;
import com.example.alcohol_recommendation.board.model.Comment;
import com.example.alcohol_recommendation.board.model.Scrap;
import com.example.alcohol_recommendation.board.repository.BoardLikeRepository;
import com.example.alcohol_recommendation.board.repository.BoardRepository;
import com.example.alcohol_recommendation.board.repository.CommentRepository;
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
    private final BoardLikeRepository boardLikeRepository;
    private final UserService userService;

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
    
    // 내 좋아요 정보
    @GetMapping("/myLikes")
    public List<BoardResponse> getMyLikes(Principal principal) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        List<BoardLike> likes = boardLikeRepository.findAllByUser(user);
        return likes.stream().map(like -> new BoardResponse(like.getBoard(), true)).toList();
    }
    
    // 회원정보 수정
    @PutMapping(value = "/myEdit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse updateMyNickname(Principal principal, @RequestPart("nickname") String nickname) {
        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        // 1. 닉네임 변경
        user.setNickname(nickname);
        userRepository.save(user);

        // 2. 본인이 쓴 모든 게시글의 author 닉네임도 일괄 변경
        List<Board> myBoards = boardRepository.findByUser(user);
        for (Board board : myBoards) {
            board.setAuthor(nickname);
        }
        boardRepository.saveAll(myBoards);

        // 3. 응답
        return new UserResponse(user);
    }
    
    // 비밀번호 수정
    @PostMapping("/myPwChange")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody PwChangeRequest req) {
        Long userSeq = Long.parseLong(principal.getName());
        userService.changePassword(userSeq, req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.ok(Collections.singletonMap("message", "비밀번호 변경 성공"));
    }
}
