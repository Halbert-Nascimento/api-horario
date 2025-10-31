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

export const getDisciplinaByCurso = async (
	req: Request<{ idCurso: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = req.params.idCurso;
		const [rows] = await pool.query(
			"SELECT * FROM vw_disciplina_curso WHERE idCurso = ?",
			[idCurso],
		);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomeDisciplina, carga_horaria, modalidade, tipo_sala } = req.body;

		if (!nomeDisciplina || !carga_horaria || !modalidade || !tipo_sala) {
			res.status(400).json({
				message: "Todos os campos obrigatórios devem ser preenchidos",
			});
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO disciplinas 
						(nomeDisciplina, carga_horaria, modalidade, tipo_sala) 
						VALUES (?, ?, ?, ?)`,
			[nomeDisciplina, carga_horaria, modalidade, tipo_sala],
		);

		res.status(201).json({
			message: "Disciplina criada com sucesso",
			data: {
				nomeDisciplina,
				carga_horaria,
				modalidade,
				tipo_sala,
			},
		});
	} catch (error) {
		next(error);
	}
};
