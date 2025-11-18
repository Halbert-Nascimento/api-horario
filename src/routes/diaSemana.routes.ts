import express from "express";
import {
	getDiaSemana,
	getDiaSemanaById,
} from "../controller/diaSemanaController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

//Rotas DiaSemana
// Todos os perfis autenticados podem visualizar dias da semana
// Dias da semana são dados de referência (lookup table), não requerem permissões especiais
router.get("/", authMiddleware, getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", authMiddleware, getDiaSemanaById); // GET /diaSemana/idDiaSemana

export default router;
