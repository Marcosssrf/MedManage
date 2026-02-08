# 🏥 Sistema de Gestão de Clínica Médica

Este projeto é uma aplicação **Spring Boot** desenvolvida para gerenciar o fluxo operacional de uma clínica médica, abrangendo desde o **cadastro de pacientes e médicos** até o **controle de agendamentos, pagamentos** e a **geração de relatórios de desempenho**.

---

## 🚀 Tecnologias Utilizadas

- **Java 21**  
  Versão da linguagem utilizada no projeto.

- **Spring Boot 4.0.1**  
  Framework base para a construção da aplicação.

- **Spring Data JPA**  
  Abstração da camada de dados e persistência.

- **H2 Database**  
  Banco de dados em memória utilizado no ambiente de testes.

- **Bean Validation**  
  Validação de regras de negócio nos modelos e DTOs.

- **Maven**  
  Gerenciador de dependências e automação de builds.

---

## 📋 Funcionalidades e Regras de Negócio

### 📅 Agendamento de Consultas

- **Validação de Horário**  
  As consultas só podem ser agendadas entre **08:00 e 18:00**.

- **Controle de Disponibilidade**  
  O sistema impede o agendamento de duas consultas para o **mesmo médico no mesmo horário**.

- **Status de Ativação**  
  Apenas **pacientes e médicos com status "ATIVO"** podem participar de novos agendamentos.

- **Fluxo Automático de Status**  
  O status da consulta evolui automaticamente:
  - `AGENDADA`
  - `CONFIRMADA`
  - `REALIZADA`  
  com base na data e hora atuais.

- **Regra de Cancelamento**  
  Uma consulta só pode ser cancelada com **no mínimo 24 horas de antecedência**.

---

### 💰 Gestão Financeira

- **Pagamentos**  
  O registro de pagamento só é permitido para consultas com status **REALIZADA**.

- **Unicidade**  
  O sistema garante que cada consulta possua **apenas um pagamento aprovado**.

- **Modalidades de Pagamento**
  - Tipo: `PARTICULAR` ou `CONVÊNIO`
  - Forma: `PIX`, `CARTÃO` ou `DINHEIRO`

---

### 📊 Relatórios Estatísticos

- **Faturamento Mensal**  
  Consulta do total arrecadado por mês em um determinado ano.

- **Desempenho Profissional**  
  Identificação do médico com o **maior número de consultas realizadas com sucesso**.

---

## 🛠️ Configuração do Ambiente

O projeto está configurado para utilizar o **perfil de teste por padrão**, permitindo a execução imediata sem a necessidade de configurar um banco de dados externo.

---

## 🗄️ Acesso ao Console do H2

Durante a execução da aplicação, é possível acessar a interface do banco de dados em memória:

- **URL:** `http://localhost:8080/h2-console`  
- **JDBC URL:** `jdbc:h2:mem:clinica`  
- **Usuário:** `sa`  
- **Senha:** *(em branco)*

---

## 🔗 Endpoints da API

| Categoria   | Método | Endpoint                     | Descrição |
|------------|--------|------------------------------|-----------|
| Consultas  | POST   | `/consultas`                 | Agenda uma nova consulta via DTO |
| Consultas  | PUT    | `/consultas/{id}/cancelar`   | Cancela um agendamento existente |
| Médicos    | GET    | `/medicos`                   | Lista todos os médicos cadastrados |
| Pacientes  | GET    | `/pacientes`                 | Lista todos os pacientes cadastrados |
| Pagamentos | POST   | `/pagamentos`                | Registra o pagamento de uma consulta realizada |
| Relatórios | GET    | `/relatorios/faturamento`    | Exibe o faturamento por mês (ex: `?ano=2026`) |

---

## 📌 Observações

Este projeto foi desenvolvido com foco em **boas práticas**, **validação de regras de negócio** e **organização em camadas**, sendo ideal para fins **acadêmicos** e como base para projetos reais.

---
