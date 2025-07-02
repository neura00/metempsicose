document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
    // =========================================================================
    const firebaseConfig = {
        apiKey: "AIzaSyAYa4v5UyI153J5BJQ3VT_myKagAWiYLWk",
        authDomain: "oraculo-mnemosine.firebaseapp.com",
        projectId: "oraculo-mnemosine",
        storageBucket: "oraculo-mnemosine.appspot.com",
        messagingSenderId: "2087358575",
        appId: "1:2087358575:web:ea9aa6f69554235bfcfd9a",
        measurementId: "G-V018KMV1FX"
    };

    // Inicializa o Firebase e os seus serviços
    if (typeof firebase !== 'undefined') {
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const analytics = firebase.analytics();

        // Anexa as funções aos botões de resultado (apenas na página do oráculo)
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

    // CORREÇÃO: Garante que o Oráculo é visível ao carregar a página
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
    // 1. RECOLHER DADOS DE TODAS AS ETAPAS
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

    // 2. INICIALIZAR PONTUAÇÕES
    const scores = { filosofo: 0, guardiao: 0, artesao: 0 };

    // 3. ATRIBUIR PONTOS
    const numeroAlma = calcularNumeroDaAlma(document.getElementById('nomeCompleto').value);
    const caminhoDeVida = calcularCaminhoDeVida(document.getElementById('dataNascimento').value);
    [numeroAlma, caminhoDeVida].forEach(num => {
        switch (num) {
            case 2: case 4: case 7: case 11: case 22: scores.filosofo += 1; break;
            case 1: case 5: case 8: scores.guardiao += 1; break;
            case 3: case 6: case 9: scores.artesao += 1; break;
        }
    });
    
    const pontos = {
        alma_tripartite: { razao: 'filosofo', animo: 'guardiao', desejo: 'artesao' },
        solido: { ar: 'filosofo', fogo: 'guardiao', terra: 'artesao', agua: 'artesao' },
        virtude: { sabedoria: 'filosofo', justica: 'filosofo', coragem: 'guardiao', temperanca: 'artesao' },
        caverna: { contemplar: 'filosofo', retornar: 'guardiao', recriar: 'artesao' },
        destino: { aceitacao: 'filosofo', resistencia: 'guardiao', transcendencia: 'artesao' },
        kosmos: { harmonia: 'filosofo', conflito: 'guardiao' },
        eudaimonia: { contemplacao: 'filosofo', servico: 'guardiao', criacao: 'artesao' },
        apatheia: { analise: 'filosofo', dominio: 'guardiao', canalizacao: 'artesao' },
        demiurgo: { geometra: 'filosofo', legislador: 'guardiao', artista: 'artesao' },
        katharsis: { abstracao: 'filosofo', sacrificio: 'guardiao', musica: 'artesao' },
        realidade: { ideias: 'filosofo', acoes: 'guardiao', manifestacao: 'artesao' }
    };

    scores[pontos.alma_tripartite[document.querySelector('input[name="alma_tripartite"]:checked').value]] += 3;
    scores[pontos.solido[document.querySelector('.solido-card.selecionado').dataset.valor]] += 2;
    scores[pontos.virtude[document.querySelector('input[name="virtude"]:checked').value]] += 3;
    scores[pontos.caverna[document.querySelector('input[name="caverna"]:checked').value]] += 2;
    scores[pontos.destino[document.querySelector('input[name="destino"]:checked').value]] += 2;
    scores[pontos.kosmos[document.querySelector('input[name="kosmos"]:checked').value]] += 2;
    scores[pontos.eudaimonia[document.querySelector('input[name="eudaimonia"]:checked').value]] += 2;
    scores[pontos.apatheia[document.querySelector('input[name="apatheia"]:checked').value]] += 2;
    scores[pontos.demiurgo[document.querySelector('input[name="demiurgo"]:checked').value]] += 2;
    scores[pontos.katharsis[document.querySelector('input[name="katharsis"]:checked').value]] += 2;
    scores[pontos.realidade[document.querySelector('input[name="realidade"]:checked').value]] += 3;
    
    // 4. DETERMINAR O ARQUÉTIPO VENCEDOR
    let arquetipoVencedor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // 5. DEFINIR OS TEXTOS NARRATIVOS DOS RESULTADOS
    const resultados = {
        filosofo: {
            titulo: "Um Eco da Alma de Ouro: A Vida do Filósofo",
            descricao: `As suas recordações sugerem uma vida passada dedicada à busca da sabedoria. A sua alma provavelmente habitou o corpo de um erudito, um mestre ou um conselheiro. Talvez tenha sido um matemático na escola de Pitágoras, um astrónomo na Babilónia ou um filósofo na Academia de Platão. A sua jornada era a de usar a razão para iluminar a si mesmo e ao mundo.`
        },
        guardiao: {
            titulo: "Um Eco da Alma de Prata: A Vida do Guardião",
            descricao: `As suas recordações sugerem uma vida passada forjada na honra e no dever. A sua alma provavelmente habitou o corpo de um soldado, um líder ou um protetor da lei. Talvez tenha sido um hoplita espartano, um centurião romano ou um cavaleiro a seguir um código de honra. A sua jornada era a de ser um pilar de virtude e força num mundo caótico.`
        },
        artesao: {
            titulo: "Um Eco da Alma de Bronze: A Vida do Artesão",
            descricao: `As suas recordações sugerem uma vida passada dedicada à criação e à harmonia. A sua alma provavelmente habitou o corpo de um artista, um arquiteto, um músico ou um construtor. Talvez tenha sido um escultor em Atenas, um arquiteto de catedrais ou um poeta na Pérsia. A sua jornada era a de manifestar a beleza e a ordem divina no mundo material.`
        }
    };
    
    // 6. MOSTRAR OS DADOS NO HTML
    document.getElementById('numero-alma-resultado').innerText = numeroAlma;
    document.getElementById('caminho-vida-resultado').innerText = caminhoDeVida;
    document.getElementById('resultado-arquetipo').innerText = resultados[arquetipoVencedor].titulo;
    document.getElementById('resultado-descricao').innerText = resultados[arquetipoVencedor].descricao;

    // 7. ENVIAR DADOS AUTOMATICAMENTE PARA O FIREBASE
    await enviarResultadoAutomatico(firebase.firestore());
    
    // 8. IR PARA A PÁGINA DE RESULTADO
    irParaEtapa('resultado-oraculo');
}

