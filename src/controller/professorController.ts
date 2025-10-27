import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM professores");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorById = async (
	req: Request<{ idProfessor: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = req.params.idProfessor;
		const [rows] = await pool.query(
			"SELECT * FROM professores WHERE idProfessor = ?",
			[idProfessor],
		);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};
