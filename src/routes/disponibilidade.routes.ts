import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeByProfessor,
	createDisponibilidade,
} from "../controller/disponibilidadeController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Disponibilidade
router.get("/", authMiddleware, getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", authMiddleware, getDisponibilidadeByProfessor); // GET /disponibilidade/idProfessor
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createDisponibilidade); // POST /disponibilidade - Admin e Coordenador

export default router;
