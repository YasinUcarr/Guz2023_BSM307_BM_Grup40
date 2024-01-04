package com.example.chatuygulama.controller;

import com.example.chatuygulama.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
public class ChatController {
    // Kullanıcı kaydını işler ve katılma işlemlerini gerçekleştirir.
    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessage register
            (@Payload ChatMessage chatMessage,
             SimpMessageHeaderAccessor headerAccessor

            )
    {
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", chatMessage.getSender());
        return chatMessage;
    }
    // Gönderilen mesajları alır ve genel sohbet odasına iletilmesini sağlar.
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage)
    {
        return chatMessage;
    }
}
