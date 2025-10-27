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
			"SELECT * FROM vw_celulas WHERE idCurso = ?",
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
		const { idGrade, idDisciplina, idProfessor, dia_semana, semestre } =
			req.body;

		// Validação dos campos obrigatórios
		if (!idGrade || !idDisciplina || !idProfessor || !dia_semana || !semestre) {
			res.status(400).json({ message: "Todos os campos são obrigatórios" });
			return;
		}

		const [result] = await pool.query(
			`INSERT INTO grade_horario 
            (idGrade, idDisciplina, idProfessor, dia_semana, semestre) 
            VALUES (?, ?, ?, ?, ?)`,
			[idGrade, idDisciplina, idProfessor, dia_semana, semestre],
		);

		res.status(201).json({
			message: "Célula criada com sucesso",
			data: {
				idGrade,
				idDisciplina,
				idProfessor,
				dia_semana,
				semestre,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const deleteCelula = async (
	req: Request<{ idCelula: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idCelula } = req.params;

		// Validação do parâmetro
		if (!idCelula) {
			res.status(400).json({
				message: "O ID da célula é obrigatório",
			});
			return;
		}

		// Primeiro verifica se a célula existe na view e obtém os IDs necessários
		const [rows]: any = await pool.query(
			`SELECT idGrade, idDisciplina, idProfessor 
             FROM vw_celulas 
             WHERE idCurso_Disciplina_Professor = ?`,
			[idCelula],
		);

		if (Array.isArray(rows) && rows.length === 0) {
			res.status(404).json({
				message: "Célula não encontrada",
			});
			return;
		}

		const { idGrade, idDisciplina, idProfessor } = rows[0];

		// Deleta da tabela base grade_horario usando a chave composta
		const [result]: any = await pool.query(
			`DELETE FROM grade_horario 
             WHERE idGrade = ? AND idDisciplina = ? AND idProfessor = ?`,
			[idGrade, idDisciplina, idProfessor],
		);

		if (result.affectedRows === 0) {
			res.status(404).json({
				message: "Erro ao deletar a célula",
			});
			return;
		}

		res.status(200).json({
			message: "Célula deletada com sucesso",
			data: {
				idCelula,
				idGrade,
				idDisciplina,
				idProfessor,
			},
		});
	} catch (error) {
		next(error);
	}
};
