import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Grade
// Todos os perfis autenticados podem visualizar grades
router.get("/", authMiddleware, getGrade); // GET /grade
router.get("/:idGrade", authMiddleware, getGradeById); // GET /grade/idGrade

// Apenas Admin e Coordenador podem criar grades
router.post("/", authMiddleware, preventProfessorEdit, createGrade); // POST /grade

export default router;
