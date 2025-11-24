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
router.get("/",  getDisciplina); // GET /disciplina
router.get("/:idDisciplina", getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", createDisciplina); // POST /disciplina
router.post("/curso", createCursoDisciplina); // POST /disciplina/curso

export default router;
