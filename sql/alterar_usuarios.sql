
USE todo_list_db;

ALTER TABLE Usuarios ADD COLUMN endereco VARCHAR(255);


ALTER TABLE Usuarios ADD COLUMN cidade VARCHAR(100);


ALTER TABLE Usuarios ADD COLUMN telefone VARCHAR(15);


ALTER TABLE Usuarios ADD COLUMN endereco_completo VARCHAR(360) 
    GENERATED ALWAYS AS (CONCAT(IFNULL(endereco, ''), ', ', IFNULL(cidade, ''))) STORED;


DESCRIBE Usuarios;
