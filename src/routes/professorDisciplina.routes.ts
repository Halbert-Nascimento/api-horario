import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Professor-Disciplina
router.get("/", authMiddleware, getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idDisciplina", authMiddleware, getProfessorDisciplinaById); // GET /professorDisciplina/idDisciplina
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createProfessorDisciplina); // POST /professorDisciplina - Admin e Coordenador

export default router;
