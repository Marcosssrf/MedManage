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
- **Spring Security** — autenticação JWT com HMAC SHA-256 (Nimbus JOSE)
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
- Ativação/inativação

### 👨‍⚕️ Médicos
- Cadastro com CRM, estado do CRM e especialidade
- Ativação/inativação
- Configuração de horários de atendimento por dia da semana (hora início, hora fim e duração padrão de consulta)
- Vinculação a um usuário do sistema

### 📅 Consultas
- Agendamento com data e hora livres
- Controle de conflito de horário por médico
- Fluxo de status automático via job agendado: `AGENDADA → CONFIRMADA → EM_ANDAMENTO → REALIZADA`
- Cancelamento de consulta
- Filtros por intervalo de datas, nome do paciente e nome do médico
- Médico autenticado visualiza apenas suas próprias consultas

### 📋 Anamnese
- Registro clínico vinculado à consulta
- Campos: queixa principal, história da moléstia principal, exame físico, hipótese diagnóstica, solicitação de exames, encaminhamento, conduta médica e CID
- Criação de prescrições vinculadas na mesma requisição

### 💊 Prescrições
- Medicamento, dosagem, via de administração, frequência, duração e observações
- Suporte a 4 tipos de receita: Comum, Controlada B1, Controlada A e Antimicrobiano
- Cadastro individual por consulta via endpoint dedicado

### 💳 Pagamentos
- Registro de pagamento vinculado à consulta
- Formas: PIX, Cartão de Crédito/Débito, Dinheiro, Boleto, Transferência
- Tipos: Particular ou Convênio
- Fluxo de status: `PENDENTE → PAGO`
- Impedimento de pagamento duplicado para a mesma consulta

### 🏥 Convênios
- Cadastro com CNPJ, registro ANS, telefone e prazo de faturamento
- Ativação/inativação
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
- Medicamentos de uso contínuo, tipo sanguíneo, peso, altura e IMC
- Hábitos: atividade física, tabagismo, etilismo, uso de drogas

### ⚙️ Configurações da Clínica
- Nome, CNPJ e telefone da clínica
- Horário de abertura e fechamento
- Duração padrão de consulta

---

## 📐 Regras de Negócio

| Regra | Detalhe |
|---|---|
| Conflito de horário | Médico não pode ter duas consultas no mesmo horário |
| Paciente inativo | Não pode agendar consultas |
| Médico inativo | Não pode receber consultas |
| Status da consulta | Fluxo gerenciado por job automático: AGENDADA → CONFIRMADA → EM_ANDAMENTO → REALIZADA |
| Cancelamento | Apenas consultas nos status AGENDADA ou CONFIRMADA podem ser canceladas |
| Pagamento duplicado | Uma consulta só pode ter um pagamento com status PAGO |
| Convênio no paciente | Se informado, carteirinha e vencimento são obrigatórios |
| Visibilidade do médico | Médico autenticado enxerga apenas suas próprias consultas e o resumo do dashboard filtra pelo seu nome |

---

## 📁 Estrutura do Projeto

```
src/main/java/com/clinica/
├── config/             # Configurações de segurança, CORS e beans
├── controller/         # Endpoints REST
├── dto/
│   ├── update/         # DTOs para PATCH
│   └── resposta/       # DTOs de resposta
├── exception/          # Tratamento global de exceções
├── model/
│   └── enums/          # Enumerações do domínio
├── repository/
│   └── specs/          # Specifications para filtros dinâmicos
├── security/           # JWT, UserDetails e SecurityService
├── service/            # Regras de negócio e job de atualização de status
└── validation/         # Anotações e validators customizados
```

---

## ⚙️ Como Rodar

### Pré-requisitos

- Java 21
- PostgreSQL rodando
- Maven

### Passos

```bash
# Clone o repositório
git clone https://github.com/Marcosssrf/MedManage.git
cd MedManage

# Configure as variáveis de ambiente (veja seção abaixo)

# Rode a aplicação
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

---

## 🔐 Variáveis de Ambiente

Configure as variáveis diretamente no ambiente ou em um arquivo de configuração:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_URL_POOLER` | URL de conexão com o PostgreSQL | `jdbc:postgresql://localhost:5432/clinica` |
| `DB_USERNAME` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `sua_senha` |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | `minha-chave-super-secreta` |
| `JWT_EXPIRATION_SECONDS` | Tempo de expiração do token em segundos | `3600` |

---

## 🌐 Endpoints

### Autenticação — `/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/token` | Público | Gera JWT com username e senha |

### Usuários — `/usuarios`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/usuarios` | ADMIN | Criar usuário |
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
| POST | `/medicos` | ADMIN, SECRETARIA | Cadastrar médico |
| PATCH | `/medicos/{id}` | ADMIN, SECRETARIA | Atualizar médico |
| GET | `/medicos/{id}/horarios` | ADMIN, MEDICO, SECRETARIA | Buscar horários de atendimento |
| POST | `/medicos/{id}/horarios` | ADMIN, SECRETARIA | Salvar horários de atendimento |
| DELETE | `/medicos/{id}/horarios/{horarioId}` | ADMIN, SECRETARIA | Remover horário específico |

### Consultas — `/consultas`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/consultas?dataInicio=&dataFim=&paciente=&medico=` | ADMIN, MEDICO, SECRETARIA | Filtrar consultas |
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
| POST `/anamneses` | ADMIN, MEDICO | Registrar anamnese + prescrições |
| POST `/prescricoes/consulta/{id}` | ADMIN, MEDICO | Adicionar prescrição a uma consulta |
| GET `/historicosClinicos` | ADMIN, MEDICO, SECRETARIA | Listar históricos clínicos |
| GET `/historicosClinicos/paciente/{id}` | ADMIN, MEDICO, SECRETARIA | Histórico clínico do paciente |
| POST `/historicosClinicos` | ADMIN, MEDICO | Cadastrar histórico clínico |
| PATCH `/historicosClinicos/{id}` | ADMIN, MEDICO | Atualizar histórico clínico |
| GET `/convenios` | ADMIN, SECRETARIA | Listar convênios |
| POST `/convenios` | ADMIN | Cadastrar convênio |
| PATCH `/convenios/{id}` | ADMIN | Atualizar convênio |
| GET `/cids` | ADMIN, MEDICO, SECRETARIA | Listar CIDs |
| GET `/dashboard/resumo` | ADMIN, MEDICO, SECRETARIA | Dados do dashboard |
| GET `/relatorios/faturamento?ano=` | ADMIN | Faturamento mensal por ano |
| GET `/relatorios/medico-mais-atendido` | ADMIN | Médico mais atendido |
| GET `/configuracaoClinica` | ADMIN, MEDICO, SECRETARIA | Buscar configurações da clínica |
| PATCH `/configuracaoClinica` | ADMIN | Atualizar configurações da clínica |

---

## 🔐 Autenticação

A API utiliza **JWT (Bearer Token)**. Primeiro obtenha o token e depois envie-o no header de todas as requisições autenticadas:

```bash
# 1. Obter token
curl -X POST http://localhost:8080/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "senha": "senha123"}'

# 2. Usar o token nas requisições
curl http://localhost:8080/pacientes \
  -H "Authorization: Bearer <seu_token>"
```

O token expira conforme configurado em `JWT_EXPIRATION_SECONDS` (padrão: 3600 segundos).

---

## 👥 Perfis de Acesso

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total ao sistema |
| `MEDICO` | Visualiza apenas suas próprias consultas, acessa anamneses, prescrições e históricos clínicos |
| `SECRETARIA` | Gerencia pacientes, médicos, consultas, pagamentos e convênios |
