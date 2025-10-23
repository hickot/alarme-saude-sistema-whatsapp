const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

/**
 * Envia uma mensagem para um contato do WhatsApp.
 * @param {string} contactName - Nome do contato (como aparece no WhatsApp)
 * @param {string} messageText - Texto da mensagem
 */
async function send(contactName = contactName, messageText) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: "meu-client" }), // pasta .wwebjs_auth
    puppeteer: {
      headless: true, // false se quiser ver o navegador abrindo
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('📱 QR recebido — escaneie com o WhatsApp do seu celular:');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('✅ Autenticado com sucesso (sessão salva).');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
  });

  client.on('ready', async () => {
    console.log('🚀 Cliente pronto!');

    try {
      const contacts = await client.getContacts();
      console.log("-------------------------------");
      //console.log("Contatos: ", contacts);
      console.log("-------------------------------");
      const contact = contacts.find(c => {
        const displayNames = [
          c.pushname && c.pushname.toString(),
          c.shortName && c.shortName.toString(),
          c.name && c.name.toString()
        ].filter(Boolean).map(s => s.toLowerCase());

        return displayNames.some(n => n === contactName.toLowerCase());
      });

      if (!contact) {
        console.log(`❌ Contato "${contactName}" não encontrado.`);
        console.log('💡 Use o nome exato do WhatsApp ou o número no formato "5511999999999@c.us".');
        await client.destroy();
        return;
      }

      const chatId = contact.id._serialized;
      const sent = await client.sendMessage(chatId, messageText);

      if (sent.id) {
        console.log(`✅ Mensagem enviada para "${contactName}": "${messageText}"`);
      } else {
        console.log('⚠️ Mensagem enviada, mas sem ID de confirmação.');
      }

    } catch (err) {
      console.error('❌ Erro ao tentar enviar mensagem:', err);
    } finally {

      console.log('===END=WHATS===')
    // opcional: mantém o cliente rodando se quiser enviar mais mensagens depois
    // client.destroy(); // descomente se quiser finalizar após o envio
    setTimeout(() => {
      client.destroy();
    }, 10000);

    }
  });

  console.log('===START==WHATS==');
  // Inicializa o cliente
  client.initialize();
}

module.exports = { send };
