package com.example.fero.config;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.*;

import static org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode.APPEND;

public class PDFBlurUtil {

    private static final float MARGIN = 15;
    private static final float FONT_SIZE = 7f;
    private static final float LINE_SPACING = 10f;


    public static byte[] createPdf(String text) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDType0Font font = loadFont(document);
            if (font == null) {
                throw new IOException("Font yüklenemedi!");
            }
            addTextToDocument(document, font, text);
            return saveDocument(document);
        }
    }


    public static byte[] mergeDocuments(byte[] firstPage, PDDocument restDocument) throws IOException {
        try (PDDocument mergedDoc = PDDocument.load(new ByteArrayInputStream(firstPage))) {
            for (PDPage page : restDocument.getPages()) {
                mergedDoc.addPage(page);
            }
            return saveDocument(mergedDoc);
        }
    }


    public static byte[] addTextToExistingPdf(byte[] pdfData, String comment) throws IOException {
        try (PDDocument document = validateAndLoadPdf(pdfData)) {
            PDPage newPage = new PDPage();
            document.addPage(newPage);

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
                    newPage,
                    PDPageContentStream.AppendMode.APPEND,
                    true,
                    true)) {

                stream.setFont(font, 12);
                stream.beginText();

                float startX = 50;
                float startY = newPage.getMediaBox().getHeight() - 50;
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

            return saveDocument(document);
        }
    }

    private static PDType0Font loadFontSafe(PDDocument doc) throws IOException {
        try {
            return loadFont(doc);
        } catch (IOException e) {
            return PDType0Font.load(doc, PDFBlurUtil.class.getResourceAsStream("/fonts/FreeSans.ttf"));
        }
    }

    private static PDDocument validateAndLoadPdf(byte[] pdfData) throws IOException {
        if (!isValidPdf(pdfData)) {
            throw new IOException("Geçersiz PDF formatı: PDF başlığı eksik veya bozuk");
        }
        return PDDocument.load(new ByteArrayInputStream(pdfData));
    }

    private static boolean isValidPdf(byte[] data) {
        return data != null && data.length >= 4 &&
                data[0] == '%' && data[1] == 'P' && data[2] == 'D' && data[3] == 'F';
    }

    private static void addCommentToPage(PDDocument doc, PDPage page, PDType0Font font, String text) throws IOException {
        try (PDPageContentStream stream = new PDPageContentStream(doc, page, APPEND, true, true)) {
            stream.setFont(font != null ? font : PDType1Font.HELVETICA, 12);
            stream.beginText();
            stream.newLineAtOffset(50, 50);
            stream.showText(text);
            stream.endText();
        }
    }


    private static void addTextToDocument(PDDocument document, PDType0Font font, String text) throws IOException {
        PDPage page = new PDPage();
        document.addPage(page);

        try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
            stream.beginText();

            stream.setFont(font, FONT_SIZE);

            float startX = MARGIN;
            float startY = page.getMediaBox().getHeight() - MARGIN;

            stream.newLineAtOffset(startX, startY);

            for (String line : text.split("\n")) {
                stream.showText(line);
                stream.newLineAtOffset(0, -LINE_SPACING);
            }

            stream.endText();
        }
    }


    private static byte[] saveDocument(PDDocument document) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        document.save(output);
        return output.toByteArray();
    }


    private static PDType0Font loadFont(PDDocument document) throws IOException {
        try (InputStream fontStream = PDFBlurUtil.class.getClassLoader().getResourceAsStream("unifont-16.0.02.ttf")) {
            if (fontStream == null) {
                throw new FileNotFoundException("Font dosyası bulunamadı: unifont-16.0.02.ttf");
            }
            return PDType0Font.load(document, fontStream);
        }
    }
}