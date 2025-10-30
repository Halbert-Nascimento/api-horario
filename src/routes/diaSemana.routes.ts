import express from "express";
import {
	getDiaSemana,
	getDiaSemanaById,
} from "../controller/diaSemanaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", getDiaSemanaById); // GET /diaSemana/idDiaSemana

export default router;
