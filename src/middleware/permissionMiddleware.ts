import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

/**
 * Middleware para verificar ownership de recursos baseado no perfil do usuário
 * 
 * Regras:
 * - Admin (3): Acesso total a tudo
 * - Coordenador (2): Acesso apenas ao seu curso
 * - Professor (1): Acesso somente visualização (validado na rota)
 */

/**
 * Verifica se o usuário tem permissão para acessar um curso
 */
export const checkCursoOwnership = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;

		if (!user) {
			res.status(401).json({
				message: "Não autenticado",
			});
			return;
		}

		// Admin tem acesso total
		if (user.perfil_id === 3) {
			next();
			return;
		}

		// Para Coordenador e Professor, verificar vínculo com o curso
		const idCurso = req.params.idCurso || req.body.idCurso;

		if (!idCurso) {
			res.status(400).json({
				message: "ID do curso não fornecido",
			});
			return;
		}

		// Buscar professor vinculado ao usuário
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({
				message: "Professor não encontrado para este usuário",
			});
			return;
		}

		// Verificar se o professor está vinculado ao curso
		const [vinculo]: any = await pool.query(
			"SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
			[professor[0].idProfessor, idCurso],
		);

		if (!vinculo.length) {
			res.status(403).json({
				message: "Você não tem permissão para acessar este curso",
			});
			return;
		}

		// Adicionar informações do professor ao request para uso posterior
		req.professor = professor[0];

		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Verifica se o usuário tem permissão para acessar uma grade
 */
export const checkGradeOwnership = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;

		if (!user) {
			res.status(401).json({
				message: "Não autenticado",
			});
			return;
		}

		// Admin tem acesso total
		if (user.perfil_id === 3) {
			next();
			return;
		}

		const idGrade = req.params.idGrade || req.body.idGrade;

		if (!idGrade) {
			res.status(400).json({
				message: "ID da grade não fornecido",
			});
			return;
		}

		// Buscar a grade e o curso relacionado
		const [grade]: any = await pool.query(
			"SELECT * FROM Grade WHERE idGrade = ?",
			[idGrade],
		);

		if (!grade.length) {
			res.status(404).json({
				message: "Grade não encontrada",
			});
			return;
		}

		const idCurso = grade[0].idCurso;

		// Buscar professor vinculado ao usuário
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({
				message: "Professor não encontrado para este usuário",
			});
			return;
		}

		// Verificar se o professor está vinculado ao curso da grade
		const [vinculo]: any = await pool.query(
			"SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
			[professor[0].idProfessor, idCurso],
		);

		if (!vinculo.length) {
			res.status(403).json({
				message: "Você não tem permissão para acessar esta grade",
			});
			return;
		}

		// Adicionar informações ao request
		req.professor = professor[0];
		req.grade = grade[0];

		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Verifica se o usuário tem permissão para acessar uma alocação
 */
export const checkAlocacaoOwnership = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;

		if (!user) {
			res.status(401).json({
				message: "Não autenticado",
			});
			return;
		}

		// Admin tem acesso total
		if (user.perfil_id === 3) {
			next();
			return;
		}

		const idAlocacao =
			req.params.idCurso_Disciplina_Professor ||
			req.params.id ||
			req.body.idCurso_Disciplina_Professor;

		if (!idAlocacao) {
			res.status(400).json({
				message: "ID da alocação não fornecido",
			});
			return;
		}

		// Buscar a alocação
		const [alocacao]: any = await pool.query(
			"SELECT * FROM Alocacao_horario WHERE idCurso_Disciplina_Professor = ?",
			[idAlocacao],
		);

		if (!alocacao.length) {
			res.status(404).json({
				message: "Alocação não encontrada",
			});
			return;
		}

		// Buscar professor vinculado ao usuário
		const [professor]: any = await pool.query(
			"SELECT * FROM Professores WHERE idUsuario = ?",
			[user.id],
		);

		if (!professor.length) {
			res.status(404).json({
				message: "Professor não encontrado para este usuário",
			});
			return;
		}

		if (user.perfil_id === 1) {
			// Professor: só pode acessar suas próprias alocações
			if (alocacao[0].idProfessor !== professor[0].idProfessor) {
				res.status(403).json({
					message: "Você não tem permissão para acessar esta alocação",
				});
				return;
			}
		} else if (user.perfil_id === 2) {
			// Coordenador: verificar se a alocação é do seu curso
			const [grade]: any = await pool.query(
				"SELECT * FROM Grade WHERE idGrade = ?",
				[alocacao[0].idGrade],
			);

			if (!grade.length) {
				res.status(404).json({
					message: "Grade não encontrada",
				});
				return;
			}

			const [vinculo]: any = await pool.query(
				"SELECT * FROM Professor_Curso WHERE idProfessor = ? AND idCurso = ?",
				[professor[0].idProfessor, grade[0].idCurso],
			);

			if (!vinculo.length) {
				res.status(403).json({
					message: "Você não tem permissão para acessar esta alocação",
				});
				return;
			}
		}

		// Adicionar informações ao request
		req.professor = professor[0];
		req.alocacao = alocacao[0];

		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Middleware genérico para bloquear edições de Professor
 * Professor (perfil 1) só pode visualizar, nunca editar
 */
export const preventProfessorEdit = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.user;

	if (!user) {
		res.status(401).json({
			message: "Não autenticado",
		});
		return;
	}

	// Professor não pode editar nada
	if (user.perfil_id === 1) {
		res.status(403).json({
			message:
				"Professores não têm permissão para editar. Apenas visualização é permitida.",
		});
		return;
	}

	next();
};

// Estender a interface Request para incluir professor, grade e alocacao
declare global {
	namespace Express {
		interface Request {
			professor?: any;
			grade?: any;
			alocacao?: any;
		}
	}
}
