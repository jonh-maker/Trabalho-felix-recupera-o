```php
<?php
header('Content-Type: application/json');
session_start();

include 'conexao.php';
include 'tarefas_db.php';

// Instancia o DAO
$tarefasDB = new TarefasDB($conexao);

// Usuário logado
$usuario_id = $_SESSION['usuario_id'] ?? 1;

// Método HTTP
$metodo = $_SERVER['REQUEST_METHOD'];

/**
 * ============================================================
 * 1. GET — LISTAR TAREFAS OU PROJETOS
 * ============================================================
 */
if ($metodo === 'GET') {

    // --- LISTAR PROJETOS DO USUÁRIO ---
    if (isset($_GET['tipo']) && $_GET['tipo'] === 'projetos') {
        $projetos = $tarefasDB->listarProjetosDoUsuario($usuario_id);
        echo json_encode($projetos);
        exit;
    }

    // --- LISTAR TAREFAS DO USUÁRIO ---
    $tarefas = $tarefasDB->listarTarefasPorUsuario($usuario_id);

    // Processamento da data limite
    foreach ($tarefas as &$tarefa) {

        if (!empty($tarefa['data_limite']) && $tarefa['data_limite'] !== '0000-00-00') {

            $tarefa['data_limite_formatada'] = date('d/m/Y', strtotime($tarefa['data_limite']));

            $hoje = new DateTime();
            $limite = new DateTime($tarefa['data_limite']);
            $diff = $hoje->diff($limite);

            $dias = $diff->days * ($diff->invert ? -1 : 1);

            $tarefa['dias_restantes'] = $dias;
            $tarefa['vencida'] = $dias < 0;
            $tarefa['proxima'] = $dias >= 0 && $dias <= 3;

        } else {
            $tarefa['data_limite_formatada'] = 'Não definida';
            $tarefa['dias_restantes'] = null;
            $tarefa['vencida'] = false;
            $tarefa['proxima'] = false;
        }
    }

    echo json_encode($tarefas);
    exit;
}

/**
 * ============================================================
 * 2. POST — ADICIONAR OU EDITAR TAREFA
 * ============================================================
 */
if ($metodo === 'POST' && !isset($_GET['acao'])) {

    $dados = json_decode(file_get_contents("php://input"), true);

    $titulo      = $dados['titulo']      ?? '';
    $descricao   = $dados['descricao']   ?? '';
    $projeto_id  = $dados['projeto_id']  ?? null;
    $data_limite = $dados['data_limite'] ?? null;
    $status      = $dados['status']      ?? 'Pendente';
    $id          = $dados['id']          ?? null;

    // Validações
    if (empty($titulo)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Título da tarefa é obrigatório']);
        exit;
    }
    if (empty($projeto_id)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Selecione um projeto']);
        exit;
    }

    // Inserir
    if (empty($id)) {

        $novo_id = $tarefasDB->inserir($titulo, $descricao, $projeto_id, $usuario_id, $data_limite, $status);

        echo json_encode([
            'sucesso' => true,
            'id' => $novo_id
        ]);
        exit;

    // Editar
    } else {

        $ok = $tarefasDB->atualizar($id, $titulo, $descricao, $projeto_id, $data_limite, $status);

        echo json_encode(['sucesso' => $ok]);
        exit;
    }
}

/**
 * ============================================================
 * 3. POST — EXCLUIR TAREFA
 * ============================================================
 */
if ($metodo === 'POST' && isset($_GET['acao']) && $_GET['acao'] === 'excluir') {

    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['sucesso' => false, 'erro' => 'ID não informado']);
        exit;
    }

    $ok = $tarefasDB->excluir($id);

    echo json_encode(['sucesso' => $ok]);
    exit;
}

echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido']);
exit;
?>
