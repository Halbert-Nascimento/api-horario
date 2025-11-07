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

		// Verificar se o professor já está cadastrado em outra disciplina/curso no mesmo dia
		const [conflictRows]: any = await pool.query(
			`SELECT 
				nomeCurso,
				nomeDisciplina,
				nomeProfessor,
				dia_semana
			FROM vw_celulas 
			WHERE idProfessor = ? 
			AND dia_semana = ? 
			AND NOT (idDisciplina = ? AND idGrade = ?)`,
			[idProfessor, dia_semana, idDisciplina, idGrade],
		);

		if (Array.isArray(conflictRows) && conflictRows.length > 0) {
			const conflict = conflictRows[0];
			res.status(409).json({
				message: "Não é possível cadastrar esta célula",
				error: `O(A) professor(a) ${conflict.nomeProfessor} já está cadastrado(a) na disciplina "${conflict.nomeDisciplina}" do curso "${conflict.nomeCurso}"`,
				conflito: {
					curso: conflict.nomeCurso,
					disciplina: conflict.nomeDisciplina,
					professor: conflict.nomeProfessor,
					dia: conflict.dia_semana,
				},
			});
			return;
		}

		const [result] = await pool.query(
			`CALL stp_cadastrar_celula(?, ?, ?, ?, ?)`,
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

		// Deleta da tabela grade_horario usando o idCelula
		const [result]: any = await pool.query(
			`DELETE FROM grade_horario WHERE idCurso_Disciplina_Professor = ?`,
			[idCelula],
		);

		if (result.affectedRows === 0) {
			res.status(404).json({
				message: "Célula não encontrada",
			});
			return;
		}

		res.status(200).json({
			message: "Célula deletada com sucesso",
			data: {
				idCelula,
			},
		});
	} catch (error) {
		next(error);
	}
};
