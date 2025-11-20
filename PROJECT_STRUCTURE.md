# Estrutura do Projeto - Sistema de Autenticação

## 📊 Visão Geral

```
api-horario/
├── 📄 AUTHENTICATION.md          # Documentação completa da API de autenticação
├── 📄 IMPLEMENTATION.md          # Guia de implementação e uso
├── 📄 SECURITY_SUMMARY.md        # Análise de segurança e recomendações
├── 📄 README.md                  # README principal do projeto
├── 📄 .env.example               # Template de variáveis de ambiente
│
├── 📁 database/
│   └── schema_auth.sql           # Schema SQL (perfil + usuarios)
│
├── 📁 src/
│   ├── 📁 config/
│   │   └── db.ts                 # Pool de conexão MySQL
│   │
│   ├── 📁 controller/
│   │   ├── authController.ts     # ✨ Login e geração de JWT
│   │   ├── perfilController.ts   # ✨ CRUD de perfis
│   │   ├── usuarioController.ts  # 🔧 Modificado: hash de senhas
│   │   └── ... (outros controllers originais)
│   │
│   ├── 📁 middleware/
│   │   ├── authMiddleware.ts     # ✨ Validação de JWT
│   │   └── roleMiddleware.ts     # ✨ Controle de acesso por role
│   │
│   ├── 📁 routes/
│   │   ├── auth.routes.ts        # ✨ POST /auth/login
│   │   ├── register.routes.ts    # ✨ POST /register
│   │   ├── perfil.routes.ts      # ✨ CRUD /perfil
│   │   ├── app.ts                # 🔧 Modificado: validação env + rotas
│   │   └── ... (outras rotas originais)
│   │
│   └── server.ts
│
└── 📁 node_modules/
    ├── bcrypt@6.0.0
    ├── jsonwebtoken@9.0.2
    ├── express-validator@7.3.0
    └── multer@2.0.2

Legenda:
✨ Novo arquivo criado
🔧 Arquivo modificado
```

## 🗂️ Arquivos por Categoria

### Autenticação
- `src/controller/authController.ts` - Login, validação, JWT
- `src/middleware/authMiddleware.ts` - Validação de token
- `src/routes/auth.routes.ts` - Rota de login

### Autorização
- `src/controller/perfilController.ts` - Gerenciamento de perfis
- `src/middleware/roleMiddleware.ts` - Verificação de permissões
- `src/routes/perfil.routes.ts` - Rotas de perfil

### Registro
- `src/routes/register.routes.ts` - Validação + hash + upload

### Documentação
- `AUTHENTICATION.md` - 📘 Guia da API
- `IMPLEMENTATION.md` - 📗 Guia de uso
- `SECURITY_SUMMARY.md` - 📕 Análise de segurança

### Banco de Dados
- `database/schema_auth.sql` - DDL e dados iniciais

### Configuração
- `.env.example` - Template de variáveis

## 📦 Dependências Adicionadas

### Runtime
```json
{
  "bcrypt": "^6.0.0",           // Hash de senhas
  "jsonwebtoken": "^9.0.2",     // JWT tokens
  "express-validator": "^7.3.0", // Validações
  "multer": "^2.0.2"            // Upload de arquivos
}
```

### Development
```json
{
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.7",
  "@types/multer": "^1.4.12"
}
```

## 🔄 Fluxo de Dados

### Login
```
Cliente
  ↓ POST /auth/login {email, senha}
auth.routes.ts
  ↓
authController.login()
  ↓ Query: SELECT * FROM usuarios WHERE emailUsuario = ?
  ↓ bcrypt.compare(senha, hash)
  ↓ Query: SELECT nomePerfil FROM perfil WHERE idPerfil = ?
  ↓ jwt.sign({id, email, perfil_id, role})
  ↓
Cliente ← {token, user}
```

### Rota Protegida
```
Cliente
  ↓ GET /rota-protegida
  ↓ Header: Authorization: Bearer <token>
authMiddleware
  ↓ jwt.verify(token)
  ↓ req.user = decoded
  ↓
checkRole (opcional)
  ↓ Verifica perfil_id ou role
  ↓
Controller
  ↓
Cliente ← Response
```

### Registro
```
Cliente
  ↓ POST /register {nome, email, senha, perfil}
register.routes.ts
  ↓ express-validator
  ↓ multer (upload opcional)
  ↓ Query: SELECT WHERE email = ? (verificar duplicado)
  ↓ bcrypt.hash(senha, 10)
  ↓ Query: INSERT INTO usuarios
  ↓
Cliente ← {message, data}
```

## 🗄️ Schema do Banco

### Tabela: perfis
```sql
idPerfil (PK, AUTO_INCREMENT)
nomePerfil (VARCHAR(100), UNIQUE)
```

**Perfis padrão (nesta ordem):**
- 1: Professor
- 2: Coordenador
- 3: Admin

### Tabela: usuarios
```sql
idUsuario (PK, AUTO_INCREMENT)
nomeUsuario (VARCHAR(100))
emailUsuario (VARCHAR(100), UNIQUE)
senha (VARCHAR(255)) -- Hash bcrypt
idPerfil (FK → perfis.idPerfil)
ativo (TINYINT)
criadoEm (TIMESTAMP)
criadoPor (INT)
atualizadoEm (TIMESTAMP)
atualizadoPor (INT)

INDEX: fk_perfil_usuario_idx (idPerfil)
INDEX: nomeUsuario_idx (nomeUsuario)
```

## 🔐 Token JWT Payload

```typescript
{
  id: number,          // idUsuario
  email: string,       // emailUsuario
  perfil_id: number,   // idPerfil
  role: string,        // nomePerfil
  iat: number,         // Timestamp de criação
  exp: number          // Timestamp de expiração (1h)
}
```

## 📋 Checklist de Implementação

- [x] Instalar dependências
- [x] Criar tabelas no banco (schema_auth.sql)
- [x] Configurar .env (JWT_SECRET)
- [x] Criar controllers de autenticação
- [x] Criar middlewares (auth + role)
- [x] Criar rotas (auth, register, perfil)
- [x] Atualizar usuarioController (hash)
- [x] Atualizar app.ts (validação + rotas)
- [x] Documentar API
- [x] Testar typecheck
- [x] Testar build
- [x] Verificar segurança
- [x] Documentar recomendações

## ✅ Status: COMPLETO

Todos os arquivos criados, testados e documentados.
Pronto para uso em desenvolvimento/staging.
