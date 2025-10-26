// Importa o módulo de sistema de arquivos
const fs = require('fs');

// Caminho do arquivo onde será salvo
const caminhoArquivoBitcoin = './data-hora.txt';
const caminhoArquivoSaudeSistema = './data-hora-saude-sistema.txt';
const caminhoValorCotacao = './valor.txt';

const INTERVALO = 30 * 1000; // Checagem a cada minuto

const repeticoes = 3;
const intervaloEnvio = 10 * 60 * 1000; // 22 minutos em milissegundos

const MOEDAS = [
  { symbol: "BTCUSDT", limite: 117532.16 },
];

//contador
var contador = 0;
var valor = 0;

rotina();

// Função para formatar a data no horário local
function formatarDataLocal(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = String(date.getHours()).padStart(2, '0');       // hora local
  const minuto = String(date.getMinutes()).padStart(2, '0');
  const segundo = String(date.getSeconds()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

async function rotina() {
  console.log("");
  setInterval(async () => {
    try {

      for (const moeda of MOEDAS) {

        fs.readFile(caminhoValorCotacao, 'utf8', (erro, dados) => {
          if (erro) {
            console.error('Erro ao ler o arquivo:', erro);
            return;
          }

          // Remove espaços, quebras de linha, e converte para número real
          const valor = parseFloat(dados.trim().replace(',', '.'));

          if (isNaN(valor)) {
            console.error('O conteúdo do arquivo não é um número válido.');
          } else {
            console.log('Número lido:', valor);
            moeda.limite = valor;
          }
        });

        console.log("🔍 Monitorando moedas:");
        MOEDAS.forEach(m => console.log(` - ${m.symbol} <= ${m.limite}`));
        console.log("");

        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda.symbol}`, { timeout: 10000 });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const preco = parseFloat(data.price);
        console.log(`[${new Date().toLocaleString()}] ${moeda.symbol}: ${preco} (limite ${moeda.limite})`);

        contador = contador + 1

        if (Number.isFinite(preco) && preco <= moeda.limite) {
          const mensagem = `🚨 *Alerta Binance!*\n\n💸 ${moeda.symbol} atingiu *${preco.toLocaleString("pt-BR")}* (limite: ${moeda.limite}).\n📅 ${new Date().toLocaleString("pt-BR")}`;

          console.log('- Passou pela regra da Cotação -')

          // Ler a data salva no arquivo
          const conteudo = fs.readFileSync(caminhoArquivoBitcoin, 'utf8');
          const inicio = new Date(conteudo);
          console.log('data inicio:', inicio);

          // Data atual como objeto Date
          const fim = new Date();
          console.log('data atual:', fim);

          // Diferença em milissegundos
          const diffMs = fim.getTime() - inicio.getTime();
          console.log('diffMs:', diffMs);

          // Verifica se já passou o intervalo (ex: 30 minutos)
          const interval = 30 * 60 * 1000; // 60 minutos em ms
          console.log('intervalo: ', interval);

          if (diffMs >= interval) {
            console.log('✅ Passou o interval, enviando mensagem');

            // Atualiza o arquivo com a data e hora no horário local
            const dataHoraFormatada = formatarDataLocal(fim);
            fs.writeFileSync(caminhoArquivoBitcoin, dataHoraFormatada, 'utf8');
            console.log('✅ Data e hora atualizada no arquivo!');

            // Chama a função de envio
            const { send } = require('./whatsapp');
            await send('Douglas Alvares', mensagem);
          }
        } else {

          console.log('- Passou pela regra do Sistema -')

          const mensagem = 'Sistema em funcionamento... ';

          // Ler a data salva no arquivo
          const conteudo = fs.readFileSync(caminhoArquivoSaudeSistema, 'utf8');
          const inicio = new Date(conteudo);
          console.log('data inicio:', inicio);

          // Data atual como objeto Date
          const fim = new Date();
          console.log('data atual:', fim);

          // Diferença em milissegundos
          const diffMs = fim.getTime() - inicio.getTime();
          console.log('diffMs:', diffMs);

          // Verifica se já passou o intervalo (ex: 30 minutos)
          const interval = 60 * 60 * 1000; // 60 minutos em ms
          console.log('intervalo: ', interval);

          if (diffMs >= interval) {
            console.log('✅ Passou o interval, enviando mensagem');

            // Atualiza o arquivo com a data e hora no horário local
            const dataHoraFormatada = formatarDataLocal(fim);
            fs.writeFileSync(caminhoArquivoSaudeSistema, dataHoraFormatada, 'utf8');
            console.log('✅ Data e hora atualizada no arquivo!');

            // Chama a função de envio
            const { send } = require('./whatsapp');
            await send('Douglas Alvares', mensagem);
          }
        }
      }

      console.log('Contador: ', contador);

    } catch (err) {

      console.error(`❌ Erro consultando `, err && err.message ? err.message : err);
    }
  }, INTERVALO);
}