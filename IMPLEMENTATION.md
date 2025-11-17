# Implementação do Sistema de Login e Controle de Acesso

Este documento resume a implementação completa do sistema de autenticação e autorização baseado nas especificações fornecidas.

## 📋 O Que Foi Implementado

### ✅ Sistema de Autenticação JWT
- Login com email e senha
- Geração de token JWT com expiração de 1 hora
- Validação automática de token em rotas protegidas
- Busca e inclusão do nome do perfil no token

### ✅ Sistema de Autorização por Perfis (Roles)
- Tabela `perfil` para gerenciar perfis/roles
- Controle de acesso baseado em perfil_id ou nome do perfil
- Middleware reutilizável para proteção de rotas

### ✅ Registro de Usuários
- Validação de dados com express-validator
- Hash de senhas com bcrypt (saltRounds=10)
- Verificação de email duplicado
- Upload de arquivos com multer

### ✅ Segurança
- Todas as senhas hasheadas automaticamente
- Validação obrigatória de JWT_SECRET ao iniciar
- 0 vulnerabilidades conhecidas nas dependências
- CORS configurado corretamente

## 📁 Estrutura de Arquivos Criados

```
src/
├── controller/
│   ├── authController.ts       # Login e geração de JWT
│   └── perfilController.ts     # CRUD de perfis
├── middleware/
│   ├── authMiddleware.ts       # Validação de JWT
│   └── roleMiddleware.ts       # Controle de acesso por role
└── routes/
    ├── auth.routes.ts          # POST /auth/login
    ├── register.routes.ts      # POST /register
    └── perfil.routes.ts        # CRUD /perfil

database/
└── schema_auth.sql             # Schema SQL para perfil e usuarios

docs/
├── AUTHENTICATION.md           # Documentação completa da API
└── SECURITY_SUMMARY.md         # Análise de segurança

.env.example                    # Template de variáveis de ambiente
```

## 🔧 Arquivos Modificados

### `src/routes/app.ts`
- ✅ Import de dotenv
- ✅ Validação de JWT_SECRET e variáveis de DB
- ✅ Montagem das rotas /auth, /register, /perfil

### `src/controller/usuarioController.ts`
- ✅ Import de bcrypt
- ✅ Hash automático de senha ao criar usuário

### `package.json`
- ✅ Novas dependências: bcrypt, jsonwebtoken, express-validator, multer
- ✅ Novas devDependencies: @types para as libs acima

### `.gitignore`
- ✅ Adicionado dist/, uploads/, arquivos de IDE e SO

### `README.md`
- ✅ Atualizado com informações sobre o sistema de autenticação

## 🚀 Como Usar

### 1. Configurar Banco de Dados

Execute o script SQL para criar as tabelas necessárias:

```bash
mysql -u root -p api_horario < database/schema_auth.sql
```

Isso criará:
- Tabela `perfil` (idPerfil, nomePerfil, descricao)
- Tabela `usuarios` (se não existir)
- Perfis padrão: Admin, Professor, Coordenador
- Índices para performance

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` e configure:

```env
# OBRIGATÓRIO - mínimo 32 caracteres aleatórios
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_minimo_32_chars

# Configuração do banco
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=api_horario
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar a Aplicação

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm run build
npm start
```

## 📚 Endpoints Disponíveis

### Autenticação

#### POST /auth/login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exemplo.com",
    "senha": "senha123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@exemplo.com",
    "nome": "Administrador",
    "perfil": "Admin",
    "perfil_id": 1
  }
}
```

### Registro

#### POST /register
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@exemplo.com",
    "senha": "senha123",
    "idPerfil": 2
  }'
```

### Perfis

#### GET /perfil
Lista todos os perfis disponíveis.

#### POST /perfil
Cria novo perfil (requer autenticação).

### Rotas Protegidas

Para acessar rotas que requerem autenticação, inclua o token no header:

```bash
curl -X GET http://localhost:3001/usuario \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔐 Como Proteger Rotas

### Exemplo 1: Apenas usuários autenticados

```typescript
import { authMiddleware } from "../middleware/authMiddleware";

router.get("/rota-protegida", authMiddleware, controller);
```

### Exemplo 2: Apenas Admin (por ID)

```typescript
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

router.delete("/admin-only", authMiddleware, checkRole([1]), controller);
```

### Exemplo 3: Admin ou Professor (por nome)

```typescript
router.get("/multi-role", 
  authMiddleware, 
  checkRole(["Admin", "Professor"]), 
  controller
);
```

### Exemplo 4: Múltiplos perfis por ID

```typescript
router.post("/multi-id", 
  authMiddleware, 
  checkRole([1, 2, 3]), 
  controller
);
```

