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

export const createCursoDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idDisciplina, idCurso } = req.body;

		// Validação dos campos obrigatórios
		if (!idDisciplina || !idCurso) {
			res.status(400).json({
				message: "Os campos idDisciplina e idCurso são obrigatórios",
			});
			return;
		}

		// Verificar se o curso existe
		const [cursoRows]: any = await pool.query(
			"SELECT idCurso FROM cursos WHERE idCurso = ?",
			[idCurso],
		);

		if (Array.isArray(cursoRows) && cursoRows.length === 0) {
			res.status(404).json({
				message: "Curso não encontrado",
			});
			return;
		}

		// Verificar se a disciplina existe
		const [disciplinaRows]: any = await pool.query(
			"SELECT idDisciplina FROM disciplinas WHERE idDisciplina = ?",
			[idDisciplina],
		);

		if (Array.isArray(disciplinaRows) && disciplinaRows.length === 0) {
			res.status(404).json({
				message: "Disciplina não encontrada",
			});
			return;
		}

		// Verificar se a relação já existe
		const [existingRows]: any = await pool.query(
			"SELECT * FROM curso_disciplina WHERE idCurso = ? AND idDisciplina = ?",
			[idCurso, idDisciplina],
		);

		if (Array.isArray(existingRows) && existingRows.length > 0) {
			res.status(409).json({
				message: "Esta disciplina já está vinculada a este curso",
			});
			return;
		}

		// Inserir a relação curso-disciplina
		const [result]: any = await pool.query(
			`INSERT INTO curso_disciplina (idCurso, idDisciplina) VALUES (?, ?)`,
			[idCurso, idDisciplina],
		);

		res.status(201).json({
			message: "Disciplina vinculada ao curso com sucesso",
			data: {
				idCursoDisciplina: result.insertId,
				idCurso,
				idDisciplina,
			},
		});
	} catch (error) {
		next(error);
	}
};
