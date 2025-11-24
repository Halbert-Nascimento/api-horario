import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import cors from "cors";

import celulaRoutes from "./celula.routes";
import cursoRoutes from "./curso.routes";
import disciplinaRoutes from "./disciplina.routes";
import professorRoutes from "./professor.routes";
import gradeRoutes from "./grade.routes";
import diaSemanaRoutes from "./diaSemana.routes";
import disponibilidadeRoutes from "./disponibilidade.routes";
import professorDisciplinaRoutes from "./professorDisciplina.routes";
import usuarioRoutes from "./usuario.routes";
import salaRoutes from "./sala.routes";

import authRoutes from "./auth.routes";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000", // Permite requisições do seu frontend
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(express.json());

// Adiciona uma rota para a raiz
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({ message: "API Grade Horário está funcionando!" });
});

app.use("/auth", authRoutes); // Rota para autenticação, ficam: /auth/login

app.use("/celula", celulaRoutes); // Rota para células, ficam: /celula/...
app.use("/curso", cursoRoutes); // Rota para cursos, ficam: /curso/...
app.use("/disciplina", disciplinaRoutes); 	// Rota para disciplinas, ficam: /disciplina/...
app.use("/professor", professorRoutes); // Rota para professores, ficam: /professor/...
app.use("/grade", gradeRoutes); // Rota para grades, ficam: /grade/...
app.use("/diaSemana", diaSemanaRoutes); // Rota para dias da semana, ficam: /diaSemana/...
app.use("/disponibilidade", disponibilidadeRoutes); // Rota para disponibilidades, ficam: /disponibilidade/...
app.use("/professorDisciplina", professorDisciplinaRoutes); // Rota para professor-disciplinas, ficam: /professorDisciplina/...
app.use("/usuario", usuarioRoutes); // Rota para usuários, ficam: /usuario/...
app.use("/sala", salaRoutes); // Rota para salas, ficam: /sala/...

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	const statusCode = err.status || 500;
	res
		.status(statusCode)
		.json({ message: err.message || "Internal Server Error" });
});

(async () => {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			port: Number(process.env.DB_PORT),
		});
		console.log("Conexão com o banco de dados bem-sucedida!");
		connection.end();
	} catch (error) {
		if (error instanceof Error) {
			console.error("Erro ao conectar ao banco de dados:", error.message);
		} else {
			console.error("Erro ao conectar ao banco de dados:", error);
		}
		process.exit(1);
	}
})();

export default app;
