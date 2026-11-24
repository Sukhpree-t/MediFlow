package com.mediflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;
import java.util.stream.Stream;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Comma-separated list from env var ALLOWED_ORIGINS (set on Render)
    @Value("${app.websocket.cors.allowed-origins:http://localhost:5173,https://mediflow2.vercel.app}")
    private String allowedOriginsRaw;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple in-memory broker for /topic destinations
        registry.enableSimpleBroker("/topic");
        // Prefix for messages from client → server
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Parse comma-separated origins + always allow localhost wildcard
        String[] origins = Stream.concat(
                Arrays.stream(allowedOriginsRaw.split(",")),
                Stream.of("http://localhost:*")
        ).map(String::trim).toArray(String[]::new);

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins)
                .withSockJS();   // SockJS fallback for browsers without native WebSocket
    }
}
