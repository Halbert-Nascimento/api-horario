import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM disciplinas");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisciplinaById = async (
	req: Request<{ idDisciplina: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDisciplina = req.params.idDisciplina;
		const [rows] = await pool.query(
			"SELECT * FROM disciplinas WHERE idDisciplina = ?",
			[idDisciplina],
		);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};
