import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Grade
router.get("/", authMiddleware, getGrade); // GET /grade
router.get("/:idGrade", authMiddleware, getGradeById); // GET /grade/idGrade
router.post("/", authMiddleware, preventProfessorEdit, createGrade); // POST /grade

export default router;
