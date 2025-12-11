/**
 * ============================================================
 * ARQUIVO: cadastro_controle.js
 * DESCRIÇÃO: Controlador da página de cadastro de novos usuários
 * 
 * Este arquivo gerencia todo o processo de registro de novos
 * usuários no sistema. Eu implementei validações tanto no
 * frontend (aqui) quanto no backend (PHP) para garantir
 * segurança e boa experiência do usuário.
 * ============================================================
 */

// ============================================================
// EVENTO: DOMContentLoaded
// Quando a página termina de carregar, inicio o controlador
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Pego a referência do formulário de cadastro
    const form = document.getElementById("form-cadastro");

    // ============================================================
    // EVENTO: Submit do Formulário
    // Intercepto o envio do formulário para validar e enviar via AJAX
    // ============================================================
    form.addEventListener("submit", function (e) {
        // Previno o comportamento padrão (recarregar a página)
        e.preventDefault();

        // Capturo todos os valores dos campos do formulário
        // O .trim() remove espaços em branco no início e fim
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmar_senha = document.getElementById("confirmar_senha").value;
        const data_nasc = document.getElementById("data_nasc").value;

        // ========== VALIDAÇÕES NO FRONTEND ==========
        // Faço validações aqui para dar feedback imediato ao usuário
        // sem precisar esperar a resposta do servidor

        // --------------------------------------------
        // VALIDAÇÃO DO NOME
        // Regras: mínimo 3 caracteres, apenas letras e espaços
        // --------------------------------------------
        if (nome.length < 3) {
            alert("O nome deve ter pelo menos 3 caracteres!");
            document.getElementById("nome").focus(); // Foco no campo com erro
            return; // Interrompo a execução
        }
        // Uso regex para verificar se contém apenas letras (incluindo acentos) e espaços
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
            alert("O nome deve conter apenas letras e espaços!");
            document.getElementById("nome").focus();
            return;
        }

        // --------------------------------------------
        // VALIDAÇÃO DO EMAIL
        // Regras: obrigatório e formato válido
        // --------------------------------------------
        if (!email) {
            alert("O email é obrigatório!");
            document.getElementById("email").focus();
            return;
        }
        // Regex para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Digite um email válido! (exemplo: usuario@email.com)");
            document.getElementById("email").focus();
            return;
        }

        // --------------------------------------------
        // VALIDAÇÃO DA DATA DE NASCIMENTO
        // Regras: obrigatória, pessoa deve ter entre 10 e 120 anos
        // --------------------------------------------
        if (!data_nasc) {
            alert("A data de nascimento é obrigatória!");
            document.getElementById("data_nasc").focus();
            return;
        }
        
        // Calculo a idade do usuário
        const dataNasc = new Date(data_nasc);
        const hoje = new Date();
        // Fórmula para calcular idade em anos
        const idade = Math.floor((hoje - dataNasc) / (365.25 * 24 * 60 * 60 * 1000));
        
        // Verifico se a data não é no futuro
        if (dataNasc >= hoje) {
            alert("A data de nascimento deve ser anterior a hoje!");
            document.getElementById("data_nasc").focus();
            return;
        }
        // Verifico idade mínima (10 anos)
        if (idade < 10) {
            alert("Você deve ter pelo menos 10 anos para se cadastrar!");
            document.getElementById("data_nasc").focus();
            return;
        }
        // Verifico idade máxima razoável (120 anos)
        if (idade > 120) {
            alert("Data de nascimento inválida!");
            document.getElementById("data_nasc").focus();
            return;
        }

        // --------------------------------------------
        // VALIDAÇÃO DA SENHA
        // Regras: mínimo 4 caracteres, confirmação deve coincidir
        // --------------------------------------------
        if (senha.length < 4) {
            alert("A senha deve ter pelo menos 4 caracteres!");
            document.getElementById("senha").focus();
            return;
        }

        // Verifico se a confirmação de senha coincide
        if (senha !== confirmar_senha) {
            alert("As senhas não coincidem!");
            document.getElementById("confirmar_senha").focus();
            return;
        }

        // ========== ENVIO DOS DADOS ==========
        // Se todas as validações passaram, preparo os dados para envio
        const dados = { 
            nome: nome, 
            email: email, 
            senha: senha,
            confirmar_senha: confirmar_senha,
            data_nasc: data_nasc
        };

        // Mostro feedback visual de loading para o usuário
        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = "Cadastrando...";
        btnSubmit.disabled = true; // Desabilito para evitar cliques duplos

        // Envio os dados para a API via POST usando fetch
        fetch('../php/api_cadastro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indico que estou enviando JSON
            },
            body: JSON.stringify(dados) // Converto o objeto para string JSON
        })
        .then(response => response.json()) // Converto a resposta para JSON
        .then(data => {
            if (data.sucesso) {
                // Cadastro realizado com sucesso!
                alert(data.mensagem);
                // Redireciono para a página de login
                window.location.href = "login.html";
            } else {
                // Houve algum erro no cadastro
                alert("Erro: " + data.erro);
                // Restauro o botão para permitir nova tentativa
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            // Erro de comunicação com o servidor
            console.error('Erro:', error);
            alert("Erro ao comunicar com o servidor");
            // Restauro o botão
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        });
    });
});
