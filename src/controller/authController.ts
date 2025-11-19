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
			"SELECT * FROM usuario WHERE emailUsuario = ?",
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
				"SELECT nomePerfil FROM perfil WHERE idPerfil = ?",
				[usuario.idPerfil],
			);
			if (perfilRows.length > 0) {
				nomePerfil = perfilRows[0].nomePerfil;
			}
		}

		// Buscar curso do usuário a partir da view vw_usuario_curso (opcional)
		let idCurso = null;
		const [cursosRows]: any = await pool.query(
			"SELECT idCurso FROM vw_usuario_curso WHERE idUsuario = ? LIMIT 1",
			[usuario.idUsuario],
		);

		if (cursosRows.length > 0) {
			idCurso = cursosRows[0].idCurso;
		}

		// Gerar token JWT
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			throw new Error("JWT_SECRET não configurado");
		}

		// Payload do token inclui id, email, perfil_id, role e idCurso (opcional)
		const tokenPayload = {
			id: usuario.idUsuario,
			email: usuario.emailUsuario,
			perfil_id: usuario.idPerfil,
			role: nomePerfil,
			...(idCurso && { idCurso }), // Só inclui idCurso se existir
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
				...(idCurso && { idCurso }), // Só inclui idCurso se existir
			},
		});
	} catch (error) {
		next(error);
	}
};
