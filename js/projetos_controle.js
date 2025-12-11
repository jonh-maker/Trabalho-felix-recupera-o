/**
 * ============================================================
 * ARQUIVO: projetos_controle.js
 * DESCRIÇÃO: Controlador CRUD para gerenciamento de projetos
 * 
 * Este arquivo gerencia todas as operações de CRUD para projetos.
 * Cada usuário pode criar seus próprios projetos, e as tarefas
 * são vinculadas a um projeto específico.
 * 
 * Funcionalidades:
 * - Listar projetos do usuário logado
 * - Criar novos projetos
 * - Editar projetos existentes
 * - Excluir projetos (também exclui as tarefas associadas)
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Ao carregar a página, inicio o sistema
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Carrego a lista de projetos ao iniciar
    listarProjetos();

    // Pego a referência do formulário
    const form = document.getElementById("form-projeto");

    // ============================================================
    // EVENTO: Submit do Formulário (Adicionar ou Editar)
    // O mesmo formulário serve para criar e atualizar projetos
    // ============================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Capturo os valores dos campos
        const id = document.getElementById("id_projeto").value;
        const nome = document.getElementById("nome_projeto").value;
        const descricao = document.getElementById("descricao_projeto").value;

        // Monto o objeto com os dados
        const dados = { id: id, nome: nome, descricao: descricao };

        // Envio para a API via POST
        fetch('../php/api_projetos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Mostro mensagem de sucesso (diferente para criar/atualizar)
                alert(id ? "Projeto atualizado com sucesso!" : "Projeto salvo com sucesso!");
                limparFormulario();
                listarProjetos();
            } else {
                alert("Erro: " + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
        });
    });
});

// ============================================================
// FUNÇÃO: limparFormulario()
// 
// Reseta o formulário para o estado inicial (modo criação).
// Limpa os campos e atualiza os textos do título e botão.
// ============================================================
function limparFormulario() {
    document.getElementById("form-projeto").reset();
    document.getElementById("id_projeto").value = "";
    document.getElementById("form-titulo-projeto").textContent = "Adicionar Novo Projeto";
    document.getElementById("btn-salvar-projeto").textContent = "Salvar Projeto";
}

// ============================================================
// FUNÇÃO: listarProjetos()
// 
// Busca os projetos da API e monta a tabela HTML dinamicamente.
// A API já filtra por usuário logado automaticamente (pela sessão).
// ============================================================
function listarProjetos() {
    // Faço a requisição GET para buscar os projetos
    fetch('../php/api_projetos.php')
        .then(response => response.json())
        .then(projetos => {
            // Pego a referência do corpo da tabela
            const tbody = document.getElementById("tabela-projetos-corpo");
            tbody.innerHTML = ""; // Limpo a tabela

            // Se não há projetos, mostro uma mensagem
            if (projetos.length === 0) {
                tbody.innerHTML = "<tr><td colspan='4'>Nenhum projeto cadastrado.</td></tr>";
                return;
            }

            // Para cada projeto, crio uma linha na tabela
            projetos.forEach(proj => {
                const tr = document.createElement("tr");
                // Uso || '-' para mostrar um traço quando a descrição é vazia
                tr.innerHTML = `
                    <td>${proj.nome}</td>
                    <td>${proj.descricao || '-'}</td>
                    <td>${proj.data_criacao_formatada}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editarProjeto(${proj.id}, '${escapeHtml(proj.nome)}', '${escapeHtml(proj.descricao || '')}')">Editar</button>
                        <button class="btn btn-delete" onclick="excluirProjeto(${proj.id}, '${escapeHtml(proj.nome)}')">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar projetos:', error);
        });
}

// ============================================================
// FUNÇÃO: escapeHtml()
// 
// Função de segurança para prevenir ataques XSS.
// Escapa caracteres especiais e quebras de linha.
// 
// Parâmetros:
// - text: string a ser escapada
// ============================================================
function escapeHtml(text) {
    if (!text) return ''; // Retorna vazio se não houver texto
    const div = document.createElement('div');
    div.textContent = text;
    // Escapa aspas simples e quebras de linha
    return div.innerHTML.replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

// ============================================================
// FUNÇÃO: editarProjeto()
// 
// Preenche o formulário com os dados do projeto para edição.
// 
// Parâmetros:
// - id: ID do projeto
// - nome: nome atual do projeto
// - descricao: descrição atual do projeto
// ============================================================
function editarProjeto(id, nome, descricao) {
    // Preencho os campos com os dados atuais
    document.getElementById("id_projeto").value = id;
    document.getElementById("nome_projeto").value = nome;
    document.getElementById("descricao_projeto").value = descricao;
    
    // Atualizo título e botão para indicar modo edição
    document.getElementById("form-titulo-projeto").textContent = "Editar Projeto";
    document.getElementById("btn-salvar-projeto").textContent = "Atualizar Projeto";
    // Rolo para o topo onde está o formulário
    window.scrollTo(0, 0);
}

// ============================================================
// FUNÇÃO: excluirProjeto()
// 
// Exclui um projeto após confirmação. ATENÇÃO: isso também
// exclui todas as tarefas associadas ao projeto (CASCADE).
// 
// Parâmetros:
// - id: ID do projeto a ser excluído
// - nome: nome do projeto (para mostrar no confirm)
// ============================================================
function excluirProjeto(id, nome) {
    // Aviso importante sobre a exclusão de tarefas associadas
    if (confirm(`Tem certeza que deseja excluir o projeto "${nome}"?\n\nTodas as tarefas associadas também serão excluídas!`)) {
        fetch(`../php/api_projetos.php?acao=excluir&id=${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Projeto excluído com sucesso!");
                listarProjetos();
            } else {
                alert("Erro ao excluir: " + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
        });
    }
}
