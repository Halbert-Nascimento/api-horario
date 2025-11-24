import pool from "../config/db";
import { Request, Response, NextFunction } from "express";

// Definir interface com index signature
interface CelulaParams extends Record<string, string> {
	idCurso: string;
	semestreLetivo: string;
	anoLetivo: string;
}

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
	req: Request<CelulaParams>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Converter parâmetros string para number
		const idCurso = parseInt(req.params.idCurso);
		const semestreLetivo = parseInt(req.params.semestreLetivo);
		const anoLetivo = parseInt(req.params.anoLetivo);

		// Validar conversão
		if (isNaN(idCurso) || isNaN(semestreLetivo) || isNaN(anoLetivo)) {
			res.status(400).json({
				message:
					"Parâmetros inválidos. idCurso, semestreLetivo e anoLetivo devem ser números.",
			});
			return;
		}

		const [rows] = await pool.query(
			"SELECT * FROM vw_celulas WHERE idCurso = ? AND semestreLetivo = ? AND anoLetivo = ?",
			[idCurso, semestreLetivo, anoLetivo],
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
		const { idGrade, idDisciplina, idProfessor, idDiaSemana, semestre } =
			req.body;

		// Validação dos campos obrigatórios
		if (
			!idGrade ||
			!idDisciplina ||
			!idProfessor ||
			!idDiaSemana ||
			!semestre
		) {
			res.status(400).json({ message: "Todos os campos são obrigatórios" });
			return;
		}

		// Buscar informações da nova célula que está sendo cadastrada
		const [novaCelulaInfo]: any = await pool.query(
			`SELECT 
                p.nomeProfessor as professor,
                d.nomeDisciplina as disciplina,
                c.nomeCurso as curso,
                ds.diaSemana
            FROM professor p
            CROSS JOIN disciplina d
            CROSS JOIN curso c
            CROSS JOIN dia_semana ds
            CROSS JOIN alocacao_horario ah
            WHERE p.idProfessor = ?
            AND d.idDisciplina = ?
            AND ah.idGrade = ?
            AND ds.idDiaSemana = ?
            LIMIT 1`,
			[idProfessor, idDisciplina, idGrade, idDiaSemana],
		);

		// Verificar se o professor já está cadastrado em outra disciplina/curso no mesmo dia
		const [professorConflict]: any = await pool.query(
			`SELECT 
                curso,
                disciplina,
                professor,
                dia_semana
            FROM vw_celulas 
            WHERE idProfessor = ? 
            AND idDiaSemana = ?`,
			[idProfessor, idDiaSemana],
		);

		if (Array.isArray(professorConflict) && professorConflict.length > 0) {
			const conflict = professorConflict[0];
			const novaCelula = novaCelulaInfo[0];
			res.status(409).json({
				message: `O professor ${novaCelula.professor} já está alocado na disciplina "${conflict.disciplina}" do curso "${conflict.curso}" no dia ${conflict.dia_semana}`,
				tipo: "professor",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.dia_semana,
				},
				conflito: {
					curso: conflict.curso,
					disciplina: conflict.disciplina,
					professor: conflict.professor,
					dia: conflict.dia_semana,
				},
			});
			return;
		}

		// Verificar se a disciplina já está cadastrada neste curso no mesmo dia
		const [disciplinaConflict]: any = await pool.query(
			`SELECT 
                curso,
                disciplina,
                professor,
                dia_semana
            FROM vw_celulas 
            WHERE idDisciplina = ? 
            AND idGrade = ? 
            AND idDiaSemana = ?`,
			[idDisciplina, idGrade, idDiaSemana],
		);

		if (Array.isArray(disciplinaConflict) && disciplinaConflict.length > 0) {
			const conflict = disciplinaConflict[0];
			const novaCelula = novaCelulaInfo[0];
			res.status(409).json({
				message: `A disciplina "${novaCelula.disciplina}" do curso "${novaCelula.curso}" já está cadastrada no dia ${novaCelula.dia_semana} com o professor ${conflict.professor}`,
				tipo: "disciplina",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.dia_semana,
				},
				conflito: {
					curso: conflict.curso,
					disciplina: conflict.disciplina,
					professor: conflict.professor,
					dia: conflict.dia_semana,
				},
			});
			return;
		}

		const [result] = await pool.query(
			`CALL stp_cadastrar_celula(?, ?, ?, ?, ?)`,
			[idGrade, idDisciplina, idProfessor, idDiaSemana, semestre],
		);

		res.status(201).json({
			message: "Célula criada com sucesso",
			data: {
				idGrade,
				idDisciplina,
				idProfessor,
				idDiaSemana,
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

		// Deleta da tabela Alocacao_horario usando o idCelula
		const [result]: any = await pool.query(
			`DELETE FROM alocacao_horario WHERE idAlocacaoHorario = ?`,
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
