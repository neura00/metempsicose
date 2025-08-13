document.addEventListener('DOMContentLoaded', function() {
    
    // AVISO DE SEGURANÇA: As suas regras do Firebase (Firestore Security Rules)
    // devem ser configuradas para restringir o acesso e proteger os seus dados,
    // já que a sua API Key está visível no código do cliente.
    const firebaseConfig = {
        apiKey: "AIzaSyAYa4v5UyI153J5BJQ3VT_myKagAWiYLWk",
        authDomain: "oraculo-mnemosine.firebaseapp.com",
        projectId: "oraculo-mnemosine",
        storageBucket: "oraculo-mnemosine.appspot.com",
        messagingSenderId: "2087358575",
        appId: "1:2087358575:web:ea9aa6f69554235bfcfd9a",
        measurementId: "G-V018KMV1FX"
    };

    let db; // Variável global para a base de dados
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebase.analytics();
            console.log("Firebase inicializado com sucesso.");
        } else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            db = firebase.firestore(); // Firebase já foi inicializado
        } else {
            console.error("Firebase não foi carregado. As funcionalidades da base de dados estarão desativadas.");
        }
    } catch (error) {
        console.error("Erro ao inicializar o Firebase: ", error);
        alert("Ocorreu um erro ao conectar à base de dados. Por favor, tente novamente mais tarde.");
    }

    // =========================================================================
    // EVENT LISTENERS (Controladores de Eventos)
    // =========================================================================
    
    // Botão Revelar o Arquétipo (Principal)
    const botaoRevelar = document.getElementById('botao-revelar');
    if (botaoRevelar) {
        botaoRevelar.addEventListener('click', () => calcularResultado(db));
    }
    
    // Botões de Navegação (Próximo/Anterior)
    document.querySelectorAll('.botao-proximo').forEach(button => {
        button.addEventListener('click', () => irParaEtapa(button.dataset.target));
    });
    document.querySelectorAll('.botao-voltar').forEach(button => {
        button.addEventListener('click', () => irParaEtapa(button.dataset.target));
    });
    
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
    document.querySelectorAll('.solido-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.solido-card').forEach(c => c.classList.remove('selecionado'));
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

