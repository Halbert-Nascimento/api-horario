import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Grade
router.get("/", authMiddleware, getGrade); // GET /grade
router.get("/:idGrade", authMiddleware, getGradeById); // GET /grade/idGrade
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createGrade); // POST /grade - Admin e Coordenador

export default router;
