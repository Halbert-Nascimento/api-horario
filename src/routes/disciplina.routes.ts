import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	getDisciplinaByCurso,
	createDisciplina,
	createCursoDisciplina,
	getDisciplinaByCursoSemstre,
} from "../controller/disciplinaController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
	preventProfessorEdit,
	checkCursoOwnership,
} from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Disciplina
// Todos os perfis podem visualizar disciplinas
router.get("/", authMiddleware, getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authMiddleware, getDisciplinaById); // GET /disciplina/:idDisciplina

// Professor vê apenas disciplinas do seu curso e período, Coordenador do seu curso, Admin vê todas
router.get(
	"/curso/:idCurso/periodo/:periodo",

	getDisciplinaByCursoSemstre,
); // GET /disciplina/curso/:idCurso/periodo/:periodo

router.get(
	"/curso/:idCurso",

	getDisciplinaByCurso,
);

// Apenas Admin e Coordenador podem criar disciplinas (Professor bloqueado)
router.post("/", authMiddleware, preventProfessorEdit, createDisciplina); // POST /disciplina
router.post(
	"/curso",
	authMiddleware,
	preventProfessorEdit,
	createCursoDisciplina,
); // POST /disciplina/curso

export default router;
