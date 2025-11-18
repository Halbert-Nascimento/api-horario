# Exemplos de Rotas com Permissões Implementadas

Este arquivo contém exemplos práticos de como implementar as permissões em rotas do sistema.

## 📚 Importações Necessárias

```typescript
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";
import {
  checkCursoOwnership,
  checkGradeOwnership,
  checkAlocacaoOwnership,
  preventProfessorEdit,
} from "../middleware/permissionMiddleware";
import pool from "../config/db";
```

## 🎓 Rotas de Cursos

### GET /curso - Listar cursos

```typescript
// Admin: vê todos
// Coordenador: vê apenas seu curso
// Professor: vê cursos onde leciona

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.perfil_id === 3) {
      // Admin - retorna todos os cursos
      const [cursos] = await pool.query("SELECT * FROM Cursos");
      res.json(cursos);
    } else {
      // Coordenador ou Professor - retorna cursos vinculados
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      const [cursos] = await pool.query(
        `SELECT c.* FROM Cursos c
         INNER JOIN Professor_Curso pc ON c.idCurso = pc.idCurso
         WHERE pc.idProfessor = ?`,
        [professor[0].idProfessor]
      );

      res.json(cursos);
    }
  } catch (error) {
    next(error);
  }
});
```

### GET /curso/:idCurso - Buscar curso específico

```typescript
router.get("/:idCurso", authMiddleware, checkCursoOwnership, async (req, res, next) => {
  try {
    const { idCurso } = req.params;

    const [curso]: any = await pool.query(
      "SELECT * FROM Cursos WHERE idCurso = ?",
      [idCurso]
    );

    if (!curso.length) {
      res.status(404).json({ message: "Curso não encontrado" });
      return;
    }

    res.json(curso[0]);
  } catch (error) {
    next(error);
  }
});
```

### POST /curso - Criar curso

```typescript
// Somente Admin pode criar cursos
router.post("/", authMiddleware, checkRole([3]), async (req, res, next) => {
  try {
    const user = req.user!;
    const { nomeCurso, descricaoCurso, duracaoSemestres } = req.body;

    if (!nomeCurso) {
      res.status(400).json({ message: "Nome do curso é obrigatório" });
      return;
    }

    const [result]: any = await pool.query(
      `INSERT INTO Cursos (nomeCurso, descricaoCurso, duracaoSemestres, criadoEm, criadoPor)
       VALUES (?, ?, ?, NOW(), ?)`,
      [nomeCurso, descricaoCurso, duracaoSemestres, user.id]
    );

    res.status(201).json({
      message: "Curso criado com sucesso",
      idCurso: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});
```

### PUT /curso/:idCurso - Atualizar curso

```typescript
// Admin: pode editar qualquer curso
// Coordenador: pode editar apenas seu curso
// Professor: não pode editar
router.put(
  "/:idCurso",
  authMiddleware,
  preventProfessorEdit,
  checkCursoOwnership,
  async (req, res, next) => {
    try {
      const user = req.user!;
      const { idCurso } = req.params;
      const { nomeCurso, descricaoCurso, duracaoSemestres } = req.body;

      await pool.query(
        `UPDATE Cursos 
         SET nomeCurso = ?, descricaoCurso = ?, duracaoSemestres = ?,
             atualizadoEm = NOW(), atualizadoPor = ?
         WHERE idCurso = ?`,
        [nomeCurso, descricaoCurso, duracaoSemestres, user.id, idCurso]
      );

      res.json({ message: "Curso atualizado com sucesso" });
    } catch (error) {
      next(error);
    }
  }
);
```

### DELETE /curso/:idCurso - Excluir curso

```typescript
// Somente Admin pode excluir cursos
router.delete("/:idCurso", authMiddleware, checkRole([3]), async (req, res, next) => {
  try {
    const { idCurso } = req.params;

    await pool.query("DELETE FROM Cursos WHERE idCurso = ?", [idCurso]);

    res.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    next(error);
  }
});
```

## 📖 Rotas de Disciplinas

### GET /disciplina - Listar disciplinas

```typescript
// Admin: vê todas
// Coordenador: vê do seu curso
// Professor: vê suas disciplinas

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.perfil_id === 3) {
      // Admin - todas as disciplinas
      const [disciplinas] = await pool.query("SELECT * FROM Disciplinas");
      res.json(disciplinas);
    } else {
      // Coordenador ou Professor
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      if (user.perfil_id === 2) {
        // Coordenador - disciplinas do seu curso
        const [disciplinas] = await pool.query(
          `SELECT d.* FROM Disciplinas d
           INNER JOIN curso_disciplina cd ON d.idDisciplina = cd.idDisciplina
           INNER JOIN Professor_Curso pc ON cd.idCurso = pc.idCurso
           WHERE pc.idProfessor = ?`,
          [professor[0].idProfessor]
        );
        res.json(disciplinas);
      } else {
        // Professor - apenas suas disciplinas
        const [disciplinas] = await pool.query(
          `SELECT d.* FROM Disciplinas d
           INNER JOIN Disciplina_Professor dp ON d.idDisciplina = dp.idDisciplina
           WHERE dp.idProfessor = ?`,
          [professor[0].idProfessor]
        );
        res.json(disciplinas);
      }
    }
  } catch (error) {
    next(error);
  }
});
```

