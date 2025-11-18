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
import { checkCursoOwnership } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Professor
// Todos os perfis autenticados podem visualizar professores
router.get("/", authMiddleware, getProfessor); // GET /professor
router.get("/:idProfessor", authMiddleware, getProfessorById); // GET /professor/:idProfessor
router.get(
	"/coordenador/:idCoordenador",
	authMiddleware,
	getProfessorByCoordenador,
); // GET /professor/coordenador/:idCoordenador

// Professor vê apenas professores do seu curso, Coordenador do seu curso, Admin vê todos
router.get(
	"/curso/:idCurso",
	authMiddleware,
	checkCursoOwnership,
	getProfessorByCurso,
); // GET /professor/curso/:idCurso

// Apenas Admin pode criar professores (perfil 1)
router.post("/", authMiddleware, checkRole([1]), createProfessor); // POST /professor

export default router;
