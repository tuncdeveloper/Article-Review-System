package com.example.fero.service;

import com.example.fero.config.PDFBlurUtil;
import com.example.fero.dto.ArticleDto;
import com.example.fero.dto.RefereeDto;
import com.example.fero.model.Article;
import com.example.fero.model.Evaluation;
import com.example.fero.model.Referee;
import com.example.fero.repository.ArticleRepository;
import com.example.fero.util.Crypto;
import jakarta.transaction.Transactional;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.bouncycastle.crypto.CryptoException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final RefereeService refereeService;
    private final IMailService emailService;

    private final AnonymizationService anonymizationService;




    public ArticleService(ArticleRepository articleRepository, RefereeService refereeService, IMailService emailService,AnonymizationService anonymizationService) {
        this.articleRepository = articleRepository;
        this.refereeService = refereeService;
        this.emailService = emailService;
        this.anonymizationService = anonymizationService;
    }

    public ArticleDto uploadArticle(String email, byte[] file) {
        if (file == null) {
            throw new IllegalArgumentException("Dosya bulunamadı veya boş.");
        }

        byte[] encryptedContent = Crypto.encrypt(file);

        String textContent = new String(file); // Bu kısım dosya türüne göre değişebilir

        // String anonymizedText = anonymizationService.anonymizeText(textContent);

        // Yeni makale nesnesi oluştur
        Article article = new Article();
        article.setEmail(email);
        article.setStatus("Beklemede");
        article.setUploadDate(LocalDateTime.now());
        article.setContent(encryptedContent); // Şifrelenmiş içeriği kaydet
        //article.setAnonymizedContent(anonymizedText); // Anonimleştirilmiş metni kaydet

        Article savedArticle = articleRepository.save(article);
        savedArticle.setTrackingNumber("TRK" + savedArticle.getId());
        savedArticle = articleRepository.save(savedArticle);

         sendArticleUploadEmail(savedArticle);

        return entityToDto(savedArticle);
    }


    private void sendArticleUploadEmail(Article article) {
        String subject = "Makaleniz Başarıyla Yüklendi";
        String text = String.format("Sayın %s,\n\nMakaleniz başarıyla yüklenmiştir. Takip numaranız: %s\n\nTeşekkür ederiz.",
                article.getEmail(), article.getTrackingNumber());

        emailService.sendEmail(article.getEmail(), subject, text);
    }



    public ArticleDto entityToDto(Article article) {
        if (article == null) return null;

        ArticleDto articleDto = new ArticleDto();
        articleDto.setId(article.getId());
        articleDto.setTrackingNumber(article.getTrackingNumber());
        articleDto.setEmail(article.getEmail());
        articleDto.setStatus(article.getStatus());
        articleDto.setUploadDate(article.getUploadDate());

        setDecryptedContent(article, articleDto);

        return articleDto;
    }



