let executando = false; // Variável de controle (bandeira)

// Ouve os comandos
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "INICIAR_AUTOMACAO") {
    if (!executando) { // Evita iniciar duas vezes
      console.log("--- Iniciando Automação ---");
      executando = true;
      processarFalas(0);
    }
  } else if (request.type === "PARAR_AUTOMACAO") {
    console.log("--- COMANDO DE PARADA RECEBIDO ---");
    executando = false; // Isso vai fazer o loop parar na próxima verificação
    alert("Automação pausada/parada!");
  }
});

async function processarFalas(index) {
  // 1. VERIFICAÇÃO DE SEGURANÇA: Se mandaram parar, a gente sai da função aqui
  if (!executando) {
    console.log("Execução interrompida pelo usuário.");
    return;
  }

  const botoesFala = document.querySelectorAll('.oral-ciN_Ll');

  if (index >= botoesFala.length) {
    alert("Fim da lista!");
    executando = false;
    return;
  }

  console.log(`Processando item ${index + 1}/${botoesFala.length}...`);
  const botaoAtual = botoesFala[index];

  botaoAtual.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(1000);

  // Verificação extra antes de clicar (caso você tenha clicado em parar durante o scroll)
  if (!executando) return;

  botaoAtual.click();
  
  const marcusSelecionado = await selecionarMarcus();

  if (marcusSelecionado && executando) { // Só continua se ainda estiver executando
    await esperarProcessamento();
    await sleep(1500);
    
    // Chama o próximo (Recursividade)
    processarFalas(index + 1); 
  } else {
    // Se falhou ou mandaram parar, tenta ir pro próximo se ainda estiver ativo
    if(executando) processarFalas(index + 1);
  }
}

// --- As funções auxiliares continuam iguais ---
async function selecionarMarcus() {
  return new Promise((resolve) => {
    let tentativas = 0;
    const intervalo = setInterval(() => {
      // Se o usuário mandou parar no meio da busca, a gente cancela
      if (!executando) {
        clearInterval(intervalo);
        resolve(false);
        return;
      }

      tentativas++;
      const elementoMarcus = document.evaluate("//span[contains(text(), 'Marcus')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

      if (elementoMarcus) {
        clearInterval(intervalo);
        elementoMarcus.click();
        if(elementoMarcus.parentElement) elementoMarcus.parentElement.click();
        resolve(true);
      } else if (tentativas >= 20) {
        clearInterval(intervalo);
        resolve(false);
      }
    }, 500);
  });
}

async function esperarProcessamento() {
  await sleep(2000); 
  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      // Se mandou parar, sai do loop
      if (!executando) {
        clearInterval(intervalo);
        resolve();
        return;
      }

      const corpoPagina = document.body.innerText;
      const estaCarregando = corpoPagina.includes("Criando a locução") || corpoPagina.includes("Gerando") || corpoPagina.includes("%");

      if (!estaCarregando) {
        clearInterval(intervalo);
        resolve();
      }
    }, 1000);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
