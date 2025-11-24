
import express from "express";
import { login } from "../controller/authController";

//criar um roteador
const router = express.Router();

// rota POST para login
router.post("/login", login);

// exportar o roteador
export default router;
