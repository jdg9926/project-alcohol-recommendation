package com.example.alcohol_recommendation.board.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
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
    	System.out.println("들어오니 ?");
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
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Board createBoard(@RequestPart("title") String title,
							 @RequestPart("content") String content,
							 @RequestPart("author") String author,
							 @RequestPart(value = "files", required = false) List<MultipartFile> files) {
    	
	    if (title == null || title.trim().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
	    }
	    if (content == null || content.trim().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내용은 필수입니다.");
	    }

	    Board board = new Board();
	    board.setTitle(title);
	    board.setContent(content);
	    board.setAuthor(author);
	    board.setCreatedAt(LocalDateTime.now());


	    // 파일 저장
	    if (files != null && !files.isEmpty()) {
	        String uploadDir = "uploads/";
	        try {
	            Files.createDirectories(Paths.get(uploadDir)); // 폴더 생성(최초 1회만)
	            for (MultipartFile file : files) {
	                if (!file.isEmpty()) {
	                    String originalFilename = file.getOriginalFilename();
	                    String saveFilename = System.currentTimeMillis() + "_" + originalFilename;
	                    Path savePath = Paths.get(uploadDir, saveFilename);
	                    file.transferTo(savePath.toFile());
	                    board.addFileName(saveFilename);
	                }
	            }
	        } catch (IOException e) {
	        	e.printStackTrace();
	            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장 실패", e);
	        }
	    }
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
