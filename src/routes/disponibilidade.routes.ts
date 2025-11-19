import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeByProfessor,
	createDisponibilidade,
} from "../controller/disponibilidadeController";

const router = express.Router();

//Rotas Perfil
router.get("/", getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", getDisponibilidadeByProfessor); // GET /disponibilidade/idProfessor
router.post("/", createDisponibilidade); // POST /disponibilidade

export default router;
