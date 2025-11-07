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
	req: Request<{ idGrade: number }>,
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
		const { idCurso, semestre_letivo, data_criacao } = req.body;
		if (!idCurso || !semestre_letivo) {
			res
				.status(400)
				.json({ message: "idCurso e semestre_letivo são obrigatórios" });
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO grade 
        (idCurso, semestre_letivo, data_criacao) 
        VALUES (?, ?, ?)`,
			[idCurso, semestre_letivo, data_criacao],
		);

		res.status(201).json({
			message: "Grade criada com sucesso",
			data: {
				idCurso,
				semestre_letivo,
				data_criacao,
			},
		});
	} catch (error) {
		next(error);
	}
};
