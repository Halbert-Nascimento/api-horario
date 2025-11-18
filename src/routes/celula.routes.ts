import express from "express";
import {
	getCelula,
	getCelulaCurso,
	createCelula,
	deleteCelula,
} from "../controller/celulaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { preventProfessorEdit } from "../middleware/permissionMiddleware";

const router = express.Router();

//Rotas Celula (Alocacao_horario)
// Todos os perfis autenticados podem visualizar alocações
router.get("/", authMiddleware, getCelula); // GET /celula
router.get("/:idCurso", authMiddleware, getCelulaCurso); // GET /celula/idCurso

// Apenas Admin e Coordenador podem criar/deletar alocações de horário
router.post("/", authMiddleware, preventProfessorEdit, createCelula); // POST /celula
router.delete("/:idCelula", authMiddleware, preventProfessorEdit, deleteCelula); // DELETE /celula/idCelula

export default router;
