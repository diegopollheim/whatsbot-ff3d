async function cotarFrete(cep) {
  let cepNormalizado = cep.replace(/[^\d]/g, "");

  try {
    const response = await fetch(
      `https://melhorenvio.com.br/api/v2/calculator?from=88350665&to=${cepNormalizado}`
    );
    const data = await response.json();
    const idCompanias = [1, 2, 3]; // PAC | PAC Centralizado | JadLog
    const fretes = data?.filter((item) => idCompanias.includes(item.id));

    // console.log('> Transportadoras', data)
    // console.log('> Fretes Selecionados', fretes)
    let retorno = "";

    fretes.forEach((frete) => {
      retorno += `*${frete.company.name}* - R$ ${Number(
        frete.price
      ).toLocaleString("pt-br", { minimumFractionDigits: 2 })} (_${
        frete.name
      } - ${frete.delivery_range.min} - ${
        frete.delivery_range.max
      } dias úteis_)\n`;
    });

    return retorno;
  } catch (error) {
    console.error(error)
    return 'Falha na busca dos Valores de Frete!'
  }
}

module.exports = {
  cotarFrete,
};
