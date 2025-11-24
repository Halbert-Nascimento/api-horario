import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getDiaSemana = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM dia_semana");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDiaSemanaById = async (
	req: Request<{ idDiaSemana: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDiaSemana = req.params.idDiaSemana;
		const [rows] = await pool.query(
			"SELECT * FROM dia_semana WHERE idDiaSemana = ?",
			[idDiaSemana],
		);

		if (Array.isArray(rows) && rows.length === 0) {
			res.status(404).json({ message: "Nenhum dia da semana encontrado" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};
