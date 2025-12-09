document.getElementById('startBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
        // Envia uma mensagem para o content.js iniciar
        window.postMessage({ type: "INICIAR_AUTOMACAO" }, "*");
    }
  });
});
