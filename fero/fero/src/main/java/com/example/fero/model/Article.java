package com.example.fero.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "email")
    private String email;

    @ManyToOne
    @JoinColumn()
    private Referee referee;

    @Column(name = "status")
    private String status;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @Lob
    @Column(name = "content" )
    private byte[] content;


    @Lob
    @Column(name = "censored_content")
    private byte[] censoredContent;



    @Lob
    @Column(name = "commented" )
    private byte[] commentedContent;



}
