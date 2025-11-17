import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar se o usuário tem um dos perfis permitidos
 * @param allowedRoles - Array com IDs de perfis ou nomes de perfis permitidos
 */
export const checkRole = (allowedRoles: Array<number | string>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;

		if (!user) {
			res.status(401).json({
				message: "Não autenticado",
			});
			return;
		}

		// Verificar por perfil_id (numérico) ou por role (string)
		const hasPermission =
			(user.perfil_id && allowedRoles.includes(user.perfil_id)) ||
			(user.role && allowedRoles.includes(user.role));

		if (!hasPermission) {
			res.status(403).json({
				message: "Acesso negado. Você não tem permissão para acessar este recurso.",
			});
			return;
		}

		next();
	};
};
