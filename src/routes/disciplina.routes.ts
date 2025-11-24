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
import { checkRole } from "../middleware/roleMiddleware";


const router = express.Router();

//Rotas Disciplina
router.get("/", authMiddleware, getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authMiddleware, getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", authMiddleware, getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createDisciplina); // POST /disciplina - Admin e Coordenador
router.post("/curso", authMiddleware, checkRole(["admin", "coordenador"]), createCursoDisciplina); // POST /disciplina/curso - Admin e Coordenador

export default router;
