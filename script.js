document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
    // =========================================================================
    // AVISO DE SEGURANÇA: As suas regras do Firebase devem ser configuradas
    // para restringir o acesso e proteger os seus dados.
    const firebaseConfig = {
        apiKey: "AIzaSyAYa4v5UyI153J5BJQ3VT_myKagAWiYLWk",
        authDomain: "oraculo-mnemosine.firebaseapp.com",
        projectId: "oraculo-mnemosine",
        storageBucket: "oraculo-mnemosine.appspot.com",
        messagingSenderId: "2087358575",
        appId: "1:2087358575:web:ea9aa6f69554235bfcfd9a",
        measurementId: "G-V018KMV1FX"
    };

    let db; // Variável para a base de dados
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebase.analytics();
            console.log("Firebase inicializado com sucesso.");
        } else if (firebase.apps.length > 0) {
            db = firebase.firestore(); // Firebase já inicializado
        } else {
            console.error("Firebase não está disponível. As funcionalidades de base de dados estarão desativadas.");
        }
    } catch (error) {
        console.error("Erro ao inicializar o Firebase: ", error);
        alert("Ocorreu um erro ao conectar à base de dados. Por favor, tente novamente mais tarde.");
    }

    // =========================================================================
    // EVENT LISTENERS (OUVINTES DE EVENTOS)
    // =========================================================================

    // Botão Revelar o Arquétipo (Principal)
    const botaoRevelar = document.getElementById('botao-revelar');
    if (botaoRevelar) {
        botaoRevelar.addEventListener('click', () => calcularResultado(db));
    }
    
    // Lógica do Consentimento Inicial
    const consentCheckbox = document.getElementById('consentimento-inicial-check');
    const startButton = document.getElementById('botao-iniciar');
    if (consentCheckbox && startButton) {
        consentCheckbox.addEventListener('change', () => {
            startButton.disabled = !consentCheckbox.checked;
        });
        startButton.addEventListener('click', () => {
            if (consentCheckbox.checked) irParaEtapa(1);
        });
    }

    // Lógica para os cards de sólidos platónicos
    const solidos = document.querySelectorAll('.solido-card');
    solidos.forEach(card => {
        card.addEventListener('click', () => {
            solidos.forEach(c => c.classList.remove('selecionado'));
            card.classList.add('selecionado');
        });
    });

    // Lógica para os botões de resultado
    const botaoDownload = document.getElementById('botao-download');
    if (botaoDownload) {
        botaoDownload.addEventListener('click', () => downloadResultado(db));
    }
    const botaoWhatsapp = document.getElementById('botao-whatsapp');
    if (botaoWhatsapp) {
        botaoWhatsapp.addEventListener('click', partilharWhatsApp);
    }
    const botaoInstagram = document.getElementById('botao-instagram');
    if (botaoInstagram) {
        botaoInstagram.addEventListener('click', partilharInstagram);
    }
});


// =========================================================================
// FUNÇÕES GLOBAIS
// =========================================================================

