
import { Request, Response } from "express";
import bcrypt from "bcrypt"; // para hashear senhas
import jwt from "jsonwebtoken"; // para criar tokens JWT
import pool from "../config/db"; // conexão com o banco de dados

// funçao de login
export const login = async (req: Request, res: Response) => {
  try {
    // pegar email e senha do corpo da requisição
    const { email, senha } = req.body;

    // verifica se enviou email e senha
    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    // buscar o usuário pelo email
    const [rows]: any = await pool.query(
      "SELECT * FROM usuario WHERE emailUsuario = ?",
      [email]
    );

    // se não encontrar o usuário, erro
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // pegar o usuário encontrado
    const user = rows[0];

    // verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(403).json({
        message: "Usuário inativo. Entre em contato com o administrador.",
      });
    }
    // verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não está definido nas variáveis de ambiente.");
      return res.status(500).json({ message: "Erro de configuração do servidor." });
    }

    // comparar a senha enviada com a senha hasheada no banco
    const senhaValida = await bcrypt.compare(senha, user.senha);

    // se a senha for inválida, erro
    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // buscar o nome do perfil do usuário
    let nomePerfil = null;
    if(user.idPerfil){
      const [perfil]: any = await pool.query(
        "SELECT nomePerfil FROM perfil WHERE idPerfil = ?",
        [user.idPerfil]
      );

      nomePerfil = perfil[0]?.nomePerfil || null;
    }

    let idCurso = null;
    let nomeCurso = null;

    const [userCursoRows]: any = await pool.query(
      `SELECT idCurso, nomeCurso FROM vw_usuario_curso 
      WHERE idUsuario = ?`,
      [user.idUsuario]
    );

    if (userCursoRows.length > 0) {
      idCurso = userCursoRows[0].idCurso;
      nomeCurso = userCursoRows[0].nomeCurso;
    }



    // definir as roles do usuário com base no nome do perfil
    let roles: string[] = [];
    if(nomePerfil){
      roles.push(nomePerfil);
    }


    // criar o payload do token
    const JWT_SECRET = process.env.JWT_SECRET as string;
    const tokenPayload = {
      idUsuario: user.idUsuario,
      nomeUsuario: user.nomeUsuario,
      email: user.emailUsuario,
      idPerfil: user.idPerfil,
      nomePerfil: nomePerfil,
      idCurso: idCurso,
      nomeCurso: nomeCurso,
      roles: roles, // array para armazenar as roles do usuário
    };

    // criar o token JWT
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "1h", // token válido por 1 hora
    });

    // retornar o token e informações do usuário
    res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        idUsuario: user.idUsuario,
        nome: user.nomeUsuario,
        email: user.emailUsuario,
        perfil: nomePerfil,
        roles: tokenPayload.roles,
      },
    });


  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno." });
  }
};

