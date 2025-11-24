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

//Rotas Disciplina
router.get("/", authMiddleware, getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authMiddleware, getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", authMiddleware, getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", authMiddleware, preventProfessorEdit, createDisciplina); // POST /disciplina
router.post("/curso", authMiddleware, preventProfessorEdit, createCursoDisciplina); // POST /disciplina/curso

export default router;
