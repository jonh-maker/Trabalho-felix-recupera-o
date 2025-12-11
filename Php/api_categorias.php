```php
<?php
/**
 * API de Categorias (CRUD)
 */

header('Content-Type: application/json');

include 'conexao.php';
include 'categorias_db.php';

// Instancia o DAO corretamente
$categoriasDB = new CategoriasDB($conexao);

// Pega o método HTTP
$metodo = $_SERVER['REQUEST_METHOD'];

/**
 * ============================================================
 * 1. LISTAR CATEGORIAS (GET)
 * ============================================================
 */
if ($metodo === 'GET') {

    $lista = $categoriasDB->listar();

    echo json_encode($lista);
    exit;
}

/**
 * ============================================================
 * 2. INSERIR OU EDITAR (POST)
 * ============================================================
 */
if ($metodo === 'POST' && !isset($_GET['acao'])) {

    $dados = json_decode(file_get_contents("php://input"), true);

    $nome = $dados['nome'] ?? '';
    $cor  = $dados['cor'] ?? '#FFFFFF';
    $id   = $dados['id'] ?? null;

    // Validação
    if (empty($nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Nome é obrigatório']);
        exit;
    }

    if ($id === null) {
        // INSERIR
        $ok = $categoriasDB->inserir($nome, $cor);
    } else {
        // ATUALIZAR
        $ok = $categoriasDB->atualizar((int)$id, $nome, $cor);
    }

    echo json_encode(['sucesso' => $ok]);
    exit;
}

/**
 * ============================================================
 * 3. EXCLUIR CATEGORIA (POST com ação=excluir)
 * ============================================================
 */
if ($metodo === 'POST' && isset($_GET['acao']) && $_GET['acao'] === 'excluir') {

    $id = $_GET['id'] ?? null;

    if (empty($id) || !is_numeric($id)) {
        echo json_encode(['sucesso' => false, 'erro' => 'ID inválido']);
        exit;
    }

    $ok = $categoriasDB->excluir((int)$id);

    echo json_encode(['sucesso' => $ok]);
    exit;
}

echo json_encode(['sucesso' => false, 'erro' => 'Método não suportado']);
exit;
?>
