import express from "express";
import { getCurso, getCursoById } from "../controller/cursoController";

const router = express.Router();

//Rotas Perfil
router.get("/", getCurso); // GET /curso
router.get("/:idCurso", getCursoById); // GET /curso/idCurso

export default router;
