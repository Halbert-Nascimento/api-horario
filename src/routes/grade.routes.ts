import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
	preventProfessorEdit,
	checkGradeOwnership,
} from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Grade
// Todos os perfis autenticados podem visualizar grades
router.get("/", authMiddleware, getGrade); // GET /grade

// Professor vê apenas grades do seu curso, Coordenador do seu curso, Admin vê todas
router.get("/:idGrade", authMiddleware, checkGradeOwnership, getGradeById); // GET /grade/:idGrade

// Apenas Admin e Coordenador podem criar grades
router.post("/", authMiddleware, preventProfessorEdit, createGrade); // POST /grade

export default router;
