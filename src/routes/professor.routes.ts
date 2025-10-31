import express from "express";
import {
	getProfessorById,
	getProfessor,
	getProfessorByCurso,
	createProfessor,
} from "../controller/professorController";

const router = express.Router();

//Rotas Perfil
router.get("/", getProfessor); // GET /professor
router.get("/:idProfessor", getProfessorById); // GET /professor/idProfessor
router.get("/curso/:idCurso", getProfessorByCurso); // GET /professor/idProfessor
router.post("/", createProfessor); // POST /professor

export default router;
