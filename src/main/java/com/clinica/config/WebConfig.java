package com.clinica.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://172.20.10.*:*",  // ← IP da sua rede local
                        "https://*.ngrok-free.app",  // ← ngrok
                        "https://*.ngrok-free.dev",
                        "https://*.railway.app",
                        "https://medmanage-api.onrender.com",
                        "https://marcosssrf.dev", // ← Seu novo domínio do Name.com
                        "https://www.marcosssrf.dev",
                        "https://*.azurewebsites.net"// ← A versão com www
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
