// ==========================================
// ESTADO DO JOGO E PROGRESSO (LocalStorage)
// ==========================================
let progresso = JSON.parse(localStorage.getItem('aprovacaoQuestSave')) || {
    xp: 0,
    acertos: 0,
    erros: 0,
    redacoesFeitas: 0,
    historicoMaterias: { portugues: 0, matematica: 0, informatica: 0, direito: 0 }
};

// ==========================================
// BANCO DE DADOS MOCK (Pode ser expandido depois)
// ==========================================
const questoesMock = [
    { materia: 'portugues', diff: 'basico', texto: 'Qual palavra é paroxítona?', opcoes: ['Cadeira', 'Lâmpada', 'Café', 'Cipó'], resposta: 0 },
    { materia: 'direito', diff: 'avancado', texto: 'Sobre os Direitos Fundamentais (Art. 5º), é correto afirmar:', opcoes: ['São absolutos', 'A casa é asilo inviolável', 'Não há liberdade de culto', 'Apenas brasileiros natos possuem'], resposta: 1 },
    // Adicione mais questões com o tempo seguindo este padrão
];

const temasRedacao = [
    "Os impactos da inteligência artificial no mercado de trabalho brasileiro.",
    "O paradoxo da hiperconectividade: solidão na era digital.",
    "Desafios da mobilidade urbana sustentável nas metrópoles.",
    "A cultura do cancelamento e os limites da liberdade de expressão."
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();
    
    // Auto-save da redação (Ajuda muito quem tem ansiedade de perder dados)
    const textarea = document.getElementById('redacao-texto');
    textarea.value = localStorage.getItem('redacaoRascunho') || "";
    textarea.addEventListener('input', (e) => {
        localStorage.setItem('redacaoRascunho', e.target.value);
    });
});

// ==========================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================
function changeTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    event.target.classList.add('active');
    
    if(tabId === 'status') atualizarInterface();
}

// ==========================================
// SISTEMA DE QUESTÕES (Mecânica de Combate)
// ==========================================
function loadQuestion() {
    const materia = document.getElementById('materia-select').value;
    const diff = document.getElementById('dificuldade-select').value;
    
    // Filtro simples - Em um projeto real buscaria de uma API/JSON maior
    const disponiveis = questoesMock.filter(q => 
        (materia === 'todas' || q.materia === materia) && 
        (q.diff === diff)
    );

    const container = document.getElementById('question-container');
    
    if (disponiveis.length === 0) {
        container.innerHTML = `<p style="color: yellow;">⚠️ Nenhuma missão encontrada nesta área. Tente outros filtros.</p>`;
        return;
    }

    const q = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    
    let html = `<h3>Desafio de ${q.materia.toUpperCase()}</h3>`;
    html += `<p>${q.texto}</p><div style="margin-top:1rem;">`;
    
    q.opcoes.forEach((opcao, index) => {
        html += `<button class="action-btn" style="text-align:left; font-size:10px; margin-top:0.5rem;" 
                  onclick="responder(${index}, ${q.resposta}, '${q.materia}')">
                  ${index + 1}) ${opcao}
                 </button>`;
    });
    html += `</div>`;
    
    container.innerHTML = html;
}

function responder(escolha, correta, materia) {
    const container = document.getElementById('question-container');
    if (escolha === correta) {
        progresso.acertos++;
        progresso.xp += 10;
        progresso.historicoMaterias[materia] = (progresso.historicoMaterias[materia] || 0) + 1;
        container.innerHTML = `<h3 style="color: #33ff33;">✨ ACERTO CRÍTICO! +10 XP</h3><button class="action-btn" onclick="loadQuestion()">PRÓXIMA MISSÃO</button>`;
    } else {
        progresso.erros++;
        container.innerHTML = `<h3 style="color: #ff0055;">💀 GAME OVER (Nesta Questão)</h3><p>O inimigo esquivou. Estude mais a teoria e tente de novo.</p><button class="action-btn" onclick="loadQuestion()">CONTINUAR</button>`;
    }
    salvarProgresso();
}

// ==========================================
// SISTEMA DE REDAÇÃO E FEEDBACK MOCK
// ==========================================
function gerarTema() {
    const tema = temasRedacao[Math.floor(Math.random() * temasRedacao.length)];
    const div = document.getElementById('tema-gerado');
    div.innerHTML = `<strong>TEMA ATUAL:</strong><br><br>${tema}`;
    div.classList.remove('hidden');
}

function simularAvaliacao() {
    const texto = document.getElementById('redacao-texto').value;
    const feedback = document.getElementById('feedback-redacao');
    
    if(texto.length < 50) {
        feedback.innerHTML = "<p style='color: yellow;'>Mestre diz: Seu texto é muito curto. Desenvolva mais suas ideias antes de enviar.</p>";
        feedback.classList.remove('hidden');
        return;
    }

    progresso.redacoesFeitas++;
    progresso.xp += 50; // Redação dá mais XP (reforço positivo)
    salvarProgresso();

    // Em uma versão futura, você conectaria a API do OpenAI aqui.
    feedback.innerHTML = `
        <h3 style="color: #33ff33;">AVALIAÇÃO RECEBIDA (+50 XP)</h3>
        <p><strong>Banca:</strong> Padrão Desafio (Cebraspe/FGV)</p>
        <p><em>Análise IA:</em> O texto possui boa estrutura. Cuidado com períodos muito longos (comum em TDAH, tendemos a escrever em fluxo de pensamento). Tente usar mais pontos finais. Nota estimada: 7.5/10.</p>
    `;
    feedback.classList.remove('hidden');
}

// ==========================================
// STATUS E MENTORIA (Redução de Ansiedade)
// ==========================================
function gerarAnaliseMentor() {
    const mentor = document.getElementById('mentor-feedback');
    const total = progresso.acertos + progresso.erros;
    
    if (total === 0) {
        mentor.innerHTML = "Você ainda não iniciou sua jornada. Vá para a aba de MISSÕES!";
        return;
    }

    const taxaAcerto = (progresso.acertos / total) * 100;
    let analise = `Taxa de Sucesso: ${taxaAcerto.toFixed(1)}%. <br><br>`;

    // Feedback focado em redução de ansiedade e direcionamento claro
    if (taxaAcerto > 70) {
        analise += "Seu desempenho está de um verdadeiro Mestre. Continue mantendo a consistência. Lembre-se de fazer pausas (Técnica Pomodoro) para não gerar *Burnout*.";
    } else if (taxaAcerto > 40) {
        analise += "Você está no caminho! O erro faz parte do aprendizado. Talvez seja hora de revisar os resumos de nível básico antes de ir para o intermediário. Um passo de cada vez.";
    } else {
        analise += "Não se desespere. Volte para as questões de nível 🟢 Básico. Foque apenas em entender *uma* matéria por vez para evitar sobrecarga cognitiva.";
    }

    mentor.innerHTML = analise;
}

function salvarProgresso() {
    localStorage.setItem('aprovacaoQuestSave', JSON.stringify(progresso));
    atualizarInterface();
}

function atualizarInterface() {
    document.getElementById('xp-counter').innerText = progresso.xp;
    document.getElementById('stat-acertos').innerText = progresso.acertos;
    document.getElementById('stat-erros').innerText = progresso.erros;
    document.getElementById('stat-redacoes').innerText = progresso.redacoesFeitas;
}

function resetarProgresso() {
    if(confirm('Tem certeza? Todo o XP será perdido. (Isso não pode ser desfeito)')) {
        localStorage.clear();
        location.reload();
    }
}