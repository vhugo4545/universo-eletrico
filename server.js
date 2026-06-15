require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');

const app  = express();
const PORT = process.env.PORT || 3000;
const SINTEGRA_TOKEN = process.env.SINTEGRA_TOKEN || '5A67C190-F9D3-4B94-8079-0A70DA008B17';

// ─── DB ───────────────────────────────────────────────────────────────────────
const DB_DIR  = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'cadastros.json');
if (!fs.existsSync(DB_DIR))  fs.mkdirSync(DB_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

const lerDB    = () => { try { return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); } catch(e){ return []; } };
const salvarDB = d  => fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));

// ─── CACHE DE CNPJ ────────────────────────────────────────────────────────────
const CACHE_FILE = path.join(DB_DIR, 'cnpj-cache.json');
if (!fs.existsSync(CACHE_FILE)) fs.writeFileSync(CACHE_FILE, '{}');

const lerCache    = () => { try { return JSON.parse(fs.readFileSync(CACHE_FILE,'utf8')); } catch(e){ return {}; } };
const salvarCache = c  => fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2));

function getCacheEntry(cnpj) {
  const cache = lerCache();
  return cache[cnpj] || null;
}

function setCacheEntry(cnpj, campo, dados) {
  const cache = lerCache();
  if (!cache[cnpj]) cache[cnpj] = { cached_at: new Date().toISOString() };
  cache[cnpj][campo]     = dados;
  cache[cnpj].updated_at = new Date().toISOString();
  salvarCache(cache);
}

// ─── UPLOADS ─────────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOADS_DIR, req.params.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
                   .replace(/[^a-zA-Z0-9_\-.]/g, '_').slice(0, 60);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// ─── CADASTROS ────────────────────────────────────────────────────────────────
app.get('/api/cadastros', (req, res) => {
  let lista = lerDB();
  if (req.query.vendedor) lista = lista.filter(c => c.vendedor_slug === req.query.vendedor);
  if (req.query.status)   lista = lista.filter(c => c.status === req.query.status);
  if (req.query.cnpj)     lista = lista.filter(c => (c.cnpj||'').replace(/\D/g,'') === req.query.cnpj.replace(/\D/g,''));
  lista.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  console.log(`[GET /api/cadastros] vendedor=${req.query.vendedor||'*'} status=${req.query.status||'*'} → ${lista.length} registros`);
  res.json({ ok:true, data:lista, total:lista.length });
});

app.get('/api/cadastros/:id', (req, res) => {
  const c = lerDB().find(c => c.id === req.params.id);
  if (!c) {
    console.warn(`[GET /api/cadastros/${req.params.id}] → 404 não encontrado`);
    return res.status(404).json({ ok:false, error:'Não encontrado' });
  }
  console.log(`[GET /api/cadastros/${req.params.id}] → ${c.razao_social||c.responsavel}`);
  res.json({ ok:true, data:c });
});

app.post('/api/cadastros', (req, res) => {
  const b = req.body;
  if (!b.cnpj || !b.vendedor_slug) {
    console.warn('[POST /api/cadastros] → 400 faltando cnpj ou vendedor_slug');
    return res.status(400).json({ ok:false, error:'CNPJ e vendedor são obrigatórios' });
  }
  const lista = lerDB();
  const novo  = {
    id:           Date.now().toString(),
    created_at:   new Date().toISOString(),
    updated_at:   new Date().toISOString(),
    status:       'pendente',
    cnpj:               b.cnpj            || '',
    razao_social:       b.razao_social    || '',
    nome_fantasia:      b.nome_fantasia   || '',
    insc_estadual:      b.insc_estadual   || '',
    atividade:          b.atividade       || '',
    telefone_empresa:   b.telefone_empresa   || '',
    email_empresa:      b.email_empresa      || '',
    responsavel:        b.responsavel     || '',
    telefone:           b.telefone        || '',
    email_responsavel:  b.email_responsavel || '',
    cond_pagamento:     b.cond_pagamento  || '',
    cep:                b.cep             || '',
    logradouro:         b.logradouro      || '',
    numero:             b.numero          || '',
    complemento:        b.complemento     || '',
    bairro:             b.bairro          || '',
    cidade:             b.cidade          || '',
    uf:                 b.uf              || '',
    endereco_entrega:   b.endereco_entrega || null,
    email_nfe:          b.email_nfe       || '',
    email_portal:       b.email_portal    || '',
    email_acesso:       b.email_acesso    || '',
    vendedor_slug:      b.vendedor_slug   || '',
    vendedor_nome:      b.vendedor_nome   || '',
    equipe:             b.equipe          || '',
    contatos:           b.contatos        || [],
    bancos:             b.bancos          || [],
    referencias_comerciais: b.referencias_comerciais || [],
    observacoes:        b.observacoes     || '',
    operador_slug:      '',
    operador_nome:      '',
    limite_credito:     '',
    forma_pagamento:    '',
    email_financeiro:   '',
    telefone_financeiro:'',
    historico:          [],
    tipo_solicitacao:        b.tipo_solicitacao        || '',
    valor_solicitado_credito: b.valor_solicitado_credito || '',
    num_orcamento:      b.num_orcamento      || '',
    num_cliente:        b.num_cliente        || '',
  };
  lista.push(novo);
  salvarDB(lista);
  console.log(`[+] Cadastro: ${novo.razao_social} — ${novo.vendedor_nome}`);
  res.status(201).json({ ok:true, data:novo });
});

