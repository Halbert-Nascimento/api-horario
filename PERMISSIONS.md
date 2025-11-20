# Sistema de Permissões por Perfil (Roles)

Este documento descreve as permissões específicas de cada perfil no sistema.

## 📋 Visão Geral das Permissões

O sistema possui 3 perfis com diferentes níveis de acesso:

| Perfil | ID | Permissões |
|--------|-------|------------|
| **Admin** | 3 | Acesso total - pode fazer tudo no sistema |
| **Coordenador** | 2 | Pode alterar e visualizar dados apenas do **seu curso** |
| **Professor** | 1 | Somente **visualização** da grade horária vinculada a ele |

## 🔐 Detalhamento das Permissões

### 1. Admin (idPerfil = 3)
**Permissões:** Acesso total ao sistema

✅ **Pode:**
- Visualizar todos os dados
- Criar, editar e excluir qualquer recurso
- Gerenciar usuários
- Gerenciar perfis
- Gerenciar todos os cursos
- Gerenciar todas as disciplinas
- Gerenciar todos os professores
- Gerenciar todas as grades horárias
- Gerenciar todas as salas
- Acessar relatórios completos

❌ **Não pode:**
- Nenhuma restrição

### 2. Coordenador (idPerfil = 2)
**Permissões:** Acesso limitado ao seu curso

✅ **Pode:**
- Visualizar dados do **seu curso** apenas
- Editar informações do **seu curso**
- Visualizar e editar disciplinas do **seu curso**
- Visualizar e gerenciar professores vinculados ao **seu curso**
- Visualizar e editar grade horária do **seu curso**
- Visualizar e editar alocações de horário do **seu curso**
- Criar e editar alocações de professores nas disciplinas do **seu curso**

❌ **Não pode:**
- Visualizar ou editar dados de outros cursos
- Gerenciar usuários do sistema
- Gerenciar perfis
- Gerenciar salas (somente visualização)
- Acessar relatórios de outros cursos

**Importante:** O coordenador é identificado através da tabela `Professores` onde `coordenador_idProfessor` indica se ele é coordenador, e através da tabela `Professor_Curso` que vincula o coordenador ao seu curso.

### 3. Professor (idPerfil = 1)
**Permissões:** Somente visualização

✅ **Pode:**
- Visualizar **sua própria** grade horária
- Visualizar disciplinas que leciona
- Visualizar alocações de horário onde está vinculado
- Visualizar informações dos cursos onde leciona

❌ **Não pode:**
- Alterar qualquer dado
- Visualizar grades de outros professores
- Criar ou editar qualquer recurso
- Gerenciar usuários
- Gerenciar perfis

## 🛡️ Implementação das Permissões

### Middlewares Disponíveis

#### 1. `authMiddleware`
Valida se o usuário está autenticado.

```typescript
import { authMiddleware } from "../middleware/authMiddleware";

router.get("/rota", authMiddleware, controller);
```

#### 2. `checkRole`
Verifica se o usuário tem um dos perfis permitidos.

```typescript
import { checkRole } from "../middleware/roleMiddleware";

// Somente Admin
router.delete("/recurso", authMiddleware, checkRole([3]), controller);

// Admin ou Coordenador
router.put("/recurso", authMiddleware, checkRole([2, 3]), controller);
```

#### 3. `checkOwnership` (Novo)
Verifica se o usuário tem permissão para acessar um recurso específico baseado em ownership.

```typescript
import { checkOwnership } from "../middleware/permissionMiddleware";

// Coordenador pode acessar apenas seu curso
router.get("/curso/:idCurso", authMiddleware, checkOwnership('curso'), controller);

// Professor pode acessar apenas suas alocações
router.get("/alocacao/:id", authMiddleware, checkOwnership('alocacao'), controller);
```

## 📊 Matriz de Permissões por Recurso

