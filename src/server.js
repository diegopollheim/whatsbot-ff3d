const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { onMessageReveived } = require("./clientConnection");
const { User } = require('./models/client')

// Create a new client instance
const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

// Client is ready!
client.once("ready", () => {
  console.log("Client is connected!");
});

// QR-CODE
client.on("qr", (qr) => {
  console.log("QR-CODE > Escaneie para iniciar a sessão...");
  qrcode.generate(qr, { small: true });
});

// Received messages
client.on("message_create", onMessageReveived);

// Start your client
client.initialize();
