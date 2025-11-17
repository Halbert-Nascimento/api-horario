# Sistema de Autenticação e Autorização

Este documento descreve o sistema de login e controle de acesso por perfis (roles) implementado na API.

## Visão Geral

O sistema implementa:
- ✅ Autenticação via JWT (JSON Web Tokens)
- ✅ Hash de senhas com bcrypt (saltRounds = 10)
- ✅ Controle de acesso baseado em perfis (roles)
- ✅ Middleware de autenticação
- ✅ Middleware de autorização por perfil
- ✅ Validação de dados com express-validator
- ✅ Upload de arquivos com multer

## Estrutura de Tabelas

### Tabela `perfil`
```sql
CREATE TABLE perfil (
    idPerfil INT AUTO_INCREMENT PRIMARY KEY,
    nomePerfil VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela `usuarios`
```sql
CREATE TABLE usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nomeUsuario VARCHAR(255) NOT NULL,
    emailUsuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,  -- Hash bcrypt
    idPerfil INT,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idPerfil) REFERENCES perfil(idPerfil) ON DELETE SET NULL
);
```

## Endpoints da API

### Autenticação

#### POST /auth/login
Realiza login de usuário e retorna token JWT.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "perfil": "Admin",
    "perfil_id": 1
  }
}
```

**Erros:**
- `400`: Email e senha são obrigatórios
- `401`: Credenciais inválidas

### Registro

#### POST /register
Registra novo usuário no sistema.

**Request Body:**
```json
{
  "nomeUsuario": "Nome Completo",
  "emailUsuario": "usuario@exemplo.com",
  "senha": "senha123",
  "idPerfil": 1
}
```

**Validações:**
- `nomeUsuario`: obrigatório, mínimo 3 caracteres
- `emailUsuario`: obrigatório, formato de email válido
- `senha`: obrigatória, mínimo 6 caracteres
- `idPerfil`: obrigatório, número válido

**Response (201 Created):**
```json
{
  "message": "Usuário registrado com sucesso",
  "data": {
    "idUsuario": 1,
    "nomeUsuario": "Nome Completo",
    "emailUsuario": "usuario@exemplo.com",
    "idPerfil": 1
  }
}
```

**Erros:**
- `400`: Validações falharam ou email já cadastrado

### Perfis

#### GET /perfil
Lista todos os perfis.

**Response (200 OK):**
```json
[
  {
    "idPerfil": 1,
    "nomePerfil": "Admin",
    "descricao": "Administrador do sistema"
  },
  ...
]
```

#### GET /perfil/:idPerfil
Retorna um perfil específico.

#### POST /perfil
Cria novo perfil (requer autenticação).

**Request Body:**
```json
{
  "nomePerfil": "Novo Perfil"
}
```

### Usuários

#### GET /usuario
Lista todos os usuários.

#### GET /usuario/:idUsuario
Retorna usuário específico.

#### POST /usuario
Cria novo usuário (senha será hasheada automaticamente).

**Request Body:**
```json
{
  "nomeUsuario": "Nome Completo",
  "emailUsuario": "usuario@exemplo.com",
  "senha": "senha123",
  "idPerfil": 1
}
```

## Middlewares

### authMiddleware
Valida token JWT e adiciona informações do usuário ao `req.user`.

**Uso:**
```typescript
import { authMiddleware } from "../middleware/authMiddleware";

router.get("/rota-protegida", authMiddleware, controller);
```

**Header necessário:**
```
Authorization: Bearer <token>
```

**Adiciona ao request:**
```typescript
req.user = {
  id: number,
  email: string,
  perfil_id: number,
  role: string
}
```

### checkRole
Verifica se usuário tem permissão baseada em perfil.

**Uso:**
```typescript
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

// Permite apenas Admin (por ID)
router.delete("/admin-only", authMiddleware, checkRole([1]), controller);

// Permite Admin ou Professor (por nome)
router.get("/multi-role", authMiddleware, checkRole(["Admin", "Professor"]), controller);

// Permite múltiplos perfis (por ID)
router.post("/multi-id", authMiddleware, checkRole([1, 2, 3]), controller);
```

**Parâmetros:**
- `allowedRoles`: Array de IDs de perfis (number) ou nomes de perfis (string)