### POST /disciplina - Criar disciplina

```typescript
// Admin: pode criar em qualquer curso
// Coordenador: pode criar no seu curso
// Professor: não pode criar

router.post("/", authMiddleware, preventProfessorEdit, async (req, res, next) => {
  try {
    const user = req.user!;
    const { codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina, idCurso } = req.body;

    // Validações
    if (!codigoDisciplina || !nomeDisciplina || !idCurso) {
      res.status(400).json({ 
        message: "Código, nome e curso são obrigatórios" 
      });
      return;
    }

    // Se for coordenador, verificar se o curso é dele
    if (user.perfil_id === 2) {
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      const [vinculo]: any = await pool.query(
        "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
        [professor[0].idProfessor, idCurso]
      );

      if (!vinculo.length) {
        res.status(403).json({ 
          message: "Você não tem permissão para criar disciplinas neste curso" 
        });
        return;
      }
    }

    // Criar disciplina
    const [result]: any = await pool.query(
      `INSERT INTO Disciplinas 
       (codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina, criadoEm, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina, user.id]
    );

    const idDisciplina = result.insertId;

    // Vincular ao curso
    await pool.query(
      "INSERT INTO curso_disciplina (idCurso, idDisciplina) VALUES (?, ?)",
      [idCurso, idDisciplina]
    );

    res.status(201).json({
      message: "Disciplina criada com sucesso",
      idDisciplina,
    });
  } catch (error) {
    next(error);
  }
});
```

## 📅 Rotas de Grade Horária

### GET /grade - Listar grades

```typescript
// Admin: vê todas
// Coordenador: vê do seu curso
// Professor: vê onde está alocado

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.perfil_id === 3) {
      // Admin - todas as grades
      const [grades] = await pool.query("SELECT * FROM Grade");
      res.json(grades);
    } else {
      // Coordenador ou Professor
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      // Grades dos cursos vinculados
      const [grades] = await pool.query(
        `SELECT g.* FROM Grade g
         INNER JOIN Professor_Curso pc ON g.idCurso = pc.idCurso
         WHERE pc.idProfessor = ?`,
        [professor[0].idProfessor]
      );

      res.json(grades);
    }
  } catch (error) {
    next(error);
  }
});
```

### GET /grade/:idGrade - Buscar grade específica

```typescript
router.get("/:idGrade", authMiddleware, checkGradeOwnership, async (req, res, next) => {
  try {
    const grade = req.grade; // Adicionado pelo middleware
    res.json(grade);
  } catch (error) {
    next(error);
  }
});
```

### PUT /grade/:idGrade - Atualizar grade

```typescript
// Admin: pode editar qualquer grade
// Coordenador: pode editar grade do seu curso
// Professor: não pode editar

router.put(
  "/:idGrade",
  authMiddleware,
  preventProfessorEdit,
  checkGradeOwnership,
  async (req, res, next) => {
    try {
      const user = req.user!;
      const { idGrade } = req.params;
      const { semestre_letivo } = req.body;

      await pool.query(
        `UPDATE Grade 
         SET semestre_letivo = ?, atualizadoEm = NOW(), atualizadoPor = ?
         WHERE idGrade = ?`,
        [semestre_letivo, user.id, idGrade]
      );

      res.json({ message: "Grade atualizada com sucesso" });
    } catch (error) {
      next(error);
    }
  }
);
```

## 🕐 Rotas de Alocação de Horário

### GET /alocacao - Listar alocações

```typescript
// Admin: vê todas
// Coordenador: vê do seu curso
// Professor: vê apenas as suas

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.perfil_id === 3) {
      // Admin - todas as alocações
      const [alocacoes] = await pool.query("SELECT * FROM Alocacao_horario");
      res.json(alocacoes);
    } else {
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      if (user.perfil_id === 2) {
        // Coordenador - alocações do seu curso
        const [alocacoes] = await pool.query(
          `SELECT a.* FROM Alocacao_horario a
           INNER JOIN Grade g ON a.idGrade = g.idGrade
           INNER JOIN Professor_Curso pc ON g.idCurso = pc.idCurso
           WHERE pc.idProfessor = ?`,
          [professor[0].idProfessor]
        );
        res.json(alocacoes);
      } else {
        // Professor - apenas suas alocações
        const [alocacoes] = await pool.query(
          "SELECT * FROM Alocacao_horario WHERE idProfessor = ?",
          [professor[0].idProfessor]
        );
        res.json(alocacoes);
      }
    }
  } catch (error) {
    next(error);
  }
});
```

### POST /alocacao - Criar alocação

```typescript
// Admin: pode criar qualquer alocação
// Coordenador: pode criar para seu curso
// Professor: não pode criar

