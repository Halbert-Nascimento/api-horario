import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const getProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const user = req.user;

		if (!user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		// Admin vê todos os professores
		if (user.perfil_id === 1) {
			const [professores]: any = await pool.query("SELECT * FROM professor");
			res.status(200).json(professores);
			return;
		}

		// Coordenador e Professor veem apenas professores dos seus cursos
		const [professor]: any = await pool.query(
			"SELECT * FROM professor WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		// Buscar professores dos mesmos cursos
		const [professores]: any = await pool.query(
			`SELECT DISTINCT p.* FROM professor p
       INNER JOIN professor_curso pc1 ON p.idProfessor = pc1.idProfessor
       INNER JOIN professor_curso pc2 ON pc1.idCurso = pc2.idCurso
       WHERE pc2.idProfessor = ?`,
			[professor[0].idProfessor],
		);

		res.status(200).json(professores);
	} catch (error) {
		next(error);
	}
};

export const getProfessorById = async (
	req: Request<{ idProfessor: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idProfessor } = req.params;
		const id = parseInt(idProfessor, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID do professor inválido" });
			return;
		}

		const user = req.user;

		if (!user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		// Admin pode ver qualquer professor
		if (user.perfil_id === 1) {
			const [professor]: any = await pool.query(
				"SELECT * FROM professor WHERE idProfessor = ?",
				[id],
			);

			if (!professor.length) {
				res.status(404).json({ message: "Professor não encontrado" });
				return;
			}

			res.status(200).json(professor[0]);
			return;
		}

		// Coordenador e Professor só podem ver professores dos mesmos cursos
		const [professorLogado]: any = await pool.query(
			"SELECT * FROM professor WHERE idUsuario = ?",
			[user.id],
		);

		if (!professorLogado.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		const [professor]: any = await pool.query(
			`SELECT DISTINCT p.* FROM professor p
       INNER JOIN professor_curso pc1 ON p.idProfessor = pc1.idProfessor
       INNER JOIN professor_curso pc2 ON pc1.idCurso = pc2.idCurso
       WHERE p.idProfessor = ? AND pc2.idProfessor = ?`,
			[id, professorLogado[0].idProfessor],
		);

		if (!professor.length) {
			res.status(404).json({
				message: "Professor não encontrado ou você não tem permissão",
			});
			return;
		}

		res.status(200).json(professor[0]);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCoordenador = async (
	req: Request<{ idCoordenador: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idCoordenador } = req.params;
		const id = parseInt(idCoordenador, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID do coordenador inválido" });
			return;
		}

		const user = req.user;

		if (!user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		// Admin pode ver professores de qualquer coordenador
		if (user.perfil_id === 1) {
			const [professores]: any = await pool.query(
				`SELECT DISTINCT p.* FROM professor p
         INNER JOIN professor_curso pc1 ON p.idProfessor = pc1.idProfessor
         INNER JOIN professor_curso pc2 ON pc1.idCurso = pc2.idCurso
         WHERE pc2.idProfessor = ?`,
				[id],
			);
			res.status(200).json(professores);
			return;
		}

		// Coordenador e Professor só podem ver seus próprios dados
		const [professorLogado]: any = await pool.query(
			"SELECT * FROM professor WHERE idUsuario = ?",
			[user.id],
		);

		if (!professorLogado.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		// Verificar se está tentando acessar os próprios dados ou se tem permissão
		if (professorLogado[0].idProfessor !== id && user.perfil_id !== 2) {
			res.status(403).json({
				message:
					"Você não tem permissão para ver professores de outro coordenador",
			});
			return;
		}

		const [professores]: any = await pool.query(
			`SELECT DISTINCT p.* FROM professor p
       INNER JOIN professor_curso pc1 ON p.idProfessor = pc1.idProfessor
       INNER JOIN professor_curso pc2 ON pc1.idCurso = pc2.idCurso
       WHERE pc2.idProfessor = ?`,
			[id],
		);

		res.status(200).json(professores);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCurso = async (
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

		// O middleware checkCursoOwnership já validou o acesso ao curso
		const [professores]: any = await pool.query(
			`SELECT p.* FROM professor p
       INNER JOIN professor_curso pc ON p.idProfessor = pc.idProfessor
       WHERE pc.idCurso = ?`,
			[id],
		);

		res.status(200).json(professores);
	} catch (error) {
		next(error);
	}
};

export const createProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const user = req.user;

		if (!user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		// Apenas Admin pode criar professores
		if (user.perfil_id !== 1) {
			res.status(403).json({
				message: "Apenas administradores podem criar professores",
			});
			return;
		}

		const {
			nomeProfessor,
			email,
			titulacao,
			curriculo_lattes,
			coordenador_idProfessor,
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

		// Se coordenador_idProfessor foi fornecido, validar se existe
		if (coordenador_idProfessor) {
			const [coordenadorRows]: any = await pool.query(
				"SELECT idProfessor FROM professor WHERE idProfessor = ?",
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
			`INSERT INTO professor
            (nomeProfessor, email, titulacao, curriculoLattes, idCoordenador) 
            VALUES (?, ?, ?, ?, ?)`,
			[
				nomeProfessor,
				email,
				titulacao,
				curriculo_lattes || null,
				coordenador_idProfessor || null,
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
				curriculo_lattes: curriculo_lattes || null,
				coordenador_idProfessor: coordenador_idProfessor || null,
			},
		});
	} catch (error) {
		next(error);
	}
};
