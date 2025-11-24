import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getDisponibilidade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM vw_disponbibilidade_professor",
		);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisponibilidadeByProfessor = async (
	req: Request<{ idProfessor: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = req.params.idProfessor;
		const [rows] = await pool.query(
			"SELECT * FROM vw_disponbibilidade_professor WHERE idProfessor = ?",
			[idProfessor],
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

export const createDisponibilidade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idProfessor, idDiaSemana } = req.body;
		if (!idProfessor || !idDiaSemana) {
			res
				.status(400)
				.json({ message: "idProfessor e idDiaSemana são obrigatórios" });
			return;
		}
		const [result] = await pool.query(
			`INSERT INTO professor_disponibilidade 
        (idProfessor, idDiaSemana) 
        VALUES (?, ?)`,
			[idProfessor, idDiaSemana],
		);

		res.status(201).json({
			message: "Disponibilidade cadastrada com sucesso",
			data: {
				idProfessor,
				idDiaSemana,
			},
		});
	} catch (error) {
		next(error);
	}
};
