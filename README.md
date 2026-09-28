# SIGAR / MozTechWave — Sistema Integrado de Gestão Acadêmica e Resultados

> Plataforma SaaS Multi-Tenant corporativa para gestão acadêmica, administrativa, pedagógica, financeira (M-Pesa / e-Mola) e certificação digital auditável (SIVEC / ANEP).

---

## Índice

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Instalação e Execução Local](#2-instalação-e-execução-local)
3. [Firebase e Infraestrutura Cloud](#3-firebase-e-infraestrutura-cloud)
4. [Authentication e Gestão de Identidade](#4-authentication-e-gestão-de-identidade)
5. [Firestore: Modelo de Dados e Multi-Tenancy](#5-firestore-modelo-de-dados-e-multi-tenancy)
6. [Firebase Storage e Mídias Digitais](#6-firebase-storage-e-mídias-digitais)
7. [Cloud Functions e Triggers Serverless](#7-cloud-functions-e-triggers-serverless)
8. [Regras de Segurança (Firestore & Storage Rules)](#8-regras-de-segurança-firestore--storage-rules)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Deployment e Publicação em Produção](#10-deployment-e-publicação-em-produção)
11. [Migração e Carga Inicial de Dados](#11-migração-e-carga-inicial-de-dados)
12. [Segurança, Auditoria e RBAC](#12-segurança-auditoria-e-rbac)
13. [Estrutura Completa de Pastas](#13-estrutura-completa-de-pastas)

---

## 1. Arquitetura Geral

O SIGAR (MozTechWave) foi arquitetado sob os princípios de **Isolamento Multi-Tenant**, **Desacoplamento Modular**, **API-First** e **Alta Disponibilidade**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO (SPA)                    │
│   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion   │
│   (13 Módulos Principais | 82+ Sub-módulos Operacionais Especializados)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌───────────────┐           ┌───────────────┐           ┌────────────────┐
│   PORTAL DO   │           │   PORTAL DO   │           │  TERMINAL DA   │
│     ALUNO     │           │   PROFESSOR   │           │    PORTARIA    │
│  (16 Pilares) │           │ (Diário/Pautas│           │ (Scanner QR/Bip│
└──────┬────────┘           └───────┬───────┘           └───────┬────────┘
       │                            │                           │
       └────────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CAMADA DE GESTÃO DE ESTADO E REGRAS DE NEGÓCIO           │
│   AppContext (Tenant + Auth + RBAC) | Firestore Sync | LocalStorage    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SERVIÇOS DE NUVEM & BACKEND (FIREBASE)               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Authentication  │  │  Cloud Firestore │  │    Cloud Storage     │  │
│  │ (Email / Google) │  │  (Multi-Tenant)  │  │ (PDFs, Fotos, Selos) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Cloud Functions  │  │ SIVEC Hub (Hash) │  │ Gateway M-Pesa/eMola │  │
│  │ (Webhooks/Crons) │  │ (SHA-256 + QR)   │  │ (Liquidação Autom.)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Pilares Arquiteturais
- **Multi-Tenant Nativo:** Separação lógica rígida por `institutionId` e `branchId` (polos/filiais).
- **Controle de Acesso RBAC:** 10 perfis canônicos rigorosamente isolados:
  `SUPER_ADMIN`, `ADMIN_INSTITUICAO`, `DIRETOR`, `SECRETARIA`, `FINANCEIRO`, `PROFESSOR`, `FORMADOR`, `ALUNO`, `RESPONSAVEL`, `PORTEIRO`, `EMPRESA`.
- **SIVEC Core:** Barramento criptográfico para validação de autenticidade de certificados com QR Code universal e hashes SHA-256 invioláveis.
- **Ecossistema Financeiro Moçambicano:** Integração nativa para pagamentos automáticos móveis via M-Pesa (Vodacom) e e-Mola (Movitel), além de controle de Caixa Escolar (fecho cego e sangria).

---

## 2. Instalação e Execução Local

### Pré-requisitos
- **Node.js**: Versão 20.x ou superior recomendada.
- **npm** (v10+) ou **bun** (v1.2+).
- Navegador moderno com suporte a WebRTC / Câmera (para leitura de QR Codes da portaria).

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd sigar-moztechwave
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente:**
   Copie o arquivo de exemplo e configure suas chaves:
   ```bash
   cp .env.example .env
   ```

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

5. **Compilação e Verificação de Tipos:**
   ```bash
   # Validação TypeScript
   npm run lint

   # Build otimizado de produção
   npm run build
   ```

---

## 3. Firebase e Infraestrutura Cloud

O sistema integra a suíte Firebase v12 utilizando o SDK modular em `src/firebase/firebaseClient.ts`.

### Arquivo de Configuração (`firebase-applet-config.json`)
```json
{
  "projectId": "siverc-94da3",
  "appId": "1:830264966313:web:08af6f106e5d6dc7333db8",
  "apiKey": "AIzaSyB54CYrkKo2oa7LDFDECoDmoTJMdaS3utI",
  "authDomain": "siverc-94da3.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "siverc-94da3.firebasestorage.app",
  "messagingSenderId": "830264966313"
}
```

### Inicialização do Cliente (`src/firebase/firebaseClient.ts`)
O cliente inicializa os serviços de forma resiliente com fallback transparente:
- `auth`: Instância do Firebase Authentication.
- `db`: Instância do Firestore configurada para o banco de dados dedicado.
- `storage`: Instância do Firebase Storage para custódia de documentos.

---

## 4. Authentication e Gestão de Identidade

A camada de autenticação gerencia múltiplos provedores e vincula o usuário autenticado ao seu perfil institucional:

1. **Email / Senha:** Credenciais seguras para funcionários, professores e alunos.
2. **Google Identity (OAuth 2.0):** Login rápido para contas corporativas.
3. **Sessão Multi-Perfil:** Identificação do usuário na coleção `/users/{uid}`, contendo:
   - `role`: Perfil de acesso (`SUPER_ADMIN`, `ADMIN_INSTITUICAO`, etc.).
   - `institutionId`: Inquilino vinculado.
   - `branchId`: Polo ou campus específico.
4. **Super Administrador Master:** Acesso universal garantido para o operador central (`jafimpaulo8@gmail.com`).
5. **Acesso Público / Anônimo:** Leitura de pautas públicas, portal de matrículas abertas e verificação de QR Code SIVEC sem necessidade de autenticação prévia.

---

## 5. Firestore: Modelo de Dados e Multi-Tenancy

O Firestore segue um padrão híbrido combinando coleções de primeiro nível com filtragem estrita por `institutionId` e subcoleções para isolamento físico por inquilino.

### Mapeamento de Coleções (`FIRESTORE_COLLECTIONS`)
- `institutions`: Configurações centrais, logotipo, planos e limites contratuais.
- `branches`: Polos, filiais e salas físicas.
- `users`: Usuários do sistema e seus perfis RBAC.
- `students`: Ficha completa do aluno, BI/DIRE/Passaporte, fotos, dados do encarregado.
- `courses`: Catálogo de cursos, cargas horárias e matrizes curriculares.
- `classes`: Turmas, anos letivos, períodos (manhã/tarde/noite) e salas.
- `payments`: Histórico de mensalidades, taxas de matrícula, multas e liquidações M-Pesa.
- `invoices`: Faturas, recibos oficiais e carnês A4 gerados.
- `certificates`: Diplomas e certificados emitidos com hash SIVEC e carimbo criptográfico.
- `audit_logs`: Trilha de auditoria cronológica e imutável de todas as ações sensíveis.
- `sivec_credentials`: Credenciais de barramento e chaves de validação governamental.

### Helpers de Caminho Tenant-Safe
```typescript
import { getTenantCollectionPath, getBranchCollectionPath } from './src/firebase/firestoreCollections';

// Caminho tenant-level: institutions/{instId}/students
const studentsPath = getTenantCollectionPath(institutionId, 'students');

// Caminho branch-level: institutions/{instId}/branches/{branchId}/classes
const classesPath = getBranchCollectionPath(institutionId, branchId, 'classes');
```

---

## 6. Firebase Storage e Mídias Digitais

O Firebase Storage hospeda mídias digitais e documentos oficiais em diretórios segregados por instituição:

```
storage-bucket/
└── institutions/
    └── {institutionId}/
        ├── students/{studentId}/photos/foto-perfil.jpg
        ├── teachers/{teacherId}/photos/foto-perfil.jpg
        ├── certificates/{certId}/diploma-oficial.pdf
        ├── finance/{receiptId}/comprovativo.pdf
        └── branding/
            ├── logo.png
            └── carimbo-assinatura.png
```

- **Fotos de Alunos e Docentes:** Leitura pública com hash no nome para CDN; gravação restrita ao usuário ou à secretaria.
- **Certificados Oficiais e Diplomas:** Acessíveis publicamente para consulta instantânea via QR Code da folha física.
- **Comprovativos e Recibos:** Acesso restrito aos operadores financeiros e ao próprio aluno/responsável.

---

## 7. Cloud Functions e Triggers Serverless

Localizadas em `/firebase/functions/index.ts`, as funções serverless atuam em tarefas assíncronas de missão crítica:

| Função | Trigger | Descrição |
| :--- | :--- | :--- |
| `onStudentEnrolled` | `firestore.onDocumentCreated` | Gera matrícula oficial, credencial digital com QR Code e envia WhatsApp de boas-vindas. |
| `onMpesaCallbackWebhook` | `https.onRequest` | Webhook que recebe callbacks da Vodacom Moçambique, valida assinatura HMAC e liquida propinas em tempo real. |
| `onEmolaCallbackWebhook` | `https.onRequest` | Webhook que valida pagamentos instantâneos via e-Mola (Movitel). |
| `onCertificateIssued` | `firestore.onDocumentCreated` | Gera selo criptográfico SHA-256 e sincroniza o registro com o barramento SIVEC / ANEP. |
| `dailyAttendanceAndDropoutAudit` | `pubsub.schedule` (Diário) | Rotina noturna que calcula assiduidade e sinaliza alunos em risco de evasão escolar. |

---

## 8. Regras de Segurança (Firestore & Storage Rules)

### Regras do Firestore (`firestore.rules`)
As regras aplicam **Default-Deny** universal e verificam autenticação, inquilino e papel:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Bloqueio Global Default-Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Validações Auxiliares
    function isSignedIn() { return request.auth != null; }
    function isSuperAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'jafimpaulo8@gmail.com' ||
        userRole() == 'SUPER_ADMIN'
      );
    }
    function isInstAdmin(instId) {
      return isSuperAdmin() || (
        isSignedIn() && userInstitution() == instId &&
        (userRole() == 'ADMIN_INSTITUICAO' || userRole() == 'DIRETOR')
      );
    }

    // Regras por coleção (Ex: Instituições)
    match /institutions/{instId} {
      allow read: if true; // Para carregar logos e portal público
      allow write: if isSuperAdmin() || isInstAdmin(instId);
    }

    // Regras para Alunos
    match /institutions/{instId}/students/{studentId} {
      allow read: if isSuperAdmin() || isInstAdmin(instId) || isSecretaria(instId) || isDocente(instId) || isSelfStudent(studentId);
      allow write: if isSuperAdmin() || isInstAdmin(instId) || isSecretaria(instId);
    }

    // Regras de Certificados (Validação Pública de QR Code)
    match /institutions/{instId}/certificates/{certId} {
      allow read: if true; // Verificação SIVEC pública
      allow write: if isSuperAdmin() || isInstAdmin(instId) || isSecretaria(instId);
    }
  }
}
```

### Regras do Firebase Storage (`firebase/storage.rules`)
- Bloqueia uploads não autorizados.
- Permite download de certificados públicos mediante hash do documento.
- Restringe acesso a balanços financeiros ao módulo da tesouraria.

---

## 9. Variáveis de Ambiente

Configurações armazenadas em `.env`:

```ini
# Chave de Inteligência Artificial Google Gemini
GEMINI_API_KEY="AIzaSy..."

# URL Base da Aplicação (usado para links públicos e webhooks)
APP_URL="https://ais-dev-qqssjltltgcdzarpyjbupu-622264300725.europe-west1.run.app"

# Porta do Servidor Local
PORT=3000

# Parâmetros de Integração Móvel (Opcionais / Server-Side)
MPESA_SHORTCODE="171717"
MPESA_API_KEY="prod_key_vodacom_mz"
EMOLA_API_KEY="prod_key_movitel_mz"
```

> **Aviso:** Chaves de API de provedores de pagamento devem ser mantidas exclusivamente em rotas protegidas no backend ou em Cloud Functions.

---

## 10. Deployment e Publicação em Produção

### 1. Build de Produção
Gera os artefatos estáticos otimizados na pasta `/dist`:
```bash
npm run build
```

### 2. Deploy de Regras de Segurança
As regras do Firestore podem ser implantadas diretamente com a ferramenta de deployment:
```bash
# Sincronização automática de firestore.rules
npm run deploy:rules
```

### 3. Hospedagem
- **Google Cloud Run / Firebase Applet:** Configurado por padrão com `server.ts` servindo os arquivos estáticos compilados com headers de segurança.
- **Nginx / Servidor Dedicado:**
  Configurar o arquivo de configuração para suportar rotas de Single Page Application:
  ```nginx
  server {
      listen 80;
      server_name sigar.seuservidor.co.mz;
      root /var/www/sigar/dist;
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }
  }
  ```

---

## 11. Migração e Carga Inicial de Dados

Os **Módulos 68 e 69** fornecem ferramentas visuais para migração em lote:

1. **Importação CSV / Excel:**
   - Cadastramento em lote de estudantes, turmas e pautas legadas.
   - Pré-validação com relatório detalhado de inconsistências (BI duplicado, turmas inexistentes).
2. **Exportação de Conformidade:**
   - Extração completa em JSON e CSV para backups externos ou prestação de contas aos Ministérios e à ANEP.
3. **Mecanismo de Rollback:**
   - Todo lote importado recebe um identificador de lote (`batchId`) permitindo estorno integral em caso de erro na importação.

---

## 12. Segurança, Auditoria e RBAC

### Matriz de Perfis e Permissões
| Perfil | Acesso aos Módulos | Permissões Especiais |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | Acesso irrestrito a todos os 82+ módulos | Gestão de Inquilinos, Licenças SaaS, Logs Globais |
| **ADMIN_INSTITUICAO** | Todos os módulos da sua instituição | Configurações, Usuários da Escola, Prazos |
| **DIRETOR** | Acadêmico, Pedagógico, Financeiro e Portaria | Validação Final de Pautas, Homologação SIVEC |
| **SECRETARIA** | Alunos, Matrículas, Contratos, Turmas, Carteirinhas | Emissão de Documentos e Matrícula de Alunos |
| **FINANCEIRO** | Contas a Pagar/Receber, M-Pesa, Caixa Escolar, Carnês | Abertura/Fecho de Caixa, Emissão de Faturas |
| **PROFESSOR / FORMADOR** | Diário de Classe, Presenças, Lançamento de Notas | Lançamento de Frequência e Avaliações |
| **ALUNO / RESPONSÁVEL** | Portal do Aluno (16 Pilares), Extrato Financeiro | Visualização de Notas, Pagamentos via M-Pesa |
| **PORTEIRO** | Terminal Rápido da Portaria (Módulo 80) | Leitura de QR Code, Registro Entrada/Saída |
| **EMPRESA** | Portal Corporativo & Parcerias (Módulo 81) | Gestão de Vagas, Estagiários e Bolsistas |

### Trilha de Auditoria Inviolável (`auditTrail`)
Todas as alterações em notas, pagamentos e matrículas gravam:
- `timestamp`: Data e hora exatas da transação.
- `userId` e `userName`: Identificador do operador.
- `action`: Tipo de operação (`CREATE`, `UPDATE`, `CANCEL`, `APPROVE`).
- `details`: Valores antes e depois da alteração para garantia de conformidade judicial.

---

## 13. Estrutura Completa de Pastas

```
/
├── .env.example                     # Modelo de variáveis de ambiente
├── firebase-applet-config.json      # Configuração de credenciais do Firebase
├── firebase-blueprint.json          # Esquema declarativo do banco Firestore
├── firestore.rules                  # Regras de segurança e autorização NoSQL
├── package.json                     # Scripts e dependências do projeto
├── tsconfig.json                    # Configurações do compilador TypeScript
├── vite.config.ts                   # Configurações do bundler Vite e Tailwind
│
├── firebase/                        # Recursos de Infraestrutura Firebase
│   ├── firestore.rules              # Cópia rastreada das regras Firestore
│   ├── storage.rules                # Regras de segurança do Cloud Storage
│   └── functions/                   # Cloud Functions Serverless
│       └── index.ts                 # Triggers, Webhooks e Cron jobs
│
├── public/                          # Recursos estáticos servidos diretamente
│   └── favicon.svg                  # Ícone da aplicação
│
└── src/                             # Código Fonte da Aplicação
    ├── App.tsx                      # Componente raiz e roteamento dinâmico
    ├── main.tsx                     # Ponto de entrada React 19
    ├── index.css                    # Estilos globais e diretivas Tailwind v4
    │
    ├── auth/                        # Autenticação e Provedores de Identidade
    ├── components/                  # Componentes reutilizáveis de interface
    │   ├── common/                  # Modais de auth, seletores de idioma, alertas
    │   ├── Header.tsx               # Barra superior com notificações e perfil
    │   └── Sidebar.tsx              # Barra lateral hierárquica (13 módulos)
    │
    ├── context/                     # Contextos globais do React
    │   └── AppContext.tsx           # Estado unificado (inquilinos, dados, RBAC)
    │
    ├── data/                        # Dados iniciais e mocks de seed
    ├── document-studio/             # Editor visual de diplomas e certificados
    │
    ├── firebase/                    # Serviços e conectores Firebase
    │   ├── firebaseClient.ts        # Inicialização do SDK modular
    │   ├── firestoreCollections.ts  # Dicionário de coleções multi-tenant
    │   └── index.ts                 # Exportação unificada dos serviços
    │
    ├── i18n/                        # Internacionalização (Português, Inglês)
    ├── integrations/                # Integrações externas (M-Pesa, WhatsApp)
    ├── modules/                     # Registro formal de módulos do sistema
    │   └── moduleRegistry.ts        # Definição e metadados dos módulos 1 a 82+
    │
    ├── security/                    # Utilitários de encriptação e RBAC
    ├── sivec/                       # Barramento de certificação oficial SIVEC
    ├── types/                       # Tipagem estrita TypeScript (Modelos de dados)
    ├── utils/                       # Funções utilitárias (moeda Metical, datas, QR)
    │
    └── views/                       # Telas e Visões dos Módulos Operacionais
        ├── academic/                # Cursos, Matrizes, Horários e Turmas
        ├── admin/                   # Painel Super Admin e Cadastro de Escolas
        ├── attendance/              # Diário de Presenças e Aulas
        ├── cards/                   # Emissor de Carteirinhas com QR Code
        ├── dashboard/               # Dashboards estatísticos e gráficos
        ├── empresa/                 # Módulo 81: Portal Corporativo e Estágios
        ├── finance/                 # Tesouraria, Caixa, Faturas e M-Pesa
        ├── grades/                  # Pautas Oficiais, Boletins e Avaliações
        ├── porteiro/                # Módulo 80: Terminal Rápido da Portaria
        ├── public/                  # Portal Público e Inscrições Online
        ├── reports/                 # Relatórios Acadêmicos e Financeiros
        ├── secretariat/             # Gestão de Matrículas, Candidatos e Contratos
        ├── student_portal/          # Portal do Aluno (16 Pilares)
        ├── studio/                  # Studio de Design de Documentos
        └── teachers/                # Gestão de Docentes e Portal do Professor
```

---

## Suporte e Manutenção

Para suporte técnico, expansão de licenças corporativas ou homologação com entidades governamentais:
- **Equipe de Engenharia:** MozTechWave Solutions
- **Administrador Central:** `jafimpaulo8@gmail.com`
- **Versão:** 4.8.0 PRO (Multi-Tenant Enterprise)
- **Licenciamento:** Proprietário / Corporativo
