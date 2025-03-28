package com.example.fero.repository;

import com.example.fero.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findByTrackingNumber(String trackingNumber);

    Optional<Article> findByEmail(String email);

    List<Article> findAllByStatus(String status);

    List<Article> findAllByRefereeId(Long refereeId);



}