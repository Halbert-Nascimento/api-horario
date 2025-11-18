import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	getDisciplinaByCurso,
	createDisciplina,
	createCursoDisciplina,
} from "../controller/disciplinaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Disciplina
// Professor pode visualizar, mas não pode criar/editar
router.get("/", authMiddleware, getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authMiddleware, getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", authMiddleware, getDisciplinaByCurso); // GET /disciplina/curso/idCurso

// Apenas Admin e Coordenador podem criar disciplinas
router.post("/", authMiddleware, preventProfessorEdit, createDisciplina); // POST /disciplina
router.post("/curso", authMiddleware, preventProfessorEdit, createCursoDisciplina); // POST /disciplina/curso

export default router;
