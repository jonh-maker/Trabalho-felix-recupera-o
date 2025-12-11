```php
<?php
/**
 * projetos_db.php
 * Contém apenas as consultas SQL usadas pelo CRUD de projetos.
 */

class ProjetosDB {

    /** Listar projetos do usuário */
    public static function LISTAR_PROJETOS() {
        return "
            SELECT id, nome, descricao, data_criacao
            FROM Projetos
            WHERE usuario_id = ?
            ORDER BY nome ASC
        ";
    }

    /** Atualizar projeto (somente do próprio usuário) */
    public static function ATUALIZAR_PROJETO() {
        return "
            UPDATE Projetos
            SET nome = ?, descricao = ?
            WHERE id = ? AND usuario_id = ?
        ";
    }

    /** Inserir novo projeto */
    public static function INSERIR_PROJETO() {
        return "
            INSERT INTO Projetos (nome, descricao, usuario_id, data_criacao)
            VALUES (?, ?, ?, NOW())
        ";
    }

    /** Excluir projeto do usuário */
    public static function EXCLUIR_PROJETO() {
        return "
            DELETE FROM Projetos
            WHERE id = ? AND usuario_id = ?
        ";
    }
}
?>
```
