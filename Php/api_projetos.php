<?php
/**
 * API de Projetos sem SQL direto
 * Agora utiliza o arquivo projetos_db.php (DAO)
 */

header('Content-Type: application/json');

session_start();

include 'conexao.php';
include 'db/projetos_db.php';

$metodo = $_SERVER['REQUEST_METHOD'];

// Identifica usuário logado (ou 1 para testes)
$usuario_id = isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : 1;

// ============================================================
// 1. LISTAR PROJETOS (GET)
// ============================================================
if ($metodo == 'GET') {

    $sql = ProjetosDB::LISTAR_PROJETOS();
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $lista = [];

    if ($resultado->num_rows > 0) {
        while ($linha = $resultado->fetch_assoc()) {
            $linha['data_criacao_formatada'] = date('d/m/Y H:i', strtotime($linha['data_criacao']));
            $lista[] = $linha;
        }
    }

    echo json_encode($lista);
    exit;
}

// ============================================================
// 2. ADICIONAR OU EDITAR PROJETO (POST)
// ============================================================
if ($metodo == 'POST' && !isset($_GET['acao'])) {

    $dados = json_decode(file_get_contents("php://input"), true);

    $nome = $dados['nome'] ?? '';
    $descricao = $dados['descricao'] ?? '';
    $id = $dados['id'] ?? '';

    if (empty($nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Nome do projeto é obrigatório']);
        exit;
    }

    if (!empty($id)) {
        // ATUALIZAÇÃO
        $sql = ProjetosDB::ATUALIZAR_PROJETO();
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ssii", $nome, $descricao, $id, $usuario_id);

    } else {
        // INSERÇÃO
        $sql = ProjetosDB::INSERIR_PROJETO();
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ssi", $nome, $descricao, $usuario_id);
    }

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true, 'id' => $id ? $id : $conexao->insert_id]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => $conexao->error]);
    }

    exit;
}

