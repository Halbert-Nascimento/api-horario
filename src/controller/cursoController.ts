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

export const createCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomeCurso, descricaoCurso, duracaoSemestres } = req.body;

		// Validação dos campos obrigatórios
		if (!nomeCurso || !duracaoSemestres) {
			res.status(400).json({
				message: "Os campos nomeCurso e duracaoSemestres são obrigatórios",
			});
			return;
		}

		// Validação do tipo de duracaoSemestres
		if (isNaN(duracaoSemestres) || duracaoSemestres <= 0) {
			res.status(400).json({
				message: "O campo duracaoSemestres deve ser um número positivo",
			});
			return;
		}

		// Inserir o curso no banco de dados
		const [result]: any = await pool.query(
			`INSERT INTO cursos (nomeCurso, descricaoCurso, duracaoSemestres) VALUES (?, ?, ?)`,
			[nomeCurso, descricaoCurso || null, duracaoSemestres],
		);

		res.status(201).json({
			message: "Curso criado com sucesso",
			data: {
				idCurso: result.insertId,
				nomeCurso,
				descricaoCurso: descricaoCurso || null,
				duracaoSemestres,
			},
		});
	} catch (error) {
		next(error);
	}
};
