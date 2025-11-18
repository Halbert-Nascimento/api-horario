import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const getProfessorDisciplina = async (
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

		// Admin vê todas as vinculações
		if (user.perfil_id === 1) {
			const [vinculacoes]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina",
			);
			res.status(200).json(vinculacoes);
			return;
		}

		// Coordenador e Professor veem apenas vinculações dos seus cursos
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		if (user.perfil_id === 3) {
			// Professor vê apenas suas próprias vinculações
			const [vinculacoes]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina WHERE idProfessor = ?",
				[professor[0].idProfessor],
			);
			res.status(200).json(vinculacoes);
			return;
		}

		if (user.perfil_id === 2) {
			// Coordenador vê vinculações de professores do seu curso
			const [vinculacoes]: any = await pool.query(
				`SELECT DISTINCT pd.* FROM Professor_Disciplina pd
         INNER JOIN Curso_Disciplina cd ON pd.idDisciplina = cd.idDisciplina
         INNER JOIN Professor_Curso pc ON cd.idCurso = pc.idCurso
         WHERE pc.idProfessor = ?`,
				[professor[0].idProfessor],
			);
			res.status(200).json(vinculacoes);
			return;
		}

		res.status(403).json({ message: "Sem permissão" });
	} catch (error) {
		next(error);
	}
};

export const getProfessorDisciplinaById = async (
	req: Request<{ idDisciplina: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idDisciplina } = req.params;
		const id = parseInt(idDisciplina, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID da disciplina inválido" });
			return;
		}

		const user = req.user;

		if (!user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		// Admin pode ver vinculações de qualquer disciplina
		if (user.perfil_id === 1) {
			const [vinculacoes]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina WHERE idDisciplina = ?",
				[id],
			);
			res.status(200).json(vinculacoes);
			return;
		}

		// Coordenador e Professor só podem ver vinculações de disciplinas dos seus cursos
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		if (user.perfil_id === 3) {
			// Professor vê apenas suas próprias vinculações naquela disciplina
			const [vinculacoes]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina WHERE idDisciplina = ? AND idProfessor = ?",
				[id, professor[0].idProfessor],
			);
			res.status(200).json(vinculacoes);
			return;
		}

		if (user.perfil_id === 2) {
			// Coordenador vê vinculações da disciplina se ela pertence ao seu curso
			const [vinculacoes]: any = await pool.query(
				`SELECT pd.* FROM Professor_Disciplina pd
         INNER JOIN Curso_Disciplina cd ON pd.idDisciplina = cd.idDisciplina
         INNER JOIN Professor_Curso pc ON cd.idCurso = pc.idCurso
         WHERE pd.idDisciplina = ? AND pc.idProfessor = ?`,
				[id, professor[0].idProfessor],
			);
			res.status(200).json(vinculacoes);
			return;
		}

		res.status(403).json({ message: "Sem permissão" });
	} catch (error) {
		next(error);
	}
};

export const createProfessorDisciplina = async (
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

		const { idProfessor, idDisciplina } = req.body;

		if (!idProfessor || !idDisciplina) {
			res
				.status(400)
				.json({ error: "ID do professor e disciplina são obrigatórios" });
			return;
		}

		// Admin pode vincular qualquer professor a qualquer disciplina
		if (user.perfil_id === 1) {
			// Verificar se o vínculo já existe
			const [existente]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina WHERE idProfessor = ? AND idDisciplina = ?",
				[idProfessor, idDisciplina],
			);

			if (existente.length) {
				res.status(409).json({ message: "Vínculo já existe" });
				return;
			}

			await pool.query(
				"INSERT INTO Professor_Disciplina (idProfessor, idDisciplina) VALUES (?, ?)",
				[idProfessor, idDisciplina],
			);
			res.status(201).json({ message: "Vínculo criado com sucesso" });
			return;
		}

		// Coordenador só pode vincular professores e disciplinas do seu curso
		if (user.perfil_id === 2) {
			const [professorLogado]: any = await pool.query(
				"SELECT * FROM Professores WHERE idUsuario = ?",
				[user.id],
			);

			if (!professorLogado.length) {
				res.status(404).json({ message: "Professor não encontrado" });
				return;
			}

			// Verificar se o professor a ser vinculado pertence ao curso do coordenador
			const [vinculoProfessor]: any = await pool.query(
				`SELECT pc1.* FROM Professor_Curso pc1
         INNER JOIN Professor_Curso pc2 ON pc1.idCurso = pc2.idCurso
         WHERE pc1.idProfessor = ? AND pc2.idProfessor = ?`,
				[idProfessor, professorLogado[0].idProfessor],
			);

			if (!vinculoProfessor.length) {
				res.status(403).json({
					message: "Você só pode vincular professores do seu curso",
				});
				return;
			}

			// Verificar se a disciplina pertence ao curso do coordenador
			const [vinculoDisciplina]: any = await pool.query(
				`SELECT cd.* FROM Curso_Disciplina cd
         INNER JOIN Professor_Curso pc ON cd.idCurso = pc.idCurso
         WHERE cd.idDisciplina = ? AND pc.idProfessor = ?`,
				[idDisciplina, professorLogado[0].idProfessor],
			);

			if (!vinculoDisciplina.length) {
				res.status(403).json({
					message: "Você só pode vincular disciplinas do seu curso",
				});
				return;
			}

			// Verificar se o vínculo já existe
			const [existente]: any = await pool.query(
				"SELECT * FROM Professor_Disciplina WHERE idProfessor = ? AND idDisciplina = ?",
				[idProfessor, idDisciplina],
			);

			if (existente.length) {
				res.status(409).json({ message: "Vínculo já existe" });
				return;
			}

			await pool.query(
				"INSERT INTO Professor_Disciplina (idProfessor, idDisciplina) VALUES (?, ?)",
				[idProfessor, idDisciplina],
			);
			res.status(201).json({ message: "Vínculo criado com sucesso" });
			return;
		}

		res.status(403).json({ message: "Sem permissão" });
	} catch (error) {
		next(error);
	}
};
