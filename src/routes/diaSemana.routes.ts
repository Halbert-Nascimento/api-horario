import express from "express";
import {
	getDiaSemana,
	getDiaSemanaById,
} from "../controller/diaSemanaController";

// Importar middleware de autenticação
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

//Rotas Dia da Semana
router.get("/", authMiddleware, getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", authMiddleware, getDiaSemanaById); // GET /diaSemana/idDiaSemana

export default router;
