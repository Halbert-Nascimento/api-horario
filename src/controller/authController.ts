import pool from "../config/db";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email, senha } = req.body;

		// Validação básica
		if (!email || !senha) {
			res.status(400).json({
				message: "Email e senha são obrigatórios",
			});
			return;
		}

		// Buscar usuário pelo email
		const [rows]: any = await pool.query(
			"SELECT * FROM usuarios WHERE emailUsuario = ?",
			[email],
		);

		if (rows.length === 0) {
			res.status(401).json({
				message: "Credenciais inválidas",
			});
			return;
		}

		const usuario = rows[0];

		// Comparar senha
		const senhaValida = await bcrypt.compare(senha, usuario.senha);
		if (!senhaValida) {
			res.status(401).json({
				message: "Credenciais inválidas",
			});
			return;
		}

		// Buscar nome do perfil
		let nomePerfil = null;
		if (usuario.idPerfil) {
			const [perfilRows]: any = await pool.query(
				"SELECT nomePerfil FROM perfis WHERE idPerfil = ?",
				[usuario.idPerfil],
			);
			if (perfilRows.length > 0) {
				nomePerfil = perfilRows[0].nomePerfil;
			}
		}

		// Gerar token JWT
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			throw new Error("JWT_SECRET não configurado");
		}

		// Payload do token inclui id, email, perfil_id e role
		const tokenPayload = {
			id: usuario.idUsuario,
			email: usuario.emailUsuario,
			perfil_id: usuario.idPerfil,
			role: nomePerfil,
		};

		const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "1h" });

		// Retornar token e dados do usuário
		res.status(200).json({
			token,
			user: {
				id: usuario.idUsuario,
				email: usuario.emailUsuario,
				nome: usuario.nomeUsuario,
				perfil: nomePerfil,
				perfil_id: usuario.idPerfil,
			},
		});
	} catch (error) {
		next(error);
	}
};
