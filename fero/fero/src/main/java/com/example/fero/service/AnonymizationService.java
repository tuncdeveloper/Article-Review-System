package com.example.fero.service;

import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.util.ArrayUtils;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.regex.*;

@Service
public class AnonymizationService {

    private final StanfordCoreNLP pipeline;
    private static final String EMAIL_REGEX = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";

    public AnonymizationService() {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner");
        this.pipeline = new StanfordCoreNLP(props);
    }

    public String anonymizeText(String text, boolean censorNames, boolean censorContacts, boolean censorInstitutions) {
        CoreDocument document = new CoreDocument(text);
        pipeline.annotate(document);

        StringBuilder censored = new StringBuilder(text);

        if (censorNames) censorEntities(document, censored, "PERSON");
        if (censorContacts) censorEmails(censored);
        if (censorInstitutions) censorEntities(document, censored, "ORGANIZATION", "LOCATION");

        return censored.toString();
    }

    private void censorEntities(CoreDocument doc, StringBuilder text, String... entityTypes) {
        for (CoreEntityMention em : doc.entityMentions()) {
            if (ArrayUtils.contains(entityTypes, em.entityType())) {
                replaceText(text, em.text());
            }
        }
    }

    private void censorEmails(StringBuilder text) {
        Matcher matcher = Pattern.compile(EMAIL_REGEX).matcher(text);
        while (matcher.find()) {
            replaceText(text, matcher.group());
        }
    }

    private void replaceText(StringBuilder text, String target) {
        String replacement = "*".repeat(target.length());
        int start = text.indexOf(target);
        if (start != -1) {
            text.replace(start, start + target.length(), replacement);
        }
    }
}