# 📖 Manual de Rotas - API Grade Horário

## 📋 Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Cursos](#cursos)
- [Disciplinas](#disciplinas)
- [Professores](#professores)
- [Salas](#salas)
- [Grade](#grade)
- [Dias da Semana](#dias-da-semana)
- [Disponibilidade](#disponibilidade)
- [Vínculos](#vínculos)
- [Tratamento de Erros](#tratamento-de-erros)

---

## 🌐 Informações Gerais

### Base URL
```
http://localhost:3333
```

### Headers Padrão
```http
Content-Type: application/json
Authorization: Bearer <seu_token_jwt>  # Apenas para rotas protegidas
```

### Perfis de Usuário
| ID | Nome        | Permissões                              |
|----|-------------|-----------------------------------------|
| 1  | admin       | Leitura + Criação + Edição + Exclusão   |
| 2  | coordenador | Leitura + Criação + Edição + Exclusão   |
| 3  | professor   | Apenas Leitura                          |

### Legendas
- 🔓 **Rota Pública** - Não requer autenticação
- 🔒 **Rota Protegida** - Requer token JWT
- 🚫 **Bloqueado para Professor** - Professor não pode acessar

---

## 🔐 Autenticação

### Login
**🔓 POST** `/auth/login`

Autentica um usuário e retorna token JWT.

**Requisição:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjEsIm5vbWVVc3VhcmlvIjoiSm_Do28gU2lsdmEiLCJlbWFpbFVzdWFyaW8iOiJqb2FvQGVtYWlsLmNvbSIsImlkUGVyZmlsIjozLCJub21lUGVyZmlsIjoicHJvZmVzc29yIiwiaWRDdXJzbyI6MSwibm9tZUN1cnNvIjoiRmlzaW90ZXJhcGlhIiwicm9sZXMiOlsicHJvZmVzc29yIl0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ.abc123",
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

**Erros Possíveis:**
| Código | Mensagem                                       | Causa                          |
|--------|------------------------------------------------|--------------------------------|
| 400    | Email e senha são obrigatórios.                | Campos vazios                  |
| 401    | Credenciais inválidas.                         | Email ou senha incorretos      |
| 403    | Usuário inativo. Entre em contato com o admin. | Conta desativada               |
| 500    | Erro de configuração do servidor.              | JWT_SECRET não configurado     |

**Uso do Token:**
Após o login, use o token em todas as requisições protegidas:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### Registro
**🔓 POST** `/register`

Registra um novo usuário no sistema.

**Requisição:**
```json
{
  "nomeUsuario": "Maria Santos",
  "emailUsuario": "maria@email.com",
  "senha": "senha123456",
  "idPerfil": 3
}
```

**Validações:**
- `nomeUsuario`: Obrigatório, não vazio
- `emailUsuario`: Obrigatório, formato de email válido
- `senha`: Mínimo 6 caracteres
- `idPerfil`: Inteiro entre 1 e 3

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário registrado com sucesso.",
  "data": {
    "idUsuario": 5,
    "nomeUsuario": "Maria Santos",
    "emailUsuario": "maria@email.com",
    "idPerfil": 3
  }
}
```

**Erros Possíveis:**
| Código | Mensagem                        | Causa                        |
|--------|---------------------------------|------------------------------|
| 400    | Nome é obrigatório.             | Campo nomeUsuario vazio      |
| 400    | Email inválido.                 | Formato de email incorreto   |
| 400    | Senha deve ter no mínimo 6...   | Senha muito curta            |
| 400    | Perfil inválido.                | idPerfil fora do range 1-3   |
| 400    | Email já cadastrado.            | Email já existe no sistema   |

---

## 👤 Usuários

### Listar Todos os Usuários
**🔒 GET** `/usuario`

**Permissões:** Admin, Coordenador, Professor

**Headers:**
```http
Authorization: Bearer <token>
```

**Resposta (200):**
```json
[
  {
    "idUsuario": 1,
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@email.com",
    "idPerfil": 3,
    "ativo": 1,
    "criadoEm": "2025-01-01T10:00:00.000Z"
  },
  {
    "idUsuario": 2,
    "nomeUsuario": "Maria Santos",
    "emailUsuario": "maria@email.com",
    "idPerfil": 2,
    "ativo": 1,
    "criadoEm": "2025-01-02T14:30:00.000Z"
  }
]
```

**Erros:**
| Código | Mensagem                              | Causa               |
|--------|---------------------------------------|---------------------|
| 401    | Você precisa estar logado...          | Token ausente       |
| 401    | Token inválido/expirado...            | Token inválido      |

---

### Buscar Usuário por ID
**🔒 GET** `/usuario/:idUsuario`

**Permissões:** Admin, Coordenador, Professor

**Parâmetros de URL:**
- `idUsuario` (string) - ID do usuário

**Exemplo:**
```http
GET /usuario/1
Authorization: Bearer <token>
```

**Resposta (200):**
```json
[
  {
    "idUsuario": 1,
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@email.com",
    "idPerfil": 3,
    "ativo": 1,
    "criadoEm": "2025-01-01T10:00:00.000Z"
  }
]
```

**Erros:**
| Código | Mensagem | Causa                    |
|--------|----------|--------------------------|
| 401    | Token... | Token ausente/inválido   |
| 404    | -        | Usuário não encontrado   |

---

### Criar Usuário
**🔒🚫 POST** `/usuario`

**Permissões:** Apenas Admin  
**Bloqueado:** Coordenador, Professor

**Requisição:**
```json
{
  "nomeUsuario": "Carlos Oliveira",
  "emailUsuario": "carlos@email.com",
  "senha": "senha123",
  "idPerfil": 3,
  "ativo": 1
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "idUsuario": 10,
    "nomeUsuario": "Carlos Oliveira",
    "emailUsuario": "carlos@email.com",
    "idPerfil": 3,
    "ativo": 1
  }
}
```

**Erros:**
| Código | Mensagem                                    | Causa                      |
|--------|---------------------------------------------|----------------------------|
| 400    | Campos obrigatórios ausentes                | Dados incompletos          |
| 403    | Professores não podem editar...             | Perfil é professor         |

---

## 📚 Cursos

### Listar Todos os Cursos
**🔒 GET** `/curso`

**Permissões:** Admin, Coordenador, Professor

**Resposta (200):**
```json
[
  {
    "idCurso": 1,
    "codigoCurso": "FIS001",
    "nomeCurso": "Fisioterapia",
    "descricaoCurso": "Curso de Fisioterapia",
    "duracaoSemestres": 10,
    "criadoEm": "2025-01-01T10:00:00.000Z"
  }
]
```

---

### Buscar Curso por ID
**🔒 GET** `/curso/:idCurso`

**Parâmetros:**
- `idCurso` (string)

**Exemplo:**
```http
GET /curso/1
```

**Resposta (200):**
```json
[
  {
    "idCurso": 1,
    "codigoCurso": "FIS001",
    "nomeCurso": "Fisioterapia",
    "descricaoCurso": "Curso de Fisioterapia",
    "duracaoSemestres": 10
  }
]
```

---

### Criar Curso
**🔒🚫 POST** `/curso`

**Permissões:** Apenas Admin  
**Bloqueado:** Coordenador, Professor

**Requisição:**
```json
{
  "codigoCurso": "ENG001",
  "nomeCurso": "Engenharia Civil",
  "descricaoCurso": "Curso de Engenharia Civil",
  "duracaoSemestres": 10
}
```

**Resposta (201):**
```json
{
  "message": "Curso criado com sucesso",
  "data": {
    "idCurso": 5,
    "codigoCurso": "ENG001",
    "nomeCurso": "Engenharia Civil",
    "descricaoCurso": "Curso de Engenharia Civil",
    "duracaoSemestres": 10
  }
}
```

**Erros:**
| Código | Mensagem                       | Causa                     |
|--------|--------------------------------|---------------------------|
| 400    | Campos obrigatórios            | Dados incompletos         |
| 403    | Professores não podem...       | Perfil é professor        |
| 409    | Código do curso já existe      | codigoCurso duplicado     |

---

## 📖 Disciplinas

### Listar Todas as Disciplinas
**🔒 GET** `/disciplina`

**Resposta (200):**
```json
[
  {
    "idDisciplina": 1,
    "codigoDisciplina": "FIS101",
    "nomeDisciplina": "Anatomia Humana",
    "cargaHoraria": 80,
    "modalidade": "presencial",
    "tipoSala": "laboratório"
  }
]
```

---

### Buscar Disciplina por ID
**🔒 GET** `/disciplina/:idDisciplina`

**Parâmetros:**
- `idDisciplina` (string)

**Resposta (200):**
```json
[
  {
    "idDisciplina": 1,
    "codigoDisciplina": "FIS101",
    "nomeDisciplina": "Anatomia Humana",
    "cargaHoraria": 80,
    "modalidade": "presencial",
    "tipoSala": "laboratório"
  }
]
```

---

### Buscar Disciplinas por Curso
**🔒 GET** `/disciplina/curso/:idCurso`

**Parâmetros:**
- `idCurso` (string)

**Resposta (200):**
```json
[
  {
    "idDisciplina": 1,
    "nomeDisciplina": "Anatomia Humana",
    "codigoDisciplina": "FIS101",
    "idCurso": 1,
    "nomeCurso": "Fisioterapia",
    "periodo": 1
  },
  {
    "idDisciplina": 2,
    "nomeDisciplina": "Fisiologia",
    "codigoDisciplina": "FIS102",
    "idCurso": 1,
    "nomeCurso": "Fisioterapia",
    "periodo": 2
  }
]
```

---

### Criar Disciplina
**🔒🚫 POST** `/disciplina`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Requisição:**
```json
{
  "codigoDisciplina": "FIS201",
  "nomeDisciplina": "Biomecânica",
  "cargaHoraria": 60,
  "modalidade": "presencial",
  "tipoSala": "laboratório",
  "periodo": 3,
  "idCurso": 1
}
```

**Validações:**
- `modalidade`: "presencial", "sincrona" ou "hibrido"
- `tipoSala`: "auditorio", "laboratório", "sala de aula" ou "virtual"
- `cargaHoraria`: número positivo
- `periodo`: número positivo

**Resposta (201):**
```json
{
  "message": "Disciplina criada e vinculada ao curso com sucesso",
  "data": {
    "idDisciplina": 10,
    "codigoDisciplina": "FIS201",
    "nomeDisciplina": "Biomecânica",
    "cargaHoraria": 60,
    "modalidade": "presencial",
    "tipoSala": "laboratório",
    "periodo": 3,
    "idCurso": 1
  }
}
```

**Erros:**
| Código | Mensagem                      | Causa                         |
|--------|-------------------------------|-------------------------------|
| 400    | Todos os campos obrigatórios  | Dados incompletos             |
| 400    | Modalidade inválida           | Valor não permitido           |
| 400    | Tipo de sala inválido         | Valor não permitido           |
| 404    | Curso não encontrado          | idCurso inexistente           |

---

### Vincular Disciplina a Curso
**🔒🚫 POST** `/disciplina/curso`

**Requisição:**
```json
{
  "idDisciplina": 5,
  "idCurso": 2,
  "periodo": 4
}
```

**Resposta (201):**
```json
{
  "message": "Disciplina vinculada ao curso com sucesso",
  "data": {
    "idCurso": 2,
    "idDisciplina": 5,
    "periodo": 4
  }
}
```

**Erros:**
| Código | Mensagem                                  | Causa                    |
|--------|-------------------------------------------|--------------------------|
| 404    | Curso não encontrado                      | idCurso inválido         |
| 404    | Disciplina não encontrada                 | idDisciplina inválido    |
| 409    | Disciplina já vinculada a este curso      | Vínculo duplicado        |

---

## 👨‍🏫 Professores

### Listar Todos os Professores
**🔒 GET** `/professor`

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "titulacao": "doutor",
    "email": "carlos.prof@email.com",
    "curriculoLattes": "http://lattes.cnpq.br/123456",
    "idCoordenador": null,
    "idUsuario": 5
  }
]
```

---

### Buscar Professor por ID
**🔒 GET** `/professor/:idProfessor`

**Parâmetros:**
- `idProfessor` (string)

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "titulacao": "doutor",
    "email": "carlos.prof@email.com",
    "curriculoLattes": "http://lattes.cnpq.br/123456",
    "idCoordenador": null,
    "idUsuario": 5
  }
]
```

---

### Buscar Professores por Curso
**🔒 GET** `/professor/curso/:idCurso`

**Parâmetros:**
- `idCurso` (string)

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "titulacao": "doutor",
    "email": "carlos.prof@email.com",
    "idCurso": 1,
    "nomeCurso": "Fisioterapia",
    "isCoordenador": 1
  }
]
```

---

### Buscar Professores por Coordenador
**🔒 GET** `/professor/coordenador/:idCoordenador`

**Parâmetros:**
- `idCoordenador` (string)

**Resposta (200):**
```json
[
  {
    "idProfessor": 2,
    "nomeProfessor": "Profa. Maria Costa",
    "titulacao": "mestre",
    "email": "maria.prof@email.com",
    "idCoordenador": 1
  }
]
```

---

### Criar Professor
**🔒🚫 POST** `/professor`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Requisição:**
```json
{
  "nomeProfessor": "Profa. Ana Paula",
  "titulacao": "mestre",
  "email": "ana@email.com",
  "curriculoLattes": "http://lattes.cnpq.br/789012",
  "idCoordenador": 1,
  "idUsuario": 10
}
```

**Validações:**
- `titulacao`: "graduado", "especialista", "mestre", "doutor" ou "doutora"

**Resposta (201):**
```json
{
  "message": "Professor criado com sucesso",
  "data": {
    "idProfessor": 15,
    "nomeProfessor": "Profa. Ana Paula",
    "titulacao": "mestre",
    "email": "ana@email.com",
    "curriculoLattes": "http://lattes.cnpq.br/789012",
    "idCoordenador": 1,
    "idUsuario": 10
  }
}
```

---

## 🏫 Salas

### Listar Todas as Salas
**🔒 GET** `/sala`

**Resposta (200):**
```json
[
  {
    "idSala": 1,
    "codigoSala": "LAB-01",
    "nomeSala": "Laboratório de Anatomia",
    "capacidadeSala": 30,
    "metrosQuadrados": 80,
    "tipoSala": "laboratório",
    "recursos": "Mesas de dissecação, modelos anatômicos",
    "localizacaoSala": "Bloco A - 2º andar"
  }
]
```

---

### Buscar Sala por ID
**🔒 GET** `/sala/:idSala`

**Parâmetros:**
- `idSala` (string)

**Resposta (200):**
```json
[
  {
    "idSala": 1,
    "codigoSala": "LAB-01",
    "nomeSala": "Laboratório de Anatomia",
    "capacidadeSala": 30,
    "tipoSala": "laboratório"
  }
]
```

---

### Criar Sala
**🔒🚫 POST** `/sala`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Requisição:**
```json
{
  "codigoSala": "AUD-01",
  "nomeSala": "Auditório Principal",
  "capacidadeSala": 200,
  "metrosQuadrados": 300,
  "tipoSala": "auditorio",
  "recursos": "Projetor, Som, Ar condicionado",
  "localizacaoSala": "Bloco B - Térreo"
}
```

**Validações:**
- `tipoSala`: "laboratório", "sala de aula", "auditorio" ou "virtual"
- `capacidadeSala`: número positivo

**Resposta (201):**
```json
{
  "message": "Sala criada com sucesso",
  "data": {
    "idSala": 20,
    "codigoSala": "AUD-01",
    "nomeSala": "Auditório Principal",
    "capacidadeSala": 200,
    "metrosQuadrados": 300,
    "tipoSala": "auditorio",
    "recursos": "Projetor, Som, Ar condicionado",
    "localizacaoSala": "Bloco B - Térreo"
  }
}
```

---

## 📅 Grade

### Listar Todas as Grades
**🔒 GET** `/grade`

**Resposta (200):**
```json
[
  {
    "idGrade": 1,
    "idCurso": 1,
    "anoLetivo": 2025,
    "semestreLetivo": 1,
    "criadoEm": "2025-01-01T10:00:00.000Z"
  }
]
```

---

### Buscar Grade por ID
**🔒 GET** `/grade/:idGrade`

**Parâmetros:**
- `idGrade` (string)

**Resposta (200):**
```json
[
  {
    "idGrade": 1,
    "idCurso": 1,
    "anoLetivo": 2025,
    "semestreLetivo": 1
  }
]
```

---

### Criar Grade
**🔒🚫 POST** `/grade`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Requisição:**
```json
{
  "idCurso": 1,
  "anoLetivo": 2025,
  "semestreLetivo": 2
}
```

**Resposta (201):**
```json
{
  "message": "Grade criada com sucesso",
  "data": {
    "idGrade": 10,
    "idCurso": 1,
    "anoLetivo": 2025,
    "semestreLetivo": 2
  }
}
```

---

## 📆 Dias da Semana

### Listar Todos os Dias
**🔒 GET** `/diaSemana`

**Resposta (200):**
```json
[
  {
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira"
  },
  {
    "idDiaSemana": 2,
    "diaSemana": "Terça-feira"
  }
]
```

---

### Buscar Dia por ID
**🔒 GET** `/diaSemana/:idDiaSemana`

**Parâmetros:**
- `idDiaSemana` (string)

**Resposta (200):**
```json
[
  {
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira"
  }
]
```

---

## ⏰ Disponibilidade

### Listar Todas as Disponibilidades
**🔒 GET** `/disponibilidade`

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira"
  }
]
```

---

### Buscar Disponibilidade por Professor
**🔒 GET** `/disponibilidade/:idProfessor`

**Parâmetros:**
- `idProfessor` (string)

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira"
  },
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDiaSemana": 3,
    "diaSemana": "Quarta-feira"
  }
]
```

---

### Criar Disponibilidade
**🔒🚫 POST** `/disponibilidade`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Requisição:**
```json
{
  "idProfessor": 1,
  "idDiaSemana": 2
}
```

**Resposta (201):**
```json
{
  "message": "Disponibilidade criada com sucesso",
  "data": {
    "idProfessor": 1,
    "idDiaSemana": 2
  }
}
```

---

## 🔗 Vínculos

### Professor-Disciplina

#### Listar Todos os Vínculos
**🔒 GET** `/professorDisciplina`

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDisciplina": 1,
    "nomeDisciplina": "Anatomia Humana"
  }
]
```

#### Buscar por Disciplina
**🔒 GET** `/professorDisciplina/:idDisciplina`

**Parâmetros:**
- `idDisciplina` (string)

**Resposta (200):**
```json
[
  {
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDisciplina": 1,
    "nomeDisciplina": "Anatomia Humana"
  }
]
```

#### Criar Vínculo
**🔒🚫 POST** `/professorDisciplina`

**Requisição:**
```json
{
  "idProfessor": 1,
  "idDisciplina": 5
}
```

**Resposta (201):**
```json
{
  "message": "Vínculo criado com sucesso",
  "data": {
    "idProfessor": 1,
    "idDisciplina": 5
  }
}
```

---

### Célula (Alocação de Horário)

#### Listar Todas as Células
**🔒 GET** `/celula`

**Resposta (200):**
```json
[
  {
    "idAlocacaoHorario": 1,
    "idGrade": 1,
    "idDisciplina": 1,
    "nomeDisciplina": "Anatomia Humana",
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira",
    "idSala": 1,
    "nomeSala": "LAB-01",
    "semestre": 1
  }
]
```

#### Buscar por Curso
**🔒 GET** `/celula/:idCurso`

**Parâmetros:**
- `idCurso` (string)

**Resposta (200):**
```json
[
  {
    "idAlocacaoHorario": 1,
    "idGrade": 1,
    "idCurso": 1,
    "nomeCurso": "Fisioterapia",
    "idDisciplina": 1,
    "nomeDisciplina": "Anatomia Humana",
    "idProfessor": 1,
    "nomeProfessor": "Dr. Carlos Silva",
    "idDiaSemana": 1,
    "diaSemana": "Segunda-feira",
    "idSala": 1,
    "nomeSala": "LAB-01",
    "semestre": 1
  }
]
```

#### Criar Célula
**🔒🚫 POST** `/celula`

**Requisição:**
```json
{
  "idGrade": 1,
  "idDisciplina": 1,
  "idProfessor": 1,
  "idDiaSemana": 1,
  "idSala": 1,
  "semestre": 1
}
```

**Resposta (201):**
```json
{
  "message": "Alocação criada com sucesso",
  "data": {
    "idAlocacaoHorario": 50,
    "idGrade": 1,
    "idDisciplina": 1,
    "idProfessor": 1,
    "idDiaSemana": 1,
    "idSala": 1,
    "semestre": 1
  }
}
```

#### Deletar Célula
**🔒🚫 DELETE** `/celula/:idCelula`

**Permissões:** Admin, Coordenador  
**Bloqueado:** Professor

**Parâmetros:**
- `idCelula` (string) - idAlocacaoHorario

**Resposta (200):**
```json
{
  "message": "Alocação deletada com sucesso"
}
```

---

## 🚨 Tratamento de Erros

### Estrutura de Erro Padrão
```json
{
  "message": "Descrição do erro"
}
```

### Erros de Validação (express-validator)
```json
{
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Nome é obrigatório.",
      "path": "nomeUsuario",
      "location": "body"
    },
    {
      "type": "field",
      "value": "emailinvalido",
      "msg": "Email inválido.",
      "path": "emailUsuario",
      "location": "body"
    }
  ]
}
```

### Códigos de Status HTTP

| Código | Status                  | Significado                                   |
|--------|-------------------------|-----------------------------------------------|
| 200    | OK                      | Requisição bem-sucedida                       |
| 201    | Created                 | Recurso criado com sucesso                    |
| 400    | Bad Request             | Dados inválidos ou campos obrigatórios        |
| 401    | Unauthorized            | Não autenticado (token ausente/inválido)      |
| 403    | Forbidden               | Sem permissão (role inadequada)               |
| 404    | Not Found               | Recurso não encontrado                        |
| 409    | Conflict                | Conflito (email/código duplicado)             |
| 500    | Internal Server Error   | Erro no servidor                              |

---

## 💡 Exemplos de Integração

### Exemplo em JavaScript (Fetch)

#### Login
```javascript
const login = async (email, senha) => {
  try {
    const response = await fetch('http://localhost:3333/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Salvar token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};
```

#### Buscar Dados Protegidos
```javascript
const buscarCursos = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3333/curso', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      // Token expirado ou inválido - redirecionar para login
      window.location.href = '/login';
      return;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    throw error;
  }
};
```

#### Criar Recurso (Bloqueado para Professor)
```javascript
const criarDisciplina = async (disciplinaData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3333/disciplina', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(disciplinaData)
    });
    
    const data = await response.json();
    
    if (response.status === 403) {
      // Usuário sem permissão
      alert('Você não tem permissão para criar disciplinas');
      return;
    }
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    throw error;
  }
};
```

---

### Exemplo em React (Axios)

#### Configuração do Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Uso nos Componentes
```javascript
import api from './api';

