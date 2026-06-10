require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');

const app  = express();
const PORT = process.env.PORT || 3000;
const SINTEGRA_TOKEN = process.env.SINTEGRA_TOKEN || 'D3C7702E-74C3-42B8-BF40-F2FF6B5565DA';

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
app.use(express.static(path.join(__dirname, 'public')));

// ─── CADASTROS ────────────────────────────────────────────────────────────────
app.get('/api/cadastros', (req, res) => {
  let lista = lerDB();
  if (req.query.vendedor) lista = lista.filter(c => c.vendedor_slug === req.query.vendedor);
  if (req.query.status)   lista = lista.filter(c => c.status === req.query.status);
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
  const cnpj = req.params.cnpj.replace(/\D/g, '');

  // verificar cache
  const entrada = getCacheEntry(cnpj);
  if (entrada?.receita) {
    console.log(`[CNPJ ${cnpj}] ✅ cache hit (Receita Federal) → ${entrada.receita.razao_social}`);
    return res.json({ ok:true, data:entrada.receita, fromCache:true });
  }

  console.log(`[CNPJ ${cnpj}] 🌐 consultando Receita Federal...`);
  try {
    const { data } = await axios.get(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { timeout:8000 }
    );
    console.log(`[CNPJ ${cnpj}] salvo no cache → ${data.razao_social} (${data.descricao_situacao_cadastral})`);
    setCacheEntry(cnpj, 'receita', data);
    res.json({ ok:true, data });
  } catch(e) {
    console.error(`[CNPJ ${cnpj}] erro Receita Federal ${e.response?.status||500}:`, e.message);
    res.status(e.response?.status||500).json({ ok:false, error:'Erro na Receita Federal' });
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
  try {
    const url = `https://sintegraws.com.br/api/v1/execute-api.php?token=${SINTEGRA_TOKEN}&cnpj=${cnpj}&plugin=ST`;
    const { data } = await axios.get(url, { timeout:10000 });
    const ie  = data.inscricao_estadual || '';
    const sit = data.situacao_ie_desc || data.situacao_ie || data.situacao_cnpj || '';
    console.log(`[SINTEGRA ${cnpj}] salvo no cache → IE: ${ie||'não encontrada'} | ${sit||'—'}`);
    setCacheEntry(cnpj, 'sintegra', data);
    res.json({ ok:true, data });
  } catch(e) {
    console.error(`[SINTEGRA ${cnpj}] erro ${e.response?.status||500}:`, e.message);
    res.status(e.response?.status||500).json({ ok:false, error:'Erro no SINTEGRA' });
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

app.listen(PORT, () => {
  const totalCNPJs = Object.keys(lerCache()).length;
  console.log(`✅  http://localhost:${PORT}`);
  console.log(`📁  DB: ${DB_FILE}`);
  console.log(`🗄️   Cache: ${totalCNPJs} CNPJ(s) gravado(s) em ${CACHE_FILE}`);
});
