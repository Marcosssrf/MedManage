# 🏥 MedManage

API REST completa para gerenciamento de clínicas médicas, desenvolvida com Spring Boot. O sistema cobre todo o fluxo clínico: do cadastro de pacientes e médicos ao agendamento de consultas, anamnese, prescrições e pagamentos.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Regras de Negócio](#regras-de-negócio)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar](#como-rodar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints](#endpoints)
- [Autenticação](#autenticação)
- [Perfis de Acesso](#perfis-de-acesso)

---

## 🚀 Tecnologias

- **Java 21**
- **Spring Boot 3**
- **Spring Security** — autenticação HTTP Basic + BCrypt
- **Spring Data JPA** — ORM com Hibernate
- **PostgreSQL** — banco de dados relacional
- **Bean Validation** — validações nos DTOs (CPF, CNPJ, email, telefone)
- **Hibernate Validator** — validações brasileiras (`@CPF`, `@CNPJ`)

---

## ✅ Funcionalidades

### 👤 Pacientes
- Cadastro completo com dados pessoais, endereço e convênio
- Validação de CPF, e-mail, telefone e data de nascimento
- Cálculo automático de idade
- Vinculação a convênio com número de carteirinha e validade
- Validação condicional: se informar convênio, carteirinha e vencimento são obrigatórios

### 👨‍⚕️ Médicos
- Cadastro com CRM, estado do CRM e especialidade
- Ativação/inativação
- Vinculação a um usuário do sistema

### 📅 Consultas
- Agendamento com validação de horário comercial (08h às 18h)
- Controle de conflito de horário por médico
- Fluxo de status automático: `AGENDADA → CONFIRMADA → REALIZADA`
- Cancelamento com regra de 24h de antecedência
- Filtros por data, nome do paciente e nome do médico
- Médico autenticado visualiza apenas suas próprias consultas

### 📋 Anamnese
- Registro clínico vinculado à consulta
- Campos: queixa principal, história da moléstica, exame físico, hipótese diagnóstica, conduta médica, encaminhamento e CID
- Criação de prescrições vinculadas na mesma requisição

### 💊 Prescrições
- Medicamento, dosagem, via de administração, frequência e duração
- Suporte a 4 tipos de receita: Comum, Controlada B1, Controlada A e Antimicrobiano

### 💳 Pagamentos
- Registro de pagamento vinculado à consulta **realizada**
- Formas: PIX, Cartão de Crédito/Débito, Dinheiro, Boleto, Transferência
- Tipos: Particular ou Convênio
- Fluxo de status: `PENDENTE → PAGO`
- Impedimento de pagamento duplicado para a mesma consulta

### 🏥 Convênios
- Cadastro com CNPJ, registro ANS e prazo de faturamento
- Vinculação a pacientes

### 📊 Dashboard
- Total de pacientes e médicos cadastrados
- Consultas do dia (filtrado por médico se o usuário for médico)
- Faturamento do mês atual

### 📈 Relatórios
- Faturamento mensal por ano
- Médico mais atendido

### 📁 Histórico Clínico
- Alergias, doenças preexistentes, cirurgias prévias, histórico familiar
- Medicamentos de uso contínuo, tipo sanguíneo, peso, altura
- Hábitos: atividade física, tabagismo, etilismo, uso de drogas

---

## 📐 Regras de Negócio

| Regra | Detalhe |
|---|---|
| Horário de atendimento | 08h00 às 18h00 |
| Cancelamento de consulta | Apenas com 24h de antecedência |
| Paciente inativo | Não pode agendar consultas |
| Médico inativo | Não pode receber consultas |
| Conflito de horário | Médico não pode ter duas consultas no mesmo horário |
| Status da consulta | Fluxo unidirecional: AGENDADA → CONFIRMADA → REALIZADA |
| Pagamento | Apenas consultas com status REALIZADA podem ser pagas |
| Pagamento duplicado | Uma consulta só pode ter um pagamento com status PAGO |
| Convênio no paciente | Se informado, carteirinha e vencimento são obrigatórios |

---

## 📁 Estrutura do Projeto

```
src/main/java/com/clinica/
├── config/             # Configurações de segurança e CORS
├── controller/         # Endpoints REST
├── dto/
│   ├── update/         # DTOs para PATCH
│   └── resposta/       # DTOs de resposta (response)
├── model/
│   └── enums/          # Enumerações do domínio
├── repository/
│   └── specs/          # Specifications para filtros dinâmicos
├── security/           # UserDetailsService e SecurityService
├── service/            # Regras de negócio
└── validation/         # Anotações e validators customizados
```

---

## ⚙️ Como Rodar

### Pré-requisitos

- Java 21+
- PostgreSQL rodando
- Maven

### Passos

```bash
# Clone o repositório
git clone https://github.com/Marcosssrf/MedManage.git
cd MedManage

# Configure as variáveis de ambiente (veja secção abaixo)

# Rode a aplicação
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` ou configure as variáveis diretamente no ambiente:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_URL_POOLER` | URL de conexão com o PostgreSQL | `jdbc:postgresql://localhost:5432/clinica` |
| `DB_USERNAME` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `sua_senha` |

---

## 🌐 Endpoints

### Usuários — `/usuarios`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/usuarios` | Público | Criar usuário |
| GET | `/usuarios` | ADMIN | Listar usuários |
| GET | `/usuarios/me` | Autenticado | Dados do usuário logado |
| PATCH | `/usuarios/{id}` | ADMIN | Atualizar usuário |
| DELETE | `/usuarios/{id}` | ADMIN | Inativar usuário |

### Pacientes — `/pacientes`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/pacientes` | ADMIN, MEDICO, SECRETARIA | Listar pacientes |
| GET | `/pacientes/{id}` | ADMIN, MEDICO, SECRETARIA | Buscar por ID |
| POST | `/pacientes` | ADMIN, SECRETARIA | Cadastrar paciente |
| PATCH | `/pacientes/{id}` | ADMIN, SECRETARIA | Atualizar paciente |

### Médicos — `/medicos`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/medicos` | ADMIN, MEDICO, SECRETARIA | Listar médicos |
| GET | `/medicos/{id}` | ADMIN, MEDICO, SECRETARIA | Buscar por ID |
| POST | `/medicos` | ADMIN | Cadastrar médico |
| PATCH | `/medicos/{id}` | ADMIN | Atualizar médico |

### Consultas — `/consultas`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/consultas?dataHora=&paciente=&medico=` | ADMIN, MEDICO, SECRETARIA | Filtrar consultas |
| GET | `/consultas/{id}` | ADMIN, MEDICO, SECRETARIA | Buscar por ID |
| POST | `/consultas` | ADMIN, SECRETARIA | Agendar consulta |
| PATCH | `/consultas/{id}` | ADMIN, SECRETARIA | Atualizar consulta |
| PUT | `/consultas/{id}/cancelar` | ADMIN, SECRETARIA | Cancelar consulta |

### Pagamentos — `/pagamentos`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/pagamentos` | ADMIN, SECRETARIA | Listar pagamentos |
| GET | `/pagamentos/{id}` | ADMIN, SECRETARIA | Buscar por ID |
| POST | `/pagamentos` | ADMIN, SECRETARIA | Registrar pagamento |
| PATCH | `/pagamentos/{id}/confirmar` | ADMIN, SECRETARIA | Confirmar pagamento |

### Outros endpoints
| Rota | Acesso | Descrição |
|---|---|---|
| GET `/anamneses` | ADMIN, MEDICO | Listar anamneses |
| POST `/anamneses` | ADMIN, MEDICO | Registrar anamnese + prescrições |
| GET `/historicosClinicos` | ADMIN, MEDICO, SECRETARIA | Listar históricos |
| POST `/historicosClinicos` | ADMIN, MEDICO | Cadastrar histórico |
| PATCH `/historicosClinicos/{id}` | ADMIN, MEDICO | Atualizar histórico |
| GET `/convenios` | ADMIN, SECRETARIA | Listar convênios |
| POST `/convenios` | ADMIN | Cadastrar convênio |
| PATCH `/convenios/{id}` | ADMIN | Atualizar convênio |
| GET `/cids` | ADMIN, MEDICO, SECRETARIA | Listar CIDs |
| GET `/dashboard/resumo` | ADMIN, MEDICO, SECRETARIA | Dados do dashboard |
| GET `/relatorios/faturamento?ano=` | ADMIN | Faturamento por mês |
| GET `/relatorios/medico-mais-atendido` | ADMIN | Médico mais atendido |

---

## 🔐 Autenticação

A API utiliza **HTTP Basic Authentication**. Envie o header em todas as requisições autenticadas:

```
Authorization: Basic base64(username:senha)
```

Exemplo com curl:
```bash
curl -u admin:senha123 http://localhost:8080/pacientes
```

---

## 👥 Perfis de Acesso

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total ao sistema |
| `MEDICO` | Visualiza consultas próprias, acessa anamneses e históricos clínicos |
| `SECRETARIA` | Gerencia pacientes, consultas e pagamentos |