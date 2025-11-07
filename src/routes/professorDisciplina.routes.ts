import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idDisciplina", getProfessorDisciplinaById); // GET /professorDisciplina/idDisciplina
router.post("/", createProfessorDisciplina); // POST /professorDisciplina

export default router;
