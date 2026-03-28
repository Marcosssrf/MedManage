package com.clinica;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ClinicaApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		System.out.println(">>> DB_URL: " + dotenv.get("DB_URL"));
		System.setProperty("DB_URL", dotenv.get("DB_URL"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
		SpringApplication.run(ClinicaApplication.class, args);
	}
}