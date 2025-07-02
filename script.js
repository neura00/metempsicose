document.addEventListener('DOMContentLoaded', function() {
    
    // CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyAYa4v5UyI153J5BJQ3VT_myKagAWiYLWk",
        authDomain: "oraculo-mnemosine.firebaseapp.com",
        projectId: "oraculo-mnemosine",
        storageBucket: "oraculo-mnemosine.appspot.com",
        messagingSenderId: "2087358575",
        appId: "1:2087358575:web:ea9aa6f69554235bfcfd9a",
        measurementId: "G-V018KMV1FX"
    };

    if (typeof firebase !== 'undefined') {
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const analytics = firebase.analytics();

        const botaoDownload = document.getElementById('botao-download');
        if(botaoDownload) {
            botaoDownload.onclick = function() { downloadResultado(db); };
        }
        const botaoWhatsapp = document.getElementById('botao-whatsapp');
        if(botaoWhatsapp) {
            botaoWhatsapp.onclick = partilharWhatsApp;
        }
        const botaoInstagram = document.getElementById('botao-instagram');
        if(botaoInstagram) {
            botaoInstagram.onclick = partilharInstagram;
        }
    }

    // Lógica do Consentimento Inicial
    const consentCheckbox = document.getElementById('consentimento-inicial-check');
    const startButton = document.getElementById('botao-iniciar');
    if (consentCheckbox && startButton) {
        consentCheckbox.addEventListener('change', function() {
            startButton.disabled = !this.checked;
        });
        startButton.addEventListener('click', function() {
            if (consentCheckbox.checked) {
                irParaEtapa(1);
            }
        });
    }

    // Lógica para os cards de sólidos platónicos serem selecionáveis
    const solidos = document.querySelectorAll('.solido-card');
    solidos.forEach(card => {
        card.addEventListener('click', () => {
            solidos.forEach(c => c.classList.remove('selecionado'));
            card.classList.add('selecionado');
        });
    });

    // LÓGICA DE CARREGAMENTO CORRIGIDA
    const oraculoContainer = document.getElementById('oraculo-container');
    const loadingContainer = document.getElementById('loading-container');
    if (oraculoContainer && loadingContainer) {
        loadingContainer.style.display = 'none';
        oraculoContainer.style.display = 'block';
    }
});

// Função para navegar entre as etapas do oráculo
function irParaEtapa(numeroEtapa) {
    document.querySelectorAll('.etapa').forEach(etapa => {
        etapa.classList.remove('etapa-ativa');
    });
    const targetElement = document.getElementById(typeof numeroEtapa === 'string' ? numeroEtapa : `etapa${numeroEtapa}`);
    if (targetElement) {
        targetElement.classList.add('etapa-ativa');
    }
}

