# 🏥 MedManage — Sistema de Gestão de Clínica Médica

> Sistema backend desenvolvido em **Java + Spring Boot** para gerenciar o fluxo operacional completo de uma clínica médica: cadastro de pacientes e médicos, agendamento de consultas com regras de negócio robustas, controle financeiro e geração de relatórios de desempenho.

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
  - [Gestão de Médicos](#-gestão-de-médicos)
  - [Gestão de Pacientes](#-gestão-de-pacientes)
  - [Agendamento de Consultas](#-agendamento-de-consultas)
  - [Gestão Financeira e Pagamentos](#-gestão-financeira-e-pagamentos)
  - [Relatórios Estatísticos](#-relatórios-estatísticos)
- [Regras de Negócio](#-regras-de-negócio)
- [Endpoints da API](#-endpoints-da-api)
- [Como Executar](#-como-executar)
- [Executando com Docker](#-executando-com-docker)
- [Banco de Dados H2](#-banco-de-dados-h2)
- [Perfis de Configuração](#-perfis-de-configuração)
- [Estrutura de Pastas](#-estrutura-de-pastas)

---

## 📌 Sobre o Projeto

O **MedManage** é uma API RESTful construída com foco em **boas práticas de desenvolvimento**, **validação rigorosa de regras de negócio** e **organização em camadas**. O sistema resolve problemas reais de uma clínica médica, como:

- Evitar conflitos de horário entre agendamentos
- Garantir que somente profissionais e pacientes ativos participem de consultas
- Controlar o status do ciclo de vida de cada consulta automaticamente
- Registrar pagamentos de forma segura, sem duplicidades
- Fornecer relatórios financeiros e de desempenho profissional

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 4.0.1 | Framework base da aplicação |
| Spring Web (MVC) | — | Criação dos endpoints REST |
| Spring Data JPA | — | Abstração da camada de persistência |
| Hibernate | — | ORM para mapeamento objeto-relacional |
| H2 Database | — | Banco de dados em memória para testes |
| Bean Validation (Jakarta) | — | Validação de DTOs e entidades |
| Maven | — | Gerenciamento de dependências e build |
| Docker | — | Conteinerização da aplicação |

---

## 🏗️ Arquitetura do Projeto

O projeto segue o padrão de **arquitetura em camadas**, amplamente utilizado em aplicações Spring Boot:

```
Controller  →  Service  →  Repository  →  Database
     ↑              ↑
    DTO           Domain (Entities)
```

- **Controller**: Recebe as requisições HTTP, valida entrada e delega para o Service.
- **Service**: Contém toda a lógica de negócio e orquestra as operações.
- **Repository**: Interface com o banco de dados via Spring Data JPA.
- **Domain/Model**: Entidades JPA que representam as tabelas do banco.
- **DTO (Data Transfer Object)**: Objetos usados para entrada e saída de dados na API, evitando expor entidades diretamente.

---

## ⚙️ Funcionalidades Detalhadas

### 👨‍⚕️ Gestão de Médicos

- **Cadastro** de médicos com nome, CRM, especialidade e dados de contato.
- **Listagem** de todos os médicos cadastrados no sistema.
- **Ativação/Inativação** de médicos — médicos inativos não aparecem em novos agendamentos.
- Apenas médicos com status **`ATIVO`** podem ser vinculados a consultas.

---

### 🧑‍🤝‍🧑 Gestão de Pacientes

- **Cadastro** de pacientes com nome, CPF, data de nascimento e informações de contato.
- **Listagem** de todos os pacientes do sistema.
- **Ativação/Inativação** de pacientes — o mesmo controle de status aplicado aos médicos.
- Apenas pacientes **`ATIVOS`** podem agendar novas consultas.

---

### 📅 Agendamento de Consultas

O módulo de agendamento é o núcleo do sistema e contém o maior número de regras de negócio.

**Fluxo de uma consulta:**

```
AGENDADA  →  CONFIRMADA  →  REALIZADA
                              ↓
                          (Pagamento liberado)
```

O status evolui **automaticamente** com base na data e hora atuais do sistema.

**Operações disponíveis:**

| Operação | Descrição |
|---|---|
| Agendar | Cria um novo agendamento via `POST /consultas` |
| Cancelar | Cancela uma consulta com no mínimo 24h de antecedência via `PUT /consultas/{id}/cancelar` |
| Listar | Futuro endpoint para listagem e filtros |

---

### 💰 Gestão Financeira e Pagamentos

O módulo financeiro garante o registro seguro e sem duplicidade dos pagamentos.

**Modalidades de pagamento suportadas:**

- **Tipo:**
  - `PARTICULAR` — pagamento direto pelo paciente
  - `CONVÊNIO` — cobertura por plano de saúde

- **Forma de pagamento:**
  - `PIX`
  - `CARTÃO`
  - `DINHEIRO`

**Regras de negócio do pagamento:**

- Somente consultas com status **`REALIZADA`** podem ser pagas.
- O sistema impede o registro de **mais de um pagamento aprovado** para a mesma consulta.
- O endpoint `POST /pagamentos` recebe o ID da consulta e os dados do pagamento.

---

### 📊 Relatórios Estatísticos

O sistema oferece relatórios para tomada de decisão gerencial:

#### Faturamento Mensal
- **Endpoint:** `GET /relatorios/faturamento?ano=2026`
- Retorna o **total arrecadado por mês** em um determinado ano.
- Útil para análise financeira e planejamento da clínica.

#### Desempenho Profissional
- Identifica o **médico com maior número de consultas realizadas com sucesso** no período.
- Base para cálculo de bonificações ou avaliação de desempenho.

---

## 📏 Regras de Negócio

Um resumo consolidado de todas as regras implementadas no sistema:

| # | Módulo | Regra |
|---|---|---|
| 1 | Consultas | Agendamentos somente entre **08:00 e 18:00** |
| 2 | Consultas | Impedimento de **conflito de horário** para o mesmo médico |
| 3 | Consultas | Somente médicos e pacientes **ATIVOS** podem participar |
| 4 | Consultas | Cancelamento exige **mínimo de 24h de antecedência** |
| 5 | Consultas | Status evolui automaticamente: `AGENDADA → CONFIRMADA → REALIZADA` |
| 6 | Pagamentos | Pagamento só é permitido para consultas **REALIZADAS** |
| 7 | Pagamentos | Cada consulta permite **apenas um pagamento aprovado** |
| 8 | Médicos | Médico **INATIVO** não pode receber novos agendamentos |
| 9 | Pacientes | Paciente **INATIVO** não pode realizar novos agendamentos |

---

## 🔗 Endpoints da API

### Consultas

| Método | Endpoint | Descrição | Body |
|---|---|---|---|
| `POST` | `/consultas` | Agenda uma nova consulta | `AgendamentoConsultaDTO` |
| `PUT` | `/consultas/{id}/cancelar` | Cancela um agendamento existente | — |

### Médicos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/medicos` | Lista todos os médicos cadastrados |

### Pacientes

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/pacientes` | Lista todos os pacientes cadastrados |

### Pagamentos

| Método | Endpoint | Descrição | Body |
|---|---|---|---|
| `POST` | `/pagamentos` | Registra o pagamento de uma consulta realizada | `RegistroPagamentoDTO` |

### Relatórios

| Método | Endpoint | Descrição | Parâmetro |
|---|---|---|---|
| `GET` | `/relatorios/faturamento` | Faturamento total por mês do ano | `?ano=2026` |

---

## ▶️ Como Executar

### Pré-requisitos

- [Java 21+](https://adoptium.net/)
- [Maven 3.8+](https://maven.apache.org/) ou use o wrapper incluído (`./mvnw`)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/Marcosssrf/MedManage.git
cd MedManage

# 2. Execute a aplicação com o Maven Wrapper
./mvnw spring-boot:run

# No Windows
mvnw.cmd spring-boot:run
```

A aplicação estará disponível em: `http://localhost:8080`

---

## 🐳 Executando com Docker

O projeto inclui suporte a Docker. Consulte o arquivo `comandosDocker.txt` na raiz do projeto para os comandos detalhados.

Exemplo básico:

```bash
# Build da imagem
docker build -t medmanage .

# Executar o container
docker run -p 8080:8080 medmanage
```

---

## 🗄️ Banco de Dados H2

No perfil de testes (padrão), o projeto utiliza o **H2**, um banco de dados em memória que não requer instalação.

Acesse o console visual pelo navegador durante a execução:

| Campo | Valor |
|---|---|
| URL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:clinica` |
| Usuário | `sa` |
| Senha | *(deixar em branco)* |

> ⚠️ Os dados são **reiniciados a cada vez** que a aplicação é reiniciada, pois o banco é em memória.

---

## 🔧 Perfis de Configuração

| Perfil | Banco de Dados | Uso |
|---|---|---|
| `test` (padrão) | H2 em memória | Desenvolvimento local e testes |
| `prod` *(a configurar)* | Banco externo (ex: PostgreSQL/MySQL) | Ambiente de produção |

Para ativar um perfil diferente:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 📁 Estrutura de Pastas

```
MedManage/
├── src/
│   ├── main/
│   │   ├── java/com/medmanage/
│   │   │   ├── controller/       # Endpoints REST (Controllers)
│   │   │   ├── service/          # Regras de negócio (Services)
│   │   │   ├── repository/       # Acesso ao banco (Repositories)
│   │   │   ├── model/            # Entidades JPA (Domain)
│   │   │   └── dto/              # Objetos de transferência de dados
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-test.properties
│   └── test/                     # Testes unitários e de integração
├── .mvn/wrapper/                 # Maven Wrapper
├── comandosDocker.txt            # Comandos úteis para Docker
├── pom.xml                       # Dependências e configuração Maven
└── README.md
```

---

## 👨‍💻 Autor

Desenvolvido por **[Marcos](https://github.com/Marcosssrf)** como projeto de estudo e portfólio, com foco em boas práticas de desenvolvimento backend com Java e Spring Boot.

---

## 📄 Licença

Este projeto está disponível para fins **acadêmicos e educacionais**.