package com.example.fero.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@Service
public class EmailService implements IMailService{


    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public MimeMessage createMimeMessage(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // Alıcıyı, konuyu ve içeriği ayarlıyoruz
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            return mimeMessage;
        } catch (MessagingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public void sendEmail(String to, String subject, String content) {
        MimeMessage message = createMimeMessage(to, subject, content);

        if (message != null) {
            try {
                mailSender.send(message);
                System.out.println("E-posta başarıyla gönderildi!");
            } catch (Exception e) {
                e.printStackTrace();
                System.out.println("E-posta gönderimi başarısız!");
            }
        }
    }
}

