async function getValoresFreteByCEP(cep) {
  const response = await fetch(
    `https://melhorenvio.com.br/api/v2/calculator?from=88350665&to=${cep}`
  );
  const data = await response.json();
  const idCompanias = [3, 28, 29]; // PAC | PAC Centralizado | JadLog
  const fretes = data?.filter((item) => idCompanias.includes(item.id));


  console.log(fretes)
  let retorno = '';

  fretes.forEach((frete) => {
    retorno += `*${frete.company.name}* - R$ ${frete.price} (_${frete.name}_)\n`;
  });

  return retorno;
}

module.exports = {
  getValoresFreteByCEP,
};
