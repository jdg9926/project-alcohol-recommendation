package com.example.alcohol_recommendation.board.controller;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import com.example.alcohol_recommendation.auth.model.User;
import com.example.alcohol_recommendation.auth.repository.UserRepository;
import com.example.alcohol_recommendation.board.dto.BoardResponse;
import com.example.alcohol_recommendation.board.dto.PagedResponse;
import com.example.alcohol_recommendation.board.model.Board;
import com.example.alcohol_recommendation.board.model.BoardLike;
import com.example.alcohol_recommendation.board.model.Scrap;
import com.example.alcohol_recommendation.board.repository.BoardLikeRepository;
import com.example.alcohol_recommendation.board.repository.BoardRepository;
import com.example.alcohol_recommendation.board.repository.ScrapRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {
    private final BoardRepository boardRepository;
    private final BoardLikeRepository boardLikeRepository;
    private final UserRepository userRepository;
    private final ScrapRepository scrapRepository;
    
    @GetMapping("/list")
    public PagedResponse<BoardResponse> getBoardList(@RequestParam(name = "search", required = false) String search, Pageable pageable) {
        Page<BoardResponse> page;
        if (search != null && !search.trim().isEmpty()) {
            page = boardRepository
                    .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(search, search, pageable)
                    .map(BoardResponse::new);
        } else {
            page = boardRepository.findAll(pageable).map(BoardResponse::new);
        }
        return new PagedResponse<>(page);
    }
    
    // 단건 조회
    @GetMapping("/{id}")
    public BoardResponse getBoard(@PathVariable("id") Long id, Principal principal) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        boolean liked = false;
        boolean scrapped = false;

        if (principal != null) { // 로그인 했을 때만 체크
            Long userSeq = Long.parseLong(principal.getName());
            User user = userRepository.findById(userSeq)
                .orElse(null);
            if (user != null) {
                liked = boardLikeRepository.existsByBoardAndUser(board, user);
                scrapped = scrapRepository.existsByUserAndBoard(user, board);
            }
        }
        return new BoardResponse(board, liked, scrapped);
    }

    // 등록(글쓰기)
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Board createBoard(Principal principal,
							 @RequestPart("title") String title,
							 @RequestPart("content") String content,
							 @RequestPart("author") String author,
							 @RequestPart(value = "files", required = false) List<MultipartFile> files) {
    	
	    if (title == null || title.trim().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
	    }
	    if (content == null || content.trim().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내용은 필수입니다.");
	    }
	    
	    System.out.println("principal :::" + principal);

	    Board board = new Board();
	    board.setTitle(title);
	    board.setContent(content);
	    board.setCreatedAt(LocalDateTime.now());
	    
	    if (principal != null) {
	        Long userSeq = Long.parseLong(principal.getName());
	        User user = userRepository.findById(userSeq)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보 오류"));
	        board.setUser(user);
	        board.setAuthor(user.getNickname());
	    } else {
	        board.setAuthor(author);
	    }

	    // 파일 저장
	    if (files != null && !files.isEmpty()) {
	    	String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
	        try {
	            Files.createDirectories(Paths.get(uploadDir)); // 폴더 생성(최초 1회만)
	            for (MultipartFile file : files) {
	                if (!file.isEmpty()) {
	                    String originalFilename = file.getOriginalFilename();
	                    String ext = "";
	                    if (originalFilename != null && originalFilename.contains(".")) {
	                        ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
	                    }
	                    String saveFilename = UUID.randomUUID().toString() + ext;
	                    Path savePath = Paths.get(uploadDir, saveFilename);
	                    file.transferTo(savePath.toFile());
	                    board.addFile(saveFilename, originalFilename);
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
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BoardResponse updateBoard(
    		Principal principal,
            @PathVariable("id") Long id,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestParam(value = "remainFiles", required = false) List<String> remainFiles,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {


        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        if (title == null || title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내용은 필수입니다.");
        }
        
    	System.out.println("principal.getName() = " + principal.getName());
    	System.out.println("board.getUser().getSeq() = " + board.getUser().getSeq());
        
        Long loginUserSeq = Long.parseLong(principal.getName());
        if (!board.getUser().getSeq().equals(loginUserSeq)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인만 수정할 수 있습니다.");
        }

        board.setTitle(title);
        board.setContent(content);

        // === 첨부파일 관리 ===

        // 1. 실제로 삭제할 파일 찾아서 서버에서 삭제
        List<String> oldFileNames = board.getFileNames();
        if (oldFileNames != null) {
            for (String oldFile : oldFileNames) {
                if (remainFiles == null || !remainFiles.contains(oldFile)) {
                    Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", oldFile);
                    try {
                        Files.deleteIfExists(filePath);
                    } catch (IOException e) {
                        // 삭제 실패해도 저장은 계속 진행 (로그만 남김)
                        e.printStackTrace();
                    }
                }
            }
        }

        // 2. 남길 기존 파일(remainFiles)로 fileNames/originFileNames 갱신
        List<String> newFileNames = new ArrayList<>();
        List<String> newOriginFileNames = new ArrayList<>();
        if (remainFiles != null) {
            for (String fileName : remainFiles) {
                int idx = board.getFileNames().indexOf(fileName);
                if (idx >= 0) {
                    newFileNames.add(fileName);
                    newOriginFileNames.add(board.getOriginFileNames().get(idx));
                }
            }
        }

        // 3. 새로 추가된 파일 저장 & 파일명, 원본명 추가
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
        try {
            Files.createDirectories(Paths.get(uploadDir));
            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String originalFilename = file.getOriginalFilename();
                        String ext = "";
                        if (originalFilename != null && originalFilename.contains(".")) {
                            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
                        }
                        String saveFilename = UUID.randomUUID().toString() + ext;
                        Path savePath = Paths.get(uploadDir, saveFilename);
                        file.transferTo(savePath.toFile());
                        newFileNames.add(saveFilename);
                        newOriginFileNames.add(originalFilename);
                    }
                }
            }
            board.setFiles(newFileNames, newOriginFileNames);
        } catch (IOException e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장 실패", e);
        }
        boardRepository.save(board);
        return new BoardResponse(board);
    }
    
    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoard(@PathVariable("id") Long id, Principal principal) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 게시글 번호입니다.");
        }

        // 게시글 가져오기
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        // 본인 여부 체크: user PK로!
        Long loginUserSeq = Long.parseLong(principal.getName());
        if (!board.getUser().getSeq().equals(loginUserSeq)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인만 삭제할 수 있습니다.");
        }

        boardRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileName") String fileName,
    											 @RequestParam(value = "originName", required = false) String originName) {
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
        Path filePath = Paths.get(uploadDir, fileName);

        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일이 존재하지 않습니다.");
        }

        Resource resource = new FileSystemResource(filePath);
        String downloadName = (originName != null && !originName.isBlank()) ? originName : fileName;
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + UriUtils.encode(downloadName, StandardCharsets.UTF_8) + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }
    
    // 좋아요 API
    @PostMapping("/{id}/like")
    public BoardResponse likeBoard(@PathVariable("id") Long id, Principal principal) {
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        // 이미 좋아요 눌렀는지 확인
        Optional<BoardLike> existingLike = boardLikeRepository.findByBoardAndUser(board, user);

        boolean liked;
        if (existingLike.isPresent()) {
            // 이미 누른 상태면 → 좋아요 취소
            boardLikeRepository.delete(existingLike.get());
            board.setLikeCount(Math.max(0, board.getLikeCount() - 1));
            liked = false;
        } else {
            // 아직 안 눌렀으면 → 좋아요 등록
            BoardLike like = new BoardLike();
            like.setBoard(board);
            like.setUser(user);
            boardLikeRepository.save(like);

            board.setLikeCount(board.getLikeCount() + 1);
            liked = true;
        }
        boardRepository.save(board);

        return new BoardResponse(board, liked);
    }
    
    @PostMapping("/{id}/scrap")
    public BoardResponse scrapBoard(@PathVariable("id") Long id, Principal principal) {
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 존재하지 않습니다."));

        Long userSeq = Long.parseLong(principal.getName());
        User user = userRepository.findById(userSeq)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        // 이미 스크랩했는지 확인
        Optional<Scrap> existingScrap = scrapRepository.findByUserAndBoard(user, board);

        Scrap scrap = null;
        if (existingScrap.isPresent()) {
            // 이미 스크랩 → 취소
            scrapRepository.delete(existingScrap.get());
        } else {
            // 아직 안 했으면 → 등록
            scrap = new Scrap();
            scrap.setBoard(board);
            scrap.setUser(user);
            scrap.setCreatedAt(LocalDateTime.now());
            scrapRepository.save(scrap);
        }

        return new BoardResponse(board, scrap);
    }
}
