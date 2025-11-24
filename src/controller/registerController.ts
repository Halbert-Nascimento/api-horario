import pool from "../config/db";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

export const registerUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Verificar erros de validação
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { nomeUsuario, emailUsuario, senha, idPerfil } = req.body;

		// Verificar se todos os campos obrigatórios foram enviados
		if (!nomeUsuario || !emailUsuario || !senha || !idPerfil) {
			return res.status(400).json({
				message: "Todos os campos são obrigatórios.",
			});
		}

		// Verificar se email já existe
		const [existing]: any = await pool.query(
			"SELECT idUsuario FROM usuario WHERE emailUsuario = ?",
			[emailUsuario],
		);

		// Se o email já estiver em uso, retornar erro
		if (existing.length > 0) {
			return res.status(400).json({ message: "Email já cadastrado." });
		}

		// Hash da senha
		const saltRounds = 10;
		const senhaHash = await bcrypt.hash(senha, saltRounds);

		// Inserir novo usuário no banco de dados
		const [result]: any = await pool.query(
			"INSERT INTO usuario (nomeUsuario, emailUsuario, senha, idPerfil, ativo) VALUES (?, ?, ?, ?, 1)",
			[nomeUsuario, emailUsuario, senhaHash, idPerfil],
		);

		// Retornar sucesso
		res.status(201).json({
			message: "Usuário registrado com sucesso.",
			data: {
				idUsuario: result.insertId,
				nomeUsuario,
				emailUsuario,
				idPerfil,
			},
		});
	} catch (error) {
		console.error("Erro ao registrar usuário:", error);
		next(error);
	}
};