// Função para enviar os dados para o Firebase automaticamente
async function enviarResultadoAutomatico(db) {
    try {
        const nome = document.getElementById('nomeCompleto').value;
        const dataNascimento = document.getElementById('dataNascimento').value;
        const email = document.getElementById('email').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const arquetipo = document.getElementById('resultado-arquetipo').innerText;
        const dataGravacao = firebase.firestore.FieldValue.serverTimestamp();

        await db.collection("resultados").add({
            nome,
            dataNascimento,
            email,
            whatsapp,
            arquetipo,
            dataGravacao,
        });
        console.log("Resultado guardado com sucesso no backend.");
    } catch (error) {
        console.error("Erro ao guardar resultado no backend: ", error);
    }
}


// Função para fazer o download do resultado
function downloadResultado(db) {
    const consentimentoComunicacao = document.getElementById('consentimento-comunicacao').checked;
    const email = document.getElementById('email').value;

    if (consentimentoComunicacao) {
        db.collection("resultados").where("email", "==", email)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                doc.ref.update({
                    consentimentoComunicacao: true
                });
            });
        });
    }

    const nome = document.getElementById('nomeCompleto').value;
    const numeroAlma = document.getElementById('numero-alma-resultado').innerText;
    const caminhoVida = document.getElementById('caminho-vida-resultado').innerText;
    const arquetipo = document.getElementById('resultado-arquetipo').innerText;
    const descricao = document.getElementById('resultado-descricao').innerText;

    const conteudoDoFicheiro = `
Resultado do Oráculo de Mnemósine para: ${nome}
==================================================

NÚMEROS FUNDAMENTAIS
--------------------
Número da Alma (do seu nome): ${numeroAlma}
Caminho de Vida (da sua data de nascimento): ${caminhoVida}

ARQUÉTIPO DA ALMA
-----------------
${arquetipo}

DESCRIÇÃO DO ECO DA SUA ALMA
----------------------------
${descricao}

==================================================
© 2025 Oráculo de Mnemósine.
    `;

    const blob = new Blob([conteudoDoFicheiro.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu_arquetipo_da_alma.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funções de Partilha
function partilharWhatsApp() {
    const arquetipo = document.getElementById('resultado-arquetipo').innerText;
    const texto = `Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: *${arquetipo}*. Descobre o teu também!`;
    const urlSite = window.location.origin;
    const url = `https://wa.me/?text=${encodeURIComponent(texto + " " + urlSite)}`;
    window.open(url, '_blank');
}

function partilharInstagram() {
    const arquetipo = document.getElementById('resultado-arquetipo').innerText;
    const texto = `Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: ${arquetipo}. #oraculodemnemosine #filosofia #anamnese`;

    navigator.clipboard.writeText(texto).then(function() {
        alert('Texto do resultado copiado! Agora pode colar na sua história ou publicação do Instagram.');
    }, function(err) {
        alert('Não foi possível copiar o texto. Por favor, copie manualmente.');
    });
}
