<?php
/**
 * Arquivo para testar a conexão com o banco de dados
 * Acesse: http://localhost/to-do-list/php/testar_conexao.php
 */

echo "<h1 style='font-family: Arial;'>🔍 Teste de Conexão - To-Do List</h1>";
echo "<hr>";

// Inclui o arquivo de conexão
include 'conexao.php';

echo "<div style='font-family: Arial; padding: 20px; background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; margin: 20px 0; color: #065f46;'>";
echo "<h2 style='margin-top:0;'>✅ Conexão bem-sucedida!</h2>";
echo "<p>O sistema está conectado ao banco de dados <strong>todo_list_db</strong>.</p>";

// Testar consultas
echo "<h3>📊 Estatísticas do Banco:</h3>";
echo "<ul>";

// Contar usuários
$result = $conexao->query("SELECT COUNT(*) as total FROM Usuarios");
$row = $result->fetch_assoc();
echo "<li><strong>Usuários:</strong> " . $row['total'] . "</li>";

// Contar categorias
$result = $conexao->query("SELECT COUNT(*) as total FROM Categorias");
$row = $result->fetch_assoc();
echo "<li><strong>Categorias:</strong> " . $row['total'] . "</li>";

// Contar projetos
$result = $conexao->query("SELECT COUNT(*) as total FROM Projetos");
$row = $result->fetch_assoc();
echo "<li><strong>Projetos:</strong> " . $row['total'] . "</li>";

// Contar tarefas
$result = $conexao->query("SELECT COUNT(*) as total FROM Tarefas");
$row = $result->fetch_assoc();
echo "<li><strong>Tarefas:</strong> " . $row['total'] . "</li>";

echo "</ul>";
echo "</div>";

echo "<p><a href='../index.html' style='color: #6366f1;'>← Voltar para o sistema</a></p>";

$conexao->close();
?>
