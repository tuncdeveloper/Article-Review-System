package com.example.fero.service;

import com.example.fero.dto.ArticleDto;
import com.example.fero.dto.EvaluationDto;
import com.example.fero.dto.LogDto;
import com.example.fero.model.Article;
import com.example.fero.model.Evaluation;
import com.example.fero.model.Log;
import com.example.fero.repository.ArticleRepository;
import com.example.fero.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final ArticleRepository articleRepository;
    private final EmailService emailService;
    private final ArticleService articleService;
    private final EvaluationService evaluationService;

    @Autowired
    public LogService(LogRepository logRepository, ArticleRepository articleRepository, EmailService emailService, ArticleService articleService, EvaluationService evaluationService) {
        this.logRepository = logRepository;
        this.articleRepository = articleRepository;
        this.emailService = emailService;
        this.articleService = articleService;
        this.evaluationService = evaluationService;
    }

    public Log dtoToEntity(LogDto logDto) {
        if (logDto.getArticleId() == null) {
            throw new IllegalArgumentException("Article ID must not be null");
        }

        Log log = new Log();
        log.setId(logDto.getId());
        log.setTimestamp(logDto.getTimestamp() != null ? logDto.getTimestamp() : LocalDateTime.now());
        log.setAction(logDto.getAction());

        Optional<Article> optionalArticle = articleRepository.findById(logDto.getArticleId());

        Article article = optionalArticle.orElseThrow(() ->
                new RuntimeException("Article bulunamadı: " + logDto.getArticleId())
        );

        log.setArticle(article);

        return log;
    }

    public LogDto entityToDto(Log log) {
        LogDto logDto = new LogDto();

        logDto.setId(log.getId());
        logDto.setTimestamp(log.getTimestamp());
        logDto.setAction(log.getAction());
        logDto.setArticleId(log.getArticle().getId());

        return logDto;
    }

    public LogDto saveLog(LogDto logDto) {
        if (logDto == null) {
            throw new IllegalArgumentException("LogDto must not be null");
        }

        try {
            Log log = dtoToEntity(logDto);
            log = logRepository.save(log);
            return entityToDto(log);
        } catch (Exception e) {
            throw new RuntimeException("Log kaydedilirken hata oluştu: " + e.getMessage(), e);
        }
    }


}