app.patch('/api/cadastros/:id', (req, res) => {
  const lista = lerDB();
  const idx   = lista.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    console.warn(`[PATCH /api/cadastros/${req.params.id}] → 404 não encontrado`);
    return res.status(404).json({ ok:false, error:'Não encontrado' });
  }
  const antes = lista[idx];
  const b     = req.body;
  const historico = [...(antes.historico || [])];
  const TRACK = ['status','operador_nome','limite_credito','forma_pagamento','observacoes'];
  TRACK.forEach(campo => {
    if (b[campo] !== undefined && String(b[campo]||'') !== String(antes[campo]||'')) {
      historico.push({ campo, de: antes[campo]||'', para: b[campo]||'', em: new Date().toISOString() });
    }
  });
  lista[idx] = { ...antes, ...b, historico, updated_at: new Date().toISOString() };
  salvarDB(lista);
  console.log(`[PATCH /api/cadastros/${req.params.id}] status: ${antes.status} → ${lista[idx].status}`);

  // ── Notificações ao cliente quando cadastro é finalizado ──────────
  if (b.status === 'cadastrado' && antes.status !== 'cadastrado') {
    const { enviarNotificacoes } = require('./notifications');
    enviarNotificacoes(lista[idx]).catch(err =>
      console.error('[NOTIF] Erro inesperado:', err.message)
    );
  }

  res.json({ ok:true, data:lista[idx] });
});

app.delete('/api/cadastros/:id', (req, res) => {
  let lista = lerDB();
  const len = lista.length;
  lista = lista.filter(c => c.id !== req.params.id);
  if (lista.length === len) {
    console.warn(`[DELETE /api/cadastros/${req.params.id}] → 404 não encontrado`);
    return res.status(404).json({ ok:false, error:'Não encontrado' });
  }
  salvarDB(lista);
  console.log(`[DELETE /api/cadastros/${req.params.id}] → removido`);
  res.json({ ok:true });
});

app.get('/api/stats/:slug', (req, res) => {
  const lista = lerDB().filter(c => c.vendedor_slug === req.params.slug);
  res.json({ ok:true, data:{
    total:      lista.length,
    pendente:   lista.filter(c => c.status==='pendente').length,
    liberado:   lista.filter(c => c.status==='liberado').length,
    finalizado: lista.filter(c => c.status==='finalizado').length,
    revisao:    lista.filter(c => c.status==='revisao').length,
  }});
});

// ─── PROXIES EXTERNOS ─────────────────────────────────────────────────────────
app.get('/api/cnpj/:cnpj', async (req, res) => {
  try {
    const cnpj = req.params.cnpj.replace(/\D/g, '');
    if (!cnpj) return res.status(400).json({ ok:false, error:'CNPJ inválido' });

    // verificar cache
    const entrada = getCacheEntry(cnpj);
    if (entrada?.receita) {
      console.log(`[CNPJ ${cnpj}] ✅ cache hit (Receita Federal) → ${entrada.receita.razao_social}`);
      return res.json({ ok:true, data:entrada.receita, fromCache:true });
    }

    console.log(`[CNPJ ${cnpj}] 🌐 consultando Receita Federal...`);
    const { data } = await axios.get(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { timeout:8000 }
    );
    console.log(`[CNPJ ${cnpj}] salvo no cache → ${data.razao_social} (${data.descricao_situacao_cadastral})`);
    setCacheEntry(cnpj, 'receita', data);
    res.json({ ok:true, data });
  } catch(e) {
    console.error(`[CNPJ] erro ${e.response?.status||500}:`, e.message);
    res.status(e.response?.status||500).json({ ok:false, error: e.response?.status === 404 ? 'CNPJ não encontrado na Receita Federal' : 'Erro ao consultar Receita Federal' });
  }
});

