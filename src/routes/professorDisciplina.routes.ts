import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Professor-Disciplina
// Todos os perfis autenticados podem visualizar vinculações
router.get("/", authMiddleware, getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idDisciplina", authMiddleware, getProfessorDisciplinaById); // GET /professorDisciplina/:idDisciplina

// Apenas Admin e Coordenador podem vincular professores a disciplinas
router.post(
	"/",
	authMiddleware,
	preventProfessorEdit,
	createProfessorDisciplina,
); // POST /professorDisciplina

export default router;
