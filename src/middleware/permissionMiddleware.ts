
import {Request, Response, NextFunction} from "express";
import poll from  "../config/db"; // conexão com o banco de dados

// middleware para verificar se o usuário tem a role necessária

// ===============================
// Guarda 1: Bloqueia professor de editar
// ===============================
export const preventProfessorEdit = (
  req: Request,
  res: Response,
  next: NextFunction
) =>{
  const user = req.user;
  // se não tiver usuário autenticado bloqueia
  if(!user){
    return res.status(401).json({message: "Usuário não autenticado."});
  }

  // se for professor bloqueia
  if(user.roles.includes("professor")){
    return res.status(403).json({message: "Acesso negado: Professores não podem editar ou deletar. somente visualizar."});
  }
  // se for outro papel, libera, ex: administrador, coordenador
  next();


};


