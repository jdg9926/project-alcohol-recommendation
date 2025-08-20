package com.example.alcohol_recommendation.board.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.BoardType;
import com.example.alcohol_recommendation.board.repository.BoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;

    // boardType별 게시글 목록 조회
    public List<Board> getBoards(String boardType) {
        if (boardType == null || boardType.equalsIgnoreCase("ALL")) {
            // 전체게시판: 모든 게시글
            return boardRepository.findAll();
        } else {
            BoardType type = BoardType.valueOf(boardType.toUpperCase());
            return boardRepository.findByBoardType(type);
        }
    }

    // boardType + 키워드 검색 (페이징)
    public Page<Board> searchBoards(String boardType, String keyword, Pageable pageable) {
        if (boardType == null || boardType.equalsIgnoreCase("ALL")) {
            // 전체에서 검색
            return boardRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            BoardType type = BoardType.valueOf(boardType.toUpperCase());
            // or 조건에는 boardType을 각각 써야 함!
            return boardRepository.findByBoardTypeAndTitleContainingIgnoreCaseOrBoardTypeAndAuthorContainingIgnoreCase(
                type, keyword, type, keyword, pageable
            );
        }
    }
}
