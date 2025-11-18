import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM Disciplinas");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisciplinaById = async (
	req: Request<{ idDisciplina: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idDisciplina } = req.params;
		const id = parseInt(idDisciplina, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID inválido" });
			return;
		}

		const [rows] = await pool.query(
			"SELECT * FROM Disciplinas WHERE idDisciplina = ?",
			[id],
		);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisciplinaByCurso = async (
	req: Request<{ idCurso: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idCurso } = req.params;
		const id = parseInt(idCurso, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID do curso inválido" });
			return;
		}

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
		const {
			codigoDisciplina,
			nomeDisciplina,
			cargaHoraria,
			modalidade,
			tipoSala,
			semestreDisciplina,
			idCurso,
		} = req.body;

		// Validação dos campos obrigatórios
		if (
			!codigoDisciplina ||
			!nomeDisciplina ||
			!cargaHoraria ||
			!modalidade ||
			!tipoSala ||
			!semestreDisciplina ||
			!idCurso
		) {
			res.status(400).json({
				message: "Todos os campos são obrigatórios",
			});
			return;
		}

		// Validação da modalidade
		const modalidadesValidas = ["Presencial", "Online", "Hibrido"];
		if (!modalidadesValidas.includes(modalidade)) {
			res.status(400).json({
				message: "Modalidade inválida",
				modalidadesValidas: modalidadesValidas,
			});
			return;
		}

		// Validação do tipo de sala
		const tiposSalasValidos = ["Laboratório", "Sala", "Sincrona"];
		if (!tiposSalasValidos.includes(tipoSala)) {
			res.status(400).json({
				message: "Tipo de sala inválido",
				tiposSalasValidos: tiposSalasValidos,
			});
			return;
		}

		// Validação da carga horária
		if (typeof cargaHoraria !== "number" || cargaHoraria <= 0) {
			res.status(400).json({
				message: "A carga horária deve ser um número positivo",
			});
			return;
		}

		// Validação do semestre
		if (typeof semestreDisciplina !== "number" || semestreDisciplina <= 0) {
			res.status(400).json({
				message: "O semestre deve ser um número positivo",
			});
			return;
		}

		// Verificar se o curso existe
		const [cursoRows]: any = await pool.query(
			"SELECT idCurso FROM Cursos WHERE idCurso = ?",
			[idCurso],
		);

		if (Array.isArray(cursoRows) && cursoRows.length === 0) {
			res.status(404).json({
				message: "Curso não encontrado",
			});
			return;
		}

		// Inserir a disciplina
		const [result] = await pool.query(
			`INSERT INTO Disciplinas 
			(codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina) 
			VALUES (?, ?, ?, ?, ?, ?)`,
			[
				codigoDisciplina,
				nomeDisciplina,
				cargaHoraria,
				modalidade,
				tipoSala,
				semestreDisciplina,
			],
		);

		const idDisciplina = (result as any).insertId;

		// Vincular a disciplina ao curso na tabela curso_disciplina
		await pool.query(
			`INSERT INTO curso_disciplina (idCurso, idDisciplina) VALUES (?, ?)`,
			[idCurso, idDisciplina],
		);

		res.status(201).json({
			message: "Disciplina criada e vinculada ao curso com sucesso",
			data: {
				idDisciplina,
				codigoDisciplina,
				nomeDisciplina,
				cargaHoraria,
				modalidade,
				tipoSala,
				semestreDisciplina,
				idCurso,
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
			"SELECT idCurso FROM Cursos WHERE idCurso = ?",
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
			"SELECT idDisciplina FROM Disciplinas WHERE idDisciplina = ?",
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

		res.status(201).json({
			message: "Disciplina vinculada ao curso com sucesso",
			data: {
				idCurso,
				idDisciplina,
			},
		});
	} catch (error) {
		next(error);
	}
};
