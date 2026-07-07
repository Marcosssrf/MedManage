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
                        "http://172.20.10.*:*",  //
//                        "https://*.ngrok-free.app",
//                        "https://*.ngrok-free.dev",
//                        "https://*.railway.app",
//                        "https://medmanage-api.onrender.com",
//                        "https://medmanagefront-production.up.railway.app",
                        "https://marcosssrf.dev",
                        "https://www.marcosssrf.dev",
                        "https://*.azurewebsites.net"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
