
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


// ===============================
// Guarda 2: verifica Acesso ao Curso
// ===============================
export const checkCursoOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!; // usuário autenticado
  const idCurso = parseInt(req.params.idCurso); // id do curso na rota

  // administrador tem acesso total
  if(user.roles.includes("admin")){
    return next();
  }

  try{
    // buscar o professor pelo usuário autenticado
    const [professor]: any = await poll.query(
      "SELECT idProfessor FROM professor WHERE idUsuario = ?",
      [user.idUsuario]
    );

    // verificar se o professor existe
    if(!professor[0]){
      return res.status(404).json({message: "professor não encontrado para o usuário autenticado."});
    }

    // verifica se o professor está associado ao curso
    const [curso]: any = await poll.query(
      "SELECT * FROM professor_curso WHERE idProfessor = ? AND idCurso = ?",
      [professor[0].idProfessor, idCurso]
    );
    
    // se nao estiver associado, bloqueia
    if(!curso[0]){
      return res.status(403).json({message: "Acesso negado: você não tem permissão para acessar este curso."});
    }
    // se estiver associado, libera
    next();

  }catch(error){
    console.error("Erro ao verificar propriedade do curso:", error);
    return res.status(500).json({message: "Erro interno do servidor."});
  }


};

// ... outros middlewares de permissão podem ser adicionados aqui