import express from "express";
import {
	getCelula,
	getCelulaCurso,
	createCelula,
	deleteCelula,
} from "../controller/celulaController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Celula
router.get("/", authMiddleware, getCelula); // GET /celula
router.get("/:idCurso", authMiddleware, getCelulaCurso); // GET /celula/idCurso
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createCelula); // POST /celula - Admin e Coordenador
router.delete("/:idCelula", authMiddleware, checkRole(["admin", "coordenador"]), deleteCelula); // DELETE /celula/idCelula - Admin e Coordenador

export default router;
