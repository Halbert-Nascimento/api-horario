import express from "express";
import {
	getProfessorById,
	getProfessor,
	createProfessor,
} from "../controller/professorController";

const router = express.Router();

//Rotas Perfil
router.get("/", getProfessor); // GET /professor
router.get("/:idCurso", getProfessorById); // GET /professor/idProfessor
router.post("/", createProfessor); // POST /professor

export default router;
