import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getGrade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM grade");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getGradeById = async (
	req: Request<{ idGrade: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idGrade = req.params.idGrade;
		const [rows] = await pool.query("SELECT * FROM grade WHERE idGrade = ?", [
			idGrade,
		]);

		if (Array.isArray(rows) && rows.length === 0) {
			res.status(404).json({ message: "Nenhuma grade encontrada" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createGrade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idCurso, anoLetivo, semestreLetivo } = req.body;
		if (!idCurso || !anoLetivo || !semestreLetivo) {
			res
				.status(400)
				.json({ message: "idCurso, anoLetivo e semestreLetivo são obrigatórios" });
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO grade 
        (idCurso, anoLetivo, semestreLetivo, criadoEm) 
        VALUES (?, ?, ?, ?)`,
			[idCurso, anoLetivo, semestreLetivo, new Date()],
		);

		res.status(201).json({
			message: "Grade criada com sucesso",
			data: {
				idCurso,
				anoLetivo,
				semestreLetivo,
			},
		});
	} catch (error) {
		next(error);
	}
};
