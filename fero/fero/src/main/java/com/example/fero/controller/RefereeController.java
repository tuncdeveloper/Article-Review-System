package com.example.fero.controller;

import com.example.fero.dto.RefereeDto;
import com.example.fero.service.RefereeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/referee")
public class RefereeController {

    private final RefereeService refereeService;
    public RefereeController(RefereeService refereeService) {
        this.refereeService = refereeService;
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<RefereeDto>> getAllReferee(){
        return ResponseEntity.ok(refereeService.getAllReferees());
    }

    @GetMapping("/get-referee/{id}")
    public ResponseEntity<RefereeDto> getFindReferee(@PathVariable Long id){
        return ResponseEntity.ok(refereeService.getFindReferee(id));
    }


}