**Respostas de erro:**
- `401`: Usuário não autenticado
- `403`: Usuário não tem permissão

## Estrutura do Token JWT

O token JWT contém as seguintes informações:

```typescript
{
  id: number,           // ID do usuário
  email: string,        // Email do usuário
  perfil_id: number,    // ID do perfil
  role: string,         // Nome do perfil
  iat: number,          // Timestamp de criação
  exp: number           // Timestamp de expiração (1h após criação)
}
```

## Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# JWT Configuration
JWT_SECRET=seu_segredo_jwt_aqui_minimo_32_caracteres

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=api_horario
```

**Importante:** O sistema valida automaticamente se `JWT_SECRET` está definido ao iniciar.

## Segurança Implementada

### Hash de Senhas
- ✅ Bcrypt com `saltRounds = 10`
- ✅ Senhas nunca são armazenadas em texto plano
- ✅ Hash aplicado tanto em `/register` quanto em `/usuario`

### JWT
- ✅ Tokens assinados com secret do `.env`
- ✅ Expiração de 1 hora
- ✅ Validação em todas as rotas protegidas

### Validações
- ✅ express-validator para validar dados de entrada
- ✅ Verificação de email duplicado no registro
- ✅ Validação de formato de email
- ✅ Senhas com mínimo 6 caracteres

### CORS
- ✅ Configurado para aceitar `Authorization` header
- ✅ Origin configurável (padrão: localhost:3000)

## Exemplo de Fluxo Completo

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@exemplo.com",
    "senha": "senha123",
    "idPerfil": 1
  }'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "senha": "senha123"
  }'
```

### 3. Acessar rota protegida
```bash
curl -X GET http://localhost:3001/rota-protegida \
  -H "Authorization: Bearer <token_recebido_no_login>"
```

## Migrando Usuários Existentes

Se você já tem usuários no banco com senhas em texto plano, você precisa:

1. Criar um script de migração para fazer hash das senhas existentes:

```typescript
import bcrypt from "bcrypt";
import pool from "./src/config/db";

async function migratePasswords() {
  const [users]: any = await pool.query("SELECT idUsuario, senha FROM usuarios");
  
  for (const user of users) {
    // Verificar se já está hasheado (bcrypt hash tem 60 caracteres)
    if (user.senha.length === 60) continue;
    
    const hashedPassword = await bcrypt.hash(user.senha, 10);
    await pool.query(
      "UPDATE usuarios SET senha = ? WHERE idUsuario = ?",
      [hashedPassword, user.idUsuario]
    );
  }
  
  console.log("Migração concluída!");
}

migratePasswords();
```

2. ⚠️ **ATENÇÃO**: Faça backup do banco antes de executar!

## Próximos Passos / Melhorias Sugeridas

- [ ] **[Recomendado]** Implementar rate limiting nos endpoints de autenticação (login, registro)
- [ ] Implementar refresh tokens
- [ ] Registro de tentativas de login falhadas
- [ ] Reset de senha via email
- [ ] Two-factor authentication (2FA)
- [ ] Roles mais granulares com permissões específicas
- [ ] Auditoria de ações dos usuários

### Nota sobre Rate Limiting

⚠️ **Importante**: O CodeQL identificou que os endpoints de autenticação (/auth/login, /register, /perfil) não possuem rate limiting. Isso é uma recomendação de segurança para prevenir ataques de força bruta.

**Recomendação para produção**: Implementar rate limiting usando bibliotecas como:
- `express-rate-limit` - limitação de requisições
- `express-slow-down` - desaceleração progressiva

Exemplo de implementação:
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

router.post('/login', loginLimiter, login);
```

## Troubleshooting

### "JWT_SECRET não está definido"
- Crie arquivo `.env` na raiz do projeto
- Adicione `JWT_SECRET=seu_segredo_aqui`

### "Token inválido"
- Verifique se está enviando o header corretamente: `Authorization: Bearer <token>`
- Token pode ter expirado (válido por 1 hora)
- Faça login novamente para obter novo token

### "Credenciais inválidas" mesmo com senha correta
- Verifique se a senha no banco está hasheada com bcrypt
- Se migrou de sistema anterior, execute script de migração de senhas

### Erro ao registrar: "Email já cadastrado"
- Email já existe no banco de dados
- Tente com outro email ou recupere a senha
