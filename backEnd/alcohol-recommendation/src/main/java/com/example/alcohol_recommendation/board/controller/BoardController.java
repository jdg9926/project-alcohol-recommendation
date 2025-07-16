package com.example.alcohol_recommendation.board.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.repository.BoardRepository;

@RestController
@RequestMapping("/api/board")
public class BoardController {
    private final BoardRepository boardRepository;

    public BoardController(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @GetMapping("/list")
    public Page<Board> getBoardList(@RequestParam(name = "search", required = false) String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            // 제목 또는 작성자에 search가 포함된 글만
            return boardRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(search, search, pageable);
        } else {
            return boardRepository.findAll(pageable);
        }
    }
    
    // 단건 조회
    @GetMapping("/{id}")
    public Board getBoard(@PathVariable("id") Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));
    }
    
    // 등록
    @PostMapping("/write")
    public Board createBoard(@RequestBody Board board) {
        // 제목, 내용, 작성자 등 필수값 체크
        if (board.getTitle() == null || board.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
        }
        if (board.getContent() == null || board.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내용은 필수입니다.");
        }
        
        // 날짜 자동 생성
        board.setCreatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }
    
    // 수정
    @PutMapping("/{id}")
    public Board updateBoard(@PathVariable("id") Long id, @RequestBody Board update) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        if (update.getTitle() == null || update.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
        }
        if (update.getContent() == null || update.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내용은 필수입니다.");
        }
        board.setTitle(update.getTitle());
        board.setContent(update.getContent());

        return boardRepository.save(board);
    }
    
    // 삭제
    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable("id") Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }
        if (!boardRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다.");
        }
        boardRepository.deleteById(id);
    }
}
