// =========================================================================
// CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
// Usando a sua nova configuração correta para 'menemos'
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDcHuPiBGzsIgi9RmZd6gUYh49A6ij8JTc",
  authDomain: "menemos.firebaseapp.com",
  projectId: "menemos",
  storageBucket: "menemos.appspot.com",
  messagingSenderId: "561439786136",
  appId: "1:561439786136:web:aef5d0d8b5e12b1f52bced",
  measurementId: "G-FGZRQDH2X2"
};

// Inicializa o Firebase para que as outras funções possam usá-lo
let db;
try {
    if (typeof firebase !== 'undefined') {
        // Evita reinicializar o app se ele já existir
        if (firebase.apps.length === 0) {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebase.analytics();
            console.log("Firebase inicializado com sucesso.");
        } else {
            db = firebase.app().firestore();
        }
    } else {
        console.error("SDK do Firebase não foi carregado.");
    }
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}


// =========================================================================
// CÓDIGO QUE EXECUTA QUANDO A PÁGINA CARREGA
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {
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
    document.querySelectorAll('.solido-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.solido-card').forEach(c => c.classList.remove('selecionado'));
            card.classList.add('selecionado');
        });
    });

    // Anexa funções aos botões da página de resultado
    const botaoDownload = document.getElementById('botao-download');
    if (botaoDownload) {
        botaoDownload.onclick = () => downloadResultado(db);
    }
    const botaoWhatsapp = document.getElementById('botao-whatsapp');
    if (botaoWhatsapp) {
        botaoWhatsapp.onclick = partilharWhatsApp;
    }
    const botaoInstagram = document.getElementById('botao-instagram');
    if (botaoInstagram) {
        botaoInstagram.onclick = partilharInstagram;
    }
});


// =========================================================================
// FUNÇÕES GLOBAIS (Acessíveis pelo HTML)
// =========================================================================

// Função para navegar entre as etapas do oráculo
function irParaEtapa(numeroEtapa) {
    document.querySelectorAll('.etapa').forEach(etapa => {
        etapa.classList.remove('etapa-ativa');
    });
    const targetElement = document.getElementById(`etapa${numeroEtapa}`);
    if (targetElement) {
        targetElement.classList.add('etapa-ativa');
    }
}

