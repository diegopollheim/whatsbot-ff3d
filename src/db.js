const XLSX = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');
const dayjs = require('dayjs');

// Função para obter o caminho do arquivo com base na data atual
function getFilePath() {
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  const today = dayjs().format('DD-MMM-YYYY'); // Formato DD-MMM-YYYY
  return path.join(downloadsPath, `${today}.xlsx`);
}

// Função para ajustar o tamanho das colunas com base no conteúdo, com limite máximo
function autoFitColumns(worksheet, data, maxColWidth = 30) {
  const columnWidths = [];

  data.forEach(row => {
    row.forEach((val, idx) => {
      const length = val ? val.toString().length : 10;
      columnWidths[idx] = Math.min(Math.max(columnWidths[idx] || 10, length), maxColWidth);
    });
  });

  worksheet['!cols'] = columnWidths.map(width => ({ wch: width + 2 }));
}

// Função para definir a quebra de linha e ajustar a altura das linhas
function adjustRowHeights(worksheet, data) {
  data.forEach((row, rowIdx) => {
    worksheet['!rows'] = worksheet['!rows'] || [];
    worksheet['!rows'][rowIdx] = worksheet['!rows'][rowIdx] || {};
    worksheet['!rows'][rowIdx].hpt = 20; // Define uma altura padrão para a linha
  });

  // Aplica quebra de linha (wrap text) a todas as células
  Object.keys(worksheet).forEach(cellRef => {
    if (worksheet[cellRef].v) {
      worksheet[cellRef].s = worksheet[cellRef].s || {};
      worksheet[cellRef].s.alignment = worksheet[cellRef].s.alignment || {};
      worksheet[cellRef].s.alignment.wrapText = true;
    }
  });
}

// Função para aplicar estilos
function applyStyles(worksheet) {
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellRef]) continue;

    worksheet[cellRef].s = worksheet[cellRef].s || {};
    worksheet[cellRef].s.fill = {
      fgColor: { rgb: "D3D3D3" } // Cor de fundo cinza
    };
    worksheet[cellRef].s.font = {
      bold: true,
      color: { rgb: "000000" }
    };
    worksheet[cellRef].s.border = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };
  }

  // Aplica bordas pretas às células
  Object.keys(worksheet).forEach(cellRef => {
    if (worksheet[cellRef].v) {
      worksheet[cellRef].s = worksheet[cellRef].s || {};
      worksheet[cellRef].s.border = worksheet[cellRef].s.border || {};
      worksheet[cellRef].s.border = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      };
    }
  });
}

// Função para adicionar uma nova dúvida ao arquivo do dia
function createRegistro(record) {
  const filePath = getFilePath();
  let workbook;
  let worksheet;
  
  // Verifica se o arquivo já existe
  if (fs.existsSync(filePath)) {
    // Lê o arquivo existente
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets['Dúvidas'];
  } else {
    // Cria um novo workbook e worksheet
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([
      ['Data/Hora', 'Nome', 'Telefone', 'Mensagem'] // Cabeçalhos das colunas
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dúvidas');
  }

  // Adiciona a nova dúvida
  const newRow = [
    dayjs().format('HH:mm:ss'),
    record.name || '',
    record.phone || '',
    record.message || ''
  ];
  const wsData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  wsData.push(newRow);
  worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Ajusta o tamanho das colunas, com limite de largura
  autoFitColumns(worksheet, wsData);

  // Ajusta a quebra de linha e a altura das linhas
  adjustRowHeights(worksheet, wsData);

  // Aplica estilos ao cabeçalho e às células
  applyStyles(worksheet);

  // Atualiza a planilha e salva o arquivo
  workbook.Sheets['Dúvidas'] = worksheet;
  XLSX.writeFile(workbook, filePath);
  console.log(`> Registro salvo em: ${filePath}`);
}

// Exemplo de uso
// createRegistro({
//   name: 'Diego Pollheim',
//   phone: '47991774897',
//   message: 'Dúvida de exemplo'
// });

module.exports = createRegistro
