package com.example.fero.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "article_id")
    private Article article;

    public Log(String action, LocalDateTime timestamp, Article article) {
        this.action = action;
        this.timestamp = timestamp;
        this.article = article;
    }

}