// Função para navegar entre as etapas
function irParaEtapa(numeroEtapa) {
    document.querySelectorAll('.etapa').forEach(etapa => etapa.classList.remove('etapa-ativa'));
    const targetId = typeof numeroEtapa === 'string' ? numeroEtapa : `etapa${numeroEtapa}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.add('etapa-ativa');
        // Faz scroll suave para o topo da nova etapa
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Funções de cálculo de numerologia (sem alterações)
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
async function calcularResultado(db) {
    try {
        // 1. VALIDAÇÃO DAS RESPOSTAS
        const validacoes = [
            { id: 'nomeCompleto', etapa: 1, msg: "Por favor, preencha o seu nome completo." },
            { id: 'dataNascimento', etapa: 1, msg: "Por favor, preencha a sua data de nascimento." },
            { id: 'email', etapa: 1, msg: "Por favor, preencha o seu email." },
            { id: 'whatsapp', etapa: 1, msg: "Por favor, preencha o seu WhatsApp." },
            { selector: 'input[name="alma_tripartite"]:checked', etapa: 2, msg: "Por favor, faça a sua escolha na Etapa 2." },
            { selector: '.solido-card.selecionado', etapa: 3, msg: "Por favor, selecione um Sólido Platónico." },
            { selector: 'input[name="virtude"]:checked', etapa: 4, msg: "Por favor, escolha a sua virtude." },
            { selector: 'input[name="caverna"]:checked', etapa: 5, msg: "Por favor, faça a sua escolha no dilema da caverna." },
            { selector: 'input[name="destino"]:checked', etapa: 6, msg: "Por favor, escolha a sua atitude perante o destino." },
            { selector: 'input[name="kosmos"]:checked', etapa: 7, msg: "Por favor, escolha a natureza do Kosmos." },
            { selector: 'input[name="eudaimonia"]:checked', etapa: 8, msg: "Por favor, escolha o propósito da vida." },
            { selector: 'input[name="apatheia"]:checked', etapa: 9, msg: "Por favor, escolha a sua gestão das paixões." },
            { selector: 'input[name="demiurgo"]:checked', etapa: 10, msg: "Por favor, escolha a natureza do Criador." },
            { selector: 'input[name="katharsis"]:checked', etapa: 11, msg: "Por favor, escolha o método de purificação." },
            { selector: 'input[name="realidade"]:checked', etapa: 12, msg: "Por favor, escolha a sua realidade última." }
        ];

        for (const check of validacoes) {
            const elemento = check.id ? document.getElementById(check.id) : document.querySelector(check.selector);
            if (!elemento || (check.id && !elemento.value)) {
                alert(check.msg);
                irParaEtapa(check.etapa);
                return;
            }
        }

        // 2. CÁLCULO DAS PONTUAÇÕES (sem alterações)
        const scores = { filosofo: 0, guardiao: 0, artesao: 0 };
        const numeroAlma = calcularNumeroDaAlma(document.getElementById('nomeCompleto').value);
        const caminhoDeVida = calcularCaminhoDeVida(document.getElementById('dataNascimento').value);

        [numeroAlma, caminhoDeVida].forEach(num => {
            if ([2, 4, 7, 11, 22].includes(num)) scores.filosofo += 1;
            else if ([1, 5, 8].includes(num)) scores.guardiao += 1;
            else if ([3, 6, 9].includes(num)) scores.artesao += 1;
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

        // 3. DETERMINAR ARQUÉTIPO E EXIBIR RESULTADO
        const arquetipoVencedor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        const resultados = {
            filosofo: { titulo: "Um Eco da Alma de Ouro: A Vida do Filósofo", descricao: "As suas recordações sugerem uma vida passada dedicada à busca da sabedoria..." },
            guardiao: { titulo: "Um Eco da Alma de Prata: A Vida do Guardião", descricao: "As suas recordações sugerem uma vida passada forjada na honra e no dever..." },
            artesao: { titulo: "Um Eco da Alma de Bronze: A Vida do Artesão", descricao: "As suas recordações sugerem uma vida passada dedicada à criação e à harmonia..." }
        };
        // (Adicione as descrições completas aqui)

        document.getElementById('numero-alma-resultado').innerText = numeroAlma;
        document.getElementById('caminho-vida-resultado').innerText = caminhoDeVida;
        document.getElementById('resultado-arquetipo').innerText = resultados[arquetipoVencedor].titulo;
        document.getElementById('resultado-descricao').innerText = resultados[arquetipoVencedor].descricao;

        // 4. ENVIAR DADOS PARA O FIREBASE
        if (db) { // Apenas tenta enviar se a base de dados estiver conectada
            await enviarResultadoAutomatico(db);
        }

        // 5. IR PARA A ETAPA DE RESULTADO
        irParaEtapa('resultado-oraculo');

    } catch (error) {
        console.error("ERRO CRÍTICO em calcularResultado:", error);
        alert("Ocorreu um erro inesperado ao calcular o seu arquétipo. Por favor, verifique se todos os campos estão preenchidos e tente novamente.");
    }
}

// Função para enviar os dados para o Firebase (sem alterações, mas mais segura devido à verificação anterior)
async function enviarResultadoAutomatico(db) {
    try {
        const dados = {
            nome: document.getElementById('nomeCompleto').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            email: document.getElementById('email').value,
            whatsapp: document.getElementById('whatsapp').value,
            arquetipo: document.getElementById('resultado-arquetipo').innerText,
            dataGravacao: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("resultados").add(dados);
        console.log("Resultado guardado com sucesso.");
    } catch (error) {
        console.error("Erro ao guardar resultado no backend: ", error);
        // Não mostrar alerta ao utilizador, pois é um erro de backend
    }
}

// Funções de download e partilha (sem alterações)
function downloadResultado(db) { 
    // ... o seu código para download aqui...
    const consentimentoComunicacao = document.getElementById('consentimento-comunicacao').checked;
    const email = document.getElementById('email').value;

    if (consentimentoComunicacao && db) {
        db.collection("resultados").where("email", "==", email)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                doc.ref.update({ consentimentoComunicacao: true });
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
function partilharWhatsApp() { 
    // ... o seu código para partilha no WhatsApp aqui...
    const arquetipo = document.getElementById('resultado-arquetipo').innerText;
    const texto = `Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: *${arquetipo}*. Descobre o teu também!`;
    const urlSite = window.location.origin;
    const url = `https://wa.me/?text=${encodeURIComponent(texto + " " + urlSite)}`;
    window.open(url, '_blank');
}
function partilharInstagram() { 
    // ... o seu código para partilha no Instagram aqui...
    const arquetipo = document.getElementById('resultado-arquetipo').innerText;
    const texto = `Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: ${arquetipo}. #oraculodemnemosine #filosofia #anamnese`;

    navigator.clipboard.writeText(texto).then(function() {
        alert('Texto do resultado copiado! Agora pode colar na sua história ou publicação do Instagram.');
    }, function(err) {
        alert('Não foi possível copiar o texto. Por favor, copie manualmente.');
    });
}
