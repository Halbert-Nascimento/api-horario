import express from "express";
import {
	getCelula,
	getCelulaCurso,
	createCelula,
} from "../controller/celulaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getCelula); // GET /celula
router.get("/:idCurso", getCelulaCurso); // GET /celula/idCurso
router.post("/", createCelula); // POST /celula

export default router;
