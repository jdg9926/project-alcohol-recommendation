package com.example.alcohol_recommendation.board.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.BoardType;

public interface BoardRepository extends JpaRepository<Board, Long> {
    // boardType + 제목/작성자 검색 (페이징)
    Page<Board> findByBoardTypeAndTitleContainingIgnoreCaseOrBoardTypeAndAuthorContainingIgnoreCase(
        BoardType boardType1, String title, BoardType boardType2, String author, Pageable pageable);

    // boardType별 전체 목록
    List<Board> findByBoardType(BoardType boardType);

    // boardType + user
    List<Board> findByBoardTypeAndUser(BoardType boardType, User user);

    // 기존 메소드도 계속 사용 가능
    Page<Board> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author, Pageable pageable);
    List<Board> findAllByUser(User user);
    List<Board> findByUser(User user);
    
    Page<Board> findByBoardType(BoardType boardType, Pageable pageable);
}