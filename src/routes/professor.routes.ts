import express from "express";
import {
	getProfessorById,
	getProfessor,
} from "../controller/professorController";

const router = express.Router();

//Rotas Perfil
router.get("/", getProfessor); // GET /professor
router.get("/:idCurso", getProfessorById); // GET /professor/idProfessor

export default router;
