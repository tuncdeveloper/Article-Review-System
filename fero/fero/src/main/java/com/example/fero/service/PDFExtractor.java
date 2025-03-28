package com.example.fero.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public class PDFExtractor {

    public static String extractTextFromFirstPage(byte[] data) throws IOException {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(data))) {
            PDFTextStripper textStripper = new PDFTextStripper();
            textStripper.setStartPage(1);
            textStripper.setEndPage(1);
            return textStripper.getText(document);
        }
    }

    public static PDDocument removeFirstPage(byte[] data) throws IOException {
        PDDocument document = PDDocument.load(new ByteArrayInputStream(data));
        if (document.getNumberOfPages() > 0) {
            document.removePage(0);
        }
        return document;
    }

    public static boolean isPdf(byte[] data) {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(data))) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}