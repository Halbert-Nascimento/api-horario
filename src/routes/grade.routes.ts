import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";

const router = express.Router();

//Rotas Perfil
router.get("/", getGrade); // GET /grade
router.get("/:idGrade", getGradeById); // GET /grade/idGrade
router.post("/", createGrade); // POST /grade

export default router;
