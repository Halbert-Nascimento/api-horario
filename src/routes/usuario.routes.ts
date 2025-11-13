import express from "express";
import {
	getUsuario,
	getUsuarioById,
	createUsuario,
} from "../controller/usuarioController";

const router = express.Router();

//Rotas Usuario
router.get("/", getUsuario); // GET /usuario
router.get("/:idUsuario", getUsuarioById); // GET /usuario/idUsuario
router.post("/", createUsuario); // POST /usuario

export default router;
