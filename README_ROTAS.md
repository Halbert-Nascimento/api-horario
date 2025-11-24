# 📋 Lista de Rotas - API Grade Horário

## 🌐 Informações Gerais

**Base URL:** `http://localhost:3333`

**Legenda:**
- 🔓 **Pública** - Não requer autenticação
- 🔒 **Protegida** - Requer token JWT no header `Authorization: Bearer <token>`
- 🚫 **Bloqueada para Professor** - Apenas Admin e Coordenador podem acessar

---

## 📚 Índice de Rotas

- [Autenticação](#-autenticação)
- [Usuários](#-usuários)
- [Cursos](#-cursos)
- [Disciplinas](#-disciplinas)
- [Professores](#-professores)
- [Salas](#-salas)
- [Grade](#-grade)
- [Dias da Semana](#-dias-da-semana)
- [Disponibilidade](#-disponibilidade)
- [Professor-Disciplina](#-professor-disciplina)
- [Célula (Alocação)](#-célula-alocação-de-horário)

---

## 🔐 Autenticação

### Login
```
🔓 POST /auth/login
```
Autentica usuário e retorna token JWT (válido por 1 hora).

### Registro
```
🔓 POST /register
```
Registra novo usuário no sistema.

---

## 👤 Usuários

### Listar todos os usuários
```
🔒 GET /usuario
```

### Buscar usuário por ID
```
🔒 GET /usuario/:idUsuario
```

### Criar novo usuário
```
🔒 🚫 POST /usuario
```
**Permissões:** Apenas Admin  
**Bloqueado para:** Coordenador, Professor

---

## 📚 Cursos

### Listar todos os cursos
```
🔒 GET /curso
```

### Buscar curso por ID
```
🔒 GET /curso/:idCurso
```

### Criar novo curso
```
🔒 🚫 POST /curso
```
**Permissões:** Apenas Admin  
**Bloqueado para:** Coordenador, Professor

---

## 📖 Disciplinas

### Listar todas as disciplinas
```
🔒 GET /disciplina
```

### Buscar disciplina por ID
```
🔒 GET /disciplina/:idDisciplina
```

### Buscar disciplinas por curso
```
🔒 GET /disciplina/curso/:idCurso
```

### Criar nova disciplina
```
🔒 🚫 POST /disciplina
```
**Bloqueado para:** Professor

### Vincular disciplina a curso
```
🔒 🚫 POST /disciplina/curso
```
**Bloqueado para:** Professor

---

## 👨‍🏫 Professores

### Listar todos os professores
```
🔒 GET /professor
```

### Buscar professor por ID
```
🔒 GET /professor/:idProfessor
```

### Buscar professores por coordenador
```
🔒 GET /professor/coordenador/:idCoordenador
```

### Buscar professores por curso
```
🔒 GET /professor/curso/:idCurso
```

### Criar novo professor
```
🔒 🚫 POST /professor
```
**Bloqueado para:** Professor

---

## 🏫 Salas

### Listar todas as salas
```
🔒 GET /sala
```

### Buscar sala por ID
```
🔒 GET /sala/:idSala
```

### Criar nova sala
```
🔒 🚫 POST /sala
```
**Bloqueado para:** Professor

---

## 📅 Grade

### Listar todas as grades
```
🔒 GET /grade
```

### Buscar grade por ID
```
🔒 GET /grade/:idGrade
```

### Criar nova grade
```
🔒 🚫 POST /grade
```
**Bloqueado para:** Professor

---

## 📆 Dias da Semana

### Listar todos os dias
```
🔒 GET /diaSemana
```

### Buscar dia por ID
```
🔒 GET /diaSemana/:idDiaSemana
```

---

## ⏰ Disponibilidade

### Listar todas as disponibilidades
```
🔒 GET /disponibilidade
```

### Buscar disponibilidade por professor
```
🔒 GET /disponibilidade/:idProfessor
```

### Criar nova disponibilidade
```
🔒 🚫 POST /disponibilidade
```
**Bloqueado para:** Professor

---

## 🔗 Professor-Disciplina

### Listar todos os vínculos
```
🔒 GET /professorDisciplina
```

### Buscar vínculos por disciplina
```
🔒 GET /professorDisciplina/:idDisciplina
```

### Criar novo vínculo
```
🔒 🚫 POST /professorDisciplina
```
**Bloqueado para:** Professor

---

## 📊 Célula (Alocação de Horário)

### Listar todas as alocações
```
🔒 GET /celula
```

### Buscar alocações por curso
```
🔒 GET /celula/:idCurso
```

### Criar nova alocação
```
🔒 🚫 POST /celula
```
**Bloqueado para:** Professor

### Deletar alocação
```
🔒 🚫 DELETE /celula/:idCelula
```
**Bloqueado para:** Professor

---

## 📊 Estatísticas

### Total de Endpoints
**37 rotas**

### Por Método HTTP
| Método | Quantidade |
|--------|------------|
| GET    | 23         |
| POST   | 13         |
| DELETE | 1          |

### Por Nível de Proteção
| Proteção                     | Quantidade |
|------------------------------|------------|
| Públicas (sem auth)          | 2          |
| Protegidas (com token)       | 35         |
| Bloqueadas para Professor    | 14         |

### Por Recurso
| Recurso              | Quantidade de Rotas |
|----------------------|---------------------|
| Autenticação         | 2                   |
| Usuários             | 3                   |
| Cursos               | 3                   |
| Disciplinas          | 5                   |
| Professores          | 5                   |
| Salas                | 3                   |
| Grade                | 3                   |
| Dias da Semana       | 2                   |
| Disponibilidade      | 3                   |
| Professor-Disciplina | 3                   |
| Célula (Alocação)    | 4                   |

---

## 🔑 Como Usar

### 1. Fazer Login
```bash
POST http://localhost:3333/auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "senha": "suasenha"
}
```

### 2. Guardar o Token e Dados do Usuário
Salve o `token` e as informações do `user` retornadas no login.

**Resposta do login:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "idUsuario": 1,
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@email.com",
    "idPerfil": 3,
    "nomePerfil": "professor",
    "idCurso": 1,
    "nomeCurso": "Fisioterapia",
    "roles": ["professor"]
  }
}
```

### 3. Usar nas Requisições
Inclua o token no header de todas as rotas protegidas:
```bash
GET http://localhost:3333/curso
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 📖 Documentação Completa

Para exemplos detalhados de requisições, respostas, validações e códigos de erro, consulte:

- **[MANUAL_ROTAS.md](./MANUAL_ROTAS.md)** - Manual completo com exemplos de uso
- **[SISTEMA_AUTENTICACAO.md](./SISTEMA_AUTENTICACAO.md)** - Documentação técnica do sistema de autenticação

---

## 🚨 Códigos de Status Comuns

| Código | Status                | Significado                              |
|--------|-----------------------|------------------------------------------|
| 200    | OK                    | Requisição bem-sucedida                  |
| 201    | Created               | Recurso criado com sucesso               |
| 400    | Bad Request           | Dados inválidos ou campos obrigatórios   |
| 401    | Unauthorized          | Token ausente, inválido ou expirado      |
| 403    | Forbidden             | Sem permissão (ex: professor tentando criar) |
| 404    | Not Found             | Recurso não encontrado                   |
| 409    | Conflict              | Conflito (ex: email duplicado)           |
| 500    | Internal Server Error | Erro no servidor                         |

---

## 💡 Dicas

1. **Token Expira em 1 hora** - Faça login novamente quando necessário
2. **Professores só podem ler** - Não podem criar, editar ou deletar
3. **Admin e Coordenador** - Têm acesso total ao sistema
4. **Todas as senhas** - São hasheadas com bcrypt antes de salvar

---

**Versão:** 1.0.0  
**Última atualização:** Novembro 2025
