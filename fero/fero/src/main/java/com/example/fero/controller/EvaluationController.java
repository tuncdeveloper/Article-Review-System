package com.example.fero.controller;
import com.example.fero.dto.EvaluationDto;
import com.example.fero.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation")
public class EvaluationController {

    private final EvaluationService evaluationService;
    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @PostMapping("/save-evaluation")
    public ResponseEntity<EvaluationDto> saveEvaluation(@RequestBody EvaluationDto evaluationDto){
        return ResponseEntity.ok(evaluationService.saveEvaluation(evaluationDto));
    }

    @GetMapping("/article-comment/{articleId}")
    public ResponseEntity<List<EvaluationDto>> getEvaluationsByArticleId(@PathVariable Long articleId) {
        try {
            List<EvaluationDto> evaluations = evaluationService.getEvaluationsByArticleId(articleId);
            return ResponseEntity.ok(evaluations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/article-comment")
    public ResponseEntity<List<EvaluationDto>> getAllEvaluations() {
        try {
            List<EvaluationDto> evaluations = evaluationService.getAllEvaluations();
            return ResponseEntity.ok(evaluations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update-comment/{id}")
    public ResponseEntity<EvaluationDto> updateEvaluation(
            @PathVariable Long id,
            @RequestBody EvaluationDto evaluationDto) {
        try {
            EvaluationDto updatedEvaluation = evaluationService.updateEvaluation(id, evaluationDto);
            return ResponseEntity.ok(updatedEvaluation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


}
