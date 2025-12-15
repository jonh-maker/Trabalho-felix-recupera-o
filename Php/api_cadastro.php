<?php
header('Content-Type: application/json');

include 'conexao.php';
include 'usuarios_db.php';

$usuariosDB = new UsuariosDB($conexao);

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {

    $dados = json_decode(file_get_contents("php://input"), true);

    $nome = trim($dados['nome'] ?? '');
    $email = trim($dados['email'] ?? '');
    $senha = $dados['senha'] ?? '';
    $confirmar_senha = $dados['confirmar_senha'] ?? '';
    $data_nasc = $dados['data_nasc'] ?? '';

    // ================= VALIDAÇÕES =================

    if (empty($nome) || strlen($nome) < 3 || !preg_match('/^[A-Za-zÀ-ÿ\s]+$/u', $nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Nome inválido']);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Email inválido']);
        exit;
    }

    if (empty($data_nasc)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Data de nascimento obrigatória']);
        exit;
    }

    $dataNasc = DateTime::createFromFormat('Y-m-d', $data_nasc);
    $hoje = new DateTime();
    $idade = $hoje->diff($dataNasc)->y;

    if (!$dataNasc || $dataNasc >= $hoje || $idade < 10 || $idade > 120) {
        echo json_encode(['sucesso' => false, 'erro' => 'Data de nascimento inválida']);
        exit;
    }

    if (empty($senha) || strlen($senha) < 4 || $senha !== $confirmar_senha) {
        echo json_encode(['sucesso' => false, 'erro' => 'Senha inválida ou não confere']);
        exit;
    }

    // ============ ACESSO AO BANCO VIA DAO ============

    if ($usuariosDB->emailExiste($email)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Este email já está cadastrado']);
        exit;
    }

    // Campos que não existem no cadastro ainda
    $endereco = '';
    $cidade = '';
    $telefone = '';

    $idUsuario = $usuariosDB->inserir(
        $nome,
        $email,
        $senha,
        $endereco,
        $cidade,
        $telefone
    );

    if ($idUsuario) {
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Cadastro realizado com sucesso!',
            'id' => $idUsuario
        ]);
    } else {
        echo json_encode([
            'sucesso' => false,
            'erro' => $usuariosDB->getErro()
        ]);
    }

    exit;
}

echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido']);
$conexao->close();