app.get('/api/sintegra/:cnpj', async (req, res) => {
  const cnpj = req.params.cnpj.replace(/\D/g, '');

  // verificar cache
  const entrada = getCacheEntry(cnpj);
  if (entrada?.sintegra) {
    const ie  = entrada.sintegra.inscricao_estadual || '';
    const sit = entrada.sintegra.situacao_ie_desc || entrada.sintegra.situacao_ie || '';
    console.log(`[SINTEGRA ${cnpj}] ✅ cache hit → IE: ${ie||'não encontrada'} | ${sit||'—'}`);
    return res.json({ ok:true, data:entrada.sintegra, fromCache:true });
  }

  console.log(`[SINTEGRA ${cnpj}] 🌐 consultando SINTEGRA...`);
  const EMPTY = { inscricao_estadual: null, situacao_ie: null, situacao_ie_desc: null, situacao_cnpj: null };
  try {
    const url = `https://sintegraws.com.br/api/v1/execute-api.php?token=${SINTEGRA_TOKEN}&cnpj=${cnpj}&plugin=ST`;
    const { data } = await axios.get(url, { timeout:12000 });
    // se a resposta não for um objeto válido (ex: HTML de erro, token expirado), ignora
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      console.warn(`[SINTEGRA ${cnpj}] resposta inválida (não é objeto) — retornando vazio`);
      return res.json({ ok:true, data: EMPTY, fromCache: false });
    }
    // se a API retornou erro explícito (ex: token inválido)
    if (data.RETURN === 'ERROR' || data.status === 'ERROR' || data.error) {
      console.warn(`[SINTEGRA ${cnpj}] erro da API: ${JSON.stringify(data)} — retornando vazio`);
      return res.json({ ok:true, data: EMPTY, fromCache: false });
    }
    const ie  = data.inscricao_estadual || '';
    const sit = data.situacao_ie_desc || data.situacao_ie || data.situacao_cnpj || '';
    console.log(`[SINTEGRA ${cnpj}] salvo no cache → IE: ${ie||'não encontrada'} | ${sit||'—'}`);
    setCacheEntry(cnpj, 'sintegra', data);
    res.json({ ok:true, data });
  } catch(e) {
    console.warn(`[SINTEGRA ${cnpj}] indisponível (${e.response?.status||e.code||'timeout'}): ${e.message} — retornando vazio`);
    res.json({ ok:true, data: EMPTY, fromCache: false });
  }
});

// ─── ANÁLISE DE CRÉDITO (CPF.CNPJ — Score Serasa) ────────────────────────────
app.get('/api/credito/cnpj/:cnpj', async (req, res) => {
  const TOKEN = process.env.CPFCNPJ_TOKEN || '5ae973d7a997af13f0aaf2bf60e65803';
  const cnpj  = req.params.cnpj.replace(/\D/g, '');
  if (!cnpj || cnpj.length !== 14) return res.status(400).json({ ok: false, error: 'CNPJ inválido' });

  const entrada = getCacheEntry(cnpj);
  if (entrada?.credito) {
    console.log(`[CREDITO ${cnpj}] ✅ cache hit`);
    return res.json({ ok: true, data: entrada.credito, fromCache: true });
  }

  try {
    console.log(`[CREDITO ${cnpj}] 🌐 consultando CPF.CNPJ (pacotes 6+12)...`);
    const BASE = `https://api.cpfcnpj.com.br/${TOKEN}`;
    const [rCadastro, rSerasa] = await Promise.all([
      axios.get(`${BASE}/6/${cnpj}`,  { timeout: 12000 }),
      axios.get(`${BASE}/12/${cnpj}`, { timeout: 12000 }),
    ]);
    const data = {
      ...rCadastro.data,
      risco: rSerasa.data?.risco || null,
    };
    setCacheEntry(cnpj, 'credito', data);
    console.log(`[CREDITO ${cnpj}] ✅ ${data.razao} | risco: ${data.risco?.descricao || '—'}`);
    res.json({ ok: true, data, teste: TOKEN === '5ae973d7a997af13f0aaf2bf60e65803' });
  } catch(e) {
    console.error(`[CREDITO ${cnpj}] erro:`, e.response?.data || e.message);
    res.status(e.response?.status || 500).json({
      ok: false,
      error: e.response?.data?.message || e.response?.data?.error || e.message
    });
  }
});

