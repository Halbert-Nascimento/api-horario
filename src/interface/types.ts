export interface CelulaViewInterface {
	idCelula: number;
	curso: string;
	disciplina: string;
	modadalidade: string;
	tipo_sala: string;
	professor: string;
	titulacao: string;
	dia_semana: string;
	semestre: string;
	data_criacao: Date;
}

export interface CelulaCursoViewInterface {
	idCurso: number;
	curso: string;
	disciplina: string;
	modadalidade: string;
	professor: string;
	titulacao: string;
	dia_semana: string;
	semestre: string;
}


export interface DbUsuario{
	idUsuario: number;
	nomeUsuario: string;
	emailUsuario: string;
	senhaUsuario: string;
	idPerfil: number;
	ativo: boolean;
}

