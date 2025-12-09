// content.js

// Ouve o comando do popup para começar
window.addEventListener("message", (event) => {
  if (event.data.type === "INICIAR_AUTOMACAO") {
    console.log("--- Iniciando Automação CapCut ---");
    processarFalas(0);
  }
});

async function processarFalas(index) {
  // 1. Pega TODOS os botões de "fala" visíveis na tela usando a classe do seu print
  const botoesFala = document.querySelectorAll('.oral-ciN_Ll');

  console.log(`Encontrados ${botoesFala.length} botões. Processando o número ${index + 1}...`);

  if (index >= botoesFala.length) {
    alert("Automação finalizada! Todos os itens foram processados.");
    return;
  }

  const botaoAtual = botoesFala[index];

  // Garante que o botão está visível na tela (rola a página se necessário)
  botaoAtual.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(1000); // Espera 1 seg para a rolagem terminar

  // Clica no botão para abrir o popup
  botaoAtual.click();
  
  // 2. Espera o popup abrir e procura pelo "Marcus"
  const marcusSelecionado = await selecionarMarcus();

  if (marcusSelecionado) {
    // 3. Aguarda o processamento (o loading)
    await esperarProcessamento();
    
    // Pequena pausa de segurança antes de ir para o próximo
    await sleep(1500); 
    
    // RECURSIVIDADE: Chama a função para o próximo item
    processarFalas(index + 1); 
  } else {
    console.error(`Falha ao selecionar Marcus no item ${index}. Tentando o próximo...`);
    processarFalas(index + 1);
  }
}

// --- Funções Auxiliares ---

async function selecionarMarcus() {
  console.log("Procurando 'Marcus'...");
  return new Promise((resolve) => {
    let tentativas = 0;
    const maxTentativas = 20; // 10 segundos tentando

    const intervalo = setInterval(() => {
      tentativas++;

      // Procura pelo TEXTO "Marcus" na tela usando XPath (mais seguro que classe)
      const elementoMarcus = document.evaluate(
        "//span[contains(text(), 'Marcus')]", 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE, 
        null
      ).singleNodeValue;

      // Se achou o texto Marcus
      if (elementoMarcus) {
        clearInterval(intervalo);
        
        // Clica no elemento. Às vezes é preciso clicar no pai do texto.
        // Vamos tentar clicar no texto primeiro.
        elementoMarcus.click();
        
        // Tenta clicar também no container pai, caso o clique no texto não funcione
        if(elementoMarcus.parentElement) elementoMarcus.parentElement.click();

        console.log("Marcus selecionado!");
        resolve(true);
      } else if (tentativas >= maxTentativas) {
        clearInterval(intervalo);
        console.log("Tempo esgotado: Marcus não apareceu.");
        resolve(false);
      }
    }, 500); // Checa a cada meio segundo
  });
}

async function esperarProcessamento() {
  console.log("Aguardando geração do áudio...");
  // Vamos dar um tempo fixo inicial para o loading aparecer
  await sleep(2000); 

  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      // Procura se existe algum texto indicando carregamento na tela
      // Ajuste o texto abaixo se a mensagem for diferente de "Criando..."
      const corpoPagina = document.body.innerText;
      const estaCarregando = corpoPagina.includes("Criando a locução") || 
                             corpoPagina.includes("Gerando") ||
                             corpoPagina.includes("%"); // Geralmente tem porcentagem

      if (!estaCarregando) {
        clearInterval(intervalo);
        console.log("Processamento concluído.");
        resolve();
      }
    }, 1000);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
