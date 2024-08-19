const { cotarFrete } = require("./melhor-envio/frete");
const stages = require("./stages");
const {
  getStageClient,
  setStageClient,
  removeClientStage,
} = require("./store/clientStage");

let expires = 10 * 1000; // 10 seg
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
  if (chat.isGroupisGroup) return; // se for grupo encerra

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
      if (op == 1) {
        chat.sendMessage(stages[1]);
        setStageClient(from, 1);
      }
      if (op == 2) {
        chat.sendMessage(stages[3]);
        setStageClient(from, 3);
      }
      break;
    case 1:
      let cep = msg;
      const resultCotacao = await cotarFrete(cep);

      let messageRetorno = `
Encontrei os seguintes valores para a sua região!
\n
${resultCotacao}      
      `;

      chat.sendMessage(messageRetorno);
      break;
  }
}

module.exports = {
  onMessageReveived,
};
