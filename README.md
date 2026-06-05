# CRM Cláudia Pacheco

Sistema interno de gestão clínica para Dra. Cláudia Pacheco — dentista e especialista em medicina estética (Botox, Sculptra, Exossomos, Preenchimentos, Bioestimuladores, Harmonização Facial, Estética Dental) atuante no Brasil e Portugal.

## Requisitos

- Node.js 18+
- npm 9+

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações (por padrão, pronto para desenvolvimento local)

# 3. Criar e migrar banco de dados
npx prisma migrate dev

# 4. Popular banco com dados de exemplo
npm run seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

**Login padrão:** `admin@clinicacp.com` / `admin123`

## Variáveis de ambiente

| Variável | Descrição | Padrão dev |
|---|---|---|
| `DATABASE_URL` | URL do banco (SQLite em dev, Postgres em prod) | `file:./dev.db` |
| `AUTH_SECRET` | Chave secreta JWT — **alterar em produção** | valor aleatório |
| `NEXTAUTH_URL` | URL base da aplicação | `http://localhost:3000` |
| `STORAGE_PATH` | Pasta para arquivos enviados (dev) | `./storage` |

## Deploy no Vercel

1. Crie um projeto no Vercel e conecte este repositório.
2. Adicione as variáveis de ambiente no painel do Vercel:
   - `DATABASE_URL` — use Neon ou Vercel Postgres (mude `provider` para `postgresql` no `prisma/schema.prisma`)
   - `AUTH_SECRET` — gere com `openssl rand -base64 32`
   - `NEXTAUTH_URL` — URL do seu domínio Vercel
3. Para produção, troque o `Storage` local por **Vercel Blob** ou **AWS S3** implementando a interface `Storage` em `lib/storage/index.ts`.
4. Execute as migrações Prisma no banco de produção.

## Estrutura do projeto

```
app/
  (app)/           # Rotas protegidas por autenticação
    agenda/        # Módulo Agenda
    pacientes/     # Módulo Pacientes
    dashboard/     # Módulo Dashboard
  api/             # Route Handlers
  login/           # Página de login
lib/
  db/              # Cliente Prisma singleton
  auth/            # Configuração Auth.js
  storage/         # Interface de armazenamento de arquivos
  format/          # Helpers de formatação (datas, moedas)
  i18n/            # Dicionário pt-BR
  schemas/         # Schemas Zod compartilhados
components/
  ui/              # Componentes de UI reutilizáveis
  layout/          # Nav, shell
prisma/
  schema.prisma    # Schema do banco
  seed.ts          # Dados de exemplo
```

## Como adicionar um novo campo ou módulo

### Novo campo num modelo existente
1. Adicione o campo no `prisma/schema.prisma`
2. Execute `npx prisma migrate dev --name add_campo`
3. Atualize o schema Zod em `lib/schemas/index.ts`
4. Atualize o formulário e a exibição no componente relevante

### Novo módulo (ex: Marketing)
1. Crie `app/(app)/marketing/` com `page.tsx` e os componentes necessários
2. Crie os route handlers em `app/api/marketing/`
3. Adicione modelos Prisma se necessário
4. Adicione o link de navegação em `components/layout/nav.tsx`
5. Adicione strings em `lib/i18n/pt.ts`

### Trocar Storage para produção (Vercel Blob / S3)
Implemente a mesma interface `{ save, get, delete }` em `lib/storage/index.ts` e substitua a implementação. Nenhum outro arquivo precisa mudar.

## SEGURANÇA / CONFORMIDADE

### Implementado
- Autenticação obrigatória em todas as rotas (middleware Next.js)
- Senhas hasheadas com bcrypt (salt rounds: 12)
- Arquivos servidos **apenas** via rota autenticada (`/api/files/[key]`)
- Validação de tipo e tamanho de arquivo no upload
- Consentimento de marketing com timestamp
- Soft-delete de pacientes (preserva dados)
- Hard-delete disponível via `DELETE /api/patients/[id]?hard=true`
- Exportação de dados por paciente (JSON) para exercício de direitos LGPD/GDPR
- Segredos via variáveis de ambiente (nunca commitados)
- Path traversal prevenido no Storage local

### Requer revisão profissional antes do uso em produção
- **Criptografia em repouso**: o SQLite local e os arquivos em `./storage` não são criptografados. Em produção, use um banco gerenciado com encryption at rest e blob storage com server-side encryption.
- **Acordo de Processamento de Dados (DPA)**: necessário com todos os fornecedores de cloud (Vercel, Neon, etc.) para conformidade com LGPD e GDPR.
- **Política de retenção de dados**: defina por quanto tempo dados de pacientes são mantidos e implemente exclusão automática.
- **Registro de auditoria**: o schema inclui espaço para uma tabela `AuditLog` (não implementada). Recomendado para rastreabilidade de acesso a dados sensíveis.
- **HTTPS**: obrigatório em produção. O Vercel provê automaticamente.
- **Conformidade com CFM/CFO e publicidade médica**: as regras brasileiras e portuguesas para prontuários eletrônicos e publicidade de serviços médicos requerem revisão por advogado especializado.
- **Este sistema não garante conformidade legal.** A responsabilidade pela adequação às normas aplicáveis é do operador do sistema.
