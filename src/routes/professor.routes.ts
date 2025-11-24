import express from "express";
import {
	getProfessorById,
	getProfessor,
	getProfessorByCurso,
	getProfessorByCoordenador,
	createProfessor,
} from "../controller/professorController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Professor
router.get("/", authMiddleware, getProfessor); // GET /professor
router.get("/:idProfessor", authMiddleware, getProfessorById); // GET /professor/idProfessor
router.get("/coordenador/:idCoordenador", authMiddleware, getProfessorByCoordenador); // GET /professor/coordenador/idCoordenador
router.get("/curso/:idCurso", authMiddleware, getProfessorByCurso); // GET /professor/curso/idCurso
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createProfessor); // POST /professor - Admin e Coordenador

export default router;