## 🔄 Compatibilidade com Sistema Existente

### ✅ Mantido Intacto
- Tabela `usuarios` (não `usuario`)
- Campos: `idUsuario`, `nomeUsuario`, `emailUsuario`, `senha`, `idPerfil`, `ativo`
- Todas as rotas existentes continuam funcionando
- Controllers existentes não foram modificados (exceto usuarioController para hash de senha)

### ✅ Adicionado
- Tabela `perfil` com relação FK
- Hash automático de senhas
- Validação de JWT_SECRET
- Novas rotas de autenticação

## 🛡️ Segurança

### Implementado
- ✅ Bcrypt para hash de senhas (saltRounds=10)
- ✅ JWT com expiração de 1 hora
- ✅ Validação de variáveis de ambiente críticas
- ✅ Express-validator para validação de entrada
- ✅ Verificação de email duplicado
- ✅ CORS configurado
- ✅ 0 vulnerabilidades nas dependências

### Recomendado para Produção
- ⚠️ Rate limiting nos endpoints /auth/login e /register
- ⚠️ HTTPS obrigatório
- ⚠️ Logging de tentativas de login
- ⚠️ Helmet.js para headers de segurança

**Ver documentação completa em:** [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)

## 📖 Documentação Completa

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Guia completo da API de autenticação
  - Estrutura das tabelas
  - Todos os endpoints com exemplos
  - Como usar middlewares
  - Estrutura do token JWT
  - Exemplos de fluxo completo
  - Troubleshooting

- **[SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)** - Análise de segurança
  - Vulnerabilidades verificadas e corrigidas
  - Análise CodeQL
  - Recomendações para produção
  - Decisões de segurança tomadas

## 🧪 Testes Realizados

- ✅ TypeScript typecheck: passou
- ✅ Build: passou
- ✅ npm audit: 0 vulnerabilidades
- ✅ GitHub Advisory Database: 0 vulnerabilidades
- ✅ CodeQL: 5 alertas (rate limiting) documentados

## 🔄 Migrando Usuários Existentes

Se você já tem usuários com senhas em texto plano:

```typescript
// Script de migração (executar UMA vez)
import bcrypt from "bcrypt";
import pool from "./src/config/db";

async function migratePasswords() {
  const [users]: any = await pool.query(
    "SELECT idUsuario, senha FROM usuarios"
  );
  
  for (const user of users) {
    // Pular se já está hasheado (60 chars)
    if (user.senha.length === 60) continue;
    
    const hash = await bcrypt.hash(user.senha, 10);
    await pool.query(
      "UPDATE usuarios SET senha = ? WHERE idUsuario = ?",
      [hash, user.idUsuario]
    );
  }
  
  console.log("Migração concluída!");
}

migratePasswords();
```

⚠️ **ATENÇÃO**: Faça backup do banco antes!

## ❓ Perguntas Frequentes

### O sistema funciona sem .env?
Não. O sistema valida a presença de `JWT_SECRET` ao iniciar e não permite execução sem essa variável configurada.

### Posso usar senhas mais fracas?
Tecnicamente sim (mínimo 6 caracteres), mas não é recomendado. O bcrypt com salt forte ajuda, mas senhas fortes são sempre melhores.

### Como adiciono novos perfis?
Use o endpoint `POST /perfil` ou insira diretamente no banco:
```sql
INSERT INTO perfil (nomePerfil, descricao) 
VALUES ('NovoPerfil', 'Descrição do perfil');
```

### Preciso recriar usuários existentes?
Não! Apenas execute o script de migração de senhas acima para fazer hash das senhas existentes.

### Rate limiting é obrigatório?
Para desenvolvimento/staging: não.
Para produção: **SIM, altamente recomendado**.

## 📞 Próximos Passos

1. ✅ Revisar documentação: [AUTHENTICATION.md](./AUTHENTICATION.md)
2. ✅ Configurar .env com JWT_SECRET forte
3. ✅ Executar schema SQL no banco
4. ✅ Testar login e registro
5. ⚠️ Antes de produção: implementar rate limiting
6. ⚠️ Antes de produção: configurar HTTPS

## 🎯 Conclusão

O sistema de autenticação está **completo e funcional** para uso em desenvolvimento/staging.

Todas as especificações foram implementadas:
- ✅ Mantém configurações originais do projeto
- ✅ Não modifica funcionalidades existentes
- ✅ Adiciona apenas o necessário para login
- ✅ Segue as melhores práticas de segurança
- ✅ Documentação completa e exemplos práticos

**Status:** Pronto para uso em desenvolvimento. Revisar [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) antes de produção.
