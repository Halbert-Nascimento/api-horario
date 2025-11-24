import express from "express";
import {
	getCurso,
	getCursoById,
	createCurso,
} from "../controller/cursoController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Curso
router.get("/", authMiddleware, getCurso); // GET /curso
router.get("/:idCurso", authMiddleware, getCursoById); // GET /curso/idCurso
router.post("/", authMiddleware, checkRole(["admin"]), createCurso); // POST /curso - Apenas Admin

export default router;
