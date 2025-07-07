// Variável global para armazenar solicitações
let requests = [];

function showTab(tabName, event) {
    // Remove active class from all tabs and buttons
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab and activate button
    document.getElementById(tabName).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function submitRequest() {
    const descricao = document.getElementById('descricao').value;
    const valorInput = document.getElementById('valor').value;
    
    if (!descricao || !valorInput) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Converter valor brasileiro para float
    const valor = parseFloatBR(valorInput);
    
    if (valor <= 0) {
        alert('Por favor, insira um valor válido maior que zero.');
        return;
    }
    
    // Criar objeto da solicitação
    const newRequest = {
        id: requests.length + 1,
        descricao: descricao,
        valor: valor,
        status: 'Pendente',
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR')
    };
    
    // Adicionar à variável global
    requests.push(newRequest);
    
    // Atualizar todas as listagens na interface
    updateAllLists();
    
    // Simular envio da solicitação
    alert(`Solicitação #${newRequest.id} criada com sucesso!\nDescrição: ${descricao}\nValor: R$ ${valorInput}`);
    
    // Log para debug
    console.log('Solicitação adicionada:', newRequest);
    console.log('Total de solicitações:', requests.length);
    
    // Limpar formulário
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    
    // Fechar modal
    closeModal('requestModal');
}

// Função para atualizar a listagem de solicitações
function updateRequestsList() {
    const requestsList = document.querySelector('#solicitante .feature-list');
    
    if (!requestsList) return;
    
    // Limpar lista atual
    requestsList.innerHTML = '';
    
    // Se não há solicitações, mostrar mensagem
    if (requests.length === 0) {
        requestsList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic;">Nenhuma solicitação encontrada</li>';
        return;
    }
    
    // Ordenar solicitações por data/hora de criação (mais recentes primeiro)
    const sortedRequests = [...requests].sort((a, b) => {
        const dateA = new Date(`${a.data} ${a.hora}`);
        const dateB = new Date(`${b.data} ${b.hora}`);
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
    // Adicionar cada solicitação à lista
    sortedRequests.forEach(request => {
        const listItem = document.createElement('li');
        
        // Definir classe do status
        let statusClass = 'status-pending';
        if (request.status === 'Aprovada') statusClass = 'status-approved';
        if (request.status === 'Executada') statusClass = 'status-executive';
        
        listItem.innerHTML = `
            Solicitação #${String(request.id).padStart(3, '0')} - ${request.descricao} 
            <span class="status-badge ${statusClass}">${request.status}</span>
            <small style="display: block; color: #999; margin-top: 5px;">
                Valor: R$ ${request.valor.toFixed(2).replace('.', ',')} | 
                Data: ${request.data} às ${request.hora}
            </small>
        `;
        
        requestsList.appendChild(listItem);
    });
}

// Função para atualizar a listagem de solicitações pendentes (aprovador)
function updatePendingRequestsList() {
    const pendingList = document.querySelector('#aprovador .feature-list');
    
    if (!pendingList) return;
    
    // Filtrar apenas solicitações pendentes
    const pendingRequests = requests.filter(request => request.status === 'Pendente');
    
    // Limpar lista atual
    pendingList.innerHTML = '';
    
    // Se não há solicitações pendentes, mostrar mensagem
    if (pendingRequests.length === 0) {
        pendingList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic;">Nenhuma solicitação pendente</li>';
        return;
    }
    
    // Adicionar cada solicitação pendente à lista
    pendingRequests.forEach(request => {
        const listItem = document.createElement('li');
        
        listItem.innerHTML = `
            <input type="checkbox" id="req-${request.id}" style="margin-right: 10px;">
            <label for="req-${request.id}" style="cursor: pointer;">
                Solicitação #${String(request.id).padStart(3, '0')} - ${request.descricao} 
                <span class="status-badge status-pending">Aguardando Aprovação</span>
                <small style="display: block; color: #999; margin-top: 5px;">
                    Valor: R$ ${request.valor.toFixed(2).replace('.', ',')} | 
                    Data: ${request.data} às ${request.hora}
                </small>
            </label>
        `;
        
        pendingList.appendChild(listItem);
    });
}

// Função para atualizar o histórico de aprovações
function updateApprovalHistoryList() {
    const historyList = document.querySelector('#aprovador .card:last-child .feature-list');
    
    if (!historyList) return;
    
    // Filtrar apenas solicitações aprovadas ou rejeitadas
    const processedRequests = requests.filter(request => 
        request.status === 'Aprovada' || request.status === 'Rejeitada' || request.status === 'Executada'
    );
    
    // Limpar lista atual
    historyList.innerHTML = '';
    
    // Se não há histórico, mostrar mensagem
    if (processedRequests.length === 0) {
        historyList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic;">Nenhuma solicitação processada</li>';
        return;
    }
    
    // Ordenar por data de processamento (mais recentes primeiro)
    const sortedProcessedRequests = [...processedRequests].sort((a, b) => {
        const dateA = new Date(`${a.dataProcessamento || a.data} ${a.horaProcessamento || a.hora}`);
        const dateB = new Date(`${b.dataProcessamento || b.data} ${b.horaProcessamento || b.hora}`);
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
    // Adicionar cada solicitação processada à lista
    sortedProcessedRequests.forEach(request => {
        const listItem = document.createElement('li');
        
        let statusClass = 'status-approved';
        if (request.status === 'Rejeitada') statusClass = 'status-pending';
        if (request.status === 'Executada') statusClass = 'status-executive';
        
        listItem.innerHTML = `
            Solicitação #${String(request.id).padStart(3, '0')} - ${request.descricao} 
            <span class="status-badge ${statusClass}">${request.status}</span>
            <small style="display: block; color: #999; margin-top: 5px;">
                Valor: R$ ${request.valor.toFixed(2).replace('.', ',')} | 
                Processada em: ${request.dataProcessamento || request.data} às ${request.horaProcessamento || request.hora}
            </small>
        `;
        
        historyList.appendChild(listItem);
    });
}

// Função para atualizar todas as listas
function updateAllLists() {
    updateRequestsList();
    updatePendingRequestsList();
    updateApprovalHistoryList();
    updateFinancialLists();
}

// Função para atualizar as listas do financeiro
function updateFinancialLists() {
    updateApprovedRequestsList();
    updateExecutedRequestsList();
    updateBudgetControl();
}

// Função para atualizar a listagem de solicitações aprovadas (financeiro)
function updateApprovedRequestsList() {
    const approvedList = document.querySelector('#card-aprovadas .feature-list');
    
    if (!approvedList) return;
    
    // Filtrar apenas solicitações aprovadas
    const approvedRequests = requests.filter(request => request.status === 'Aprovada');
    
    // Limpar lista atual
    approvedList.innerHTML = '';
    
    // Se não há solicitações aprovadas, mostrar mensagem
    if (approvedRequests.length === 0) {
        approvedList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic;">Nenhuma solicitação aprovada para execução</li>';
        return;
    }
    
    // Ordenar por data de aprovação (mais recentes primeiro)
    const sortedApproved = [...approvedRequests].sort((a, b) => {
        const dateA = new Date(`${a.dataProcessamento || a.data} ${a.horaProcessamento || a.hora}`);
        const dateB = new Date(`${b.dataProcessamento || b.data} ${b.horaProcessamento || b.hora}`);
        return dateB - dateA;
    });
    
    // Adicionar cada solicitação aprovada à lista
    sortedApproved.forEach(request => {
        const listItem = document.createElement('li');
        
        listItem.innerHTML = `
            <input type="checkbox" id="fin-${request.id}" style="margin-right: 10px;">
            <label for="fin-${request.id}" style="cursor: pointer;">
                Solicitação #${String(request.id).padStart(3, '0')} - ${request.descricao} 
                <span class="status-badge status-approved">Aprovada</span>
                <small style="display: block; color: #999; margin-top: 5px;">
                    Valor: R$ ${request.valor.toFixed(2).replace('.', ',')} | 
                    Aprovada em: ${request.dataProcessamento || request.data} às ${request.horaProcessamento || request.hora}
                </small>
            </label>
        `;
        
        approvedList.appendChild(listItem);
    });
}

// Função para atualizar a listagem de execuções realizadas (financeiro)
function updateExecutedRequestsList() {
    const executedList = document.querySelector('#card-execucoes .feature-list');
    
    if (!executedList) return;
    
    // Filtrar apenas solicitações executadas
    const executedRequests = requests.filter(request => request.status === 'Executada');
    
    // Limpar lista atual
    executedList.innerHTML = '';
    
    // Se não há execuções, mostrar mensagem
    if (executedRequests.length === 0) {
        executedList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic;">Nenhuma execução realizada</li>';
        return;
    }
    
    // Ordenar por data de execução (mais recentes primeiro)
    const sortedExecuted = [...executedRequests].sort((a, b) => {
        const dateA = new Date(`${a.dataExecucao || a.data} ${a.horaExecucao || a.hora}`);
        const dateB = new Date(`${b.dataExecucao || b.data} ${b.horaExecucao || b.hora}`);
        return dateB - dateA;
    });
    
    // Adicionar cada execução à lista
    sortedExecuted.forEach(request => {
        const listItem = document.createElement('li');
        
        listItem.innerHTML = `
            Solicitação #${String(request.id).padStart(3, '0')} - ${request.descricao} 
            <span class="status-badge status-executive">Executada</span>
            <small style="display: block; color: #999; margin-top: 5px;">
                Valor: R$ ${request.valor.toFixed(2).replace('.', ',')} | 
                Executada em: ${request.dataExecucao || request.data} às ${request.horaExecucao || request.hora}
            </small>
        `;
        
        executedList.appendChild(listItem);
    });
}

// Função para atualizar o controle orçamentário
function updateBudgetControl() {
    const budgetList = document.querySelector('#card-orcamento .feature-list');
    
    if (!budgetList) return;
    
    // Calcular valores
    const orcamentoTotal = 500000.00;
    const valorExecutado = requests
        .filter(req => req.status === 'Executada')
        .reduce((sum, req) => sum + req.valor, 0);
    const pendenteExecucao = requests
        .filter(req => req.status === 'Aprovada')
        .reduce((sum, req) => sum + req.valor, 0);
    const saldoDisponivel = orcamentoTotal - valorExecutado - pendenteExecucao;
    
    // Atualizar lista
    budgetList.innerHTML = `
        <li>Orçamento Total: R$ ${orcamentoTotal.toFixed(2).replace('.', ',')}</li>
        <li>Valor Executado: R$ ${valorExecutado.toFixed(2).replace('.', ',')}</li>
        <li>Saldo Disponível: R$ ${saldoDisponivel.toFixed(2).replace('.', ',')}</li>
        <li>Pendente de Execução: R$ ${pendenteExecucao.toFixed(2).replace('.', ',')}</li>
    `;
}

// Função para aprovar solicitações selecionadas
function approveSelectedRequests() {
    const checkboxes = document.querySelectorAll('#aprovador input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos uma solicitação para aprovar.');
        return;
    }
    
    let approvedCount = 0;
    checkboxes.forEach(checkbox => {
        const requestId = parseInt(checkbox.id.replace('req-', ''));
        const request = requests.find(r => r.id === requestId);
        
        if (request && request.status === 'Pendente') {
            request.status = 'Aprovada';
            request.dataProcessamento = new Date().toLocaleDateString('pt-BR');
            request.horaProcessamento = new Date().toLocaleTimeString('pt-BR');
            approvedCount++;
        }
    });
    
    if (approvedCount > 0) {
        alert(`${approvedCount} solicitação(ões) aprovada(s) com sucesso!`);
        updateAllLists();
    }
}

// Função para rejeitar solicitações selecionadas
function rejectSelectedRequests() {
    const checkboxes = document.querySelectorAll('#aprovador input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos uma solicitação para rejeitar.');
        return;
    }
    
    let rejectedCount = 0;
    checkboxes.forEach(checkbox => {
        const requestId = parseInt(checkbox.id.replace('req-', ''));
        const request = requests.find(r => r.id === requestId);
        
        if (request && request.status === 'Pendente') {
            request.status = 'Rejeitada';
            request.dataProcessamento = new Date().toLocaleDateString('pt-BR');
            request.horaProcessamento = new Date().toLocaleTimeString('pt-BR');
            rejectedCount++;
        }
    });
    
    if (rejectedCount > 0) {
        alert(`${rejectedCount} solicitação(ões) rejeitada(s).`);
        updateAllLists();
    }
}

// Função para executar solicitações selecionadas
function executeSelectedRequests() {
    const checkboxes = document.querySelectorAll('#financeiro input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos uma solicitação para executar.');
        return;
    }
    
    let executedCount = 0;
    checkboxes.forEach(checkbox => {
        const requestId = parseInt(checkbox.id.replace('fin-', ''));
        const request = requests.find(r => r.id === requestId);
        
        if (request && request.status === 'Aprovada') {
            request.status = 'Executada';
            request.dataExecucao = new Date().toLocaleDateString('pt-BR');
            request.horaExecucao = new Date().toLocaleTimeString('pt-BR');
            executedCount++;
        }
    });
    
    if (executedCount > 0) {
        alert(`${executedCount} solicitação(ões) executada(s) com sucesso!`);
        updateAllLists();
    }
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('requestModal');
    if (event.target === modal) {
        closeModal('requestModal');
    }
}

// Carregar a lista quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    updateAllLists();
    
    // Adicionar evento de formatação para o campo valor
    const valorInput = document.getElementById('valor');
    if (valorInput) {
        valorInput.addEventListener('input', formatCurrency);
        valorInput.addEventListener('blur', validateCurrency);
    }
});

