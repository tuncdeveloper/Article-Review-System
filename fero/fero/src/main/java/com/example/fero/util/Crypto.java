package com.example.fero.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class Crypto {
    private static final String AES_ALGORITHM = "AES";
    private static final String AES_TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final byte[] AES_KEY = hexStringToByteArray("6061b1bf93cb95828baa7f671f6fecc7311b525033d9b486ab3dc5b8042fabe7");

    public static byte[] encrypt(byte[] data) {
        try {
            Cipher cipher = Cipher.getInstance(AES_TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(AES_KEY, AES_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            return cipher.doFinal(data);
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Şifreleme hatası: " + ex.getMessage(), ex);        }
    }

    public static byte[] decrypt(String encryptedData) {
        try {
            Cipher cipher = Cipher.getInstance(AES_TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(AES_KEY, AES_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            return cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        } catch (Exception ex) {
            throw new RuntimeException("Şifre çözme başarısız: " + ex.getMessage(), ex);
        }
    }

    private static byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
