<?php
/**
 * ============================================================
 * ARQUIVO: usuarios_db.php
 * DESCRIÇÃO: Classe responsável por TODAS as operações de
 *            banco de dados da tabela Usuarios.
 * 
 * MÉTODO 2 - DAO (Data Access Object)
 * Este arquivo contém SOMENTE SQL, nada de validação ou JSON.
 * ============================================================
 */

class UsuariosDB {
    
    private $conexao;
    
    public function __construct($conexao) {
        $this->conexao = $conexao;
    }
    
    /**
     * Busca todos os usuários
     */
    public function buscarTodos() {
        $sql = "SELECT id, nome, email, endereco, cidade, telefone, data_cadastro 
                FROM Usuarios 
                ORDER BY nome ASC";
        
        $resultado = $this->conexao->query($sql);
        return $this->formatarResultados($resultado);
    }
    
    /**
     * Pesquisa usuários por nome ou email
     */
    public function pesquisar($termo) {
        $sql = "SELECT id, nome, email, endereco, cidade, telefone, data_cadastro 
                FROM Usuarios 
                WHERE nome LIKE ? OR email LIKE ? 
                ORDER BY nome ASC";
        
        $pesquisa = "%$termo%";
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ss", $pesquisa, $pesquisa);
        $stmt->execute();
        
        return $this->formatarResultados($stmt->get_result());
    }
    
    /**
     * Busca usuário por ID
     */
    public function buscarPorId($id) {
        $sql = "SELECT id, nome, email, endereco, cidade, telefone, data_cadastro 
                FROM Usuarios 
                WHERE id = ?";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $resultado = $stmt->get_result();
        if ($resultado->num_rows > 0) {
            return $this->formatarUsuario($resultado->fetch_assoc());
        }
        return null;
    }
    
    /**
     * Verifica se email já existe
     */
    public function emailExiste($email, $excluirId = 0) {
        $sql = "SELECT id FROM Usuarios WHERE email = ? AND id != ?";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("si", $email, $excluirId);
        $stmt->execute();
        
        return $stmt->get_result()->num_rows > 0;
    }
    
    /**
     * Insere novo usuário
     */
    public function inserir($nome, $email, $senha, $endereco, $cidade, $telefone) {
        $sql = "INSERT INTO Usuarios (nome, email, senha, endereco, cidade, telefone, data_cadastro) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ssssss", $nome, $email, $senha, $endereco, $cidade, $telefone);
        
        if ($stmt->execute()) {
            return $this->conexao->insert_id;
        }
        return false;
    }
    
    /**
     * Atualiza usuário (com senha)
     */
    public function atualizarComSenha($id, $nome, $email, $senha, $endereco, $cidade, $telefone) {
        $sql = "UPDATE Usuarios 
                SET nome = ?, email = ?, senha = ?, endereco = ?, cidade = ?, telefone = ? 
                WHERE id = ?";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ssssssi", $nome, $email, $senha, $endereco, $cidade, $telefone, $id);
        
        return $stmt->execute();
    }
    
    /**
     * Atualiza usuário (sem mudar senha)
     */
    public function atualizarSemSenha($id, $nome, $email, $endereco, $cidade, $telefone) {
        $sql = "UPDATE Usuarios 
                SET nome = ?, email = ?, endereco = ?, cidade = ?, telefone = ? 
                WHERE id = ?";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("sssssi", $nome, $email, $endereco, $cidade, $telefone, $id);
        
        return $stmt->execute();
    }
    
    /**
     * Exclui usuário
     */
    public function excluir($id) {
        $sql = "DELETE FROM Usuarios WHERE id = ?";
        
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
    
    /**
     * Formata lista de resultados
     */
    private function formatarResultados($resultado) {
        $lista = [];
        while ($linha = $resultado->fetch_assoc()) {
            $lista[] = $this->formatarUsuario($linha);
        }
        return $lista;
    }
    
    /**
     * Formata dados de um usuário
     */
    private function formatarUsuario($linha) {
        $linha['data_cadastro_formatada'] = date('d/m/Y H:i', strtotime($linha['data_cadastro']));
        
        // Concatena endereço + cidade
        $endereco_completo = $linha['endereco'] ?? '';
        if (!empty($linha['cidade'])) {
            $endereco_completo .= ($endereco_completo ? ', ' : '') . $linha['cidade'];
        }
        $linha['endereco_completo'] = $endereco_completo;
        
        return $linha;
    }
    
    /**
     * Retorna erro do banco
     */
    public function getErro() {
        return $this->conexao->error;
    }
}
?>
