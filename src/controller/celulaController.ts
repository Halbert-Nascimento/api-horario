import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM vw_celulas");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getCelulaCurso = async (
	req: Request<{ idCurso: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = req.params.idCurso;
		const [rows] = await pool.query(
			"SELECT * FROM vw_celulas_por_curso WHERE idCurso = ?",
			[idCurso],
		);

		if (Array.isArray(rows) && rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhuma célula encontrada para este curso" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			idCurso_Disciplina_Professor,
			idGrade,
			idDisciplina,
			idProfessor,
			dia_semanan,
			semestre,
		} = req.body;

		// Validação dos campos obrigatórios
		if (
			!idCurso_Disciplina_Professor ||
			!idGrade ||
			!idDisciplina ||
			!idProfessor ||
			!dia_semanan ||
			!semestre
		) {
			res.status(400).json({ message: "Todos os campos são obrigatórios" });
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO Grade_horario 
            (idCurso_Disciplina_Professor, idGrade, idDisciplina, idProfessor, dia_semanan, semestre) 
            VALUES (?, ?, ?, ?, ?, ?)`,
			[
				idCurso_Disciplina_Professor,
				idGrade,
				idDisciplina,
				idProfessor,
				dia_semanan,
				semestre,
			],
		);

		res.status(201).json({
			message: "Célula criada com sucesso",
			data: {
				idCurso_Disciplina_Professor,
				idGrade,
				idDisciplina,
				idProfessor,
				dia_semanan,
				semestre,
			},
		});
	} catch (error) {
		next(error);
	}
};
