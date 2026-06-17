const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode  = require('qrcode');
const pino    = require('pino');
const path    = require('path');
const fs      = require('fs');

const SESSION_DIR = path.join(__dirname, 'data', 'whatsapp-session');
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });


let sock             = null;
let qrDataURL        = null;
let status           = 'disconnected'; // disconnected | connecting | qr_ready | connected
let connectingLock   = false;
let retryTimer       = null;

async function connect() {
  if (status === 'connected' || connectingLock) return;
  connectingLock = true;
  status = 'connecting';
  qrDataURL = null;

  try {
    const { state, saveCreds }  = await useMultiFileAuthState(SESSION_DIR);
    const { version }           = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth:               state,
      printQRInTerminal:  true,
      logger:             pino({ level: 'silent' }),
      browser:            ['Universo Elétrico', 'Chrome', '1.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrDataURL = await QRCode.toDataURL(qr, { width: 280, margin: 2 });
        status = 'qr_ready';
        console.log('[WhatsApp] QR code gerado — aguardando leitura');
      }

      if (connection === 'close') {
        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log('[WhatsApp] Conexão encerrada. Código:', code);
        sock = null;
        connectingLock = false;

        if (code === DisconnectReason.loggedOut) {
          console.log('[WhatsApp] Deslogado. Limpando sessão...');
          clearSession();
          status = 'disconnected';
        } else {
          status = 'connecting';
          clearTimeout(retryTimer);
          retryTimer = setTimeout(() => connect(), 5000);
        }
      }

      if (connection === 'open') {
        qrDataURL = null;
        status = 'connected';
        connectingLock = false;
        console.log('[WhatsApp] ✅ Conectado com sucesso');
      }
    });
  } catch (e) {
    connectingLock = false;
    status = 'disconnected';
    console.error('[WhatsApp] Erro ao conectar:', e.message);
  }
}

function clearSession() {
  try {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  } catch(e) { /* ignore */ }
}

async function sendMessage(numero, texto) {
  if (status !== 'connected' || !sock) throw new Error('WhatsApp não está conectado');
  const digits = numero.replace(/\D/g, '');
  if (!digits) throw new Error('Número inválido');
  const numFull = digits.startsWith('55') ? digits : '55' + digits;

  // Sempre tenta os dois formatos brasileiros
  const jids = [numFull + '@s.whatsapp.net'];
  if (numFull.length === 13 && numFull.startsWith('55')) {
    const semNove = numFull.slice(0, 4) + numFull.slice(5);
    jids.push(semNove + '@s.whatsapp.net');
  }

  console.log(`\n┌─ Envio WhatsApp para: ${numero}`);
  let enviado = false;
  for (const jid of jids) {
    try {
      await sock.sendMessage(jid, { text: texto });
      console.log(`│  ✅ ${jid}`);
      enviado = true;
    } catch(e) {
      console.log(`│  ❌ ${jid} — ${e.message}`);
    }
  }
  console.log(`└─ ${enviado ? 'Entregue' : 'FALHOU em todos os formatos'}\n`);
  if (!enviado) throw new Error('Não foi possível entregar para nenhum formato do número');
}

function disconnect() {
  clearTimeout(retryTimer);
  connectingLock = false;
  if (sock) { try { sock.logout(); } catch(e) {} }
  sock = null;
  status = 'disconnected';
  qrDataURL = null;
  clearSession();
  console.log('[WhatsApp] Desconectado manualmente');
}

function getStatus() { return status; }
function getQR()     { return qrDataURL; }
function getNumero() { return sock?.user?.id?.split(':')[0] || null; }

// Inicia conexão automaticamente
connect().catch(e => console.error('[WhatsApp] Erro na inicialização:', e.message));

module.exports = { connect, disconnect, sendMessage, getStatus, getQR, getNumero };
