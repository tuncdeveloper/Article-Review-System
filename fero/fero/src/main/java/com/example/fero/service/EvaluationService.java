package com.example.fero.service;

import com.example.fero.dto.EvaluationDto;
import com.example.fero.model.Article;
import com.example.fero.model.Evaluation;
import com.example.fero.model.Referee;
import com.example.fero.repository.ArticleRepository;
import com.example.fero.repository.EvaluationRepository;
import com.example.fero.repository.RefereeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ArticleRepository articleRepository;
    private final RefereeRepository refereeRepository;

    public EvaluationService(EvaluationRepository evaluationRepository, ArticleRepository articleRepository, RefereeRepository refereeRepository) {
        this.evaluationRepository = evaluationRepository;
        this.articleRepository = articleRepository;
        this.refereeRepository = refereeRepository;
    }


    public Evaluation dtoToEntity(EvaluationDto evaluationDto) {
        if (evaluationDto == null) {
            throw new IllegalArgumentException("EvaluationDto cannot be null");
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setId(evaluationDto.getId());
        evaluation.setEvaluationText(evaluationDto.getEvaluationText());
        evaluation.setEvaluationDate(LocalDateTime.now());

        if (evaluationDto.getArticleId() == null) {
            throw new IllegalArgumentException("Article ID cannot be null");
        }
        Optional<Article> optionalArticle = articleRepository.findById(evaluationDto.getArticleId());
        Article article = optionalArticle.orElseThrow(() -> new IllegalArgumentException("Article not found with ID: " + evaluationDto.getArticleId()));
        evaluation.setArticle(article);

        if (evaluationDto.getRefereeId() == null) {
            throw new IllegalArgumentException("Referee ID cannot be null");
        }
        Optional<Referee> optionalReferee = refereeRepository.findById(evaluationDto.getRefereeId());
        Referee referee = optionalReferee.orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + evaluationDto.getRefereeId()));
        evaluation.setReferee(referee);

        return evaluation;
    }



    private EvaluationDto entityToDto(Evaluation evaluation) {
        EvaluationDto dto = new EvaluationDto();
        dto.setId(evaluation.getId());
        dto.setEvaluationText(evaluation.getEvaluationText());
        dto.setEvaluationDate(evaluation.getEvaluationDate());

        if (evaluation.getReferee() != null) {
            dto.setRefereeId(evaluation.getReferee().getId());
            dto.setRefereeName(evaluation.getReferee().getName());
        }

        if (evaluation.getArticle() != null) {
            dto.setArticleId(evaluation.getArticle().getId());
            dto.setTrackingNumber(evaluation.getArticle().getTrackingNumber());
            dto.setAuthorEmail(evaluation.getArticle().getEmail());
        }

        return dto;
    }

    @Transactional
    public EvaluationDto updateEvaluation(Long id, EvaluationDto evaluationDto) {
        if (id == null || evaluationDto == null) {
            throw new IllegalArgumentException("ID and EvaluationDto cannot be null");
        }

        Evaluation existingEvaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with ID: " + id));

        existingEvaluation.setEvaluationText(evaluationDto.getEvaluationText());
        existingEvaluation.setEvaluationDate(LocalDateTime.now()); // Update the evaluation date

        if (evaluationDto.getArticleId() != null && !evaluationDto.getArticleId().equals(existingEvaluation.getArticle().getId())) {
            Optional<Article> optionalArticle = articleRepository.findById(evaluationDto.getArticleId());
            Article article = optionalArticle.orElseThrow(() -> new IllegalArgumentException("Article not found with ID: " + evaluationDto.getArticleId()));
            existingEvaluation.setArticle(article);
        }

        if (evaluationDto.getRefereeId() != null && !evaluationDto.getRefereeId().equals(existingEvaluation.getReferee().getId())) {
            Optional<Referee> optionalReferee = refereeRepository.findById(evaluationDto.getRefereeId());
            Referee referee = optionalReferee.orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + evaluationDto.getRefereeId()));
            existingEvaluation.setReferee(referee);
        }

        Evaluation updatedEvaluation = evaluationRepository.save(existingEvaluation);

        return entityToDto(updatedEvaluation);
    }



    public EvaluationDto getEvaluationByArticleId(Long articleId) {
        if (articleId == null) {
            throw new IllegalArgumentException("Article ID cannot be null");
        }
        Evaluation evaluation = evaluationRepository.findByArticleId(articleId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found for article ID: " + articleId));

        return entityToDto(evaluation);
    }

    @Transactional
    public List<EvaluationDto> getEvaluationsByArticleId(Long articleId) {
        if (articleId == null) {
            throw new IllegalArgumentException("Article ID cannot be null");
        }

        List<Evaluation> evaluations = evaluationRepository.findAllByArticleId(articleId);

        if (evaluations.isEmpty()) {
            throw new RuntimeException("No evaluations found for article ID: " + articleId);
        }
        return evaluations.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }





    public EvaluationDto saveEvaluation(EvaluationDto evaluationDto) {
        if (evaluationDto == null) {
            throw new IllegalArgumentException("EvaluationDto cannot be null");
        }
        Evaluation evaluation = dtoToEntity(evaluationDto);

        if (evaluation.getEvaluationDate() == null) {
            evaluation.setEvaluationDate(LocalDateTime.now());
        }

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return entityToDto(savedEvaluation);
    }


    public EvaluationDto getEvaluationById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Evaluation ID cannot be null");
        }

        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with ID: " + id));

        return entityToDto(evaluation);
    }


    public List<EvaluationDto> getAllEvaluations() {
        List<Evaluation> evaluations = evaluationRepository.findAll();
        return evaluations.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public void deleteEvaluationById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Evaluation ID cannot be null");
        }

        evaluationRepository.deleteById(id);
    }





}