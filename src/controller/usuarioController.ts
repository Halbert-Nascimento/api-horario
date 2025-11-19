import pool from "../config/db";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

export const getUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM usuario");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getUsuarioById = async (
	req: Request<{ idUsuario: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idUsuario } = req.params;
		const id = parseInt(idUsuario, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID do usuário inválido" });
			return;
		}

		const [rows] = await pool.query(
			"SELECT * FROM usuario WHERE idUsuario = ?",
			[id],
		);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomeUsuario, emailUsuario, senha, idPerfil, ativo } = req.body;
		if (!nomeUsuario || !emailUsuario || !senha || !idPerfil) {
			res.status(400).json({
				message: "nomeUsuario, emailUsuario, senha e idPerfil são obrigatórios",
			});
			return;
		}

		// Hash da senha com bcrypt
		const saltRounds = 10;
		const senhaHash = await bcrypt.hash(senha, saltRounds);

		const [result]: any = await pool.query(
			`INSERT INTO usuarios 
        (nomeUsuario, emailUsuario, senha, idPerfil, ativo)
        VALUES (?, ?, ?, ?, 1)`,
			[nomeUsuario, emailUsuario, senhaHash, idPerfil, ativo],
		);
		res.status(201).json({
			message: "Usuário criado com sucesso",
			data: {
				idUsuario: result.insertId,
				nomeUsuario,
				emailUsuario,
				idPerfil,
				ativo: ativo,
			},
		});
	} catch (error) {
		next(error);
	}
};
