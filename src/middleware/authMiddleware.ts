
// importar as ferramentsas necessarias
import jwt from 'jsonwebtoken'; // biblioteca para manipular JSON Web Tokens
import { Request, Response, NextFunction } from 'express'; // tipos do Express para requisições, respostas e próximo middleware
import dotenv from 'dotenv'; // biblioteca para carregar variáveis de ambiente
dotenv.config(); // carregar variáveis de ambiente do arquivo .env

// dizer ao TypeScript que o objeto Request do Express terá uma propriedade 'userId' do tipo string
declare global {
  namespace Express{
    interface Request {
      user? :{
        idUsuario: number; // id do usuário
        email: string; // email do usuário
        nomeUsuario: string; // nome do usuário
        idCurso: number | null; // id do curso do usuário, pode ser null
        nomeCurso:  string | null; // nome do curso do usuário, pode ser null
        idPerfil: number; // id do perfil do usuário ex: admin, user, etc.
        roles: string[]; // roles do usuário

      };
    }
  }
}

// middleware para autenticação guarda principal
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // pegar o token do cabeçalho Authorization
  const token = req.headers.authorization?.split(" ")[1]; // o token geralmente vem no formato "Bearer <token>"

  // se não houver token, retornar erro 401 (não autorizado)
  if (!token) {
    return res.status(401).json({ 
      message: "Você precisa estar logado para acessar este recurso." 
    });
  }
  try{
    // verifica se o token é válido usando a chave secreta
    const jwtSecret = process.env.JWT_SECRET as string; // pegar a chave secreta do arquivo .env
      // Verificar se JWT_SECRET existe
    if (!jwtSecret) {
      console.error("JWT_SECRET não está definido nas variáveis de ambiente.");
      return res.status(500).json({ 
        message: "Erro de configuração do servidor." 
      });
    }
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload; // verificar o token e decodificá-lo como JwtPayload
    // const decoded = jwt.verify(token, jwtSecret) as any; // verificar o token e decodificá-lo para qualquer tipo

    // anexar as informações do usuário decodificadas à requisição
    req.user = {
      idUsuario: decoded.idUsuario,
      nomeUsuario: decoded.nomeUsuario,
      idCurso: decoded.idCurso,
      nomeCurso: decoded.nomeCurso,
      email: decoded.email,
      idPerfil: decoded.idPerfil,
      roles: decoded.roles,
    } // req.user = decoded; // anexar o objeto decodificado diretamente

    // chamar o próximo middleware ou rota
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError ){
      // se o token for inválido, retornar erro 401 (não autorizado)
      return res.status(401).json({
        message: "Token inválido. Por favor, faça login novamente."
      });
    }

    if (error instanceof jwt.TokenExpiredError ){
      // se o token tiver expirado, retornar erro 401 (não autorizado)
      return res.status(401).json({
        message: "Token expirado. Por favor, faça login novamente."
      });
    }

    // erro desconhecido
    console.error("Erro desconhecido ao verificar o token:", error);
    return res.status(500).json({
      message: "Erro interno do servidor ao verificar o token."
    });
  }
};