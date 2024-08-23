const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const { randomUUID } = require("crypto");

// Caminho para o diretório e arquivo JSON
const directoryPath = path.join(__dirname, "../src/database");
const filePath = path.join(directoryPath, "db.json");

// Função para garantir que o diretório e o arquivo existam
function ensureDirectoryAndFile(callback) {
  // Verificar se o diretório existe
  fs.access(directoryPath, fs.constants.F_OK, (err) => {
    if (err) {
      // Diretório não existe, então criá-lo
      fs.mkdir(directoryPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Erro ao criar diretório:", err);
          return;
        }
        // Diretório criado com sucesso, agora garantir que o arquivo exista
        ensureFile(callback);
      });
    } else {
      // Diretório existe, então garantir que o arquivo exista
      ensureFile(callback);
    }
  });
}

// Função para garantir que o arquivo JSON exista
function ensureFile(callback) {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Arquivo não existe, então criá-lo com um array vazio
      fs.writeFile(filePath, JSON.stringify([]), "utf8", (err) => {
        if (err) {
          console.error("Erro ao criar arquivo:", err);
          return;
        }
        console.log("Arquivo criado com sucesso.");
        // Chama o callback após a criação do arquivo
        callback();
      });
    } else {
      // Arquivo existe, então chama o callback
      callback();
    }
  });
}

// Função para adicionar um item ao arquivo JSON
function createRegistro(newItem) {
  console.log("> Salvando novo registro");
  // Garantir que o diretório e o arquivo existam antes de tentar ler e escrever
  ensureDirectoryAndFile(() => {
    // Ler o conteúdo atual do arquivo JSON
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Erro ao ler o arquivo:", err);
        return;
      }

      let jsonData;
      try {
        // Parse o conteúdo do JSON
        jsonData = JSON.parse(data || "[]");
      } catch (err) {
        console.error("Erro ao parsear JSON:", err);
        return;
      }

      // Adicionar o novo item ao objeto JSON
      if (Array.isArray(jsonData)) {
        jsonData.push({
          id: randomUUID(),
          ...newItem,
          createdAt: dayjs().format("DD-MM-YY HH:mm:ss"),
        });
      } else {
        console.error("O JSON não é um array.");
        return;
      }

      // Converter o objeto JSON atualizado de volta para string
      const updatedData = JSON.stringify(jsonData, null, 2);

      // Escrever o conteúdo atualizado de volta ao arquivo
      fs.writeFile(filePath, updatedData, "utf8", (err) => {
        if (err) {
          console.error("Erro ao escrever o arquivo:", err);
        } else {
          console.log("Arquivo atualizado com sucesso.");
        }
      });
    });
  });
}

module.exports = { createRegistro };
