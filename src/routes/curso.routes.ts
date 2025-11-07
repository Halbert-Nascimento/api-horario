import express from "express";
import {
	getCurso,
	getCursoById,
	createCurso,
} from "../controller/cursoController";

const router = express.Router();

//Rotas Perfil
router.get("/", getCurso); // GET /curso
router.get("/:idCurso", getCursoById); // GET /curso/idCurso
router.post("/", createCurso); // POST /curso

export default router;
