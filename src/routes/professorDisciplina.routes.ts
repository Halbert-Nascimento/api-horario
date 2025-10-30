import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idProfessor", getProfessorDisciplinaById); // GET /professorDisciplina/idProfessor
router.post("/", createProfessorDisciplina); // POST /professorDisciplina

export default router;
