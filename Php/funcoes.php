<?php
/**
 * ============================================================
 * ARQUIVO: funcoes.php
 * DESCRIÇÃO: Funções utilitárias do sistema To-Do List
 * 
 * Este arquivo contém funções auxiliares que são usadas em
 * várias partes do sistema. Inclui funções para:
 * - Formatação de datas
 * - Cálculo de dias
 * - Verificação de prazos
 * ============================================================
 */

/**
 * ============================================================
 * FUNÇÃO: formatarDataBrasil()
 * 
 * Converte uma data do formato MySQL (YYYY-MM-DD) para o
 * formato brasileiro (DD/MM/YYYY). Pode incluir hora também.
 * 
 * Parâmetros:
 * - $data: data em formato MySQL
 * - $incluirHora: boolean para incluir hora (padrão: false)
 * 
 * Retorno: string com a data formatada
 * ============================================================
 */
function formatarDataBrasil($data, $incluirHora = false) {
    // Verifico se a data está vazia ou é uma data inválida do MySQL
    if (empty($data) || $data == '0000-00-00' || $data == '0000-00-00 00:00:00') {
        return 'Nao definida';
    }
    
    // Converto a string de data para timestamp
    $timestamp = strtotime($data);
    if ($timestamp === false) {
        return 'Data invalida';
    }
    
    // Formato a data conforme o parâmetro
    if ($incluirHora) {
        return date("d/m/Y H:i", $timestamp);
    } else {
        return date("d/m/Y", $timestamp);
    }
}

/**
 * ============================================================
 * FUNÇÃO: converterDataParaMySQL()
 * 
 * Converte uma data do formato brasileiro (DD/MM/YYYY) para
 * o formato MySQL (YYYY-MM-DD). Útil quando recebo dados
 * de formulários.
 * 
 * Parâmetros:
 * - $data: data em formato brasileiro
 * 
 * Retorno: string com a data no formato MySQL ou vazio se inválida
 * ============================================================
 */
function converterDataParaMySQL($data) {
    // Se a data está vazia, retorno vazio
    if (empty($data)) {
        return '';
    }
    
    // Removo caracteres que não sejam números ou barras
    $data = preg_replace('/[^0-9\/]/', '', $data);
    
    // Uso regex para extrair dia, mês e ano
    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $data, $matches)) {
        // Garanto que dia e mês tenham 2 dígitos
        $dia = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        $mes = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
        $ano = $matches[3];
        
        // Verifico se é uma data válida usando checkdate
        if (checkdate($mes, $dia, $ano)) {
            return "$ano-$mes-$dia";
        }
    }
    
    return '';
}

/**
 * ============================================================
 * FUNÇÃO: calcularDiferencaDias()
 * 
 * Calcula a diferença em dias entre duas datas. Se a segunda
 * data não for informada, usa a data atual.
 * 
 * Parâmetros:
 * - $dataInicio: data inicial
 * - $dataFim: data final (padrão: data atual)
 * 
 * Retorno: número de dias (positivo ou negativo)
 * ============================================================
 */
function calcularDiferencaDias($dataInicio, $dataFim = null) {
    // Se a data final não foi informada, uso hoje
    if ($dataFim === null) {
        $dataFim = date('Y-m-d');
    }
    
    // Crio objetos DateTime para calcular a diferença
    $inicio = new DateTime($dataInicio);
    $fim = new DateTime($dataFim);
    $diferenca = $inicio->diff($fim);
    
    // Retorno o número de dias, negativo se a data já passou
    return $diferenca->days * ($diferenca->invert ? -1 : 1);
}

/**
 * ============================================================
 * FUNÇÃO: formatarStatusTarefa()
 * 
 * Retorna o HTML do status da tarefa com a classe CSS apropriada
 * para colorir de acordo com o estado.
 * 
 * Parâmetros:
 * - $status: string com o status da tarefa
 * 
 * Retorno: HTML formatado com span e classe CSS
 * ============================================================
 */
function formatarStatusTarefa($status) {
    // Mapeamento de status para classes CSS
    $classes = array(
        'Pendente' => 'status-pendente',        // Amarelo
        'Em Andamento' => 'status-andamento',   // Azul
        'Concluida' => 'status-concluida'       // Verde
    );
    
    // Pego a classe correspondente ou uso uma padrão
    $classe = isset($classes[$status]) ? $classes[$status] : 'status-padrao';
    
    // Retorno o HTML formatado (htmlspecialchars previne XSS)
    return "<span class='" . $classe . "'>" . htmlspecialchars($status) . "</span>";
}

/**
 * ============================================================
 * FUNÇÃO: dataProximaVencimento()
 * 
 * Verifica se uma data limite está próxima (dentro de 3 dias).
 * Uso isso para mostrar alertas amarelos nas tarefas.
 * 
 * Parâmetros:
 * - $dataLimite: data limite da tarefa
 * 
 * Retorno: boolean (true se próxima, false se não)
 * ============================================================
 */
function dataProximaVencimento($dataLimite) {
    // Se não tem data limite, retorna falso
    if (empty($dataLimite)) {
        return false;
    }
    
    // Calculo quantos dias faltam
    $dias = calcularDiferencaDias(date('Y-m-d'), $dataLimite);
    // Retorna true se faltam 0 a 3 dias
    return $dias >= 0 && $dias <= 3;
}

/**
 * ============================================================
 * FUNÇÃO: dataVencida()
 * 
 * Verifica se uma data limite já passou (tarefa atrasada).
 * Uso isso para mostrar alertas vermelhos nas tarefas.
 * 
 * Parâmetros:
 * - $dataLimite: data limite da tarefa
 * 
 * Retorno: boolean (true se vencida, false se não)
 * ============================================================
 */
function dataVencida($dataLimite) {
    // Se não tem data limite, retorna falso
    if (empty($dataLimite)) {
        return false;
    }
    
    // Se a diferença é negativa, a data já passou
    return calcularDiferencaDias(date('Y-m-d'), $dataLimite) < 0;
}
?>
