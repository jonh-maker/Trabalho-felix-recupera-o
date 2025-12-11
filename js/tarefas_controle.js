/**
 * ============================================================
 * ARQUIVO: tarefas_controle.js
 * DESCRIÇÃO: Controlador CRUD para gerenciamento de tarefas
 * 
 * Este arquivo gerencia todas as operações de CRUD para tarefas.
 * Cada tarefa pertence a um projeto e possui:
 * - Título e descrição
 * - Data limite (para controle de prazos)
 * - Status (Pendente, Em Andamento, Concluída)
 * 
 * Funcionalidades especiais:
 * - Alerta visual para tarefas vencidas (vermelho)
 * - Alerta para tarefas próximas do vencimento (amarelo)
 * - Contador de dias restantes/atrasados
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Ao carregar a página, inicio o sistema
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Primeiro carrego os projetos para popular o select
    carregarProjetos();
    // Depois carrego a lista de tarefas
    listarTarefas();

    // Pego a referência do formulário
    const form = document.getElementById("form-tarefa");

    // ============================================================
    // EVENTO: Submit do Formulário (Adicionar ou Editar)
    // ============================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Capturo todos os valores dos campos
        const id = document.getElementById("id_tarefa").value;
        const titulo = document.getElementById("titulo_tarefa").value;
        const descricao = document.getElementById("descricao_tarefa").value;
        const projeto_id = document.getElementById("projeto_id").value;
        const data_limite = document.getElementById("data_limite").value;
        const status = document.getElementById("status").value;

        // Monto o objeto com os dados
        const dados = { 
            id: id, 
            titulo: titulo, 
            descricao: descricao,
            projeto_id: projeto_id,
            data_limite: data_limite,
            status: status
        };

        // Envio para a API via POST
        fetch('../php/api_tarefas.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert(id ? "Tarefa atualizada com sucesso!" : "Tarefa salva com sucesso!");
                limparFormulario();
                listarTarefas();
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
// FUNÇÃO: carregarProjetos()
// 
// Busca os projetos da API para popular o select do formulário.
// O usuário precisa selecionar um projeto para associar a tarefa.
// ============================================================
function carregarProjetos() {
    // Passo tipo=projetos para a API retornar apenas os projetos
    fetch('../php/api_tarefas.php?tipo=projetos')
        .then(response => response.json())
        .then(projetos => {
            // Pego a referência do select
            const select = document.getElementById("projeto_id");
            // Reseto o select com a opção padrão
            select.innerHTML = '<option value="">Selecione um projeto</option>';
            
            // Adiciono cada projeto como uma opção
            projetos.forEach(proj => {
                const option = document.createElement("option");
                option.value = proj.id;
                option.textContent = proj.nome;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar projetos:', error);
        });
}

// ============================================================
// FUNÇÃO: limparFormulario()
// 
// Reseta o formulário para o estado inicial (modo criação).
// ============================================================
function limparFormulario() {
    document.getElementById("form-tarefa").reset();
    document.getElementById("id_tarefa").value = "";
    document.getElementById("form-titulo-tarefa").textContent = "Adicionar Nova Tarefa";
    document.getElementById("btn-salvar-tarefa").textContent = "Salvar Tarefa";
}

// ============================================================
// FUNÇÃO: listarTarefas()
// 
// Busca as tarefas da API e monta a tabela HTML dinamicamente.
// Esta função também implementa os alertas visuais de vencimento.
// ============================================================
function listarTarefas() {
    fetch('../php/api_tarefas.php')
        .then(response => response.json())
        .then(tarefas => {
            const tbody = document.getElementById("tabela-tarefas-corpo");
            tbody.innerHTML = "";

            if (tarefas.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5'>Nenhuma tarefa cadastrada.</td></tr>";
                return;
            }

            // Para cada tarefa, crio uma linha na tabela
            tarefas.forEach(tarefa => {
                const tr = document.createElement("tr");
                
                // ============================================
                // DESTAQUE VISUAL PARA TAREFAS VENCIDAS/PRÓXIMAS
                // Adiciono classes CSS para colorir a linha
                // ============================================
                if (tarefa.vencida) {
                    // Tarefa atrasada - fica com fundo vermelho claro
                    tr.classList.add('tarefa-vencida');
                } else if (tarefa.proxima) {
                    // Tarefa próxima do vencimento (3 dias) - fundo amarelo
                    tr.classList.add('tarefa-proxima-vencimento');
                }

                // ============================================
                // BADGES DE ALERTA
                // Mostro indicadores visuais na coluna da tarefa
                // ============================================
                let alertaVencimento = '';
                if (tarefa.vencida) {
                    alertaVencimento = '<span class="alerta-vencida">⚠️ VENCIDA</span>';
                } else if (tarefa.proxima) {
                    alertaVencimento = '<span class="alerta-proxima">🔔 PRÓXIMA</span>';
                }

                // ============================================
                // INFORMAÇÃO DE DIAS
                // Mostro quantos dias faltam ou há quanto tempo atrasou
                // ============================================
                let infoDias = '';
                if (tarefa.dias_restantes !== null) {
                    if (tarefa.dias_restantes < 0) {
                        // Tarefa atrasada - mostro há quantos dias
                        infoDias = `<br><small>(${Math.abs(tarefa.dias_restantes)} dias atrás)</small>`;
                    } else if (tarefa.dias_restantes === 0) {
                        // Vence hoje
                        infoDias = '<br><small>(Hoje)</small>';
                    } else {
                        // Dias restantes
                        infoDias = `<br><small>(${tarefa.dias_restantes} dias restantes)</small>`;
                    }
                }

                // ============================================
                // CLASSES CSS PARA O STATUS
                // Cada status tem uma cor diferente
                // ============================================
                const statusClass = {
                    'Pendente': 'status-pendente',      // Amarelo
                    'Em Andamento': 'status-andamento', // Azul
                    'Concluída': 'status-concluida'     // Verde
                };

                // Monto o HTML da linha
                tr.innerHTML = `
                    <td>
                        ${escapeHtml(tarefa.titulo)}
                        ${alertaVencimento}
                    </td>
                    <td>${escapeHtml(tarefa.nome_projeto)}</td>
                    <td>${tarefa.data_limite_formatada}${infoDias}</td>
                    <td><span class="${statusClass[tarefa.status] || ''}">${tarefa.status}</span></td>
                    <td>
                        <button class="btn btn-edit" onclick="editarTarefa(${tarefa.id}, '${escapeHtml(tarefa.titulo)}', '${escapeHtml(tarefa.descricao || '')}', ${tarefa.projeto_id}, '${tarefa.data_limite || ''}', '${tarefa.status}')">Editar</button>
                        <button class="btn btn-delete" onclick="excluirTarefa(${tarefa.id}, '${escapeHtml(tarefa.titulo)}')">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar tarefas:', error);
        });
}

// ============================================================
// FUNÇÃO: escapeHtml()
// 
// Função de segurança para prevenir ataques XSS.
// ============================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

// ============================================================
// FUNÇÃO: editarTarefa()
// 
// Preenche o formulário com os dados da tarefa para edição.
// 
// Parâmetros:
// - id: ID da tarefa
// - titulo: título atual
// - descricao: descrição atual
// - projeto_id: ID do projeto associado
// - data_limite: data limite (formato YYYY-MM-DD)
// - status: status atual da tarefa
// ============================================================
function editarTarefa(id, titulo, descricao, projeto_id, data_limite, status) {
    // Preencho todos os campos do formulário
    document.getElementById("id_tarefa").value = id;
    document.getElementById("titulo_tarefa").value = titulo;
    document.getElementById("descricao_tarefa").value = descricao;
    document.getElementById("projeto_id").value = projeto_id;
    document.getElementById("data_limite").value = data_limite;
    document.getElementById("status").value = status;
    
    // Atualizo título e botão para modo edição
    document.getElementById("form-titulo-tarefa").textContent = "Editar Tarefa";
    document.getElementById("btn-salvar-tarefa").textContent = "Atualizar Tarefa";
    window.scrollTo(0, 0);
}

// ============================================================
// FUNÇÃO: excluirTarefa()
// 
// Exclui uma tarefa após confirmação.
// 
// Parâmetros:
// - id: ID da tarefa
// - titulo: título da tarefa (para mostrar no confirm)
// ============================================================
function excluirTarefa(id, titulo) {
    if (confirm(`Tem certeza que deseja excluir a tarefa "${titulo}"?`)) {
        fetch(`../php/api_tarefas.php?acao=excluir&id=${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Tarefa excluída com sucesso!");
                listarTarefas();
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
