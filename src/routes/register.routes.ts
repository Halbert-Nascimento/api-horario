
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import pool from "../config/db";

const router = express.Router();

// Rota para registrar um novo usuário
// rota POST /register
router.post(
  "/",
  [
    // Validações dos campos
    body("nomeUsuario").trim().notEmpty().withMessage("Nome é obrigatório."),
    body("emailUsuario").isEmail().withMessage("Email inválido."),
    body("senha").isLength({ min: 6 }).withMessage("Senha deve ter no mínimo 6 caracteres."),
    body("idPerfil").isInt({ min: 1 , max: 3 }).withMessage("Perfil inválido."), 
  ],

  // Função de tratamento da rota
  async (req: any, res: any) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { nomeUsuario, emailUsuario, senha, idPerfil } = req.body;

      // verificar se email já existe
      const [existing]: any = await pool.query(
        "SELECT idUsuario FROM usuario WHERE emailUsuario = ?",
        [emailUsuario]
      );

      // Se o email já estiver em uso, retornar erro
      if (existing.length > 0) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      // Hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Inserir novo usuário no banco de dados
      const [result]: any = await pool.query(
        "INSERT INTO usuario (nomeUsuario, emailUsuario, senha, idPerfil) VALUES (?, ?, ?, ?)",
        [nomeUsuario, emailUsuario, senhaHash, idPerfil]
      );

      // Retornar sucesso
      res.status(201).json({
        message: "Usuário registrado com sucesso.",
        userId: result.insertId,
      });

    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

);

export default router;