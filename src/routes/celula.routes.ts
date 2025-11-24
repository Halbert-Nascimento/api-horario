import express from "express";
import {
	getCelula,
	getCelulaCurso,
	createCelula,
	deleteCelula,
} from "../controller/celulaController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Celula
router.get("/", authMiddleware, getCelula); // GET /celula
router.get("/:idCurso", authMiddleware, getCelulaCurso); // GET /celula/idCurso
router.post("/", authMiddleware, preventProfessorEdit, createCelula); // POST /celula
router.delete("/:idCelula", authMiddleware, preventProfessorEdit, deleteCelula); // DELETE /celula/idCelula

export default router;
