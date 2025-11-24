import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeByProfessor,
	createDisponibilidade,
} from "../controller/disponibilidadeController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Disponibilidade
router.get("/", authMiddleware, getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", authMiddleware, getDisponibilidadeByProfessor); // GET /disponibilidade/idProfessor
router.post("/", authMiddleware, preventProfessorEdit, createDisponibilidade); // POST /disponibilidade

export default router;
