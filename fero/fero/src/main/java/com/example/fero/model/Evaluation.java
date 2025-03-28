package com.example.fero.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String evaluationText;
    private LocalDateTime evaluationDate;

    @ManyToOne
    @JoinColumn
    private Referee referee;

    @ManyToOne
    @JoinColumn
    private Article article;
}