### Usuários

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todos | ❌ | ❌ | ✅ |
| Visualizar próprio | ✅ | ✅ | ✅ |
| Criar | ❌ | ❌ | ✅ |
| Editar próprio | ✅ | ✅ | ✅ |
| Editar outros | ❌ | ❌ | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Cursos

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todos | ❌ | ❌ | ✅ |
| Visualizar próprio curso | ✅ | ✅ | ✅ |
| Criar | ❌ | ❌ | ✅ |
| Editar próprio curso | ❌ | ✅ | ✅ |
| Editar outros cursos | ❌ | ❌ | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Disciplinas

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todas | ❌ | ❌ | ✅ |
| Visualizar do curso | ✅ (suas) | ✅ (seu curso) | ✅ |
| Criar | ❌ | ✅ (seu curso) | ✅ |
| Editar | ❌ | ✅ (seu curso) | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Professores

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todos | ❌ | ❌ | ✅ |
| Visualizar do curso | ✅ | ✅ (seu curso) | ✅ |
| Criar | ❌ | ❌ | ✅ |
| Editar | ❌ | ✅ (seu curso) | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Grade Horária

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todas | ❌ | ❌ | ✅ |
| Visualizar própria | ✅ | ✅ (seu curso) | ✅ |
| Criar | ❌ | ✅ (seu curso) | ✅ |
| Editar | ❌ | ✅ (seu curso) | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Alocação de Horário

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar todas | ❌ | ❌ | ✅ |
| Visualizar próprias | ✅ | ✅ (seu curso) | ✅ |
| Criar | ❌ | ✅ (seu curso) | ✅ |
| Editar | ❌ | ✅ (seu curso) | ✅ |
| Excluir | ❌ | ❌ | ✅ |

### Salas

| Ação | Professor | Coordenador | Admin |
|------|-----------|-------------|-------|
| Visualizar | ✅ | ✅ | ✅ |
| Criar | ❌ | ❌ | ✅ |
| Editar | ❌ | ❌ | ✅ |
| Excluir | ❌ | ❌ | ✅ |

## 💻 Exemplos de Implementação

### Exemplo 1: Rota para listar cursos

```typescript
// GET /curso
// Admin: vê todos
// Coordenador: vê apenas seu curso
// Professor: vê cursos onde leciona

import { authMiddleware } from "../middleware/authMiddleware";

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;
    
    if (user.perfil_id === 3) {
      // Admin - retorna todos os cursos
      const [cursos] = await pool.query("SELECT * FROM Cursos");
      res.json(cursos);
      
    } else if (user.perfil_id === 2) {
      // Coordenador - retorna apenas seu curso
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );
      
      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }
      
      const [cursos] = await pool.query(`
        SELECT c.* FROM Cursos c
        INNER JOIN Professor_Curso pc ON c.idCurso = pc.idCurso
        WHERE pc.idProfessor = ?
      `, [professor[0].idProfessor]);
      
      res.json(cursos);
      
    } else if (user.perfil_id === 1) {
      // Professor - retorna cursos onde leciona
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );
      
      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }
      
      const [cursos] = await pool.query(`
        SELECT c.* FROM Cursos c
        INNER JOIN Professor_Curso pc ON c.idCurso = pc.idCurso
        WHERE pc.idProfessor = ?
      `, [professor[0].idProfessor]);
      
      res.json(cursos);
    }
    
  } catch (error) {
    next(error);
  }
});
```

### Exemplo 2: Rota para editar curso

```typescript
// PUT /curso/:idCurso
// Admin: pode editar qualquer curso
// Coordenador: pode editar apenas seu curso
// Professor: não pode editar

import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

router.put("/:idCurso", authMiddleware, checkRole([2, 3]), async (req, res, next) => {
  try {
    const user = req.user!;
    const { idCurso } = req.params;
    const { nomeCurso, descricaoCurso, duracaoSemestres } = req.body;
    
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
      
      // Verificar se o curso pertence ao coordenador
      const [vinculo]: any = await pool.query(
        "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
        [professor[0].idProfessor, idCurso]
      );
      
      if (!vinculo.length) {
        res.status(403).json({ 
          message: "Você não tem permissão para editar este curso" 
        });
        return;
      }
    }
    
    // Admin ou coordenador autorizado pode editar
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
});
```

### Exemplo 3: Rota para visualizar grade horária

```typescript
// GET /grade/:idGrade
// Admin: pode visualizar qualquer grade
// Coordenador: pode visualizar grade do seu curso
// Professor: pode visualizar apenas sua grade

import { authMiddleware } from "../middleware/authMiddleware";

router.get("/:idGrade", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;
    const { idGrade } = req.params;
    
    // Buscar a grade
    const [grade]: any = await pool.query(
      "SELECT * FROM Grade WHERE idGrade = ?",
      [idGrade]
    );
    
    if (!grade.length) {
      res.status(404).json({ message: "Grade não encontrada" });
      return;
    }
    
    const idCurso = grade[0].idCurso;
    
    if (user.perfil_id === 3) {
      // Admin - pode visualizar
      res.json(grade[0]);
      
    } else if (user.perfil_id === 2 || user.perfil_id === 1) {
      // Coordenador ou Professor - verificar se tem acesso
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );
      
      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }
      
      // Verificar se está vinculado ao curso
      const [vinculo]: any = await pool.query(
        "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
        [professor[0].idProfessor, idCurso]
      );
      
      if (!vinculo.length) {
        res.status(403).json({ 
          message: "Você não tem permissão para visualizar esta grade" 
        });
        return;
      }
      
      // Coordenador ou professor autorizado
      res.json(grade[0]);
    }
    
  } catch (error) {
    next(error);
  }
});
```

