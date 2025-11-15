import express from "express";
import { getSala, getSalaById, createSala } from "../controller/salaController";

const router = express.Router();

//Rotas Sala
router.get("/", getSala); // GET /sala
router.get("/:idSala", getSalaById); // GET /sala/idSala
router.post("/", createSala); // POST /sala

export default router;
