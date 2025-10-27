import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
} from "../controller/disciplinaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getDisciplina); // GET /disciplina
router.get("/:idCurso", getDisciplinaById); // GET /disciplina/idDisciplina

export default router;