// ─── ANEXOS ───────────────────────────────────────────────────────────────────
// Servir arquivo
app.get('/api/cadastros/:id/anexos/:arquivo', (req, res) => {
  const arquivo = path.basename(req.params.arquivo); // sanitize path traversal
  const file    = path.join(UPLOADS_DIR, req.params.id, arquivo);
  if (!fs.existsSync(file)) {
    console.warn(`[GET anexo] não encontrado: ${file}`);
    return res.status(404).json({ ok: false, error: 'Arquivo não encontrado' });
  }
  console.log(`[GET /api/cadastros/${req.params.id}/anexos/${arquivo}] servindo arquivo`);
  res.sendFile(file);
});

// Upload de arquivos
app.post('/api/cadastros/:id/anexos', upload.array('files', 20), (req, res) => {
  const lista = lerDB();
  const idx   = lista.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Não encontrado' });
  if (!req.files?.length) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado' });

  const novos = req.files.map(f => ({
    id:        `${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    nome:      f.originalname,
    arquivo:   f.filename,
    tipo:      f.mimetype,
    tamanho:   f.size,
    criado_at: new Date().toISOString(),
  }));

  lista[idx].anexos     = [...(lista[idx].anexos || []), ...novos];
  lista[idx].updated_at = new Date().toISOString();
  salvarDB(lista);
  console.log(`[POST /api/cadastros/${req.params.id}/anexos] +${novos.length} arquivo(s): ${novos.map(a=>a.nome).join(', ')}`);
  res.json({ ok: true, data: novos });
});

// Remover arquivo
app.delete('/api/cadastros/:id/anexos/:anexoId', (req, res) => {
  const lista = lerDB();
  const idx   = lista.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Não encontrado' });

  const anexo = (lista[idx].anexos || []).find(a => a.id === req.params.anexoId);
  if (!anexo) return res.status(404).json({ ok: false, error: 'Anexo não encontrado' });

  try { fs.unlinkSync(path.join(UPLOADS_DIR, req.params.id, path.basename(anexo.arquivo))); }
  catch(e) { console.warn(`[DELETE anexo] erro ao excluir arquivo: ${e.message}`); }

  lista[idx].anexos     = lista[idx].anexos.filter(a => a.id !== req.params.anexoId);
  lista[idx].updated_at = new Date().toISOString();
  salvarDB(lista);
  console.log(`[DELETE /api/cadastros/${req.params.id}/anexos/${req.params.anexoId}] removido`);
  res.json({ ok: true });
});

app.get('/api/cep/:cep', async (req, res) => {
  console.log(`[GET /api/cep/${req.params.cep}] consultando BrasilAPI...`);
  try {
    const { data } = await axios.get(
      `https://brasilapi.com.br/api/cep/v1/${req.params.cep}`, { timeout:5000 }
    );
    console.log(`[GET /api/cep/${req.params.cep}] → ${data.street}, ${data.city}/${data.state}`);
    res.json({ ok:true, data });
  } catch(e) {
    console.error(`[GET /api/cep/${req.params.cep}] → erro ${e.response?.status||500}:`, e.message);
    res.status(e.response?.status||500).json({ ok:false, error:'CEP não encontrado' });
  }
});

// ─── PAGAMENTOS ───────────────────────────────────────────────────────────────
const PAG_FILE = path.join(DB_DIR, 'pagamentos.json');
if (!fs.existsSync(PAG_FILE)) fs.writeFileSync(PAG_FILE, '[]');
if (!fs.existsSync(PAG_FILE)) fs.writeFileSync(PAG_FILE, '[]');
const lerPag    = () => { try { return JSON.parse(fs.readFileSync(PAG_FILE,'utf8')); } catch(e){ return []; } };
const salvarPag = d  => fs.writeFileSync(PAG_FILE, JSON.stringify(d, null, 2));

const COMP_DIR = path.join(__dirname, 'data', 'comprovantes');
if (!fs.existsSync(COMP_DIR)) fs.mkdirSync(COMP_DIR, { recursive: true });

const storageComp = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(COMP_DIR, req.params.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
                   .replace(/[^a-zA-Z0-9_\-.]/g, '_').slice(0, 60);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const uploadComp = multer({ storage: storageComp, limits: { fileSize: 20 * 1024 * 1024 } });

app.get('/api/pagamentos', (req, res) => {
  let lista = lerPag();
  if (req.query.vendedor) lista = lista.filter(p => p.vendedor_slug === req.query.vendedor);
  if (req.query.tipo)     lista = lista.filter(p => p.tipo === req.query.tipo);
  if (req.query.status)   lista = lista.filter(p => p.status === req.query.status);
  lista.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ ok:true, data:lista, total:lista.length });
});

