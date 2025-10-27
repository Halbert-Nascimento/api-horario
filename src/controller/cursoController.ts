import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM cursos");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getCursoById = async (
	req: Request<{ idCurso: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = req.params.idCurso;
		const [rows] = await pool.query("SELECT * FROM cursos WHERE idCurso = ?", [
			idCurso,
		]);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};
