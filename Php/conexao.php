<?php
/**
 * ============================================================
 * ARQUIVO: conexao.php
 * DESCRIÇÃO: Configuração e conexão com o banco de dados MySQL
 * 
 * Este arquivo é incluído em todas as APIs do sistema para
 * estabelecer a conexão com o banco de dados. Eu configurei
 * tratamento de erros amigável para facilitar o debug.
 * ============================================================
 */

// ============================================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// Aqui defino as credenciais de acesso ao MySQL
// ============================================================
$servidor = "localhost";    // Endereço do servidor MySQL (localhost para ambiente local)
$usuario = "root";          // Usuário do MySQL
$senha = "Admin@000";       // Senha do MySQL
$banco = "todo_list_db";    // Nome do banco de dados que criei

/**
 * ============================================================
 * FUNÇÃO: mostrarErroConexao()
 * 
 * Esta função trata os erros de conexão de forma amigável.
 * Dependendo do tipo de requisição (JSON ou HTML), ela retorna
 * a mensagem de erro no formato apropriado.
 * 
 * Parâmetros:
 * - $mensagemTecnica: detalhes técnicos do erro
 * ============================================================
 */
function mostrarErroConexao($mensagemTecnica) {
    // Verifico se a requisição espera resposta em JSON
    // Isso acontece quando o JavaScript faz uma requisição AJAX
    $isJson = (
        isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false
    ) || (
        isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false
    );
    
    // Se espera JSON, retorno erro em formato JSON
    if ($isJson) {
        header('Content-Type: application/json');
        echo json_encode([
            'sucesso' => false, 
            'erro' => 'Falha na conexão com o banco de dados. Verifique se o MySQL está rodando.'
        ]);
        exit;
    }
    
    // Caso contrário, mostro uma mensagem HTML amigável com instruções
    // Isso ajuda muito no debug quando acesso a página diretamente
    echo "<div style='font-family: Arial; padding: 20px; background: #fee2e2; border: 2px solid #dc2626; border-radius: 12px; margin: 20px; color: #991b1b; max-width: 600px;'>
        <h2 style='margin-top:0;'>⚠️ Erro de Conexão com o Banco de Dados</h2>
        <p>Não foi possível conectar ao banco de dados MySQL.</p>
        <p><strong>Possíveis causas:</strong></p>
        <ul>
            <li>O servidor MySQL não está rodando</li>
            <li>Usuário ou senha incorretos</li>
            <li>O banco de dados '<strong>todo_list_db</strong>' não existe</li>
        </ul>
        <p><strong>Como resolver:</strong></p>
        <ol>
            <li>Verifique se o MySQL está rodando: <code>sudo service mysql status</code></li>
            <li>Execute o script SQL: <code>mysql -u root -p < sql/database_completo.sql</code></li>
            <li>Verifique a senha em <code>php/conexao.php</code></li>
        </ol>
        <details>
            <summary style='cursor:pointer; color:#666;'>Detalhes técnicos</summary>
            <pre style='background:#fef2f2; padding:10px; border-radius:4px; overflow:auto;'>" . htmlspecialchars($mensagemTecnica) . "</pre>
        </details>
    </div>";
    exit;
}

// ============================================================
// TENTATIVA DE CONEXÃO COM O BANCO
// Uso try-catch para capturar possíveis erros
// ============================================================
try {
    // Crio uma nova conexão usando mysqli (MySQL Improved)
    $conexao = new mysqli($servidor, $usuario, $senha, $banco);
    
    // Verifico se houve erro na conexão
    if ($conexao->connect_error) {
        mostrarErroConexao($conexao->connect_error);
    }
    
    // Defino o charset como UTF-8 para suportar acentos e caracteres especiais
    $conexao->set_charset("utf8");
    
} catch (mysqli_sql_exception $e) {
    // Capturo erros específicos do MySQL
    mostrarErroConexao($e->getMessage());
} catch (Exception $e) {
    // Capturo qualquer outro tipo de erro
    mostrarErroConexao($e->getMessage());
}
?>