router.post("/", authMiddleware, preventProfessorEdit, async (req, res, next) => {
  try {
    const user = req.user!;
    const { idGrade, idDisciplina, idProfessor, idDiaSemana, idSala, semestre } = req.body;

    // Validações
    if (!idGrade || !idDisciplina || !idProfessor || !idDiaSemana || !semestre) {
      res.status(400).json({ 
        message: "Todos os campos são obrigatórios" 
      });
      return;
    }

    // Se for coordenador, verificar se a grade é do seu curso
    if (user.perfil_id === 2) {
      const [professorCoordenador]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );

      if (!professorCoordenador.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }

      const [grade]: any = await pool.query(
        "SELECT * FROM Grade WHERE idGrade = ?",
        [idGrade]
      );

      if (!grade.length) {
        res.status(404).json({ message: "Grade não encontrada" });
        return;
      }

      const [vinculo]: any = await pool.query(
        "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
        [professorCoordenador[0].idProfessor, grade[0].idCurso]
      );

      if (!vinculo.length) {
        res.status(403).json({ 
          message: "Você não tem permissão para criar alocações nesta grade" 
        });
        return;
      }
    }

    // Criar alocação
    const [result]: any = await pool.query(
      `INSERT INTO Alocacao_horario 
       (idGrade, idDisciplina, idProfessor, idDiaSemana, idSala, semestre, criadoEm, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [idGrade, idDisciplina, idProfessor, idDiaSemana, idSala, semestre, user.id]
    );

    res.status(201).json({
      message: "Alocação criada com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});
```

### PUT /alocacao/:id - Atualizar alocação

```typescript
// Admin: pode editar qualquer alocação
// Coordenador: pode editar alocações do seu curso
// Professor: não pode editar

router.put(
  "/:id",
  authMiddleware,
  preventProfessorEdit,
  checkAlocacaoOwnership,
  async (req, res, next) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { idDiaSemana, idSala, semestre } = req.body;

      await pool.query(
        `UPDATE Alocacao_horario 
         SET idDiaSemana = ?, idSala = ?, semestre = ?,
             atualizadoEm = NOW(), atualizadoPor = ?
         WHERE idCurso_Disciplina_Professor = ?`,
        [idDiaSemana, idSala, semestre, user.id, id]
      );

      res.json({ message: "Alocação atualizada com sucesso" });
    } catch (error) {
      next(error);
    }
  }
);
```

## 🏢 Rotas de Salas

### GET /sala - Listar salas

```typescript
// Todos os perfis podem visualizar salas
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const [salas] = await pool.query("SELECT * FROM Salas");
    res.json(salas);
  } catch (error) {
    next(error);
  }
});
```

### POST /sala - Criar sala

```typescript
// Somente Admin pode criar salas
router.post("/", authMiddleware, checkRole([3]), async (req, res, next) => {
  try {
    const user = req.user!;
    const { codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizacaoSala } = req.body;

    if (!codigoSala || !capacidadeSala || !tipoSala) {
      res.status(400).json({ 
        message: "Código, capacidade e tipo são obrigatórios" 
      });
      return;
    }

    const [result]: any = await pool.query(
      `INSERT INTO Salas 
       (codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizacaoSala, criadoEm, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizacaoSala, user.id]
    );

    res.status(201).json({
      message: "Sala criada com sucesso",
      idSala: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});
```

## 📝 Resumo dos Middlewares Usados

### 1. `authMiddleware`
Sempre use primeiro para garantir autenticação.

### 2. `checkRole([perfis])`
Use para restringir acesso a perfis específicos.

### 3. `preventProfessorEdit`
Use em rotas de edição (PUT, POST, DELETE) para bloquear Professor.

### 4. `checkCursoOwnership`
Use em rotas de cursos para garantir que Coordenador/Professor só acesse seu curso.

### 5. `checkGradeOwnership`
Use em rotas de grade para garantir acesso apenas à grade do curso vinculado.

### 6. `checkAlocacaoOwnership`
Use em rotas de alocação para garantir acesso adequado por perfil.

## 🎯 Padrão de Uso

```typescript
// Visualização (todos os perfis autenticados)
router.get("/recurso", authMiddleware, controller);

// Somente Admin
router.post("/recurso", authMiddleware, checkRole([3]), controller);

// Admin e Coordenador (com verificação de ownership)
router.put("/recurso/:id", authMiddleware, preventProfessorEdit, checkOwnership, controller);

// Com lógica personalizada no controller
router.get("/recurso", authMiddleware, async (req, res, next) => {
  const user = req.user!;
  if (user.perfil_id === 3) {
    // Admin - lógica completa
  } else if (user.perfil_id === 2) {
    // Coordenador - lógica limitada
  } else {
    // Professor - lógica read-only
  }
});
```
