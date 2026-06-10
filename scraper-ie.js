const puppeteer = require('puppeteer-core');
const fs = require('fs');

// Caminhos comuns do Chrome no Windows
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    try { if (fs.existsSync(p)) return p; } catch(e){}
  }
  return null;
}

/**
 * Busca a Inscrição Estadual de um CNPJ via cnpj.biz
 * @param {string} cnpj - CNPJ apenas números
 * @returns {object} { ie, estado, fonte, erro }
 */
async function buscarIE(cnpj) {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  let browser;

  const execPath = findChrome();
  if (!execPath) {
    return { cnpj: cnpjLimpo, inscricoes: [], ie_principal: null, estado_principal: null, fonte: 'cnpj.biz', erro: 'Chrome/Edge não encontrado. Instale o Google Chrome.' };
  }
  console.log(`[Puppeteer] Usando browser: ${execPath}`);

  try {
   browser = await puppeteer.launch({
  headless: false,
  executablePath: execPath,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
  ]
});

const page = await browser.newPage();

// Simula um navegador real
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9',
    });

    const url = `https://cnpj.biz/${cnpjLimpo}`;
    console.log(`[Puppeteer] Acessando: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Aguarda o elemento com a IE aparecer
    await page.waitForSelector('b.copy', { timeout: 10000 }).catch(() => null);

    // Extrai todas as inscrições estaduais da página
    const resultado = await page.evaluate(() => {
      const inscrições = [];

      // Busca todos os parágrafos que mencionam "Inscrição Estadual"
      const paragrafos = document.querySelectorAll('p');
      paragrafos.forEach(p => {
        const texto = p.textContent || '';
        if (texto.includes('Inscrição Estadual')) {
          // Extrai o estado do texto (ex: "Inscrição Estadual MG:")
          const matchEstado = texto.match(/Inscrição Estadual\s+([A-Z]{2})/);
          const estado = matchEstado ? matchEstado[1] : 'N/D';

          // Pega o valor dentro de <b class="copy">
          const bEl = p.querySelector('b.copy');
          const ie = bEl ? bEl.textContent.trim() : null;

          if (ie) {
            inscrições.push({ estado, ie });
          }
        }
      });

      return inscrições;
    });

    console.log('[Puppeteer] Resultado:', resultado);
    return {
      cnpj: cnpjLimpo,
      inscricoes: resultado,
      ie_principal: resultado.length > 0 ? resultado[0].ie : null,
      estado_principal: resultado.length > 0 ? resultado[0].estado : null,
      fonte: 'cnpj.biz',
      erro: null
    };

  } catch (e) {
    console.error('[Puppeteer] Erro:', e.message);
    return {
      cnpj: cnpjLimpo,
      inscricoes: [],
      ie_principal: null,
      estado_principal: null,
      fonte: 'cnpj.biz',
      erro: e.message
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ── Execução direta via linha de comando ──────────────────────────
// node scraper-ie.js 02697297000111
if (require.main === module) {
  const cnpjArg = process.argv[2];
  if (!cnpjArg) {
    console.error('Uso: node scraper-ie.js <CNPJ>');
    console.error('Ex:  node scraper-ie.js 02697297000111');
    process.exit(1);
  }
  buscarIE(cnpjArg).then(r => {
    console.log('\n─── Resultado ───────────────────────────────');
    if (r.erro) {
      console.log('❌ Erro:', r.erro);
    } else if (r.inscricoes.length === 0) {
      console.log('⚠️  Nenhuma IE encontrada para o CNPJ:', r.cnpj);
    } else {
      r.inscricoes.forEach(i => {
        console.log(`✅ IE ${i.estado}: ${i.ie}`);
      });
    }
    console.log('─────────────────────────────────────────────\n');
  });
}

module.exports = { buscarIE };
