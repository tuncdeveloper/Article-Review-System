    package com.example.fero.dto;

    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.LocalDateTime;

    @Data
    @NoArgsConstructor
    public class LogDto {
        private Long id;
        private String action;
        private LocalDateTime timestamp;
        private Long articleId;
    }
