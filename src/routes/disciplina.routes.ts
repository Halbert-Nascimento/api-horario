import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	getDisciplinaByCurso,
	createDisciplina,
} from "../controller/disciplinaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getDisciplina); // GET /disciplina
router.get("/:idDisciplina", getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", createDisciplina); // POST /disciplina

export default router;
