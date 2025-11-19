import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

export const getSala = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM sala");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getSalaById = async (
	req: Request<{ idSala: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idSala = req.params.idSala;
		const [rows] = await pool.query("SELECT * FROM sala WHERE idSala = ?", [
			idSala,
		]);
		if (Array.isArray(rows) && rows.length === 0) {
			res.status(404).json({ message: "Sala não encontrada" });
			return;
		}
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createSala = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			codigoSala,
			nomeSala,
			capacidadeSala,
			tipoSala,
			recursos,
			localizcao,
		} = req.body;

		// Validação dos campos obrigatórios
		if (!codigoSala || !capacidadeSala || !tipoSala) {
			res.status(400).json({
				message:
					"Os campos codigoSala, capacidadeSala e tipoSala são obrigatórios",
			});
			return;
		}

		// Validação do tipo de sala
		const tiposSalasValidos = [
			"Laboratório",
			"Sala de Aula",
			"Auditorio",
			"Virtual",
		];
		if (!tiposSalasValidos.includes(tipoSala)) {
			res.status(400).json({
				message: "Tipo de sala inválido",
				tiposSalasValidos: tiposSalasValidos,
			});
			return;
		}

		// Validação da capacidade
		if (typeof capacidadeSala !== "number" || capacidadeSala <= 0) {
			res.status(400).json({
				message: "A capacidade da sala deve ser um número positivo",
			});
			return;
		}

		// Verificar se o código da sala já existe
		const [codigoExists]: any = await pool.query(
			"SELECT idSala FROM sala WHERE codigoSala = ?",
			[codigoSala],
		);

		if (Array.isArray(codigoExists) && codigoExists.length > 0) {
			res.status(409).json({
				message: "Já existe uma sala com este código",
			});
			return;
		}

		// Inserir a sala
		const [result] = await pool.query(
			`INSERT INTO sala 
      (codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizacaoSala) 
      VALUES (?, ?, ?, ?, ?, ?)`,
			[
				codigoSala,
				nomeSala,
				capacidadeSala,
				tipoSala,
				recursos || null,
				localizcao || null,
			],
		);

		const idSala = (result as any).insertId;

		res.status(201).json({
			message: "Sala criada com sucesso",
			data: {
				idSala,
				codigoSala,
				nomeSala,
				capacidadeSala,
				tipoSala,
				recursos: recursos || null,
				localizcao: localizcao || null,
			},
		});
	} catch (error) {
		next(error);
	}
};
