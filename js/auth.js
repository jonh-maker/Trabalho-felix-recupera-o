/**
 * ============================================================
 * ARQUIVO: auth.js
 * DESCRIÇÃO: Sistema de Autenticação do To-Do List
 * 
 * Este arquivo é responsável por gerenciar todo o sistema de
 * login/logout em TODAS as páginas do sistema. Eu incluo ele
 * em cada página para garantir que:
 * 1. Páginas protegidas só sejam acessíveis por usuários logados
 * 2. O menu seja atualizado dinamicamente (Login/Logout)
 * 3. O nome do usuário apareça no header quando logado
 * ============================================================
 */

// ============================================================
// CONFIGURAÇÃO: Lista de páginas que precisam de login
// Se o usuário tentar acessar sem estar logado, será redirecionado
// ============================================================
const PAGINAS_PROTEGIDAS = ['usuarios.html', 'projetos.html', 'tarefas.html', 'categorias.html'];

// ============================================================
// IIFE (Função Auto-Executável) - Roda imediatamente ao carregar
// Aqui eu escondo a página antes de verificar se o usuário está logado
// Isso evita que o conteúdo "pisque" antes de redirecionar
// ============================================================
(function() {
    // Pego o nome do arquivo atual da URL
    const paginaAtual = window.location.pathname.split('/').pop();
    const isInPages = window.location.pathname.includes('/pages/');
    
    // Se é uma página protegida, escondo todo o conteúdo temporariamente
    if (PAGINAS_PROTEGIDAS.includes(paginaAtual)) {
        document.documentElement.style.visibility = 'hidden';
    }
})();

// ============================================================
// EVENTO: Quando o DOM terminar de carregar
// Inicio a verificação de autenticação
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    verificarAutenticacao();
});

// ============================================================
// FUNÇÃO: verificarAutenticacao()
// 
// Esta é a função principal! Ela faz uma requisição GET para
// a API de login para verificar se existe uma sessão ativa.
// Se a página requer login e o usuário não está logado,
// redireciono ele para a tela de login.
// ============================================================
function verificarAutenticacao() {
    // Verifico se estou na pasta /pages/ para montar o caminho correto da API
    const isInPages = window.location.pathname.includes('/pages/');
    
    // Monto os caminhos relativos baseado na localização atual
    const apiPath = isInPages ? '../php/api_login.php' : 'php/api_login.php';
    const loginPath = isInPages ? 'login.html' : 'pages/login.html';
    
    // Pego o nome da página atual
    const paginaAtual = window.location.pathname.split('/').pop();
    
    // Faço a requisição para verificar o status do login
    fetch(apiPath)
        .then(response => response.json())
        .then(data => {
            // Verifico se a página atual requer login E se o usuário NÃO está logado
            if (PAGINAS_PROTEGIDAS.includes(paginaAtual) && !data.logado) {
                // Mostro um alerta amigável e redireciono
                alert('Você precisa fazer login para acessar esta página!');
                window.location.href = loginPath;
                return; // Paro a execução aqui
            }
            
            // Se passou na verificação, mostro a página normalmente
            document.documentElement.style.visibility = 'visible';
            
            // Atualizo o menu de navegação com as opções corretas
            atualizarMenu(data, isInPages);
        })
        .catch(error => {
            // Se houver erro na comunicação, mostro a página mesmo assim
            // (para não travar o usuário completamente)
            console.error('Erro ao verificar autenticação:', error);
            document.documentElement.style.visibility = 'visible';
        });
}

// ============================================================
// FUNÇÃO: atualizarMenu()
// 
// Esta função atualiza dinamicamente o menu de navegação.
// - Se o usuário está LOGADO: mostra o nome dele e botão "Sair"
// - Se NÃO está logado: mostra links de "Login" e "Cadastre-se"
// 
// Parâmetros:
// - data: objeto com informações do usuário (vem da API)
// - isInPages: boolean indicando se estamos na pasta /pages/
// ============================================================
function atualizarMenu(data, isInPages) {
    // Localizo a lista do menu de navegação
    const nav = document.querySelector('nav ul');
    if (!nav) return; // Se não encontrar, paro aqui
    
    // Removo itens de login/cadastro/logout que já existam (evita duplicar)
    const itensRemover = nav.querySelectorAll('.auth-item');
    itensRemover.forEach(item => item.remove());
    
    // Localizo o header para adicionar info do usuário
    const header = document.querySelector('header');
    let userInfo = document.getElementById('user-info');
    
    // Se o usuário está logado...
    if (data.logado) {
        // Crio ou atualizo o elemento que mostra o nome do usuário
        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.id = 'user-info';
            userInfo.style.cssText = 'color: white; font-size: 0.9em; margin-top: 5px;';
            header.appendChild(userInfo);
        }
        // Mostro uma saudação personalizada
        userInfo.innerHTML = `👤 Olá, <strong>${data.usuario.nome}</strong>`;
        
        // Adiciono o botão de logout no menu
        const logoutItem = document.createElement('li');
        logoutItem.className = 'auth-item';
        // O onclick chama a função fazerLogout() e o return false evita que o link navegue
        logoutItem.innerHTML = `<a href="#" onclick="fazerLogout(); return false;" style="color: #ff6b6b;">Sair</a>`;
        nav.appendChild(logoutItem);
    } else {
        // Se não está logado, removo qualquer info de usuário
        if (userInfo) userInfo.remove();
        
        // Defino o prefixo correto para os links baseado na localização
        const prefix = isInPages ? '' : 'pages/';
        
        // Adiciono link para a página de login
        const loginItem = document.createElement('li');
        loginItem.className = 'auth-item';
        loginItem.innerHTML = `<a href="${prefix}login.html">Login</a>`;
        nav.appendChild(loginItem);
        
        // Adiciono link para a página de cadastro
        const cadastroItem = document.createElement('li');
        cadastroItem.className = 'auth-item';
        cadastroItem.innerHTML = `<a href="${prefix}cadastro.html">Cadastre-se</a>`;
        nav.appendChild(cadastroItem);
    }
}

// ============================================================
// FUNÇÃO: fazerLogout()
// 
// Esta função é chamada quando o usuário clica em "Sair".
// Ela envia uma requisição POST para a API de login com
// a ação 'logout', que destrói a sessão no servidor.
// Após o logout, redireciono o usuário para a página de login.
// ============================================================
function fazerLogout() {
    // Determino o caminho correto da API baseado na localização
    const isInPages = window.location.pathname.includes('/pages/');
    const apiPath = isInPages ? '../php/api_login.php' : 'php/api_login.php';
    const loginPath = isInPages ? 'login.html' : 'pages/login.html';
    
    // Faço a requisição POST para fazer logout
    fetch(apiPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // Envio a ação de logout no corpo da requisição
        body: JSON.stringify({ acao: 'logout' })
    })
    .then(response => response.json())
    .then(data => {
        // Se o logout foi bem sucedido
        if (data.sucesso) {
            alert('Você saiu do sistema!');
            // Redireciono para a página de login
            window.location.href = loginPath;
        }
    })
    .catch(error => {
        // Registro qualquer erro no console
        console.error('Erro ao fazer logout:', error);
    });
}
