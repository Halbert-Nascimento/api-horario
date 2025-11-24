import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Professor-Disciplina
router.get("/", authMiddleware, getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idDisciplina", authMiddleware, getProfessorDisciplinaById); // GET /professorDisciplina/idDisciplina
router.post("/", authMiddleware, preventProfessorEdit, createProfessorDisciplina); // POST /professorDisciplina

export default router;
