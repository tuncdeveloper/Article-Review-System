package com.example.fero.controller;

import com.example.fero.dto.ArticleDto;
import com.example.fero.model.Article;
import com.example.fero.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/article")
public class ArticleController {

    private final ArticleService articleService;

    @Autowired
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ArticleDto> uploadArticle(
                @RequestPart("email") String email,
                @RequestPart("file") byte[] file) {
            try {
                ArticleDto savedArticle = articleService.uploadArticle(email, file);
                return ResponseEntity.ok(savedArticle);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }




    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        try {
            articleService.deleteArticle(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/get-status/{status}")
    public ResponseEntity<List<ArticleDto>> getArticlesByStatus(@PathVariable String status) {
        List<ArticleDto> articleDtos = articleService.getArticlesByStatus(status);
        return new ResponseEntity<>(articleDtos, HttpStatus.OK);
    }



    @PutMapping("/assign-referee/{articleId}")
    public ResponseEntity<ArticleDto> assignRefereeForArticle(
            @PathVariable Long articleId,
            @RequestParam Long refereeId // Sadece refereeId al
    ) {
        ArticleDto updatedArticle = articleService.assignRefereeForArticle(articleId, refereeId);
        return ResponseEntity.ok(updatedArticle);
    }

    @PutMapping("/assign-censor/{articleId}")
    public ResponseEntity<ArticleDto> updateCensoredContent(
            @PathVariable Long articleId,
            @RequestBody ArticleDto articleDto) {
            ArticleDto updatedArticleDto = articleService.updateCensoredContent(articleId, articleDto);
            return ResponseEntity.ok(updatedArticleDto);
    }

    @PutMapping("/assign-censorCommented/{articleId}")
    public ResponseEntity<ArticleDto> updateCensoredCommentedContent(
            @PathVariable Long articleId,
            @RequestBody ArticleDto articleDto) {
        ArticleDto updatedArticleDto = articleService.updateCensoredCommentContent(articleId, articleDto);
        return ResponseEntity.ok(updatedArticleDto);
    }

    @PutMapping("/remove-referee/{id}")
    public ResponseEntity<ArticleDto> removeRefereeFromArticle(@PathVariable Long id) {
        try {
            ArticleDto updatedArticleDto = articleService.removeRefereeFromArticle(id);
            return ResponseEntity.ok(updatedArticleDto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/get-article-by-refereeId/{refereeId}")
    public ResponseEntity<List<ArticleDto>> getArticlesByReferee(@PathVariable Long refereeId) {
        List<ArticleDto> articleDtos = articleService.getAllArticlesByReferee(refereeId);
        return new ResponseEntity<>(articleDtos, HttpStatus.OK);
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<ArticleDto>> getAllArticles() {
        List<ArticleDto> articleDtos = articleService.getAllArticles();
        return new ResponseEntity<>(articleDtos, HttpStatus.OK);
    }

    @GetMapping(value = "/tracking/{trackingNumber}" )
    public ResponseEntity<ArticleDto> getArticleByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(articleService.getArticleByTrackingNumber(trackingNumber));
    }

    @GetMapping(value = "/get-article/{id}" )
    public ResponseEntity<Article> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Article> getArticleByEmail(@PathVariable String email) {
        Article article = articleService.getArticleByEmail(email);
        return article != null ? new ResponseEntity<>(article, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