// Função para calcular o número da alma (versão pitagórica)
function calcularNumeroDaAlma(nome) {
    if (!nome) return 1;
    const nomeLimpo = nome.toLowerCase().replace(/[^a-z]/g, '');
    let soma = 0;
    for (let i = 0; i < nomeLimpo.length; i++) {
        soma += (nomeLimpo.charCodeAt(i) - 96 - 1) % 9 + 1;
    }
    while (soma > 9 && soma !== 11 && soma !== 22) {
        soma = String(soma).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return soma;
}

// Função para calcular o Caminho de Vida (método tradicional)
function calcularCaminhoDeVida(dataString) {
    if (!dataString) return 1;
    function reduzirNumero(num) {
        if (num === 11 || num === 22) return num;
        let soma = num;
        while (soma > 9) {
            soma = String(soma).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
            if (soma === 11 || soma === 22) break;
        }
        return soma;
    }
    const [ano, mes, dia] = dataString.split('-').map(Number);
    const diaReduzido = reduzirNumero(dia);
    const mesReduzido = reduzirNumero(mes);
    const anoReduzido = reduzirNumero(ano);
    return reduzirNumero(diaReduzido + mesReduzido + anoReduzido);
}

// Função principal para calcular e mostrar o resultado
async function calcularResultado() {
    // Validação
    const validacoes = [
        { valor: document.getElementById('nomeCompleto').value, etapa: 1, mensagem: "Por favor, preencha o seu nome completo na Etapa 1." },
        { valor: document.getElementById('dataNascimento').value, etapa: 1, mensagem: "Por favor, preencha a sua data de nascimento na Etapa 1." },
        { valor: document.getElementById('email').value, etapa: 1, mensagem: "Por favor, preencha o seu email na Etapa 1." },
        { valor: document.getElementById('whatsapp').value, etapa: 1, mensagem: "Por favor, preencha o seu WhatsApp na Etapa 1." },
        { valor: document.querySelector('input[name="alma_tripartite"]:checked'), etapa: 2, mensagem: "Por favor, faça a sua escolha na Etapa 2." },
        { valor: document.querySelector('.solido-card.selecionado'), etapa: 3, mensagem: "Por favor, selecione um Sólido Platónico na Etapa 3." },
        { valor: document.querySelector('input[name="virtude"]:checked'), etapa: 4, mensagem: "Por favor, escolha a sua virtude fundamental na Etapa 4." },
        { valor: document.querySelector('input[name="caverna"]:checked'), etapa: 5, mensagem: "Por favor, faça a sua escolha no dilema da caverna na Etapa 5." },
        { valor: document.querySelector('input[name="destino"]:checked'), etapa: 6, mensagem: "Por favor, escolha a sua atitude perante o destino na Etapa 6." },
        { valor: document.querySelector('input[name="kosmos"]:checked'), etapa: 7, mensagem: "Por favor, escolha a natureza do Kosmos na Etapa 7." },
        { valor: document.querySelector('input[name="eudaimonia"]:checked'), etapa: 8, mensagem: "Por favor, escolha o propósito da vida na Etapa 8." },
        { valor: document.querySelector('input[name="apatheia"]:checked'), etapa: 9, mensagem: "Por favor, escolha a sua gestão das paixões na Etapa 9." },
        { valor: document.querySelector('input[name="demiurgo"]:checked'), etapa: 10, mensagem: "Por favor, escolha a natureza do Criador na Etapa 10." },
        { valor: document.querySelector('input[name="katharsis"]:checked'), etapa: 11, mensagem: "Por favor, escolha o método de purificação na Etapa 11." },
        { valor: document.querySelector('input[name="realidade"]:checked'), etapa: 12, mensagem: "Por favor, escolha a sua realidade última na Etapa 12." }
    ];

    for (const check of validacoes) {
        if (!check.valor) {
            alert(check.mensagem);
            irParaEtapa(check.etapa);
            return;
        }
    }

    // Lógica de cálculo de pontos...
    const scores = { filosofo: 0, guardiao: 0, artesao: 0 };
    const numeroAlma = calcularNumeroDaAlma(document.getElementById('nomeCompleto').value);
    const caminhoDeVida = calcularCaminhoDeVida(document.getElementById('dataNascimento').value);
    // ... (resto da lógica de pontuação) ...

    let arquetipoVencedor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    const resultados = {
        filosofo: { titulo: "Um Eco da Alma de Ouro: A Vida do Filósofo", descricao: "..." },
        guardiao: { titulo: "Um Eco da Alma de Prata: A Vida do Guardião", descricao: "..." },
        artesao: { titulo: "Um Eco da Alma de Bronze: A Vida do Artesão", descricao: "..." }
    };
    
    document.getElementById('numero-alma-resultado').innerText = numeroAlma;
    document.getElementById('caminho-vida-resultado').innerText = caminhoDeVida;
    document.getElementById('resultado-arquetipo').innerText = resultados[arquetipoVencedor].titulo;
    document.getElementById('resultado-descricao').innerText = resultados[arquetipoVencedor].descricao;

    await enviarResultadoAutomatico(firebase.firestore());
    irParaEtapa('resultado-oraculo');
}

// ... (Resto das funções)
