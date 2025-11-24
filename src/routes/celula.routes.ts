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

// Definir a interface com index signature
interface CelulaParams extends Record<string, string> {
	idCurso: string;
	semestreLetivo: string;
	anoLetivo: string;
}

const router = express.Router();

//Rotas Celula
router.get("/", authMiddleware, getCelula); // GET /celula
router.get<CelulaParams>(
	"/:idCurso/semestre/:semestreLetivo/ano/:anoLetivo",
	authMiddleware,
	getCelulaCurso,
); // GET /celula/{idCurso}/semestre/{semestreLetivo}/ano/{anoLetivo}
router.post(
	"/",
	authMiddleware,
	checkRole(["admin", "coordenador"]),
	createCelula,
); // POST /celula - Admin e Coordenador
router.delete<{ idCelula: string }>(
	"/:idCelula",
	authMiddleware,
	checkRole(["admin", "coordenador"]),
	deleteCelula,
); // DELETE /celula/idCelula - Admin e Coordenador

export default router;
