// Importa o módulo de sistema de arquivos
const fs = require('fs');

// Caminho do arquivo onde será salvo
const caminhoArquivo = './data-hora-saude-sistema.txt';

// ===============================
// Configurações de moedas e alertas
// ===============================
const MOEDAS = [
  { symbol: "BTCUSDT", limite: 109532.16 },
];

const INTERVALO = 30 * 1000; // Checagem a cada minuto

const repeticoes = 3;
const intervaloEnvio = 10 * 60 * 1000; // 22 minutos em milissegundos

//contador
var contador = 0;

// for (let i = 1; i <= repeticoes; i++) {
//   setTimeout(async () => {
//     // chama a função e envia a mensagem
//     await send('Douglas Alvares', mensagem);
//   }, (i - 1) * intervaloEnvio);
// }

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

// ===============================
// Monitoramento Binance
// ===============================
async function rotina() {

  console.log("🔍 Monitorando moedas:");
  MOEDAS.forEach(m => console.log(` - ${m.symbol} <= ${m.limite}`));
  console.log("");

  setInterval(async () => {
    for (const moeda of MOEDAS) {
      try {

        contador = contador + 1

        const mensagem = 'Sistema em funcionamento... ';

        // Ler a data salva no arquivo
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
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
        fs.writeFileSync(caminhoArquivo, dataHoraFormatada, 'utf8');
        console.log('✅ Data e hora atualizada no arquivo!');

        // Chama a função de envio
        const { send } = require('./whatsapp');
        await send('Douglas Alvares', mensagem);
        }

          console.log('Contador: ', contador);
        
      } catch (err) {
        
        console.error(`❌ Erro consultando ${moeda.symbol}:`, err && err.message ? err.message : err);
      }
    }
  }, INTERVALO);
}