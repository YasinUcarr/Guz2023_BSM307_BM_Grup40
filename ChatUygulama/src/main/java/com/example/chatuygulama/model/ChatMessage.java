package com.example.chatuygulama.model;

import org.apache.logging.log4j.message.Message;
import lombok.Getter;
import lombok.Setter;
import java.awt.*;


public class ChatMessage {
    // Mesaj içeriği
@Getter
@Setter
    private String content;

    // Mesajı gönderen kişinin adı
@Getter
@Setter
    private String sender;

    // Mesajın tipi
@Getter
@Setter
    private MessageType type;

    // Mesajın gönderildiği zaman
@Getter
@Setter
    private String time;

    public enum MessageType{
    CHAT, LEAVE, JOIN
    }
}
