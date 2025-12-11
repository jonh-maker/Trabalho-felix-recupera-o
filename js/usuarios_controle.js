/**
 * ============================================================
 * ARQUIVO: usuarios_controle.js
 * DESCRIÇÃO: Controlador CRUD completo para gerenciamento de usuários
 * 
 * Este arquivo implementa todas as operações de CRUD (Create, Read,
 * Update, Delete) para usuários. Ele se comunica com a API PHP
 * para persistir os dados no banco de dados MySQL.
 * 
 * Funcionalidades:
 * - Listar todos os usuários
 * - Pesquisar usuários por nome ou email
 * - Cadastrar novos usuários
 * - Editar usuários existentes
 * - Excluir usuários
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Quando a página carrega, inicio o sistema
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Carrego a lista de usuários ao iniciar a página
    listarUsuarios();

    // Pego as referências dos elementos do formulário
    const form = document.getElementById("form-usuario");
    const btnPesquisar = document.getElementById("btn-pesquisar");
    const inputPesquisa = document.getElementById("pesquisa-usuario");

    // ============================================================
    // EVENTO: Submit do Formulário (Adicionar ou Editar)
    // O mesmo formulário serve para criar e atualizar usuários
    // A diferença é se o campo id_usuario tem valor ou não
    // ============================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Capturo os valores de todos os campos
        const id = document.getElementById("id_usuario").value;
        const nome = document.getElementById("nome_usuario").value;
        const email = document.getElementById("email_usuario").value;
        const senha = document.getElementById("senha_usuario").value;
        const confirmarSenha = document.getElementById("confirmar_senha_usuario").value;
        const endereco = document.getElementById("endereco_usuario").value;
        const cidade = document.getElementById("cidade_usuario").value;
        const telefone = document.getElementById("telefone_usuario").value;

        // Valido se as senhas coincidem (se uma senha foi digitada)
        if (senha && senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        // Monto o objeto com os dados para enviar
        const dados = { 
            id: id, 
            nome: nome, 
            email: email,
            endereco: endereco,
            cidade: cidade,
            telefone: telefone
        };
        
        // Só adiciono a senha se foi preenchida
        if (senha) {
            dados.senha = senha;
        }

        // Envio os dados para a API via POST
        fetch('../php/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Sucesso! Mostro mensagem apropriada (diferente para criar/atualizar)
                alert(id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
                // Limpo o formulário e recarrego a lista
                limparFormulario();
                listarUsuarios();
            } else {
                // Mostro o erro retornado pela API
                alert("Erro: " + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
        });
    });

    // ============================================================
    // EVENTO: Clique no Botão Pesquisar
    // ============================================================
    btnPesquisar.addEventListener("click", function () {
        const termo = inputPesquisa.value;
        // Chamo a função de listar passando o termo de pesquisa
        listarUsuarios(termo);
    });

    // ============================================================
    // EVENTO: Pressionar Enter no campo de pesquisa
    // Para facilitar a usabilidade
    // ============================================================
    inputPesquisa.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const termo = inputPesquisa.value;
            listarUsuarios(termo);
        }
    });

    // ============================================================
    // EVENTO: Botão Limpar Pesquisa
    // Limpa o campo e recarrega todos os usuários
    // ============================================================
    const btnLimpar = document.getElementById("btn-limpar-pesquisa");
    if (btnLimpar) {
        btnLimpar.addEventListener("click", function () {
            inputPesquisa.value = "";
            listarUsuarios(); // Sem parâmetro = todos os usuários
        });
    }
});

// ============================================================
// FUNÇÃO: limparFormulario()
// 
// Reseta o formulário para o estado inicial (modo cadastro).
// Também mudo os textos do título e botão, e reabilito
// os campos de senha como obrigatórios.
// ============================================================
function limparFormulario() {
    document.getElementById("form-usuario").reset();
    document.getElementById("id_usuario").value = "";
    document.getElementById("form-titulo").textContent = "Cadastrar Novo Usuário";
    document.getElementById("btn-salvar").textContent = "Cadastrar Usuário";
    // Senha volta a ser obrigatória para novo cadastro
    document.getElementById("senha_usuario").required = true;
    document.getElementById("confirmar_senha_usuario").required = true;
    // Escondo o aviso sobre manter senha
    document.getElementById("aviso-senha").style.display = "none";
}

// ============================================================
// FUNÇÃO: listarUsuarios()
// 
// Busca os usuários da API e monta a tabela HTML dinamicamente.
// Se receber um parâmetro de pesquisa, filtra os resultados.
// 
// Parâmetros:
// - pesquisa (opcional): termo para filtrar usuários
// ============================================================
function listarUsuarios(pesquisa = "") {
    // Monto a URL da API (com ou sem parâmetro de pesquisa)
    let url = '../php/api_usuarios.php';
    if (pesquisa) {
        // encodeURIComponent garante que caracteres especiais sejam codificados
        url += '?pesquisa=' + encodeURIComponent(pesquisa);
    }

    // Faço a requisição GET para buscar os usuários
    fetch(url)
        .then(response => response.json())
        .then(usuarios => {
            // Pego a referência do corpo da tabela
            const tbody = document.getElementById("tabela-usuarios-corpo");
            tbody.innerHTML = ""; // Limpo a tabela

            // Se não há usuários, mostro uma mensagem
            if (usuarios.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6'>Nenhum usuário encontrado.</td></tr>";
                return;
            }

            // Para cada usuário, crio uma linha na tabela
            usuarios.forEach(user => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>${user.endereco_completo || '-'}</td>
                    <td>${user.telefone || '-'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editarUsuario(${user.id})">Editar</button>
                        <button class="btn btn-delete" onclick="excluirUsuario(${user.id}, '${escapeHtml(user.nome)}')">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
        });
}

// ============================================================
// FUNÇÃO: escapeHtml()
// 
// Função de segurança para evitar ataques XSS (Cross-Site Scripting).
// Converte caracteres especiais em entidades HTML.
// Também escapa aspas simples para uso em atributos onclick.
// 
// Parâmetros:
// - text: string a ser escapada
// ============================================================
function escapeHtml(text) {
    // Crio um elemento temporário para usar o escape nativo do navegador
    const div = document.createElement('div');
    div.textContent = text;
    // Também substituo aspas simples para não quebrar os atributos onclick
    return div.innerHTML.replace(/'/g, "\\'");
}

// ============================================================
// FUNÇÃO: editarUsuario()
// 
// Busca os dados do usuário da API e preenche o formulário para edição.
// Mudo o título e botão para indicar modo de edição.
// A senha fica opcional na edição (deixar em branco mantém a atual).
// 
// Parâmetros:
// - id: ID do usuário
// ============================================================
function editarUsuario(id) {
    // Busco os dados atualizados do usuário da API
    fetch('../php/api_usuarios.php')
        .then(response => response.json())
        .then(usuarios => {
            const user = usuarios.find(u => u.id == id);
            if (user) {
                // Preencho os campos do formulário com os dados atuais
                document.getElementById("id_usuario").value = user.id;
                document.getElementById("nome_usuario").value = user.nome;
                document.getElementById("email_usuario").value = user.email;
                document.getElementById("endereco_usuario").value = user.endereco || '';
                document.getElementById("cidade_usuario").value = user.cidade || '';
                document.getElementById("telefone_usuario").value = user.telefone || '';
                // Limpo os campos de senha
                document.getElementById("senha_usuario").value = "";
                document.getElementById("confirmar_senha_usuario").value = "";
                
                // Na edição, a senha não é obrigatória (pode manter a atual)
                document.getElementById("senha_usuario").required = false;
                document.getElementById("confirmar_senha_usuario").required = false;
                // Mostro o aviso explicando isso
                document.getElementById("aviso-senha").style.display = "block";
                
                // Mudo o título e texto do botão para indicar modo edição
                document.getElementById("form-titulo").textContent = "Editar Usuário";
                document.getElementById("btn-salvar").textContent = "Atualizar Usuário";
                // Rolo a página para o topo onde está o formulário
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar usuário:', error);
            alert("Erro ao carregar dados do usuário");
        });
}

// ============================================================
// FUNÇÃO: excluirUsuario()
// 
// Exclui um usuário após confirmação. Envia requisição POST
// para a API com a ação de exclusão.
// 
// Parâmetros:
// - id: ID do usuário a ser excluído
// - nome: nome do usuário (para mostrar no confirm)
// ============================================================
function excluirUsuario(id, nome) {
    // Peço confirmação antes de excluir (ação irreversível!)
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?\n\nEsta ação não pode ser desfeita!`)) {
        // Envio a requisição de exclusão
        // Passo a ação e id como parâmetros na URL (query string)
        fetch(`../php/api_usuarios.php?acao=excluir&id=${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Usuário excluído com sucesso!");
                // Recarrego a lista para refletir a exclusão
                listarUsuarios();
            } else {
                alert("Erro ao excluir: " + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
        });
    }
}/**
 * ============================================================
 * ARQUIVO: usuarios_controle.js
 * DESCRIÇÃO: Controlador CRUD completo para gerenciamento de usuários
 * 
 * Este arquivo implementa todas as operações de CRUD (Create, Read,
 * Update, Delete) para usuários. Ele se comunica com a API PHP
 * para persistir os dados no banco de dados MySQL.
 * 
 * Funcionalidades:
 * - Listar todos os usuários
 * - Pesquisar usuários por nome ou email
 * - Cadastrar novos usuários
 * - Editar usuários existentes
 * - Excluir usuários
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Quando a página carrega, inicio o sistema
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Carrego a lista de usuários ao iniciar a página
    listarUsuarios();

    // Pego as referências dos elementos do formulário
    const form = document.getElementById("form-usuario");
    const btnPesquisar = document.getElementById("btn-pesquisar");
    const inputPesquisa = document.getElementById("pesquisa-usuario");

    // ============================================================
    // EVENTO: Submit do Formulário (Adicionar ou Editar)
    // O mesmo formulário serve para criar e atualizar usuários
    // A diferença é se o campo id_usuario tem valor ou não
    // ============================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Capturo os valores de todos os campos
        const id = document.getElementById("id_usuario").value;
        const nome = document.getElementById("nome_usuario").value;
        const email = document.getElementById("email_usuario").value;
        const senha = document.getElementById("senha_usuario").value;
        const confirmarSenha = document.getElementById("confirmar_senha_usuario").value;
        const endereco = document.getElementById("endereco_usuario").value;
        const cidade = document.getElementById("cidade_usuario").value;
        const telefone = document.getElementById("telefone_usuario").value;

        // Valido se as senhas coincidem (se uma senha foi digitada)
        if (senha && senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        // Monto o objeto com os dados para enviar
        const dados = { 
            id: id, 
            nome: nome, 
            email: email,
            endereco: endereco,
            cidade: cidade,
            telefone: telefone
        };
        
        // Só adiciono a senha se foi preenchida
        if (senha) {
            dados.senha = senha;
        }

        // Envio os dados para a API via POST
        fetch('../php/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Sucesso! Mostro mensagem apropriada (diferente para criar/atualizar)
                alert(id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
                // Limpo o formulário e recarrego a lista
                limparFormulario();
                listarUsuarios();
            } else {
                // Mostro o erro retornado pela API
                alert("Erro: " + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
        });
    });

    // ============================================================
    // EVENTO: Clique no Botão Pesquisar
    // ============================================================
    btnPesquisar.addEventListener("click", function () {
        const termo = inputPesquisa.value;
        // Chamo a função de listar passando o termo de pesquisa
        listarUsuarios(termo);
    });

    // ============================================================
    // EVENTO: Pressionar Enter no campo de pesquisa
    // Para facilitar a usabilidade
    // ============================================================
    inputPesquisa.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const termo = inputPesquisa.value;
            listarUsuarios(termo);
        }
    });

    // ============================================================
    // EVENTO: Botão Limpar Pesquisa
    // Limpa o campo e recarrega todos os usuários
    // ============================================================
    const btnLimpar = document.getElementById("btn-limpar-pesquisa");
    if (btnLimpar) {
        btnLimpar.addEventListener("click", function () {
            inputPesquisa.value = "";
            listarUsuarios(); // Sem parâmetro = todos os usuários
        });
    }
});

// ============================================================
// FUNÇÃO: limparFormulario()
// 
// Reseta o formulário para o estado inicial (modo cadastro).
// Também mudo os textos do título e botão, e reabilito
// os campos de senha como obrigatórios.
// ============================================================
function limparFormulario() {
    document.getElementById("form-usuario").reset();
    document.getElementById("id_usuario").value = "";
    document.getElementById("form-titulo").textContent = "Cadastrar Novo Usuário";
    document.getElementById("btn-salvar").textContent = "Cadastrar Usuário";
    // Senha volta a ser obrigatória para novo cadastro
    document.getElementById("senha_usuario").required = true;
    document.getElementById("confirmar_senha_usuario").required = true;
    // Escondo o aviso sobre manter senha
    document.getElementById("aviso-senha").style.display = "none";
}

// ============================================================
// FUNÇÃO: listarUsuarios()
// 
// Busca os usuários da API e monta a tabela HTML dinamicamente.
// Se receber um parâmetro de pesquisa, filtra os resultados.
// 
// Parâmetros:
// - pesquisa (opcional): termo para filtrar usuários
// ============================================================
function listarUsuarios(pesquisa = "") {
    // Monto a URL da API (com ou sem parâmetro de pesquisa)
    let url = '../php/api_usuarios.php';
    if (pesquisa) {
        // encodeURIComponent garante que caracteres especiais sejam codificados
        url += '?pesquisa=' + encodeURIComponent(pesquisa);
    }

    // Faço a requisição GET para buscar os usuários
    fetch(url)
        .then(response => response.json())
        .then(usuarios => {
            // Pego a referência do corpo da tabela
            const tbody = document.getElementById("tabela-usuarios-corpo");
            tbody.innerHTML = ""; // Limpo a tabela

            // Se não há usuários, mostro uma mensagem
            if (usuarios.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6'>Nenhum usuário encontrado.</td></tr>";
                return;
            }

            // Para cada usuário, crio uma linha na tabela
            usuarios.forEach(user => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>${user.endereco_completo || '-'}</td>
                    <td>${user.telefone || '-'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editarUsuario(${user.id})">Editar</button>
                        <button class="btn btn-delete" onclick="excluirUsuario(${user.id}, '${escapeHtml(user.nome)}')">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
        });
}

// ============================================================
// FUNÇÃO: escapeHtml()
// 
// Função de segurança para evitar ataques XSS (Cross-Site Scripting).
// Converte caracteres especiais em entidades HTML.
// Também escapa aspas simples para uso em atributos onclick.
// 
// Parâmetros:
// - text: string a ser escapada
// ============================================================
function escapeHtml(text) {
    // Crio um elemento temporário para usar o escape nativo do navegador
    const div = document.createElement('div');
    div.textContent = text;
    // Também substituo aspas simples para não quebrar os atributos onclick
    return div.innerHTML.replace(/'/g, "\\'");
}

// ============================================================
// FUNÇÃO: editarUsuario()
// 
// Busca os dados do usuário da API e preenche o formulário para edição.
// Mudo o título e botão para indicar modo de edição.
// A senha fica opcional na edição (deixar em branco mantém a atual).
// 
// Parâmetros:
// - id: ID do usuário
// ============================================================
function editarUsuario(id) {
    // Busco os dados atualizados do usuário da API
    fetch('../php/api_usuarios.php')
        .then(response => response.json())
        .then(usuarios => {
            const user = usuarios.find(u => u.id == id);
            if (user) {
                // Preencho os campos do formulário com os dados atuais
                document.getElementById("id_usuario").value = user.id;
                document.getElementById("nome_usuario").value = user.nome;
                document.getElementById("email_usuario").value = user.email;
                document.getElementById("endereco_usuario").value = user.endereco || '';
                document.getElementById("cidade_usuario").value = user.cidade || '';
                document.getElementById("telefone_usuario").value = user.telefone || '';
                // Limpo os campos de senha
                document.getElementById("senha_usuario").value = "";
                document.getElementById("confirmar_senha_usuario").value = "";
                
                // Na edição, a senha não é obrigatória (pode manter a atual)
                document.getElementById("senha_usuario").required = false;
                document.getElementById("confirmar_senha_usuario").required = false;
                // Mostro o aviso explicando isso
                document.getElementById("aviso-senha").style.display = "block";
                
                // Mudo o título e texto do botão para indicar modo edição
                document.getElementById("form-titulo").textContent = "Editar Usuário";
                document.getElementById("btn-salvar").textContent = "Atualizar Usuário";
                // Rolo a página para o topo onde está o formulário
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar usuário:', error);
            alert("Erro ao carregar dados do usuário");
        });
}

// ============================================================
// FUNÇÃO: excluirUsuario()
// 
// Exclui um usuário após confirmação. Envia requisição POST
// para a API com a ação de exclusão.
// 
// Parâmetros:
// - id: ID do usuário a ser excluído
// - nome: nome do usuário (para mostrar no confirm)
// ============================================================
function excluirUsuario(id, nome) {
    // Peço confirmação antes de excluir (ação irreversível!)
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?\n\nEsta ação não pode ser desfeita!`)) {
        // Envio a requisição de exclusão
        // Passo a ação e id como parâmetros na URL (query string)
        fetch(`../php/api_usuarios.php?acao=excluir&id=${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Usuário excluído com sucesso!");
                // Recarrego a lista para refletir a exclusão
                listarUsuarios();
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
