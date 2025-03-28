package com.example.fero.controller;
import com.example.fero.dto.LogDto;
import com.example.fero.model.Article;
import com.example.fero.service.ArticleService;
import com.example.fero.service.EmailService;
import com.example.fero.service.LogService;
import com.sun.istack.NotNull;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
public class LogController {

    private final LogService logService;
    private final EmailService emailService;
    private final ArticleService articleService;

    public LogController(LogService logService, EmailService emailService, ArticleService articleService) {
        this.logService = logService;
        this.emailService = emailService;
        this.articleService = articleService;
    }

    @PostMapping("/save-log")
    public ResponseEntity<LogDto> saveLog(@RequestBody LogDto logDto){
        return ResponseEntity.ok(logService.saveLog(logDto));
    }

    @PostMapping("/save-bildirim")
    public ResponseEntity<ApiResponse> sendReviewNotification(
            @RequestBody NotificationRequest request) {

        try {
            Article article = articleService.getArticleById(request.getArticleId());
            if (article == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Makale bulunamadı"));
            }

            String subject = request.getCustomSubject() != null ?
                    request.getCustomSubject() : "Makaleniz Değerlendirildi";

            String content = buildEmailContent(article, request);
            emailService.sendEmail(article.getEmail(), subject, content);



            return ResponseEntity.ok()
                    .body(new ApiResponse(true, "Bildirim e-postası başarıyla gönderildi"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "Makale bulunamadı"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Bildirim gönderilemedi: " + e.getMessage()));
        }
    }

    private String buildEmailContent(Article article, NotificationRequest request) {
        if (Boolean.TRUE.equals(request.getIsHtml())) {
            return String.format("""
            <html>
                <body>
                    <h2>Makale Değerlendirme Bildirimi</h2>
                    <p><strong>Makale ID:</strong> %d</p>
                    <hr>
                    <h3>Hakem Yorumu:</h3>
                    <p>%s</p>
                    %s
                    <hr>
                    <footer>Sistem Bildirimi</footer>
                </body>
            </html>
            """,
                    article.getId(),
                    request.getComment(),
                    request.getAdditionalInfo() != null ?
                            "<h3>Ek Bilgiler:</h3><p>" + request.getAdditionalInfo() + "</p>" : "");
        } else {
            return String.format("""
            Makale Değerlendirme Bildirimi
                
            Makale ID: %d
                
            Hakem Yorumu:
            %s
            %s
                
            Sistem Bildirimi
            """,
                    article.getId(),
                    request.getComment(),
                    request.getAdditionalInfo() != null ?
                            "\nEk Bilgiler:\n" + request.getAdditionalInfo() + "\n" : "");
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationRequest {
        @NotNull
        private Long articleId;

        private String comment;

        private String customSubject;
        private Boolean isHtml;
        private String additionalInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiResponse {
        private boolean success;
        private String message;
    }
}
