/**
 * ============================================================
 * ARQUIVO: categorias_controle.js
 * DESCRIÇÃO: Controlador CRUD para gerenciamento de categorias
 * 
 * Este arquivo gerencia as operações CRUD para categorias.
 * Cada categoria tem um nome e uma cor personalizada que
 * pode ser usada para organizar visualmente as tarefas.
 * 
 * Funcionalidades:
 * - Listar categorias
 * - Criar novas categorias com cor personalizada
 * - Editar categorias existentes
 * - Excluir categorias
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Ao carregar a página, inicio o sistema
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Carrego a lista de categorias ao iniciar
    listarCategorias();

    // Pego a referência do formulário
    const form = document.getElementById("form-categoria");

    // ============================================================
    // EVENTO: Submit do Formulário (Adicionar ou Editar)
    // ============================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Capturo os valores dos campos
        const id = document.getElementById("id_categoria").value;
        const nome = document.getElementById("nome_categoria").value;
        const cor = document.getElementById("cor_categoria").value;

        // Monto o objeto com os dados
        const dados = { id: id, nome: nome, cor: cor };

        // Envio para a API via POST
        fetch('../php/api_categorias.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Salvo com sucesso!");
                // Limpo o formulário manualmente
                form.reset();
                document.getElementById("id_categoria").value = "";
                // Restauro os textos originais
                document.getElementById("form-titulo").textContent = "Adicionar Nova Categoria";
                document.getElementById("btn-salvar").textContent = "Salvar Categoria";
                // Recarrego a lista
                listarCategorias();
            } else {
                alert("Erro: " + data.erro);
            }
        })
        .catch(error => console.error('Erro:', error));
    });
});

// ============================================================
// FUNÇÃO: listarCategorias()
// 
// Busca as categorias da API e monta a tabela HTML.
// Cada categoria é exibida com uma amostra visual da cor.
// ============================================================
function listarCategorias() {
    fetch('../php/api_categorias.php')
        .then(response => response.json())
        .then(categorias => {
            const tbody = document.getElementById("tabela-categorias-corpo");
            tbody.innerHTML = ""; // Limpo a tabela

            // Se não há categorias, mostro mensagem
            if (categorias.length === 0) {
                tbody.innerHTML = "<tr><td colspan='3'>Nenhuma categoria cadastrada.</td></tr>";
                return;
            }

            // Para cada categoria, crio uma linha
            categorias.forEach(cat => {
                const tr = document.createElement("tr");
                // Uso o color-swatch para mostrar uma amostra visual da cor
                tr.innerHTML = `
                    <td>${cat.nome}</td>
                    <td>
                        <span class="color-swatch" style="background-color: ${cat.cor};"></span>
                        ${cat.cor}
                    </td>
                    <td>
                        <button class="btn btn-edit" onclick="editarCategoria(${cat.id}, '${cat.nome}', '${cat.cor}')">Editar</button>
                        <button class="btn btn-delete" onclick="excluirCategoria(${cat.id})">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// ============================================================
// FUNÇÃO: editarCategoria()
// 
// Preenche o formulário com os dados da categoria para edição.
// O input type="color" é preenchido automaticamente.
// 
// Parâmetros:
// - id: ID da categoria
// - nome: nome atual
// - cor: cor atual (formato hexadecimal #RRGGBB)
// ============================================================
function editarCategoria(id, nome, cor) {
    // Preencho os campos
    document.getElementById("id_categoria").value = id;
    document.getElementById("nome_categoria").value = nome;
    document.getElementById("cor_categoria").value = cor;
    
    // Atualizo título e botão
    document.getElementById("form-titulo").textContent = "Editar Categoria";
    document.getElementById("btn-salvar").textContent = "Atualizar Categoria";
    // Rolo para o formulário
    window.scrollTo(0, 0);
}

// ============================================================
// FUNÇÃO: excluirCategoria()
// 
// Exclui uma categoria após confirmação.
// 
// Parâmetros:
// - id: ID da categoria a ser excluída
// ============================================================
function excluirCategoria(id) {
    // Peço confirmação
    if (confirm("Tem certeza que deseja excluir?")) {
        // Envio a requisição de exclusão
        fetch(`../php/api_categorias.php?acao=excluir&id=${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Recarrego a lista
                listarCategorias();
            } else {
                alert("Erro ao excluir.");
            }
        });
    }
}
