import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getProfessorDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM vw_disciplina_professor");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorDisciplinaById = async (
	req: Request<{ idDisciplina: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDisciplina = req.params.idDisciplina;
		const [rows] = await pool.query(
			"SELECT * FROM vw_disciplina_professor WHERE idDisciplina = ?",
			[idDisciplina],
		);

		if (Array.isArray(rows) && rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhum professor com esse id encontrado" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createProfessorDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idProfessor, idDisciplina } = req.body;
		if (!idProfessor || !idDisciplina) {
			res
				.status(400)
				.json({ message: "idProfessor e idDiaSemana são obrigatórios" });
			return;
		}
		const [result] = await pool.query(
			`INSERT INTO disciplina_professor 
        (idProfessor, idDisciplina) 
        VALUES (?, ?)`,
			[idProfessor, idDisciplina],
		);

		res.status(201).json({
			message: "Disponibilidade cadastrada com sucesso",
			data: {
				idProfessor,
				idDisciplina,
			},
		});
	} catch (error) {
		next(error);
	}
};
