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

export const createProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomeProfessor, titulacao, email, curriculo_lattes } = req.body;

		if (!nomeProfessor || !titulacao || !email) {
			res
				.status(400)
				.json({
					message: "Todos os campos obrigatórios devem ser preenchidos",
				});
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO professores 
						(nomeProfessor, titulacao, email, curriculo_lattes) 
						VALUES (?, ?, ?, ?)`,
			[nomeProfessor, titulacao, email, curriculo_lattes],
		);

		res.status(201).json({
			message: "Professor criado com sucesso",
			data: {
				id: (result as any).insertId,
				nomeProfessor,
				titulacao,
				email,
				curriculo_lattes,
			},
		});
	} catch (error) {
		next(error);
	}
};
