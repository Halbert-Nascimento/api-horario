import express from "express";
import {
	getProfessorById,
	getProfessor,
	getProfessorByCurso,
	getProfessorByCoordenador,
	createProfessor,
} from "../controller/professorController";

const router = express.Router();

//Rotas Professor
router.get("/", getProfessor); // GET /professor
router.get("/:idProfessor", getProfessorById); // GET /professor/idProfessor
router.get("/coordenador/:idCoordenador", getProfessorByCoordenador); // GET /professor/coordenador/idCoordenador
router.get("/curso/:idCurso", getProfessorByCurso); // GET /professor/curso/idCurso
router.post("/", createProfessor); // POST /professor

export default router;
