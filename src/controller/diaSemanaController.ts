import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getDiaSemana = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM Dia_semana");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDiaSemanaById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idDiaSemana } = req.params;
		const id = parseInt(idDiaSemana, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID inválido" });
			return;
		}

		const [rows] = await pool.query(
			"SELECT * FROM Dia_semana WHERE idDiaSemana = ?",
			[id],
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
