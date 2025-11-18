import express from "express";
import {
	getDiaSemana,
	getDiaSemanaById,
} from "../controller/diaSemanaController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

//Rotas DiaSemana
// Todos os perfis autenticados podem visualizar dias da semana
router.get("/", authMiddleware, getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", authMiddleware, getDiaSemanaById); // GET /diaSemana/idDiaSemana

export default router;
