import express from "express";
import { getSala, getSalaById, createSala } from "../controller/salaController";

// Importar middlewares de autenticação e permissão
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

//Rotas Sala
router.get("/", authMiddleware, getSala); // GET /sala
router.get("/:idSala", authMiddleware, getSalaById); // GET /sala/idSala
router.post("/", authMiddleware, checkRole(["admin", "coordenador"]), createSala); // POST /sala - Admin e Coordenador

export default router;
