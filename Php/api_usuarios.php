<?php
/**
 * ============================================================
 * ARQUIVO: api_usuarios.php
 * DESCRIÇÃO: API para gerenciamento de usuários
 * 
 * Esta API cuida de: validação, receber requisições e retornar JSON
 * O SQL fica na classe UsuariosDB (arquivo db/usuarios_db.php)
 * ============================================================
 */

header('Content-Type: application/json');
session_start();

include 'conexao.php';
include 'db/usuarios_db.php';

$db = new UsuariosDB($conexao);
$metodo = $_SERVER['REQUEST_METHOD'];

// ============================================================
// GET - Listar ou Pesquisar
// ============================================================
if ($metodo == 'GET') {
    if (isset($_GET['pesquisa']) && !empty($_GET['pesquisa'])) {
        $lista = $db->pesquisar($_GET['pesquisa']);
    } else {
        $lista = $db->buscarTodos();
    }
    echo json_encode($lista);
    exit;
}

// ============================================================
// POST - Inserir ou Atualizar
// ============================================================
if ($metodo == 'POST' && !isset($_GET['acao'])) {
    $dados = json_decode(file_get_contents("php://input"), true);

    $id = $dados['id'] ?? '';
    $nome = $dados['nome'] ?? '';
    $email = $dados['email'] ?? '';
    $senha = $dados['senha'] ?? '';
    $endereco = $dados['endereco'] ?? '';
    $cidade = $dados['cidade'] ?? '';
    $telefone = $dados['telefone'] ?? '';

    // Validações
    if (empty($nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Nome é obrigatório']);
        exit;
    }
    if (empty($email)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Email é obrigatório']);
        exit;
    }
    if (empty($endereco)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Endereço é obrigatório']);
        exit;
    }
    if (empty($cidade)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Cidade é obrigatória']);
        exit;
    }
    if (empty($telefone)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Telefone é obrigatório']);
        exit;
    }

    // Verifica email duplicado
    $idCheck = empty($id) ? 0 : $id;
    if ($db->emailExiste($email, $idCheck)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Este email já está cadastrado']);
        exit;
    }

    // Atualizar
    if (!empty($id)) {
        if (!empty($senha)) {
            $sucesso = $db->atualizarComSenha($id, $nome, $email, $senha, $endereco, $cidade, $telefone);
        } else {
            $sucesso = $db->atualizarSemSenha($id, $nome, $email, $endereco, $cidade, $telefone);
        }
        
        if ($sucesso) {
            echo json_encode(['sucesso' => true, 'id' => $id]);
        } else {
            echo json_encode(['sucesso' => false, 'erro' => $db->getErro()]);
        }
    } 
    // Inserir
    else {
        if (empty($senha)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Senha é obrigatória para novo usuário']);
            exit;
        }
        
        $novoId = $db->inserir($nome, $email, $senha, $endereco, $cidade, $telefone);
        
        if ($novoId) {
            echo json_encode(['sucesso' => true, 'id' => $novoId]);
        } else {
            echo json_encode(['sucesso' => false, 'erro' => $db->getErro()]);
        }
    }
    exit;
}

// ============================================================
// POST - Excluir
// ============================================================
if ($metodo == 'POST' && isset($_GET['acao']) && $_GET['acao'] == 'excluir') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['sucesso' => false, 'erro' => 'ID não informado']);
        exit;
    }
    
    // Proteção: não excluir a si mesmo
    if (isset($_SESSION['usuario_id']) && $_SESSION['usuario_id'] == $id) {
        echo json_encode(['sucesso' => false, 'erro' => 'Você não pode excluir seu próprio usuário']);
        exit;
    }
    
    if ($db->excluir($id)) {
        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => $db->getErro()]);
    }
    exit;
}

$conexao->close();
?>