// Login
const handleLogin = async (email, senha) => {
  try {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Erro no login:', error.response?.data?.message);
    throw error;
  }
};

// Buscar dados
const fetchCursos = async () => {
  try {
    const { data } = await api.get('/curso');
    return data;
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    throw error;
  }
};

// Criar recurso
const createDisciplina = async (disciplinaData) => {
  try {
    const { data } = await api.post('/disciplina', disciplinaData);
    return data;
  } catch (error) {
    if (error.response?.status === 403) {
      alert('Você não tem permissão para criar disciplinas');
    }
    throw error;
  }
};
```

---

## 🔐 Verificação de Permissões no Frontend

### Hook Personalizado (React)
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const hasRole = (allowedRoles) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => allowedRoles.includes(role));
  };

  const canEdit = () => {
    return hasRole(['admin', 'coordenador']);
  };

  const isProfessor = () => {
    return hasRole(['professor']);
  };

  const isAdmin = () => {
    return hasRole(['admin']);
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    canEdit,
    isProfessor,
    isAdmin
  };
};
```

### Uso no Componente
```javascript
import { useAuth } from './hooks/useAuth';

const MinhaComponente = () => {
  const { user, canEdit, isProfessor } = useAuth();

  return (
    <div>
      <h1>Olá, {user?.nome}</h1>
      
      {canEdit() && (
        <button onClick={handleCreate}>Criar Novo</button>
      )}
      
      {isProfessor() && (
        <p>Você pode apenas visualizar os dados</p>
      )}
    </div>
  );
};
```

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique a documentação: [SISTEMA_AUTENTICACAO.md](./SISTEMA_AUTENTICACAO.md)
- Consulte os logs do servidor para detalhes de erros
- Verifique se o token JWT não expirou (válido por 1 hora)

---

**Última atualização:** Novembro 2025  
**Versão da API:** 1.0.0
