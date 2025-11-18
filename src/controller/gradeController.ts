import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const getGrade = async (
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

		// Admin vê todas as grades
		if (user.perfil_id === 1) {
			const [grades]: any = await pool.query("SELECT * FROM Grade");
			res.status(200).json(grades);
			return;
		}

		// Coordenador e Professor veem apenas grades dos seus cursos
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({ message: "Professor não encontrado" });
			return;
		}

		// Buscar grades dos cursos vinculados ao professor
		const [grades]: any = await pool.query(
			`SELECT DISTINCT g.* FROM Grade g
       INNER JOIN Professor_Curso pc ON g.idCurso = pc.idCurso
       WHERE pc.idProfessor = ?`,
			[professor[0].idProfessor],
		);

		res.status(200).json(grades);
	} catch (error) {
		next(error);
	}
};

export const getGradeById = async (
	req: Request<{ idGrade: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { idGrade } = req.params;
		const id = parseInt(idGrade, 10);

		if (isNaN(id)) {
			res.status(400).json({ error: "ID da grade inválido" });
			return;
		}

		// O middleware checkGradeOwnership já validou o acesso
		// Buscar a grade
		const [grade]: any = await pool.query(
			"SELECT * FROM Grade WHERE idGrade = ?",
			[id],
		);

		if (!grade.length) {
			res.status(404).json({ message: "Grade não encontrada" });
			return;
		}

		res.status(200).json(grade[0]);
	} catch (error) {
		next(error);
	}
};

export const createGrade = async (
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

		const { idCurso, nome, anoLetivo, semestre } = req.body;

		// Validar campos obrigatórios
		if (!idCurso || !nome || !anoLetivo || !semestre) {
			res.status(400).json({ error: "Todos os campos são obrigatórios" });
			return;
		}

		// Admin pode criar grade para qualquer curso
		if (user.perfil_id === 1) {
			const [result]: any = await pool.query(
				"INSERT INTO Grade (idCurso, nome, anoLetivo, semestre) VALUES (?, ?, ?, ?)",
				[idCurso, nome, anoLetivo, semestre],
			);
			res.status(201).json({
				message: "Grade criada com sucesso",
				idGrade: result.insertId,
			});
			return;
		}

		// Coordenador só pode criar grade para seu curso
		if (user.perfil_id === 2) {
			const [professor]: any = await pool.query(
				"SELECT * FROM Professores WHERE idUsuario = ?",
				[user.id],
			);

			if (!professor.length) {
				res.status(404).json({ message: "Professor não encontrado" });
				return;
			}

			// Verificar se o coordenador está vinculado ao curso
			const [vinculo]: any = await pool.query(
				"SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
				[professor[0].idProfessor, idCurso],
			);

			if (!vinculo.length) {
				res.status(403).json({
					message: "Você só pode criar grades para o seu curso",
				});
				return;
			}

			const [result]: any = await pool.query(
				"INSERT INTO Grade (idCurso, nome, anoLetivo, semestre) VALUES (?, ?, ?, ?)",
				[idCurso, nome, anoLetivo, semestre],
			);
			res.status(201).json({
				message: "Grade criada com sucesso",
				idGrade: result.insertId,
			});
			return;
		}

		res.status(403).json({ message: "Sem permissão" });
	} catch (error) {
		next(error);
	}
};
