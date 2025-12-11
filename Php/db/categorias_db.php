<?php
/**
 * ============================================================
 * ARQUIVO: categorias_db.php
 * DESCRIÇÃO: Classe DAO responsável por TODAS as operações de
 *            banco de dados da tabela Categorias.
 * 
 * NÃO contém validações.
 * NÃO contém JSON.
 * NÃO recebe requisições HTTP.
 * ============================================================
 */

class CategoriasDB {

    private $conexao;

    public function __construct($conexao) {
        $this->conexao = $conexao;
    }

    /**
     * LISTAR TODAS AS CATEGORIAS
     */
    public function listar() {
        $sql = "SELECT id, nome, cor FROM Categorias ORDER BY nome ASC";
        $resultado = $this->conexao->query($sql);

        $lista = [];

        if ($resultado && $resultado->num_rows > 0) {
            while ($linha = $resultado->fetch_assoc()) {
                $lista[] = $linha;
            }
        }

        return $lista;
    }

    /**
     * INSERIR NOVA CATEGORIA
     */
    public function inserir($nome, $cor) {
        $sql = "INSERT INTO Categorias (nome, cor) VALUES (?, ?)";
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ss", $nome, $cor);

        return $stmt->execute();
    }

    /**
     * ATUALIZAR CATEGORIA
     */
    public function atualizar($id, $nome, $cor) {
        $sql = "UPDATE Categorias SET nome = ?, cor = ? WHERE id = ?";
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ssi", $nome, $cor, $id);

        return $stmt->execute();
    }

    /**
     * EXCLUIR CATEGORIA
     */
    public function excluir($id) {
        $sql = "DELETE FROM Categorias WHERE id = ?";
        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }

    /**
     * RETORNAR ÚLTIMO ERRO DO BANCO
     */
    public function getErro() {
        return $this->conexao->error;
    }
}
?>
