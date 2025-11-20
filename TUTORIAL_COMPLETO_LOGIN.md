# 📚 Tutorial Completo: Sistema de Login do Zero

## 🎯 Objetivo Deste Tutorial

Este documento vai ensinar, passo a passo, como foi criado o sistema de login e permissões do projeto. Vou explicar cada arquivo, cada linha de código, e por que cada coisa é necessária. Mesmo se você nunca fez um sistema de login, vai entender tudo!

---

## 📖 Índice

1. [O que é um Sistema de Login?](#1-o-que-é-um-sistema-de-login)
2. [Conceitos Básicos que Você Precisa Saber](#2-conceitos-básicos)
3. [Ordem de Criação dos Arquivos](#3-ordem-de-criação)
4. [Passo a Passo Detalhado](#4-passo-a-passo-detalhado)
5. [Pontos de Atenção e Erros Comuns](#5-pontos-de-atenção)
6. [Testando o Sistema](#6-testando-o-sistema)

---

## 1. O que é um Sistema de Login?

Imagine uma escola com três tipos de pessoas:

- **Professor**: Pode ver a grade de aulas dele, mas não pode mudar nada
- **Coordenador**: Pode ver e mudar coisas do curso que ele coordena
- **Admin**: Pode fazer tudo no sistema

Um sistema de login faz 3 coisas principais:

1. **Autenticação**: Verifica se você é quem diz ser (login com email e senha)
2. **Autorização**: Define o que você pode fazer (se é Professor, Coordenador ou Admin)
3. **Controle de Permissões**: Bloqueia ações que você não pode fazer

---

## 2. Conceitos Básicos

### 2.1 O que é JWT (Token)?

Imagine que você tem um crachá especial que:
- Tem seu nome
- Tem seu cargo (Professor, Coordenador ou Admin)
- Expira depois de 1 hora
- Ninguém consegue falsificar

Este "crachá" é o JWT (JSON Web Token). Toda vez que você faz uma ação no sistema, mostra esse crachá.

### 2.2 O que é Hash de Senha?

Nunca guardamos a senha do usuário diretamente no banco de dados. Em vez disso, transformamos ela em um código impossível de reverter. É como um liquidificador: você põe a senha, ela vira um código misturado, e não dá pra voltar ao original.

**Exemplo:**
- Senha: `minhaSenha123`
- Hash: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

Mesmo se alguém roubar o banco de dados, não consegue ver a senha verdadeira.

### 2.3 Middleware: O Guarda de Segurança

Middleware é como um segurança na porta de cada sala. Antes de você entrar (executar uma função), o middleware verifica:
- Você está logado? (tem um token válido?)
- Você tem permissão pra entrar aqui? (é Admin? Professor?)

Se tudo OK, ele deixa passar. Se não, te barra na porta.

---

## 3. Ordem de Criação

Vou explicar a ordem correta de criar os arquivos. É importante seguir essa ordem porque cada arquivo depende do anterior:

```
1. PRIMEIRO: Configurar banco de dados e variáveis de ambiente
   └─> Sem isso, nada funciona

2. SEGUNDO: Criar tabelas no banco (perfis e usuarios)
   └─> Precisa ter onde guardar os dados

3. TERCEIRO: Instalar bibliotecas necessárias
   └─> As ferramentas que vamos usar

4. QUARTO: Criar middlewares (guardas de segurança)
   └─> authMiddleware (verifica se está logado)
   └─> roleMiddleware (verifica o cargo)
   └─> permissionMiddleware (verifica permissões específicas)

5. QUINTO: Criar controller de autenticação
   └─> authController (faz o login)

6. SEXTO: Criar rotas de autenticação
   └─> auth.routes (endpoint de login)

7. SÉTIMO: Criar rota de registro
   └─> register.routes (cadastro de usuários)

8. OITAVO: Proteger as rotas existentes
   └─> Adicionar os guardas nas rotas

9. NONO: Testar tudo!
```

---

## 4. Passo a Passo Detalhado

### PASSO 1: Configurar Variáveis de Ambiente

**O que é:** Um arquivo que guarda informações secretas do projeto.

**Arquivo:** `.env` (na raiz do projeto)

**Por que fazer primeiro:** Sem isso, o sistema não sabe como conectar no banco nem como criar os tokens.

**Como fazer:**

```bash
# Criar arquivo .env
JWT_SECRET=meu-segredo-super-secreto-aqui-12345
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua-senha-aqui
DB_DATABASE=grade_horario
DB_PORT=3306
```

**O que cada linha faz:**
- `JWT_SECRET`: A senha mestra para criar os tokens (crachás)
- `DB_HOST`: Onde está o banco de dados (localhost = no seu computador)
- `DB_USER`: Usuário do MySQL
- `DB_PASSWORD`: Senha do MySQL
- `DB_DATABASE`: Nome do banco que vamos usar
- `DB_PORT`: Porta do MySQL (padrão é 3306)

**⚠️ ATENÇÃO:** Nunca compartilhe o arquivo `.env`! Coloque ele no `.gitignore`

---

### PASSO 2: Criar Tabelas no Banco de Dados

**O que é:** As "gavetas" onde vamos guardar os dados dos usuários e perfis.

**Arquivo:** `database/schema_auth.sql`

**Por que fazer agora:** Precisa ter onde guardar as informações.

**Como fazer:**

```sql
-- Criar pasta database/ se não existir
-- Criar arquivo schema_auth.sql dentro dela

-- Tabela de perfis (cargos: Professor, Coordenador, Admin)
CREATE TABLE IF NOT EXISTS perfis (
    idPerfil INT AUTO_INCREMENT PRIMARY KEY,
    nomePerfil VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB;

-- Inserir os 3 perfis na ordem correta
INSERT INTO perfis (nomePerfil) VALUES ('Professor');   -- ID será 1
INSERT INTO perfis (nomePerfil) VALUES ('Coordenador'); -- ID será 2
INSERT INTO perfis (nomePerfil) VALUES ('Admin');       -- ID será 3

-- Verificar se tabela usuarios já existe, se não, criar
-- (Provavelmente já existe no seu banco)
```

**Executar no MySQL:**

```bash
mysql -u root -p grade_horario < database/schema_auth.sql
```

**O que aconteceu:**
- Criamos 3 "crachás diferentes": Professor, Coordenador e Admin
- Cada um tem um número (1, 2, 3)
- Quando criar um usuário, vamos dizer qual crachá ele tem

---

### PASSO 3: Instalar Bibliotecas Necessárias

**O que é:** Ferramentas prontas que outras pessoas criaram para facilitar nossa vida.

**Arquivo:** `package.json` (já existe)

**Por que fazer agora:** Vamos usar essas ferramentas nos próximos passos.

**Como fazer:**

```bash
# No terminal, dentro da pasta do projeto
npm install bcrypt jsonwebtoken express-validator multer

# Instalar os tipos (para TypeScript entender)
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/multer
```

**O que cada biblioteca faz:**

1. **bcrypt**: O "liquidificador" de senhas (faz o hash)
2. **jsonwebtoken**: Cria e valida os tokens (crachás)
3. **express-validator**: Verifica se email é válido, senha tem tamanho certo, etc
4. **multer**: Permite upload de arquivos (foto de perfil)

---

### PASSO 4: Criar o Middleware de Autenticação

**O que é:** O primeiro guarda. Ele verifica se você está logado.

**Arquivo:** `src/middleware/authMiddleware.ts`

**Por que fazer agora:** Este é o guarda principal. Sem ele, qualquer um entra.

**Como criar:**

```typescript
// src/middleware/authMiddleware.ts

// Importar as ferramentas que vamos usar
import jwt from "jsonwebtoken";  // Para validar o token
import { Request, Response, NextFunction } from "express";  // Tipos do Express

// Dizer ao TypeScript que req.user existe
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;           // ID do usuário
        email: string;        // Email do usuário
        perfil_id: number;    // Qual cargo (1, 2 ou 3)
        role: string;         // Nome do cargo
      };
    }
  }
}

// O GUARDA PRINCIPAL
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Pegar o token que o usuário enviou
  const token = req.headers.authorization?.split(" ")[1];
  
  // 2. Se não tem token, barrar na porta
  if (!token) {
    return res.status(401).json({ 
      message: "Você precisa estar logado para acessar isso." 
    });
  }

  try {
    // 3. Verificar se o token é válido
    const jwtSecret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // 4. Salvar os dados do usuário no request
    req.user = decoded;
    
    // 5. Deixar passar para a próxima função
    next();
    
  } catch (error) {
    // Se o token for falso ou expirado
    return res.status(401).json({ 
      message: "Token inválido ou expirado. Faça login novamente." 
    });
  }
};
```

**Explicação linha por linha:**

1. **Linhas 1-3**: Importamos as ferramentas
2. **Linhas 5-15**: Dizemos que `req.user` vai existir e ter essas informações
3. **Linha 18**: Pegamos o token do cabeçalho `Authorization: Bearer TOKEN_AQUI`
4. **Linhas 21-24**: Se não tem token, retorna erro 401 (não autorizado)
5. **Linha 28**: Verificamos se o token é válido usando a senha secreta
6. **Linha 31**: Guardamos os dados do usuário em `req.user`
7. **Linha 34**: Chamamos `next()` para ir para a próxima função
8. **Linhas 36-40**: Se deu erro, token é inválido

**Onde este arquivo é usado:**
- Em TODAS as rotas que precisam de autenticação
- Exemplo: `router.get("/disciplina", authMiddleware, getDisciplina)`

---

### PASSO 5: Criar o Middleware de Cargo (Role)

**O que é:** O segundo guarda. Ele verifica qual seu cargo.

**Arquivo:** `src/middleware/roleMiddleware.ts`

**Por que criar:** Para bloquear ações por cargo (ex: só Admin pode criar professores).

**Como criar:**

```typescript
// src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from "express";

// GUARDA QUE VERIFICA O CARGO
export const checkRole = (allowedRoles: Array<number | string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Pegar o usuário que o authMiddleware salvou
    const user = req.user;
    
    // 2. Se não tem usuário, algo deu errado
    if (!user) {
      return res.status(401).json({ 
        message: "Você precisa estar logado." 
      });
    }

    // 3. Verificar se o cargo dele está na lista permitida
    const hasPermission = 
      allowedRoles.includes(user.perfil_id) ||  // Por número (1, 2, 3)
      allowedRoles.includes(user.role);         // Por nome ("Admin")
    
    // 4. Se não tem permissão, barrar
    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Você não tem permissão para fazer isso." 
      });
    }

    // 5. Se tem permissão, deixar passar
    next();
  };
};
```

**Explicação:**

- **Linha 6**: A função recebe uma lista de cargos permitidos
  - Exemplo: `[3]` = só Admin
  - Exemplo: `[2, 3]` = Coordenador e Admin
- **Linha 14-17**: Verificamos se `req.user` existe (authMiddleware deve vir primeiro!)
- **Linha 20-21**: Verificamos se o cargo do usuário está na lista
- **Linha 24-27**: Se não está, retorna erro 403 (proibido)
- **Linha 30**: Se está, deixa passar

**Onde usar:**

```typescript
// Só Admin pode criar professores
router.post("/professor", authMiddleware, checkRole([3]), createProfessor);

// Coordenador e Admin podem criar disciplinas
router.post("/disciplina", authMiddleware, checkRole([2, 3]), createDisciplina);
```

---

### PASSO 6: Criar o Middleware de Permissões Específicas

**O que é:** Guardas especializados para regras mais complexas.

**Arquivo:** `src/middleware/permissionMiddleware.ts`

**Por que criar:** Para regras como "Coordenador só pode mexer no curso dele".

**Como criar:**

```typescript
// src/middleware/permissionMiddleware.ts

import { Request, Response, NextFunction } from "express";
import pool from "../config/db";  // Conexão com o banco

// ========================================
// GUARDA 1: Bloqueia Professor de Editar
// ========================================
export const preventProfessorEdit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  
  // Se não está logado, barrar
  if (!user) {
    return res.status(401).json({ message: "Não autenticado." });
  }
  
  // Se é Professor (perfil_id = 1), bloquear
  if (user.perfil_id === 1) {
    return res.status(403).json({ 
      message: "Professores não podem criar, editar ou deletar. Somente visualizar." 
    });
  }
  
  // Se é Coordenador ou Admin, deixar passar
  next();
};

// ========================================
// GUARDA 2: Verifica Acesso ao Curso
// ========================================
export const checkCursoOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const idCurso = parseInt(req.params.idCurso);
  
  // Admin pode tudo
  if (user.perfil_id === 3) {
    return next();
  }
  
  try {
    // Buscar o professor pelo usuário
    const [professor]: any = await pool.query(
      "SELECT idProfessor FROM Professores WHERE idUsuario = ?",
      [user.id]
    );
    
    if (!professor[0]) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    
    // Verificar se o professor está vinculado ao curso
    const [vinculo]: any = await pool.query(
      "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
      [professor[0].idProfessor, idCurso]
    );
    
    // Se não tem vínculo, bloquear
    if (vinculo.length === 0) {
      return res.status(403).json({ 
        message: "Você não tem acesso a este curso." 
      });
    }
    
    // Se tem vínculo, deixar passar
    next();
    
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar permissão." });
  }
};

// ... outros guardas especializados ...
```

**Explicação:**

**preventProfessorEdit:**
- Linha 22: Se perfil_id = 1 (Professor), bloqueia
- Linha 29: Se não é Professor, deixa passar

**checkCursoOwnership:**
- Linha 44: Admin sempre passa
- Linhas 48-52: Busca o ID do professor na tabela Professores
- Linhas 58-61: Verifica se existe vínculo na tabela Professor_Curso
- Linha 64: Se não tem vínculo, bloqueia
- Linha 71: Se tem vínculo ou é Admin, deixa passar

**Onde usar:**

```typescript
// Professor só vê seus cursos, Coordenador só seu curso
router.get("/:idCurso", authMiddleware, checkCursoOwnership, getCurso);

// Bloqueia Professor de editar
router.put("/:idCurso", authMiddleware, preventProfessorEdit, checkCursoOwnership, updateCurso);
```

---

### PASSO 7: Criar o Controller de Autenticação (Login)

**O que é:** A função que realmente faz o login acontecer.

**Arquivo:** `src/controller/authController.ts`

**Por que criar agora:** Agora que temos os guardas, precisamos da porta de entrada.

**Como criar:**

```typescript
// src/controller/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";  // Para comparar senhas
import jwt from "jsonwebtoken";  // Para criar o token
import pool from "../config/db";  // Banco de dados

// FUNÇÃO DE LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    // 1. Pegar email e senha que o usuário enviou
    const { email, senha } = req.body;
    
    // 2. Verificar se enviou email e senha
    if (!email || !senha) {
      return res.status(400).json({ 
        message: "Email e senha são obrigatórios." 
      });
    }
    
    // 3. Buscar usuário no banco pelo email
    const [rows]: any = await pool.query(
      "SELECT * FROM usuarios WHERE emailUsuario = ?",
      [email]
    );
    
    // 4. Se não encontrou usuário, erro
    if (rows.length === 0) {
      return res.status(401).json({ 
        message: "Email ou senha incorretos." 
      });
    }
    
    const usuario = rows[0];
    
    // 5. Comparar a senha enviada com a senha do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    // 6. Se senha errada, erro
    if (!senhaValida) {
      return res.status(401).json({ 
        message: "Email ou senha incorretos." 
      });
    }
    
    // 7. Buscar o nome do perfil (Professor, Coordenador ou Admin)
    let nomePerfil = null;
    if (usuario.idPerfil) {
      const [perfil]: any = await pool.query(
        "SELECT nomePerfil FROM perfis WHERE idPerfil = ?",
        [usuario.idPerfil]
      );
      nomePerfil = perfil[0]?.nomePerfil || null;
    }
    
    // 8. Criar o token (crachá) com as informações do usuário
    const jwtSecret = process.env.JWT_SECRET as string;
    const tokenPayload = {
      id: usuario.idUsuario,
      email: usuario.emailUsuario,
      perfil_id: usuario.idPerfil,
      role: nomePerfil
    };
    
    const token = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: "1h"  // Expira em 1 hora
    });
    
    // 9. Retornar o token e dados do usuário
    res.status(200).json({
      message: "Login realizado com sucesso!",
      token: token,
      user: {
        id: usuario.idUsuario,
        nome: usuario.nomeUsuario,
        email: usuario.emailUsuario,
        perfil: nomePerfil
      }
    });
    
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor." });
  }
};
```

**Explicação passo a passo:**

1. **Linhas 12**: Pegamos email e senha do body
2. **Linhas 15-18**: Verificamos se foram enviados
3. **Linhas 21-24**: Buscamos o usuário no banco
4. **Linhas 27-31**: Se não achou, email não existe
5. **Linha 36**: Comparamos senha enviada com hash do banco
6. **Linhas 39-43**: Se senha não bate, erro
7. **Linhas 46-53**: Buscamos o nome do cargo
8. **Linhas 56-66**: Criamos o token com JWT
9. **Linhas 69-79**: Retornamos token e dados

**Fluxo completo:**
```
Usuário → Email + Senha → Busca no Banco → Compara Senha → Busca Perfil → Cria Token → Retorna Token
```

---

### PASSO 8: Criar a Rota de Login

**O que é:** O endpoint que o frontend vai chamar para fazer login.

**Arquivo:** `src/routes/auth.routes.ts`

**Por que criar:** Precisamos expor a função de login via HTTP.

**Como criar:**

```typescript
// src/routes/auth.routes.ts

import express from "express";
import { login } from "../controller/authController";

// Criar um roteador
const router = express.Router();

// Rota POST /auth/login
router.post("/login", login);

// Exportar o roteador
export default router;
```

**Explicação:**
- Linha 7: Criamos um roteador (grupo de rotas)
- Linha 10: Definimos que POST /login chama a função login
- Linha 13: Exportamos para usar em outro arquivo

**Registrar no app principal:**

No arquivo `src/routes/app.ts`, adicionar:

```typescript
import authRoutes from "./auth.routes";

// ...

app.use("/auth", authRoutes);  // Rotas ficam /auth/login
```

**Como usar:**

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "professor@email.com", "senha": "123456"}'
```

---

### PASSO 9: Criar a Rota de Registro

**O que é:** Cadastro de novos usuários com validações.

**Arquivo:** `src/routes/register.routes.ts`

**Por que criar:** Para adicionar usuários ao sistema.

**Como criar:**

```typescript
// src/routes/register.routes.ts

import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import pool from "../config/db";

const router = express.Router();

// Rota POST /register
router.post(
  "/",
  [
    // Validações
    body("nomeUsuario").trim().notEmpty().withMessage("Nome é obrigatório"),
    body("emailUsuario").isEmail().withMessage("Email inválido"),
    body("senha").isLength({ min: 6 }).withMessage("Senha mínimo 6 caracteres"),
    body("idPerfil").isInt({ min: 1, max: 3 }).withMessage("Perfil inválido"),
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { nomeUsuario, emailUsuario, senha, idPerfil } = req.body;

      // Verificar se email já existe
      const [existing]: any = await pool.query(
        "SELECT * FROM usuarios WHERE emailUsuario = ?",
        [emailUsuario]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      // Hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Inserir usuário
      const [result]: any = await pool.query(
        "INSERT INTO usuarios (nomeUsuario, emailUsuario, senha, idPerfil) VALUES (?, ?, ?, ?)",
        [nomeUsuario, emailUsuario, senhaHash, idPerfil]
      );

      res.status(201).json({
        message: "Usuário criado com sucesso!",
        id: result.insertId
      });

    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ message: "Erro no servidor." });
    }
  }
);

export default router;
```

**Explicação:**

- **Linhas 13-18**: Validações automáticas
  - Nome não pode ser vazio
  - Email tem que ser válido
  - Senha mínimo 6 caracteres
  - Perfil de 1 a 3
- **Linhas 22-25**: Se validações falharam, retorna erro
- **Linhas 31-37**: Verifica se email já existe
- **Linhas 40-42**: Transforma senha em hash
- **Linhas 45-48**: Insere no banco
- **Linhas 50-53**: Retorna sucesso

---

### PASSO 10: Proteger as Rotas Existentes

**O que é:** Adicionar os guardas nas rotas que já existem.

**Arquivos:** Todos os arquivos `.routes.ts`

**Por que fazer por último:** Agora temos todos os guardas prontos.

**Como fazer:**

**Exemplo - Disciplina Routes:**

```typescript
// src/routes/disciplina.routes.ts

import express from "express";
import {
  getDisciplina,
  getDisciplinaById,
  createDisciplina,
} from "../controller/disciplinaController";

// IMPORTAR OS GUARDAS
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

// GET - Todos podem ver (mas precisam estar logados)
router.get("/", authMiddleware, getDisciplina);
router.get("/:idDisciplina", authMiddleware, getDisciplinaById);

// POST - Só Admin e Coordenador (Professor bloqueado)
router.post("/", authMiddleware, preventProfessorEdit, createDisciplina);

export default router;
```

**Exemplo - Professor Routes:**

```typescript
// src/routes/professor.routes.ts

import express from "express";
import { getProfessor, createProfessor } from "../controller/professorController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

// GET - Todos podem ver
router.get("/", authMiddleware, getProfessor);

// POST - Só Admin pode criar
router.post("/", authMiddleware, checkRole([3]), createProfessor);

export default router;
```

**Regra geral:**

```typescript
// Visualizar (GET) - Todos autenticados
router.get("/recurso", authMiddleware, getRecurso);

// Criar/Editar/Deletar - Bloquear Professor
router.post("/recurso", authMiddleware, preventProfessorEdit, createRecurso);
router.put("/recurso/:id", authMiddleware, preventProfessorEdit, updateRecurso);
router.delete("/recurso/:id", authMiddleware, preventProfessorEdit, deleteRecurso);

// Ação só de Admin
router.post("/especial", authMiddleware, checkRole([3]), acaoEspecial);
```

---

## 5. Pontos de Atenção

### ⚠️ Erros Comuns e Como Evitar

#### 1. **Ordem dos Middlewares**

**ERRADO:**
```typescript
router.post("/", createDisciplina, authMiddleware);  // Middleware depois!
```

**CERTO:**
```typescript
router.post("/", authMiddleware, createDisciplina);  // Middleware antes!
```

**Por quê:** O middleware precisa rodar ANTES da função principal.

---

#### 2. **Esquecer de Usar `req.user`**

**ERRADO:**
```typescript
const userId = req.body.userId;  // Usuário pode mentir!
```

**CERTO:**
```typescript
const userId = req.user!.id;  // Vem do token validado
```

**Por quê:** Nunca confie no que o usuário envia. Use o que vem do token.

---

#### 3. **JWT_SECRET Fraco**

**ERRADO:**
```env
JWT_SECRET=123
```

**CERTO:**
```env
JWT_SECRET=minhaChaveSecretaMuitoComplexa123!@#$%^&*()
```

**Por quê:** Se o segredo for fraco, hackers podem falsificar tokens.

---

#### 4. **Não Tratar Erros**

**ERRADO:**
```typescript
const user = await pool.query(...);  // Se der erro, quebra tudo
```

**CERTO:**
```typescript
try {
  const user = await pool.query(...);
} catch (error) {
  res.status(500).json({ message: "Erro no servidor" });
}
```

**Por quê:** Sempre pode dar erro. Precisa tratar.

---

#### 5. **Expor Informações Sensíveis**

**ERRADO:**
```typescript
res.json({ senha: usuario.senha });  // Nunca!
```

**CERTO:**
```typescript
res.json({ 
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email 
});
```

**Por quê:** Nunca retorne a senha (mesmo hasheada) ou dados sensíveis.

---

### 🔒 Checklist de Segurança

- [ ] JWT_SECRET é longo e complexo
- [ ] Senhas são sempre hasheadas (nunca em texto)
- [ ] Token expira (1 hora é bom)
- [ ] Todas rotas sensíveis têm authMiddleware
- [ ] Professor não pode criar/editar/deletar
- [ ] Admin pode tudo
- [ ] Coordenador só acessa seu curso
- [ ] Erros são tratados
- [ ] Não retorna dados sensíveis
- [ ] .env está no .gitignore

---

## 6. Testando o Sistema

### Teste 1: Fazer Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@email.com",
    "senha": "123456"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Professor",
    "email": "professor@email.com",
    "perfil": "Professor"
  }
}
```

---

### Teste 2: Acessar Rota Protegida

```bash
# Copiar o token do teste anterior
TOKEN="cole-o-token-aqui"

curl -X GET http://localhost:3001/disciplina \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
[
  {
    "idDisciplina": 1,
    "nomeDisciplina": "Matemática",
    ...
  }
]
```

---

### Teste 3: Professor Tentando Criar (Deve Falhar)

```bash
curl -X POST http://localhost:3001/disciplina \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nomeDisciplina": "Nova Disciplina"}'
```

**Resposta esperada:**
```json
{
  "message": "Professores não podem criar, editar ou deletar. Somente visualizar."
}
```

---

### Teste 4: Admin Criando (Deve Funcionar)

```bash
# Fazer login como Admin primeiro
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "senha": "123456"
  }'

# Usar o token do Admin
curl -X POST http://localhost:3001/disciplina \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nomeDisciplina": "Nova Disciplina"}'
```

**Resposta esperada:**
```json
{
  "message": "Disciplina criada com sucesso!",
  "id": 10
}
```

---

## 📝 Resumo Final

**O que fizemos:**

1. ✅ Configuramos variáveis de ambiente (.env)
2. ✅ Criamos tabelas (perfis, usuarios)
3. ✅ Instalamos bibliotecas (bcrypt, jwt, etc)
4. ✅ Criamos guardas (authMiddleware, roleMiddleware, permissionMiddleware)
5. ✅ Criamos login (authController)
6. ✅ Criamos rotas (auth.routes, register.routes)
7. ✅ Protegemos todas as rotas existentes
8. ✅ Testamos tudo

**Agora você sabe:**

- ✅ O que é JWT e como funciona
- ✅ Por que usar hash de senha
- ✅ O que são middlewares
- ✅ Como criar um sistema de permissões
- ✅ Como proteger rotas
- ✅ Como testar autenticação

**Próximos passos:**

- Implementar refresh token (token que dura mais)
- Adicionar rate limiting (limitar tentativas de login)
- Adicionar recuperação de senha
- Adicionar 2FA (autenticação de dois fatores)

---

## 🎓 Conclusão

Sistema de login é fundamental para qualquer aplicação. Agora você entende cada peça, como elas se conectam, e por que cada uma é importante.

Lembre-se: segurança não é opcional. Sempre:
- Hash de senhas
- Validar inputs
- Usar HTTPS em produção
- Nunca expor secrets
- Sempre tratar erros

**Boa sorte no desenvolvimento! 🚀**
