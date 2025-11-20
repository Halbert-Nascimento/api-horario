import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeById,
	createDisponibilidade,
} from "../controller/disponibilidadeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Disponibilidade
// Todos os perfis autenticados podem visualizar disponibilidades
router.get("/", authMiddleware, getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", authMiddleware, getDisponibilidadeById); // GET /disponibilidade/idProfessor

// Apenas Admin e Coordenador podem criar disponibilidades
router.post("/", authMiddleware, preventProfessorEdit, createDisponibilidade); // POST /disponibilidade

export default router;
