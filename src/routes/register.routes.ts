
import express from "express";
import { body } from "express-validator";
import { registerUsuario } from "../controller/registerController";

const router = express.Router();

// Rota para registrar um novo usuário
// POST /register
router.post(
	"/",
	[
		// Validações dos campos
		body("nomeUsuario").trim().notEmpty().withMessage("Nome é obrigatório."),
		body("emailUsuario").isEmail().withMessage("Email inválido."),
		body("senha")
			.isLength({ min: 6 })
			.withMessage("Senha deve ter no mínimo 6 caracteres."),
		body("idPerfil")
			.isInt({ min: 1, max: 3 })
			.withMessage("Perfil inválido."),
	],
	registerUsuario,
);

export default router;