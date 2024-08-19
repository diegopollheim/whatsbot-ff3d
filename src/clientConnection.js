const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const { cotarFrete } = require("./melhor-envio/frete");
const stages = require("./stages");
const {
  getStageClient,
  setStageClient,
  removeClientStage,
} = require("./store/clientStage");

let expires = 30 * 1000; // 30 seg
// let expires = 60 * 60 * 1000 // 1 hora
let timer;

async function onMessageReveived(message) {
  let msg = message.body;
  let from = message.from;

  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log("> Reset Stage Client");
    removeClientStage(from);
  }, expires);

  const chat = await message.getChat();
  if (chat.isGroup) return; // se for grupo encerra

  let clientWhats = getStageClient(from);
  console.log("> Client Whats", clientWhats);

  if (!clientWhats) {
    chat.sendMessage(stages[0]);
    setStageClient(from, 0);
    return;
  }

  switch (clientWhats.stage) {
    case 0:
      let op = parseInt(msg);

      // Solicita Cep
      if (op == 1) {
        chat.sendMessage(stages[1]);
        setStageClient(from, 1);
      }

      // Envia tabela de valores
      if (op == 2) {
        const filePath = path.join(__dirname, "assets", "tabela-valores.png");
        const media = MessageMedia.fromFilePath(filePath);
        await chat.sendMessage(media);
        setStageClient(from, 2);
      }

      // Transfere atendente
      if (op == 3) {
        chat.sendMessage(stages[3]);
        setStageClient(from, 3);
      }
      break;
    case 1:
      let cep = msg;

      try {
        const resultCotacao = await cotarFrete(cep);
        let messageRetorno = `🤖
Encontrei os seguintes valores para a sua região!
\n
${resultCotacao}

🚚💨💨💨
              `;

        chat.sendMessage(messageRetorno);
      } catch (error) {
        chat.sendMessage(error.message);
      }

      break;
  }
}

module.exports = {
  onMessageReveived,
};
