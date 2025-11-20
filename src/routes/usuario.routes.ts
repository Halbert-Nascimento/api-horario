import express from "express";
import {
	getUsuario,
	getUsuarioById,
	createUsuario,
} from "../controller/usuarioController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Usuario
// Todos os perfis autenticados podem visualizar usuários
router.get("/", authMiddleware, getUsuario); // GET /usuario
router.get("/:idUsuario", authMiddleware, getUsuarioById); // GET /usuario/idUsuario

// Apenas Admin pode criar usuários
router.post("/", authMiddleware, checkRole([3]), createUsuario); // POST /usuario

export default router;