### Exemplo 4: Rota para visualizar alocações de horário

```typescript
// GET /alocacao
// Admin: vê todas
// Coordenador: vê apenas do seu curso
// Professor: vê apenas as suas

import { authMiddleware } from "../middleware/authMiddleware";

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user!;
    
    if (user.perfil_id === 3) {
      // Admin - retorna todas as alocações
      const [alocacoes] = await pool.query("SELECT * FROM Alocacao_horario");
      res.json(alocacoes);
      
    } else if (user.perfil_id === 2) {
      // Coordenador - retorna alocações do seu curso
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );
      
      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }
      
      const [alocacoes] = await pool.query(`
        SELECT a.* FROM Alocacao_horario a
        INNER JOIN Grade g ON a.idGrade = g.idGrade
        INNER JOIN Professor_Curso pc ON g.idCurso = pc.idCurso
        WHERE pc.idProfessor = ?
      `, [professor[0].idProfessor]);
      
      res.json(alocacoes);
      
    } else if (user.perfil_id === 1) {
      // Professor - retorna apenas suas alocações
      const [professor]: any = await pool.query(
        "SELECT * FROM Professores WHERE idUsuario = ?",
        [user.id]
      );
      
      if (!professor.length) {
        res.status(404).json({ message: "Professor não encontrado" });
        return;
      }
      
      const [alocacoes] = await pool.query(
        "SELECT * FROM Alocacao_horario WHERE idProfessor = ?",
        [professor[0].idProfessor]
      );
      
      res.json(alocacoes);
    }
    
  } catch (error) {
    next(error);
  }
});
```

## 🔍 Validações Importantes

### 1. Verificar Perfil do Usuário
```typescript
const user = req.user!; // Garantido pelo authMiddleware

if (user.perfil_id === 3) {
  // Admin
} else if (user.perfil_id === 2) {
  // Coordenador
} else if (user.perfil_id === 1) {
  // Professor
}
```

### 2. Buscar Professor pelo ID do Usuário
```typescript
const [professor]: any = await pool.query(
  "SELECT * FROM Professores WHERE idUsuario = ?",
  [user.id]
);
```

### 3. Verificar Vínculo com Curso
```typescript
const [vinculo]: any = await pool.query(
  "SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
  [idProfessor, idCurso]
);
```

### 4. Verificar se é Coordenador
```typescript
const [professor]: any = await pool.query(
  "SELECT * FROM Professores WHERE idUsuario = ? AND coordenador_idProfessor IS NOT NULL",
  [user.id]
);
```

## 🚨 Mensagens de Erro Padrão

```typescript
// 401 - Não autenticado
res.status(401).json({ message: "Autenticação necessária" });

// 403 - Sem permissão
res.status(403).json({ message: "Você não tem permissão para acessar este recurso" });

// 404 - Recurso não encontrado
res.status(404).json({ message: "Recurso não encontrado" });
```

## 📋 Checklist de Implementação

Ao implementar permissões em uma rota:

- [ ] Adicionar `authMiddleware` para garantir autenticação
- [ ] Verificar `user.perfil_id` para determinar o perfil
- [ ] Para Admin (3): permitir acesso total
- [ ] Para Coordenador (2): verificar vínculo com o curso
- [ ] Para Professor (1): permitir apenas visualização e verificar vínculo
- [ ] Retornar mensagens de erro apropriadas (401, 403, 404)
- [ ] Registrar `atualizadoPor` e `criadoPor` com `user.id`
- [ ] Testar com cada perfil para garantir as permissões corretas

## 🎯 Resumo

**Admin (3):**
- ✅ Acesso total
- ✅ Pode fazer tudo

**Coordenador (2):**
- ✅ Visualizar e editar **apenas seu curso**
- ✅ Gerenciar disciplinas, professores e grade do **seu curso**
- ❌ Não pode acessar outros cursos

**Professor (1):**
- ✅ **Somente visualização** da sua grade
- ❌ Não pode alterar nada
- ❌ Não pode ver dados de outros professores
