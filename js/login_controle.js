/**
 * ============================================================
 * ARQUIVO: login_controle.js
 * DESCRIÇÃO: Controlador da página de login
 * 
 * Este arquivo gerencia o processo de autenticação do usuário.
 * Quando o usuário submete o formulário de login, eu envio
 * as credenciais para a API que verifica no banco de dados
 * e cria uma sessão PHP se as credenciais estiverem corretas.
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Quando a página termina de carregar, inicio o controlador
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Pego a referência do formulário de login
    const form = document.getElementById("form-login");
    
    // Verifico se o usuário já está logado (para não ficar na página de login à toa)
    verificarLoginLocal();

    // ============================================================
    // EVENTO: Submit do Formulário de Login
    // Intercepto o envio para fazer via AJAX
    // ============================================================
    form.addEventListener("submit", function (e) {
        // Previno o comportamento padrão do formulário
        e.preventDefault();

        // Capturo os valores dos campos de email e senha
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        // Monto o objeto com os dados para enviar
        const dados = { email: email, senha: senha };

        // Mostro feedback visual de loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = "Entrando...";
        btnSubmit.disabled = true; // Desabilito para evitar cliques múltiplos

        // Envio a requisição POST para a API de login
        fetch('../php/api_login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Login bem sucedido! Mostro mensagem de boas-vindas
                alert("Bem-vindo, " + data.usuario.nome + "!");
                // Redireciono para a página inicial
                window.location.href = "../index.html";
            } else {
                // Erro no login (credenciais inválidas, etc)
                alert("Erro: " + data.erro);
                // Restauro o botão para nova tentativa
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            // Erro de comunicação com o servidor
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        });
    });
});

// ============================================================
// FUNÇÃO: verificarLoginLocal()
// 
// Esta função verifica se o usuário JÁ está logado quando
// acessa a página de login. Se estiver, não faz sentido
// ficar aqui, então redireciono para a home automaticamente.
// ============================================================
function verificarLoginLocal() {
    // Faço uma requisição GET para verificar o status da sessão
    fetch('../php/api_login.php')
        .then(response => response.json())
        .then(data => {
            // Se o usuário já está logado
            if (data.logado) {
                // Redireciono para a página inicial
                window.location.href = "../index.html";
            }
            // Se não está logado, não faço nada (fica na página de login)
        })
        .catch(error => {
            // Apenas registro o erro, não impeço o uso da página
            console.error('Erro ao verificar login:', error);
        });
}
