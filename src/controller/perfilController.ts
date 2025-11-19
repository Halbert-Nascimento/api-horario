import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getPerfis = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM perfil");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getPerfilById = async (
	req: Request<{ idPerfil: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idPerfil = req.params.idPerfil;
		const [rows] = await pool.query("SELECT * FROM perfil WHERE idPerfil = ?", [
			idPerfil,
		]);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createPerfil = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomePerfil } = req.body;
		if (!nomePerfil) {
			res.status(400).json({
				message: "nomePerfil é obrigatório",
			});
			return;
		}
		const [result]: any = await pool.query(
			`INSERT INTO perfis (nomePerfil) VALUES (?)`,
			[nomePerfil],
		);
		res.status(201).json({
			message: "Perfil criado com sucesso",
			data: {
				idPerfil: result.insertId,
				nomePerfil,
			},
		});
	} catch (error) {
		next(error);
	}
};
