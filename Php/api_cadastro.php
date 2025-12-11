<?php
/**
 * ============================================================
 * ARQUIVO: api_cadastro.php
 * DESCRIÇÃO: API para registro de novos usuários
 * 
 * Esta API recebe os dados de cadastro via POST e cria um
 * novo usuário no banco de dados. Implementa validações
 * rigorosas para garantir dados válidos e seguros.
 * 
 * Validações realizadas:
 * - Nome: mínimo 3 caracteres, apenas letras e espaços
 * - Email: formato válido e único no sistema
 * - Senha: mínimo 4 caracteres, confirmação deve coincidir
 * - Idade: entre 10 e 120 anos
 * ============================================================
 */

// Defino o tipo de resposta como JSON
header('Content-Type: application/json');

// Incluo a conexão com o banco
include 'conexao.php';

// Pego o método HTTP
$metodo = $_SERVER['REQUEST_METHOD'];

// ============================================================
// MÉTODO POST: Cadastrar novo usuário
// ============================================================
if ($metodo == 'POST') {
    // Leio os dados JSON enviados pelo JavaScript
    $dados = json_decode(file_get_contents("php://input"), true);

    // Capturo os campos do formulário (trim remove espaços extras)
    $nome = trim($dados['nome'] ?? '');
    $email = trim($dados['email'] ?? '');
    $senha = $dados['senha'] ?? '';
    $confirmar_senha = $dados['confirmar_senha'] ?? '';
    $data_nasc = $dados['data_nasc'] ?? '';

    // ========== VALIDAÇÕES DO BACKEND ==========
    // Mesmo tendo validações no JavaScript, repito aqui por segurança
    // (nunca confie apenas no frontend!)

    // --------------------------------------------
    // VALIDAÇÃO DO NOME
    // --------------------------------------------
    if (empty($nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Nome é obrigatório']);
        exit;
    }
    if (strlen($nome) < 3) {
        echo json_encode(['sucesso' => false, 'erro' => 'O nome deve ter pelo menos 3 caracteres']);
        exit;
    }
    // Regex para aceitar apenas letras (incluindo acentos) e espaços
    // O modificador 'u' é para suportar UTF-8
    if (!preg_match('/^[A-Za-zÀ-ÿ\s]+$/u', $nome)) {
        echo json_encode(['sucesso' => false, 'erro' => 'O nome deve conter apenas letras e espaços']);
        exit;
    }

    // --------------------------------------------
    // VALIDAÇÃO DO EMAIL
    // --------------------------------------------
    if (empty($email)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Email é obrigatório']);
        exit;
    }
    // Uso o filtro nativo do PHP para validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Email inválido']);
        exit;
    }

    // --------------------------------------------
    // VALIDAÇÃO DA DATA DE NASCIMENTO
    // --------------------------------------------
    if (empty($data_nasc)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Data de nascimento é obrigatória']);
        exit;
    }
    // Tento criar um objeto DateTime a partir da data
    $dataNasc = DateTime::createFromFormat('Y-m-d', $data_nasc);
    if (!$dataNasc) {
        echo json_encode(['sucesso' => false, 'erro' => 'Data de nascimento inválida']);
        exit;
    }
    // Calculo a idade
    $hoje = new DateTime();
    $idade = $hoje->diff($dataNasc)->y;
    
    // Data não pode ser no futuro
    if ($dataNasc >= $hoje) {
        echo json_encode(['sucesso' => false, 'erro' => 'A data de nascimento deve ser anterior a hoje']);
        exit;
    }
    // Idade mínima: 10 anos
    if ($idade < 10) {
        echo json_encode(['sucesso' => false, 'erro' => 'Você deve ter pelo menos 10 anos para se cadastrar']);
        exit;
    }
    // Idade máxima razoável: 120 anos
    if ($idade > 120) {
        echo json_encode(['sucesso' => false, 'erro' => 'Data de nascimento inválida']);
        exit;
    }

    // --------------------------------------------
    // VALIDAÇÃO DA SENHA
    // --------------------------------------------
    if (empty($senha)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Senha é obrigatória']);
        exit;
    }
    if (strlen($senha) < 4) {
        echo json_encode(['sucesso' => false, 'erro' => 'A senha deve ter pelo menos 4 caracteres']);
        exit;
    }
    // A confirmação deve coincidir
    if ($senha !== $confirmar_senha) {
        echo json_encode(['sucesso' => false, 'erro' => 'As senhas não coincidem']);
        exit;
    }

    // --------------------------------------------
    // VERIFICAÇÃO DE EMAIL DUPLICADO
    // Não permito dois usuários com o mesmo email
    // --------------------------------------------
    $sql_check = "SELECT id FROM Usuarios WHERE email = ?";
    $stmt_check = $conexao->prepare($sql_check);
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        echo json_encode(['sucesso' => false, 'erro' => 'Este email já está cadastrado']);
        exit;
    }

    // ========== INSERÇÃO NO BANCO DE DADOS ==========
    // Uso prepared statement para prevenir SQL Injection
    $stmt = $conexao->prepare("INSERT INTO Usuarios (nome, email, senha, data_cadastro) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sss", $nome, $email, $senha);

    // Executo a inserção
    if ($stmt->execute()) {
        // Cadastro realizado com sucesso!
        echo json_encode([
            'sucesso' => true, 
            'mensagem' => 'Cadastro realizado com sucesso! Faça login para continuar.',
            'id' => $conexao->insert_id  // Retorno o ID do novo usuário
        ]);
    } else {
        // Erro na inserção
        echo json_encode(['sucesso' => false, 'erro' => $conexao->error]);
    }
    exit;
}

// Se o método não é POST, retorno erro
echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido']);

// Fecho a conexão
$conexao->close();
?>
