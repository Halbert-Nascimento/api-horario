import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	getDisciplinaByCurso,
	createDisciplina,
	createCursoDisciplina,
} from "../controller/disciplinaController";

// importa os guardas
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";


const router = express.Router();

//Rotas Perfil
router.get("/", authMiddleware,  getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authMiddleware, getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", authMiddleware, getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", authMiddleware, createDisciplina); // POST /disciplina
router.post("/curso", authMiddleware, createCursoDisciplina); // POST /disciplina/curso

export default router;
