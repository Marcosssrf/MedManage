# MedManageFront

Interface web para o sistema de gerenciamento de clínicas médicas **MedManage**. Desenvolvida com React, TypeScript e Tailwind CSS.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite**
- **React Router DOM** (rotas protegidas por perfil)
- **TanStack Query** (React Query) para gerenciamento de estado assíncrono
- **Tailwind CSS** + **shadcn/ui**
- **Lucide React** (ícones)
- **Sonner** (notificações toast)
- **jsPDF** (geração de PDF de prescrições)

## Funcionalidades

- Login com autenticação JWT e controle de acesso por perfil (ADMIN, MEDICO, SECRETARIA)
- Dashboard com resumo gerencial (total de pacientes, médicos, consultas do dia e faturamento)
- Cadastro e gestão completa de pacientes com histórico clínico
- Cadastro e gestão de médicos com horários de atendimento por dia da semana
- Agendamento de consultas com detalhe completo (anamnese, prescrições, histórico)
- Geração de PDF de prescrições diretamente no navegador
- Gestão de pagamentos e confirmação
- Gestão de convênios
- Gerenciamento de usuários (apenas ADMIN)
- Configurações gerais da clínica (apenas ADMIN)
- Sessão com expiração automática por JWT

## Estrutura do Projeto

```
src/
├── assets/          # Imagens estáticas
├── components/      # Componentes reutilizáveis (forms, layout, paginação, PDF)
│   └── ui/          # Componentes shadcn/ui
├── consultas/       # Componentes específicos da tela de consultas
├── context/         # AuthContext (estado global de autenticação)
├── hooks/           # Hooks customizados (permissões, paginação, toast, mobile)
├── lib/             # Utilitários do shadcn/ui
├── pages/           # Páginas da aplicação
├── services/        # Camada de comunicação com a API
│   ├── api.ts       # Todos os endpoints (pacientes, médicos, consultas, etc.)
│   └── auth.ts      # Login, logout e controle de token
└── utils/           # Funções auxiliares e utilitários de segurança
```

## Perfis de Acesso

| Perfil      | Rotas disponíveis                                                        |
|-------------|--------------------------------------------------------------------------|
| ADMIN       | Todas as rotas, incluindo Usuários e Configurações                       |
| SECRETARIA  | Dashboard, Pacientes, Médicos, Consultas, Pagamentos, Convênios          |
| MEDICO      | Dashboard, Pacientes, Consultas (somente as próprias)                    |

Rotas são protegidas pelo componente `ProtectedRoute` com validação de perfil.

## Configuração

### Pré-requisitos

- Node.js 18+
- Backend [MedManage](https://github.com/Marcosssrf/MedManage) em execução

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

### Executando localmente

```bash
# Clone o repositório
git clone https://github.com/Marcosssrf/MedManageFront
cd MedManageFront

# Instale as dependências
npm install

# Configure a variável de ambiente
echo "VITE_API_URL=http://localhost:8080" > .env

# Execute em modo de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Build para produção

```bash
npm run build
```

## Backend

A API consumida por este frontend está disponível em: [MedManage](https://github.com/Marcosssrf/MedManage)
