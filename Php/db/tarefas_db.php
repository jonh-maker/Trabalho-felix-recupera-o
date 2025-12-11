```php
<?php
/**
 * tarefas_db.php
 * Classe DAO completa para CRUD de tarefas
 * Agora funcionando de verdade!
 */

class TarefasDB {

    private $conexao;

    public function __construct($conexao) {
        $this->conexao = $conexao;
    }

    /* ============================================================
     * LISTAR PROJETOS DO USUÁRIO
     * ============================================================ */
    public function listarProjetosDoUsuario($usuario_id) {
        $sql = "
            SELECT id, nome
            FROM Projetos
            WHERE usuario_id = ?
            ORDER BY nome ASC
        ";

        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();

        $res = $stmt->get_result();
        $lista = [];

        while ($linha = $res->fetch_assoc()) {
            $lista[] = $linha;
        }

        return $lista;
    }

    /* ============================================================
     * LISTAR TAREFAS DO USUÁRIO
     * ============================================================ */
    public function listarTarefasPorUsuario($usuario_id) {
        $sql = "
            SELECT 
                t.id,
                t.titulo,
                t.descricao,
                t.status,
                t.data_limite,
                t.projeto_id,
                p.nome AS nome_projeto
            FROM Tarefas AS t
            JOIN Projetos AS p ON t.projeto_id = p.id
            WHERE p.usuario_id = ?
            ORDER BY t.data_limite ASC
        ";

        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();

        $res = $stmt->get_result();
        $lista = [];

        while ($linha = $res->fetch_assoc()) {
            $lista[] = $linha;
        }

        return $lista;
    }

    /* ============================================================
     * INSERIR TAREFA
     * ============================================================ */
    public function inserir($titulo, $descricao, $projeto_id, $usuario_id, $data_limite, $status) {

        $sql = "
            INSERT INTO Tarefas (titulo, descricao, projeto_id, data_limite, status)
            VALUES (?, ?, ?, ?, ?)
        ";

        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ssiss", 
            $titulo, 
            $descricao, 
            $projeto_id, 
            $data_limite, 
            $status
        );

        if ($stmt->execute()) {
            return $this->conexao->insert_id;
        } else {
            return false;
        }
    }

    /* ============================================================
     * ATUALIZAR TAREFA
     * ============================================================ */
    public function atualizar($id, $titulo, $descricao, $projeto_id, $data_limite, $status) {

        $sql = "
            UPDATE Tarefas
            SET titulo = ?, descricao = ?, projeto_id = ?, data_limite = ?, status = ?
            WHERE id = ?
        ";

        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("ssissi", 
            $titulo, 
            $descricao, 
            $projeto_id, 
            $data_limite, 
            $status,
            $id
        );

        return $stmt->execute();
    }

    /* ============================================================
     * EXCLUIR TAREFA
     * ============================================================ */
    public function excluir($id) {
        $sql = "DELETE FROM Tarefas WHERE id = ?";

        $stmt = $this->conexao->prepare($sql);
        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }

    /* ============================================================
     * ÚLTIMO ERRO
     * ============================================================ */
    public function getErro() {
        return $this->conexao->error;
    }
}
?>
```
