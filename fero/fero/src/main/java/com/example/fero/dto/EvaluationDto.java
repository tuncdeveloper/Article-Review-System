package com.example.fero.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class EvaluationDto {

    private Long id;

    private String evaluationText;
    private String anonymizationCategory;
    private LocalDateTime evaluationDate;
    private Long refereeId;
    private Long articleId;

        private String refereeName;

        private String trackingNumber;
        private String authorEmail;

}
