
import { Request, Response, NextFunction } from "express";

// middleware para verificar se o usuário tem a role necessária
export const checkRole = (allowedRoles: Array<string> | string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // pegar a usuario da requisição
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }


    // garantir que allowedRoles seja um array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];



    // pegar as roles do usuário da requisição (definidas no authMiddleware)
    const userRoles = user.roles || [];

    // verificar se o usuário tem pelo menos uma das roles permitidas
    const hasRole = userRoles.some((role: string) => rolesArray.includes(role));
    // se não tiver, retornar 403
    if (!hasRole) {
      return res.status(403).json({ 
        message: "Acesso negado: você não tem permissão para acessar este recurso." 
      });
    }

    next();
  };
};