// Função principal para calcular e mostrar o resultado
// Esta função é chamada pelo onclick="calcularResultado()" no seu HTML
async function calcularResultado() {
    // 1. VALIDAÇÃO
    const validacoes = [
        { valor: document.getElementById('nomeCompleto').value, etapa: 1, mensagem: "Por favor, preencha o seu nome completo na Etapa 1." },
        { valor: document.getElementById('dataNascimento').value, etapa: 1, mensagem: "Por favor, preencha a sua data de nascimento na Etapa 1." },
        { valor: document.querySelector('input[name="alma_tripartite"]:checked'), etapa: 2, mensagem: "Por favor, faça a sua escolha na Etapa 2." },
        { valor: document.querySelector('.solido-card.selecionado'), etapa: 3, mensagem: "Por favor, selecione um Sólido Platónico na Etapa 3." },
        // Adicione aqui as outras validações se necessário
    ];

    for (const check of validacoes) {
        if (!check.valor) {
            alert(check.mensagem);
            irParaEtapa(check.etapa);
            return; // Para a execução se algo estiver em falta
        }
    }

    // 2. CÁLCULO DE PONTUAÇÃO (Lógica simplificada para exemplo)
    const scores = { filosofo: 0, guardiao: 0, artesao: 0 };
    const alma = document.querySelector('input[name="alma_tripartite"]:checked').value;
    if (alma === 'razao') scores.filosofo += 2;
    if (alma === 'animo') scores.guardiao += 2;
    if (alma === 'desejo') scores.artesao += 2;
    // ... adicione a sua lógica completa de pontuação aqui ...

    // 3. DETERMINAR ARQUÉTIPO VENCEDOR
    let arquetipoVencedor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // 4. DEFINIR TEXTOS DOS RESULTADOS
    const resultados = {
        filosofo: { titulo: "Um Eco da Alma de Ouro: A Vida do Filósofo", descricao: "As suas recordações sugerem uma vida passada dedicada à busca da sabedoria..." },
        guardiao: { titulo: "Um Eco da Alma de Prata: A Vida do Guardião", descricao: "As suas recordações sugerem uma vida passada forjada na honra e no dever..." },
        artesao: { titulo: "Um Eco da Alma de Bronze: A Vida do Artesão", descricao: "As suas recordações sugerem uma vida passada dedicada à criação e à harmonia..." }
    };
    
    // 5. MOSTRAR DADOS NO HTML
    document.getElementById('resultado-arquetipo').innerText = resultados[arquetipoVencedor].titulo;
    document.getElementById('resultado-descricao').innerText = resultados[arquetipoVencedor].descricao;
    // ... preencha os campos de numerologia se os calcular ...

    // 6. ENVIAR DADOS PARA O FIREBASE
    try {
        if (db) {
            const dadosParaEnviar = {
                nome: document.getElementById('nomeCompleto').value,
                dataNascimento: document.getElementById('dataNascimento').value,
                email: document.getElementById('email').value,
                whatsapp: document.getElementById('whatsapp').value,
                arquetipo: resultados[arquetipoVencedor].titulo,
                dataGravacao: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection("resultados").add(dadosParaEnviar);
            console.log("Resultado guardado com sucesso no Firebase.");
        }
    } catch (error) {
        console.error("Erro ao guardar resultado no Firebase: ", error);
    }
    
    // 7. IR PARA A PÁGINA DE RESULTADO
    irParaEtapa('resultado-oraculo');
}


// Funções de download e partilha (sem alterações necessárias)
function downloadResultado(db) { /* ... o seu código original aqui ... */ }
function partilharWhatsApp() { /* ... o seu código original aqui ... */ }
function partilharInstagram() { /* ... o seu código original aqui ... */ }
// Funções originais mantidas para compatibilidade
function downloadResultado(db){const e=document.getElementById("consentimento-comunicacao").checked,a=document.getElementById("email").value;e&&db&&db.collection("resultados").where("email","==",a).get().then(t=>{t.forEach(o=>{o.ref.update({consentimentoComunicacao:!0})})});const t=document.getElementById("nomeCompleto").value,o=document.getElementById("numero-alma-resultado")?document.getElementById("numero-alma-resultado").innerText:"",n=document.getElementById("caminho-vida-resultado")?document.getElementById("caminho-vida-resultado").innerText:"",c=document.getElementById("resultado-arquetipo").innerText,r=document.getElementById("resultado-descricao").innerText,l=`\nResultado do Oráculo de Mnemósine para: ${t}\n==================================================\n\nNÚMEROS FUNDAMENTAIS\n--------------------\nNúmero da Alma (do seu nome): ${o}\nCaminho de Vida (da sua data de nascimento): ${n}\n\nARQUÉTIPO DA ALMA\n-----------------\n${c}\n\nDESCRIÇÃO DO ECO DA SUA ALMA\n----------------------------\n${r}\n\n==================================================\n© 2025 Oráculo de Mnemósine.\n    `.trim(),d=new Blob([l],{type:"text/plain"}),i=URL.createObjectURL(d),s=document.createElement("a");s.href=i,s.download="meu_arquetipo_da_alma.txt",document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(i)}
function partilharWhatsApp(){const e=document.getElementById("resultado-arquetipo").innerText,a=`Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: *${e}*. Descobre o teu também!`,t=window.location.origin,o=`https://wa.me/?text=${encodeURIComponent(a+" "+t)}`;window.open(o,"_blank")}
function partilharInstagram(){const e=document.getElementById("resultado-arquetipo").innerText,a=`Descobri o meu arquétipo de vida passada no Oráculo de Mnemósine: ${e}. #oraculodemnemosine #filosofia #anamnese`;navigator.clipboard.writeText(a).then(function(){alert("Texto do resultado copiado! Agora pode colar na sua história ou publicação do Instagram.")},function(t){alert("Não foi possível copiar o texto. Por favor, copie manualmente.")})}
