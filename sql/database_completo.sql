-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS todo_list_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados para uso
USE todo_list_db;

-- Tabela: Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  telefone VARCHAR(15),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Categorias
CREATE TABLE IF NOT EXISTS Categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#FFFFFF',
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- Tabela: Projetos
CREATE TABLE IF NOT EXISTS Projetos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  usuario_id INT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- Tabela: Tarefas
CREATE TABLE IF NOT EXISTS Tarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status ENUM('Pendente', 'Em Andamento', 'Concluída') DEFAULT 'Pendente',
  data_limite DATE,
  projeto_id INT NOT NULL,
  FOREIGN KEY (projeto_id) REFERENCES Projetos(id) ON DELETE CASCADE
);

-- Tabela: Subtarefas
CREATE TABLE IF NOT EXISTS Subtarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  status ENUM('Pendente', 'Concluída') DEFAULT 'Pendente',
  tarefa_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES Tarefas(id) ON DELETE CASCADE
);

-- Tabela: Tags
CREATE TABLE IF NOT EXISTS Tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela: Tarefa_Tags (Tabela de Ligação)
CREATE TABLE IF NOT EXISTS Tarefa_Tags (
  tarefa_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (tarefa_id, tag_id),
  FOREIGN KEY (tarefa_id) REFERENCES Tarefas(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- Inserir usuário padrão para testes
INSERT IGNORE INTO Usuarios (id, nome, email, senha, data_cadastro) 
VALUES (1, 'Usuário Padrão', 'admin@todolist.com', 'admin123', NOW());

-- Inserir algumas categorias padrão para o usuário
INSERT IGNORE INTO Categorias (id, nome, cor, usuario_id) VALUES
(1, 'Trabalho', '#FF6B6B', 1),
(2, 'Pessoal', '#4ECDC4', 1),
(3, 'Estudos', '#45B7D1', 1),
(4, 'Urgente', '#FFA07A', 1);

-- Verificar se os dados foram inseridos
SELECT 'USUÁRIOS:' as 'TABELA';
SELECT id, nome, email, data_cadastro FROM Usuarios;

SELECT 'CATEGORIAS:' as 'TABELA';
SELECT id, nome, cor, usuario_id FROM Categorias;

-- Mostrar estrutura das tabelas criadas
SELECT 'ESTRUTURA DO BANCO:' as 'INFO';
SHOW TABLES;
