package com.example.alcohol_recommendation.board.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.board.dto.CommentRequest;
import com.example.alcohol_recommendation.board.dto.CommentResponse;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Comment;
import com.example.alcohol_recommendation.board.repository.BoardRepository;
import com.example.alcohol_recommendation.board.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/board/{boardId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // 댓글 목록
    @GetMapping
    public List<CommentResponse> getComments(@PathVariable("boardId") Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));
        return commentRepository.findByBoardOrderByCreatedAtAsc(board).stream().map(CommentResponse::new).toList();
    }
    
    // 댓글 등록
    @PostMapping
    public CommentResponse addComment(@PathVariable("boardId") Long boardId,
                                      @RequestBody CommentRequest request,
                                      Principal principal) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        if (request.getContent() == null || request.getContent().trim().isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "댓글 내용을 입력하세요.");

        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .author(user.getNickname())
                .board(board)
                .createdAt(LocalDateTime.now())
                .build();

        Comment saved = commentRepository.save(comment);
        return new CommentResponse(saved);
    }
    
    // (선택) 댓글 삭제
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable("boardId") Long boardId,
                              @PathVariable("commentId") Long commentId,
                              Principal principal) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 존재하지 않습니다."));

        Long loginUserSeq = Long.parseLong(principal.getName());
        if (!comment.getUser().getSeq().equals(loginUserSeq)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인만 삭제할 수 있습니다.");
        }

        commentRepository.delete(comment);
    }
}
