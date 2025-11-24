import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM professor");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorById = async (
	req: Request<{ idProfessor: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = req.params.idProfessor;
		const [rows] = await pool.query(
			"SELECT * FROM professor WHERE idProfessor = ?",
			[idProfessor],
		);

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCoordenador = async (
	req: Request<{ idCoordenador: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCoordenador = req.params.idCoordenador;
		const [rows] = await pool.query(
			"SELECT * FROM vw_professor_coordenador WHERE idCoordenador = ?",
			[idCoordenador],
		);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCurso = async (
	req: Request<{ idCurso: string }>,
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
			email,
			titulacao,
			curriculoLattes,
			idCoordenador,
		} = req.body;

		// Validação dos campos obrigatórios
		if (!nomeProfessor || !email || !titulacao) {
			res.status(400).json({
				message: "Os campos nomeProfessor, email e titulacao são obrigatórios",
			});
			return;
		}

		// Validação do formato do email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			res.status(400).json({
				message: "Formato de email inválido",
			});
			return;
		}

		// Validação da titulação
		const titulacoesValidas = [
			"graduado",
			"especialista",
			"mestre",
			"doutor",
			"doutora",
		];
		if (!titulacoesValidas.includes(titulacao)) {
			res.status(400).json({
				message: "Titulação inválida",
				titulacoesValidas: titulacoesValidas,
			});
			return;
		}

		// Verificar se o email já está cadastrado
		const [emailExists]: any = await pool.query(
			"SELECT idProfessor FROM professor WHERE email = ?",
			[email],
		);

		if (Array.isArray(emailExists) && emailExists.length > 0) {
			res.status(409).json({
				message: "Este email já está cadastrado",
			});
			return;
		}

		// Se idCoordenador foi fornecido, validar se existe
		if (idCoordenador) {
			const [coordenadorRows]: any = await pool.query(
				"SELECT idProfessor FROM professor WHERE idProfessor = ?",
				[idCoordenador],
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
			`INSERT INTO professor 
            (nomeProfessor, email, titulacao, curriculoLattes, idCoordenador) 
            VALUES (?, ?, ?, ?, ?)`,
			[
				nomeProfessor,
				email,
				titulacao,
				curriculoLattes || null,
				idCoordenador || null,
			],
		);

		const idProfessor = (result as any).insertId;

		res.status(201).json({
			message: "Professor criado com sucesso",
			data: {
				idProfessor,
				nomeProfessor,
				email,
				titulacao,
				curriculoLattes: curriculoLattes || null,
				idCoordenador: idCoordenador || null,
			},
		});
	} catch (error) {
		next(error);
	}
};
