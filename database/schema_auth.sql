-- Schema para sistema de autenticação e controle de acesso

-- Tabela de perfis (roles)
CREATE TABLE IF NOT EXISTS perfis (
    idPerfil INT AUTO_INCREMENT PRIMARY KEY,
    nomePerfil VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB;

-- Inserir perfis padrão na ordem: Professor, Coordenador, Admin
INSERT INTO perfis (nomePerfil) VALUES
('Professor'),
('Coordenador'),
('Admin')
ON DUPLICATE KEY UPDATE nomePerfil=VALUES(nomePerfil);

-- Atualizar tabela de usuários (caso já exista)
-- A tabela usuarios deve ter os seguintes campos conforme schema do banco:
-- idUsuario INT AUTO_INCREMENT PRIMARY KEY
-- nomeUsuario VARCHAR(100) NOT NULL
-- emailUsuario VARCHAR(100) NOT NULL UNIQUE
-- senha VARCHAR(255) NOT NULL (para armazenar hash bcrypt)
-- idPerfil INT NOT NULL (FK para perfis)
-- ativo TINYINT NOT NULL DEFAULT 1
-- criadoEm TIMESTAMP NULL
-- criadoPor INT NULL
-- atualizadoEm TIMESTAMP NULL
-- atualizadoPor INT NULL

-- Criar tabela usuarios se não existir
CREATE TABLE IF NOT EXISTS usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nomeUsuario VARCHAR(100) NOT NULL,
    emailUsuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    idPerfil INT NOT NULL,
    ativo TINYINT NOT NULL DEFAULT 1,
    criadoEm TIMESTAMP NULL,
    criadoPor INT NULL,
    atualizadoEm TIMESTAMP NULL,
    atualizadoPor INT NULL,
    INDEX fk_perfil_usuario_idx (idPerfil ASC),
    INDEX nomeUsuario_idx (nomeUsuario ASC),
    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (idPerfil)
        REFERENCES perfis (idPerfil)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;