//    public Article dtoToEntity(ArticleDto articleDto){
//        if (articleDto == null) return null;
//        Article article = new Article();
//
//        article.setId(articleDto.getId());
//        article.setTrackingNumber(articleDto.getTrackingNumber());
//        article.setEmail(articleDto.getEmail());
//        article.setStatus(articleDto.getStatus());
//        article.setUploadDate(articleDto.getUploadDate());
//        article.setAnonymizedContent(articleDto.getAnonymizedContent());
//
//        // İçerikleri çöz ve Base64 formatında ayarla
//        setDecryptedContent(article, articleDto);
//
//        return article;
//
//    }

    private void setDecryptedContent(Article article, ArticleDto articleDto) {
        articleDto.setContent(decryptContent(article.getContent()));
        articleDto.setCensoredContent(decryptContent(article.getCensoredContent()));
        articleDto.setCommentedContent(decryptContent(article.getCommentedContent()));
        articleDto.setDecryptedContent(decryptContent(article.getContent())); // DecryptedContent de aynı içerikle işlem yapılacaksa
    }

    private String decryptContent(byte[] content) {
        if (content != null) {
            String encryptedBase64 = Base64.getEncoder().encodeToString(content);
            byte[] decryptedContent = Crypto.decrypt(encryptedBase64);
            return Base64.getEncoder().encodeToString(decryptedContent);
        }
        return null;
    }

    @Transactional
    public List<ArticleDto> getAllArticles() {
        return articleRepository.findAll().stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ArticleDto> getAllArticlesByReferee(Long refereeId) {
        return articleRepository.findAllByRefereeId(refereeId).stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArticleDto updateCensoredContent(Long articleId, ArticleDto articleDto) {
        try {
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Makale bulunamadı: " + articleId));

            byte[] decryptedContent = decryptArticleContent(article.getContent());

            String textContent = extractAndAnonymizeText(decryptedContent, articleDto);

            byte[] censoredPdf = processPdfCensoring(decryptedContent, textContent);

            persistCensoredContent(article, censoredPdf, textContent);

            return entityToDto(articleRepository.save(article));

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "PDF işleme hatası: " + e.getMessage(),
                    e);
        } catch (CryptoException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Şifreleme hatası: " + e.getMessage(),
                    e);
        }
    }

    @Transactional
    public ArticleDto updateCensoredCommentContent(Long articleId, ArticleDto articleDto) {
        try {
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Makale bulunamadı: " + articleId));

            byte[] encryptedCensoredContent = article.getCensoredContent();
            if (encryptedCensoredContent == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Sansürlenmiş içerik bulunamadı!");
            }

            byte[] decryptedCensoredContent = Crypto.decrypt(
                    Base64.getEncoder().encodeToString(encryptedCensoredContent)
            );

            String comment = "HAKEM DEĞERLENDİRMESİ\n\n" +
                    articleDto.getCommentedContent() + "\n\n" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));

            byte[] commentedPdf = addBlankPageAndComment(decryptedCensoredContent, comment);

            byte[] encryptedCommentedContent = Crypto.encrypt(commentedPdf);
            article.setCommentedContent(encryptedCommentedContent);
            article.setStatus("Yorumlanmış");

            Article updatedArticle = articleRepository.save(article);
            return entityToDto(updatedArticle);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "PDF işleme hatası: " + e.getMessage(),
                    e);
        }
    }

    private byte[] addBlankPageAndComment(byte[] originalPdf, String comment) throws IOException {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(originalPdf))) {
            PDPage blankPage = new PDPage();
            document.addPage(blankPage);

            PDPage commentPage = new PDPage();
            document.addPage(commentPage);

            PDType0Font font;
            try (InputStream fontStream = PDFBlurUtil.class.getClassLoader()
                    .getResourceAsStream("unifont-16.0.02.ttf")) {
                if (fontStream == null) {
                    throw new IOException("Font dosyası bulunamadı: unifont-16.0.02.ttf");
                }
                font = PDType0Font.load(document, fontStream);
            }

            try (PDPageContentStream stream = new PDPageContentStream(
                    document,
                    commentPage,
                    PDPageContentStream.AppendMode.APPEND,
                    true,
                    true)) {

                stream.setFont(font, 12);
                stream.beginText();

                float startX = 50;
                float startY = commentPage.getMediaBox().getHeight() - 50;
                stream.newLineAtOffset(startX, startY);

                String[] lines = comment.split("\n");
                float lineHeight = 15;
                for (String line : lines) {
                    stream.showText(line);
                    if (!line.equals(lines[lines.length - 1])) {
                        stream.newLineAtOffset(0, -lineHeight);
                    }
                }

                stream.endText();
            }

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            return output.toByteArray();
        }
    }

    public ArticleDto assignRefereeForArticle(Long articleId, Long refereeId) {
        Article updatedArticle = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Makale bulunamadı: " + articleId));

        RefereeDto refereeDto = refereeService.findById(refereeId);
        Referee referee = refereeService.dtoToEntity(refereeDto);
        updatedArticle.setReferee(referee);

        updatedArticle.setStatus("İnceleniyor");
        Article savedArticle = articleRepository.save(updatedArticle);
        sendRefereeAssignedEmail(savedArticle);

        return entityToDto(savedArticle);
    }


    private byte[] decryptArticleContent(byte[] encryptedContent) throws CryptoException {
        if (encryptedContent == null || encryptedContent.length == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Geçersiz makale içeriği");
        }

        try {
            return Crypto.decrypt(Base64.getEncoder().encodeToString(encryptedContent));
        } catch (Exception e) {
            throw new CryptoException("Şifre çözme hatası", e);
        }
    }

    private String extractAndAnonymizeText(byte[] pdfContent, ArticleDto dto) throws IOException {
        String text = PDFExtractor.extractTextFromFirstPage(pdfContent);

        return anonymizationService.anonymizeText(
                text,
                dto.isNameSurname(),
                dto.isContactInformation(),
                dto.isCompanyInformation()
        );
    }

    private byte[] processPdfCensoring(byte[] originalPdf, String censoredText) throws IOException {
        byte[] censoredFirstPage = PDFBlurUtil.createPdf(censoredText);

        try (PDDocument restPages = PDFExtractor.removeFirstPage(originalPdf)) {
            return PDFBlurUtil.mergeDocuments(censoredFirstPage, restPages);
        }
    }

    private void persistCensoredContent(Article article, byte[] censoredPdf, String anonymizedText) throws CryptoException {
        try {
            // article.setAnonymizedContent(anonymizedText);

            String base64Encrypted = Base64.getEncoder().encodeToString(
                    Crypto.encrypt(censoredPdf)
            );
            article.setCensoredContent(Base64.getDecoder().decode(base64Encrypted));

        } catch (Exception e) {
            throw new CryptoException("Şifreleme hatası", e);
        }
    }

    public ArticleDto removeRefereeFromArticle(Long id) {
        Article updatedArticle = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Makale bulunamadı: " + id));

        updatedArticle.setReferee(null);

        updatedArticle.setStatus("Beklemede");

        Article savedArticle = articleRepository.save(updatedArticle);

         sendRefereeRemovedEmail(savedArticle);

        return entityToDto(savedArticle);
    }

    private void sendRefereeAssignedEmail(Article article) {
        String subject = "Makaleniz Başarıyla İnceleniyor";
        String text = String.format("Sayın %s,\n\nMakalenize hakem atanmıştır ve incelenmektedir. Takip numaranız: %s\n\nTeşekkür ederiz.",
                article.getEmail(), article.getTrackingNumber());
        emailService.sendEmail(article.getEmail(), subject, text);
    }

    private void sendRefereeRemovedEmail(Article article) {
        String subject = "Hakem Ataması Kaldırıldı";
        String text = String.format("Sayın %s,\n\nMakaleniz için hakem ataması kaldırılmıştır. Takip numaranız: %s\n\nTeşekkür ederiz.",
                article.getEmail(), article.getTrackingNumber());

        emailService.sendEmail(article.getEmail(), subject, text);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    public List<ArticleDto> getArticlesByStatus(String status) {
        return articleRepository.findAllByStatus(status).stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArticleDto getArticleByTrackingNumber(String trackingNumber) {
        Article article = articleRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Makale bulunamadı: " + trackingNumber));
        return entityToDto(article);
    }

    @Transactional
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Makale bulunamadı: " + id));
    }


    public Article getArticleByEmail(String email) {
        return articleRepository.findByEmail(email).orElse(null);
    }
}
