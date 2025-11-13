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

export const getProfessorByCoordenador = async (
	req: Request<{ coordenador_idProfessor: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const coordenador_idProfessor = req.params.coordenador_idProfessor;
		const [rows] = await pool.query(
			"SELECT * FROM vw_professor_coordenador WHERE coordenador_idProfessor = ?",
			[coordenador_idProfessor],
		);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCurso = async (
	req: Request<{ idCurso: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = req.params.idCurso;
		const [rows] = await pool.query(
			"SELECT * FROM vw_professor_curso WHERE idCurso = ?",
			[idCurso],
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
		const {
			nomeProfessor,
			titulacao,
			curriculo_lattes,
			coordenador_idProfessor,
			idUsuario,
		} = req.body;

		// Validação dos campos obrigatórios
		if (!nomeProfessor || !titulacao || !idUsuario) {
			res.status(400).json({
				message:
					"Os campos nomeProfessor, titulacao e idUsuario são obrigatórios",
			});
			return;
		}

		// Validação da titulação
		const titulacoesValidas = [
			"Graduado",
			"Especialista",
			"Mestre",
			"Doutor",
			"Pos Doutor",
		];
		if (!titulacoesValidas.includes(titulacao)) {
			res.status(400).json({
				message: "Titulação inválida",
				titulacoesValidas: titulacoesValidas,
			});
			return;
		}

		// Validar se o idUsuario existe
		const [usuarioRows]: any = await pool.query(
			"SELECT idUsuario FROM usuarios WHERE idUsuario = ?",
			[idUsuario],
		);

		if (!Array.isArray(usuarioRows) || usuarioRows.length === 0) {
			res.status(404).json({
				message: "Usuário não encontrado",
			});
			return;
		}

		// Se coordenador_idProfessor foi fornecido, validar se existe
		if (coordenador_idProfessor) {
			const [coordenadorRows]: any = await pool.query(
				"SELECT idProfessor FROM professores WHERE idProfessor = ?",
				[coordenador_idProfessor],
			);

			if (!Array.isArray(coordenadorRows) || coordenadorRows.length === 0) {
				res.status(404).json({
					message: "Professor coordenador não encontrado",
				});
				return;
			}
		}

		// Inserir o professor
		const [result] = await pool.query(
			`INSERT INTO professores 
            (nomeProfessor, titulacao, curriculo_lattes, coordenador_idProfessor, idUsuario) 
            VALUES (?, ?, ?, ?, ?)`,
			[
				nomeProfessor,
				titulacao,
				curriculo_lattes || null,
				coordenador_idProfessor || null,
				idUsuario,
			],
		);

		const idProfessor = (result as any).insertId;

		res.status(201).json({
			message: "Professor criado com sucesso",
			data: {
				idProfessor,
				nomeProfessor,
				titulacao,
				curriculo_lattes: curriculo_lattes || null,
				coordenador_idProfessor: coordenador_idProfessor || null,
				idUsuario,
			},
		});
	} catch (error) {
		next(error);
	}
};
