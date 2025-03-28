package com.example.fero.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class ArticleDto {

    private Long id;
    private Long refereeId;
    private String trackingNumber;
    private String email;
    private String status;
    private LocalDateTime uploadDate;
    private String digitalSignature;
    private String content;
    private String censoredContent;
    private String contentNotCommentedContent;
    private String commentedContent;
    private String decryptedContent ;
    private String anonymizedContent;
    private boolean nameSurname;
    private boolean contactInformation;
    private boolean companyInformation;



}
