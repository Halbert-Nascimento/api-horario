import express from "express";
import {
	getPerfis,
	getPerfilById,
	createPerfil,
} from "../controller/perfilController";

const router = express.Router();

//Rotas Perfil
router.get("/", getPerfis); // GET /perfil
router.get("/:idPerfil", getPerfilById); // GET /perfil/idPerfil
router.post("/", createPerfil); // POST /perfil

export default router;
