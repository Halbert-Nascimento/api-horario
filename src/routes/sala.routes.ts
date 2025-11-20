import express from "express";
import { getSala, getSalaById, createSala } from "../controller/salaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Sala
// Todos os perfis autenticados podem visualizar salas
router.get("/", authMiddleware, getSala); // GET /sala
router.get("/:idSala", authMiddleware, getSalaById); // GET /sala/idSala

// Apenas Admin pode criar salas
router.post("/", authMiddleware, checkRole([3]), createSala); // POST /sala

export default router;
