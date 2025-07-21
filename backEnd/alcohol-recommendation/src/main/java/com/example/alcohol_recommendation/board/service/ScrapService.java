package com.example.alcohol_recommendation.board.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.Scrap;
import com.example.alcohol_recommendation.board.repository.BoardRepository;
import com.example.alcohol_recommendation.board.repository.ScrapRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScrapService {
    private final ScrapRepository scrapRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;

    // 스크랩 토글 기능, 이미 스크랩되어 있으면 삭제, 아니면 새로 저장.
    @Transactional
    public boolean toggleScrap(Long userId, Long boardId) {
        // User와 Board 엔티티 객체를 조회(또는 프록시 생성)
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("유저가 존재하지 않습니다."));
        Board board = boardRepository.findById(boardId)
                        .orElseThrow(() -> new RuntimeException("게시판이 존재하지 않습니다."));

        // Scrap 엔티티는 user와 board 객체로 조회
        return scrapRepository.findByUserAndBoard(user, board)
            .map(scrap -> {
                scrapRepository.delete(scrap);
                return false;
            })
            .orElseGet(() -> {
                Scrap newScrap = Scrap.builder()
                    .user(user)
                    .board(board)
                    .build();
                scrapRepository.save(newScrap);
                return true;
            });
    }

    // 게시글에 대한 총 스크랩 개수 조회
    public int getScrapCount(Long boardId) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new RuntimeException("Board not found"));

        return scrapRepository.countByBoard(board);
    }

    // 사용자가 해당 게시글을 스크랩했는지 여부 조회
    public boolean isScrapped(Long userId, Long boardId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new RuntimeException("Board not found"));

        return scrapRepository.findByUserAndBoard(user, board).isPresent();
    }
    
    @Transactional(readOnly = true)
    public List<Board> getScrapBoardsByUser(User user) {
        return scrapRepository.findAllByUser(user).stream().map(Scrap::getBoard).toList();
    }
}
