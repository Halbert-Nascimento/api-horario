import express from "express";
import {
	getUsuario,
	getUsuarioById,
	createUsuario,
} from "../controller/usuarioController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Usuario
router.get("/", authMiddleware, getUsuario); // GET /usuario
router.get("/:idUsuario", authMiddleware, getUsuarioById); // GET /usuario/idUsuario
router.post("/", authMiddleware, preventProfessorEdit, createUsuario); // POST /usuario

export default router;
