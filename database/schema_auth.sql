-- Schema para sistema de autenticação e controle de acesso

-- Tabela de perfis (roles)
CREATE TABLE IF NOT EXISTS perfil (
    idPerfil INT AUTO_INCREMENT PRIMARY KEY,
    nomePerfil VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir perfis padrão
INSERT INTO perfil (nomePerfil, descricao) VALUES
('Admin', 'Administrador do sistema'),
('Professor', 'Professor com acesso a funcionalidades de ensino'),
('Coordenador', 'Coordenador de curso')
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);

-- Atualizar tabela de usuários (caso já exista)
-- A tabela usuarios deve ter os seguintes campos:
-- idUsuario INT AUTO_INCREMENT PRIMARY KEY
-- nomeUsuario VARCHAR(255) NOT NULL
-- emailUsuario VARCHAR(255) NOT NULL UNIQUE
-- senha VARCHAR(255) NOT NULL (para armazenar hash bcrypt)
-- idPerfil INT (FK para perfil)
-- ativo TINYINT(1) DEFAULT 1
-- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- Criar tabela usuarios se não existir
CREATE TABLE IF NOT EXISTS usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nomeUsuario VARCHAR(255) NOT NULL,
    emailUsuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    idPerfil INT,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idPerfil) REFERENCES perfil(idPerfil) ON DELETE SET NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(emailUsuario);
CREATE INDEX idx_usuarios_perfil ON usuarios(idPerfil);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
