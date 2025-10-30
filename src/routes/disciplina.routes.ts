import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	createDisciplina,
} from "../controller/disciplinaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getDisciplina); // GET /disciplina
router.get("/:idCurso", getDisciplinaById); // GET /disciplina/idDisciplina
router.post("/", createDisciplina); // POST /disciplina

export default router;
