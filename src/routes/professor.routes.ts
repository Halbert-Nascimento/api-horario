import express from "express";
import {
	getProfessorById,
	getProfessor,
	getProfessorByCurso,
	getProfessorByCoordenador,
	createProfessor,
} from "../controller/professorController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Professor
// Todos os perfis autenticados podem visualizar professores
router.get("/", authMiddleware, getProfessor); // GET /professor
router.get("/:idProfessor", authMiddleware, getProfessorById); // GET /professor/idProfessor
router.get("/coordenador/:idCoordenador", authMiddleware, getProfessorByCoordenador); // GET /professor/coordenador/idCoordenador
router.get("/curso/:idCurso", authMiddleware, getProfessorByCurso); // GET /professor/curso/idCurso

// Apenas Admin pode criar professores
router.post("/", authMiddleware, checkRole([3]), createProfessor); // POST /professor

export default router;
