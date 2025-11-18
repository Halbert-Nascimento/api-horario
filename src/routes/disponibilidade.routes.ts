import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeById,
	createDisponibilidade,
} from "../controller/disponibilidadeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

//Rotas Disponibilidade
// Professor pode gerenciar sua própria disponibilidade
// Coordenador pode gerenciar disponibilidades de professores do seu curso
// Admin tem acesso total
router.get("/", authMiddleware, getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", authMiddleware, getDisponibilidadeById); // GET /disponibilidade/:idProfessor

// Todos os perfis podem criar disponibilidade (professor cria a sua própria)
router.post("/", authMiddleware, createDisponibilidade); // POST /disponibilidade

export default router;