app.post('/api/pagamentos', (req, res) => {
  try {
    const b = req.body;
    if (!b || !b.tipo || !b.vendedor_slug) return res.status(400).json({ ok:false, error:'tipo e vendedor são obrigatórios' });
    const lista = lerPag();
    const novo = {
      id:             Date.now().toString(),
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
      tipo:           b.tipo,
      status:         'aguardando',
      vendedor_slug:  b.vendedor_slug || '',
      vendedor_nome:  b.vendedor_nome || '',
      equipe:         b.equipe || '',
      cliente_nome:   b.cliente_nome || '',
      valor:          b.valor || '',
      descricao:      b.descricao || '',
      observacoes:    b.observacoes || '',
      link_pagamento: '',
      comprovante:    null,
    };
    lista.push(novo);
    salvarPag(lista);
    console.log(`[+] Pagamento ${novo.tipo}: ${novo.cliente_nome} — ${novo.vendedor_nome} — ${novo.valor}`);
    res.status(201).json({ ok:true, data:novo });
  } catch(e) {
    console.error('[POST /api/pagamentos] erro:', e.message);
    res.status(500).json({ ok:false, error:'Erro interno ao criar solicitação' });
  }
});

app.patch('/api/pagamentos/:id', (req, res) => {
  const lista = lerPag();
  const idx   = lista.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok:false, error:'Não encontrado' });
  lista[idx] = { ...lista[idx], ...req.body, updated_at: new Date().toISOString() };
  salvarPag(lista);
  console.log(`[PATCH /api/pagamentos/${req.params.id}] status → ${lista[idx].status}`);
  res.json({ ok:true, data:lista[idx] });
});

app.delete('/api/pagamentos/:id', (req, res) => {
  let lista = lerPag();
  const len = lista.length;
  lista = lista.filter(p => p.id !== req.params.id);
  if (lista.length === len) return res.status(404).json({ ok:false, error:'Não encontrado' });
  salvarPag(lista);
  res.json({ ok:true });
});

app.post('/api/pagamentos/:id/comprovante', uploadComp.single('file'), (req, res) => {
  const lista = lerPag();
  const idx   = lista.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok:false, error:'Não encontrado' });
  if (!req.file)  return res.status(400).json({ ok:false, error:'Nenhum arquivo enviado' });
  lista[idx].comprovante = {
    nome:      req.file.originalname,
    arquivo:   req.file.filename,
    tipo:      req.file.mimetype,
    tamanho:   req.file.size,
    criado_at: new Date().toISOString(),
  };
  lista[idx].status     = 'comprovante-enviado';
  lista[idx].updated_at = new Date().toISOString();
  salvarPag(lista);
  res.json({ ok:true, data:lista[idx].comprovante });
});

app.get('/api/pagamentos/:id/comprovante/:arquivo', (req, res) => {
  const arquivo = path.basename(req.params.arquivo);
  const file    = path.join(COMP_DIR, req.params.id, arquivo);
  if (!fs.existsSync(file)) return res.status(404).json({ ok:false, error:'Arquivo não encontrado' });
  res.sendFile(file);
});

app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => {
  const totalCNPJs = Object.keys(lerCache()).length;
  console.log(`✅  http://localhost:${PORT}`);
  console.log(`📁  DB: ${DB_FILE}`);
  console.log(`🗄️   Cache: ${totalCNPJs} CNPJ(s) gravado(s) em ${CACHE_FILE}`);
});


