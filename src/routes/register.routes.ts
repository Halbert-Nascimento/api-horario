import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import pool from "../config/db";

const router = express.Router();

// Configurar multer para upload de arquivos
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
		);
	},
});

const upload = multer({ storage: storage });

// Rota de registro com validações
router.post(
	"/",
	upload.single("foto"),
	[
		body("nomeUsuario")
			.notEmpty()
			.withMessage("Nome completo é obrigatório")
			.isLength({ min: 3 })
			.withMessage("Nome deve ter no mínimo 3 caracteres"),
		body("emailUsuario")
			.notEmpty()
			.withMessage("Email é obrigatório")
			.isEmail()
			.withMessage("Email inválido"),
		body("senha")
			.notEmpty()
			.withMessage("Senha é obrigatória")
			.isLength({ min: 6 })
			.withMessage("Senha deve ter no mínimo 6 caracteres"),
		body("idPerfil")
			.notEmpty()
			.withMessage("Perfil é obrigatório")
			.isInt()
			.withMessage("Perfil deve ser um número válido"),
	],
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validar erros
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(400).json({ errors: errors.array() });
				return;
			}

			const { nomeUsuario, emailUsuario, senha, idPerfil } = req.body;

			// Verificar se email já existe
			const [existingUsers]: any = await pool.query(
				"SELECT idUsuario FROM usuarios WHERE emailUsuario = ?",
				[emailUsuario],
			);

			if (existingUsers.length > 0) {
				res.status(400).json({
					message: "Email já cadastrado",
				});
				return;
			}

			// Hash da senha
			const saltRounds = 10;
			const senhaHash = await bcrypt.hash(senha, saltRounds);

			// Inserir usuário
			const [result]: any = await pool.query(
				`INSERT INTO usuarios 
                (nomeUsuario, emailUsuario, senha, idPerfil, ativo)
                VALUES (?, ?, ?, ?, 1)`,
				[nomeUsuario, emailUsuario, senhaHash, idPerfil],
			);

			res.status(201).json({
				message: "Usuário registrado com sucesso",
				data: {
					idUsuario: result.insertId,
					nomeUsuario,
					emailUsuario,
					idPerfil,
				},
			});
		} catch (error) {
			next(error);
		}
	},
);

export default router;
