const fs = require("fs");
const path = require("path");
const createRegistro = require("./db");
const { MessageMedia } = require("whatsapp-web.js");
const { cotarFrete } = require("./melhor-envio/frete");
const stages = require("./stages");
const {
  getStageClient,
  setStageClient,
  removeClientStage,
} = require("./store/clientStage");
const isNumeric = require("./utils/isNumeric");
require("dotenv").config();

let expires = 60 * 60 * 1000; // 1 hora
let timer;

let ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER;
let BOT_ACTIVE = true;

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

  if (from.includes(ADMIN_PHONE_NUMBER)) {
    if (msg.includes("/bot")) {
      let ativarBot = msg.split("/bot")[1];
      BOT_ACTIVE = ativarBot == " true";
      console.log("> Bot Ativo:", BOT_ACTIVE);
      chat.sendMessage(
        `${BOT_ACTIVE ? "✅ Bot Ativado" : "🚫 Bot Desativado"}`
      );
    }
    return;
  }

  if (!BOT_ACTIVE) return;

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
      console.log("> Op: ", op);
      
      // Opcão inválida
      if (op > 3 || !isNumeric(msg)) {
        chat.sendMessage("⚠️ Opção Inválida!\n\n_🤖 Digite uma opção válida_");
        return;
      }

      // Solicita Cep
      if (op == 1) {
        chat.sendMessage(stages[1]);
        setStageClient(from, 1);
      }

      // Envia tabela de valores // Multiplas imagens
      if (op == 2) {
        const pathImages = path.resolve(__dirname + "/assets");
        fs.readdirSync(pathImages).forEach(async (file) => {
          const pathFile = path.resolve(__dirname + "/assets/" + file);

          console.log("> Enviando: ", file);
          const media = MessageMedia.fromFilePath(pathFile);
          await chat.sendMessage(media);
        });

        removeClientStage(from);
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
      } finally {
        removeClientStage(from);
      }

      break;

    case 3:
      chat.sendMessage(stages[4]);
      setStageClient(from, 4);

      // Salvar registro para consulta futura
      createRegistro({
        name: chat.name,
        phone: from.split("@")[0],
        message: msg,
      });
      break;
  }
}

module.exports = {
  onMessageReveived,
};
