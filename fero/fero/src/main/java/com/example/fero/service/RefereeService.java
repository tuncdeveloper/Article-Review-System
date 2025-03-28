package com.example.fero.service;

import com.example.fero.dto.RefereeDto;
import com.example.fero.model.Referee;
import com.example.fero.repository.RefereeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RefereeService {

    private final RefereeRepository refereeRepository;


    @Autowired
    public RefereeService(RefereeRepository refereeRepository) {
        this.refereeRepository = refereeRepository;

    }



    public Referee dtoToEntity(RefereeDto refereeDto) {
        if (refereeDto == null) {
            return null;
        }

        Optional<Referee> optionalReferee = refereeRepository.findById(refereeDto.getId());
        if (optionalReferee.isEmpty()) {
            return null;
        }

        Referee referee = optionalReferee.get();
        referee.setId(refereeDto.getId());
        referee.setName(refereeDto.getName());
        referee.setField(refereeDto.getField());


        return referee;
    }

    public RefereeDto entityToDto(Referee referee) {
        if (referee == null) {
            return null;
        }

        RefereeDto refereeDto = new RefereeDto();
        refereeDto.setId(referee.getId());
        refereeDto.setName(referee.getName());
        refereeDto.setField(referee.getField());

        return refereeDto;
    }



    public RefereeDto findById(Long id) {
        Referee referee = refereeRepository.findById(id).orElseThrow(()->new RuntimeException("not found article"));
        return entityToDto(referee);
    }



    public List<RefereeDto> getAllReferees() {
        return refereeRepository.findAll().stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }


    public RefereeDto getFindReferee(Long id) {
        Optional<Referee> refereeOptional = refereeRepository.findById(id);
        if (refereeOptional.isPresent()) {
            return entityToDto(refereeOptional.get());
        } else {
            throw new RuntimeException("Referee not found with id: " + id);
        }
    }


}