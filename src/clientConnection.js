const mensagens = require("./constants/mensagens");
const etapas = require("./constants/etapas");
const { getValoresFreteByCEP } = require("./melhor-envio/getValoresFrete");
const { User } = require("./models/client");

async function onMessageReveived(response) {
  const chat = await response.getChat();
  if (chat.isGroupisGroup) return; // se for grupo encerra

  let msg = response.body;

  // Verificar se usuário existe na base de dados
  const user = await User.findByPk(response.from);

  if (user) {
    if (user.etapa == etapas.BOAS_VINDAS) {
      let opcao = msg;

      console.log('opcao', opcao)
      if (opcao !== '1' || opcao !== '2') {
        return chat.sendMessage(mensagens.OPCAO_INVALIDA);
      }

      switch (opcao) {
        case '1':
          await User.update(
            { etapa: etapas.AGUARDANDO_CEP },
            {
              where: {
                id: user.id,
              },
            }
          );

          chat.sendMessage(mensagens.AGUARDANDO_CEP);
          break;

        case '2':
          await User.update(
            { etapa: etapas.FALAR_COM_ATENDENTE },
            {
              where: {
                id: user.id,
              },
            }
          );

          chat.sendMessage(mensagens.FALAR_COM_ATENDENTE);
          break;
      }
    }
  }

  // Cria um novo usuário
  if (!user) {
    const userCreated = await User.create({
      id: response.from,
      name: response.notifyName,
      phone: response.from.split("@").shift(),
      etapa: etapas.BOAS_VINDAS,
    });

    console.log("Novo cliente cadastrado > ", userCreated);

    return chat.sendMessage(mensagens.BOAS_VINDAS);
  }

  // Se nao existir, criar usuário e dar boas vindas

  // const valoresFrete = await getValoresFreteByCEP(msg);
  // return chat.sendMessage(
  //   `Valores encontrados para sua Região:\n\n ${valoresFrete}`
  // );
}

module.exports = {
  onMessageReveived,
};
