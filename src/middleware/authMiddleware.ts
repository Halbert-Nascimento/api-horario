import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Estender a interface Request do Express para incluir user
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				email: string;
				perfil_id: number;
				role: string;
			};
		}
	}
}

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Extrair token do header Authorization
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(401).json({
				message: "Token não fornecido",
			});
			return;
		}

		// Verificar e decodificar o token
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			throw new Error("JWT_SECRET não configurado");
		}

		const decoded = jwt.verify(token, jwtSecret) as {
			id: number;
			email: string;
			perfil_id: number;
			role: string;
		};

		// Adicionar informações do usuário ao request
		req.user = decoded;

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				message: "Token inválido",
			});
			return;
		}
		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({
				message: "Token expirado",
			});
			return;
		}
		res.status(500).json({
			message: "Erro ao validar token",
		});
	}
};