function irParaEtapa(numeroEtapa) {
    document.querySelectorAll('.etapa').forEach(etapa => etapa.classList.remove('etapa-ativa'));
    const targetId = `etapa${numeroEtapa}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.add('etapa-ativa');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Funções de cálculo de numerologia
function calcularNumeroDaAlma(nome) { /* ... (código mantido) ... */ }
function calcularCaminhoDeVida(dataString) { /* ... (código mantido) ... */ }
// Funções mantidas como no seu script original
function calcularNumeroDaAlma(nome){if(!nome)return 1;const e=nome.toLowerCase().replace(/[^a-z]/g,"");let a=0;for(let o=0;o<e.length;o++)a+=(e.charCodeAt(o)-96-1)%9+1;for(;"11"!==String(a)&&"22"!==String(a)&&a>9;)a=String(a).split("").reduce((t,n)=>t+parseInt(n,10),0);return a}function calcularCaminhoDeVida(dataString){if(!dataString)return 1;function reduzirNumero(num){if(11===num||22===num)return num;let soma=num;for(;soma>9;){if(soma=String(soma).split("").reduce((acc,digit)=>acc+parseInt(digit,10),0),11===soma||22===soma)break}return soma}const[ano,mes,dia]=dataString.split("-").map(Number);const diaReduzido=reduzirNumero(dia),mesReduzido=reduzirNumero(mes),anoReduzido=reduzirNumero(ano);return reduzirNumero(diaReduzido+mesReduzido+anoReduzido)}

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
            { selector: 'input[name="virtude"]:checked', etapa: 4, msg: "Por favor, escolha a sua virtude na Etapa 4." },
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

        // 2. CÁLCULO DAS PONTUAÇÕES
        const scores = { filosofo: 0, guardiao: 0, artesao: 0 };
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
        // ... (resto da lógica de pontuação)
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

        const numeroAlma = calcularNumeroDaAlma(document.getElementById('nomeCompleto').value);
        const caminhoDeVida = calcularCaminhoDeVida(document.getElementById('dataNascimento').value);

        document.getElementById('numero-alma-resultado').innerText = numeroAlma;
        document.getElementById('caminho-vida-resultado').innerText = caminhoDeVida;
        document.getElementById('resultado-arquetipo').innerText = resultados[arquetipoVencedor].titulo;
        document.getElementById('resultado-descricao').innerText = resultados[arquetipoVencedor].descricao;

        // 4. ENVIAR DADOS PARA O FIREBASE
        if (db) {
            await enviarResultadoAutomatico(db);
        }

        // 5. IR PARA A ETAPA DE RESULTADO
        irParaEtapa('resultado-oraculo');

    } catch (error) {
        console.error("ERRO CRÍTICO em calcularResultado:", error);
        alert("Ocorreu um erro inesperado ao calcular o seu arquétipo. Por favor, verifique se todos os campos estão preenchidos e tente novamente.");
    }
}

// Função para enviar os dados para o Firebase
async function enviarResultadoAutomatico(db) { /* ... (código mantido) ... */ }
// Função para fazer o download do resultado
function downloadResultado(db) { /* ... (código mantido) ... */ }
// Funções de Partilha
function partilharWhatsApp() { /* ... (código mantido) ... */ }
function partilharInstagram() { /* ... (código mantido) ... */ }
// Funções mantidas como no seu script original
async function enviarResultadoAutomatico(db){try{const e=document.getElementById("nomeCompleto").value,a=document.getElementById("dataNascimento").value,t=document.getElementById("email").value,o=document.getElementById("whatsapp").value,n=document.getElementById("resultado-arquetipo").innerText,c=firebase.firestore.FieldValue.serverTimestamp();await db.collection("resultados").add({nome:e,dataNascimento:a,email:t,whatsapp:o,arquetipo:n,dataGravacao:c}),console.log("Resultado guardado com sucesso no backend.")}catch(r){console.error("Erro ao guardar resultado no backend: ",r)}}function downloadResultado(db){const e=document.getElementById("consentimento-comunicacao").checked,a=document.getElementById("email").value;e&&db&&db.collection("resultados").where("email","==",a).get().then(t=>{t.forEach(o=>{o.ref.update({consentimentoComunicacao:!0})})});const t=document.getElementById("nomeCompleto").value,o=document.getElementById("numero-alma-resultado").innerText,n=document.getElementById("caminho-vida-resultado").innerText,c=document.getElementById("resultado-arquetipo").innerText,r=document.getElementById("resultado-descricao").innerText,l=`\nResultado do Oráculo de Mnemósine para: ${t}\n==================================================\n\nNÚMEROS FUNDAMENTAIS\n--------------------\nNúmero da Alma (do seu nome): ${o}\nCaminho de Vida (da sua data de nascimento): ${n}\n\nARQUÉTIPO DA ALMA\n-----------------\n${c}\n\nDESCRIÇÃO DO ECO DA SUA ALMA\n----------------------------\n${r}\n\n==================================================\n© 2025 Oráculo de Mnemósine.\n    `.trim(),d=new Blob([l],{type:"text/plain"}),i=URL.createObjectURL(d),s=document.createElement("a");s.href=i,s.download="meu_arquetipo_da_alma.txt",document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(i)}function partilharWhatsApp(){const e=document.getElementById("resultado-arquetipo").innerText,a=`Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: *${e}*. Descobre o teu também!`,t=window.location.origin,o=`https://wa.me/?text=${encodeURIComponent(a+" "+t)}`;window.open(o,"_blank")}function partilharInstagram(){const e=document.getElementById("resultado-arquetipo").innerText,a=`Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: ${e}. #oraculodemnemosine #filosofia #anamnese`;navigator.clipboard.writeText(a).then(function(){alert("Texto do resultado copiado! Agora pode colar na sua história ou publicação do Instagram.")},function(t){alert("Não foi possível copiar o texto. Por favor, copie manualmente.")})}
