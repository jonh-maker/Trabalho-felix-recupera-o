<?php
/**
 * API de Login sem SQL direto
 * Agora utiliza o arquivo login_db.php (DAO)
 */

header('Content-Type: application/json');

session_start();

include 'conexao.php';   // conexão
include 'db/login_db.php'; // arquivo DAO contendo apenas SQL

$metodo = $_SERVER['REQUEST_METHOD'];

// ============================================================
// MÉTODO GET – Verificar sessão
// ============================================================
if ($metodo == 'GET') {

    if (isset($_SESSION['usuario_id'])) {
        echo json_encode([
            'logado' => true,
            'usuario' => [
                'id'    => $_SESSION['usuario_id'],
                'nome'  => $_SESSION['usuario_nome'],
                'email' => $_SESSION['usuario_email']
            ]
        ]);
    } else {
        echo json_encode(['logado' => false]);
    }

    exit;
}

// ============================================================
// MÉTODO POST – Login e Logout
// ============================================================
if ($metodo == 'POST') {

    $dados = json_decode(file_get_contents("php://input"), true);

    // --------------------------------------------
    // LOGOUT
    // --------------------------------------------
    if (isset($dados['acao']) && $dados['acao'] === 'logout') {

        session_destroy();
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Logout realizado com sucesso'
        ]);

        exit;
    }

    // --------------------------------------------
    // LOGIN
    // --------------------------------------------
    $email = $dados['email'] ?? '';
    $senha = $dados['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Email e senha são obrigatórios'
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Email inválido'
        ]);
        exit;
    }

    // Buscar usuário usando a query do DAO
    $sql = LoginDB::BUSCAR_USUARIO_EMAIL();
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    // Usuário não existe
    if ($resultado->num_rows == 0) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Usuário não encontrado'
        ]);
        exit;
    }

    $usuario = $resultado->fetch_assoc();

    // Verifica senha (a versão original não usa password_hash)
    if ($usuario['senha'] !== $senha) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Senha incorreta'
        ]);
        exit;
    }

    // LOGIN OK — cria sessão
    $_SESSION['usuario_id']    = $usuario['id'];
    $_SESSION['usuario_nome']  = $usuario['nome'];
    $_SESSION['usuario_email'] = $usuario['email'];

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Login realizado com sucesso',
        'usuario' => [
            'id'    => $usuario['id'],
            'nome'  => $usuario['nome'],
            'email' => $usuario['email']
        ]
    ]);

    exit;
}

$conexao->close();
?>
