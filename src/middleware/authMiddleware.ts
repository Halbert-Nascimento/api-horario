
// importar as ferramentsas necessarias
import jwr from 'jsonwebtoken'; // biblioteca para manipular JSON Web Tokens
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
      message: "Voccê precisa estar logado para acessar este recurso." 
    });
  }
  try{
    // verifica se o token é válido usando a chave secreta
    const jwtScret = process.env.JWT_SECRET as string; // pegar a chave secreta do arquivo .env
    const decoded = jwr.verify(token, jwtScret) as jwr.JwtPayload; // verificar o token e decodificá-lo como JwtPayload
    // const decoded = jwr.verify(token, jwtScret) as any; // verificar o token e decodificá-lo para qualquer tipo

    // anexar as informações do usuário decodificadas à requisição
    req.user = {
      idUsuario: decoded.idUsuario,
      email: decoded.email,
      idPerfil: decoded.idPerfil,
      roles: decoded.roles,
    } // req.user = decoded; // anexar o objeto decodificado diretamente

    // chamar o próximo middleware ou rota
    next();
  } catch (error) {
    // se o token for falso ou expirado, retornar erro 401 (não autorizado)
    return res.status(401).json({
      message: "Token inválido ou expirado. Por favor, faça login novamente."
    });
  }
};