// Função para formatar valor monetário
function formatCurrency(event) {
    let value = event.target.value;
    
    // Remove tudo que não é dígito ou vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Permite apenas uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
        value = parts[0] + ',' + parts[1];
    }
    
    // Limita casas decimais a 2
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    event.target.value = value;
}

// Função para validar valor monetário
function validateCurrency(event) {
    let value = event.target.value;
    
    // Se está vazio, não faz nada
    if (!value) return;
    
    // Se termina com vírgula, remove
    if (value.endsWith(',')) {
        value = value.slice(0, -1);
    }
    
    // Se não tem vírgula, adiciona ,00
    if (!value.includes(',')) {
        value = value + ',00';
    }
    
    // Se tem vírgula mas só um dígito depois, adiciona zero
    const parts = value.split(',');
    if (parts.length === 2 && parts[1].length === 1) {
        value = parts[0] + ',' + parts[1] + '0';
    }
    
    event.target.value = value;
}

// Função para converter valor brasileiro para float
function parseFloatBR(value) {
    if (!value) return 0;
    
    // Remove espaços e converte vírgula para ponto
    const cleanValue = value.toString().trim().replace(',', '.');
    
    // Converte para float
    const floatValue = parseFloat(cleanValue);
    
    // Retorna 0 se não é um número válido
    return isNaN(floatValue) ? 0 : floatValue;
}
