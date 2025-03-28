package com.example.fero.repository;

import com.example.fero.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByArticleId(Long articleId);
    Optional<Evaluation> findByRefereeId(Long refereeId);

    List<Evaluation> findAllByArticleId(Long articleId);
}