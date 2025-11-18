import express from "express";
import {
	getCurso,
	getCursoById,
	createCurso,
} from "../controller/cursoController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Curso
// Todos os perfis autenticados podem visualizar cursos
router.get("/", authMiddleware, getCurso); // GET /curso
router.get("/:idCurso", authMiddleware, getCursoById); // GET /curso/idCurso

// Apenas Admin pode criar cursos (perfil 1)
router.post("/", authMiddleware, checkRole([1]), createCurso); // POST /curso

export default router;
