// ═══════════════════════════════════════════════════════════════════
// SHARED — dados, helpers e constantes usados em todas as páginas
// ═══════════════════════════════════════════════════════════════════
const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;

const TEAMS = [
  {id:'civil',   name:'Construção Civil', icon:'ti-building-factory-2', color:'#1B3FAB', bg:'#EEF3FF'},
  {id:'atacado', name:'Atacado',           icon:'ti-package',            color:'#0891B2', bg:'#ECFEFF'},
  {id:'uno',     name:'Equipe Uno',        icon:'ti-bolt',               color:'#7C3AED', bg:'#F5F3FF'},
  {id:'cobr',    name:'Cobrança',          icon:'ti-receipt',            color:'#D97706', bg:'#FFFBEB'},
  {id:'atend',   name:'Atendimento',       icon:'ti-headset',            color:'#059669', bg:'#ECFDF5'},
  {id:'fiscal',  name:'Fiscal',            icon:'ti-file-invoice',       color:'#DC2626', bg:'#FEF2F2'},
  {id:'fin',     name:'Financeiro',        icon:'ti-cash',               color:'#EA580C', bg:'#FFF7ED'},
  {id:'mkt',     name:'Marketing',         icon:'ti-speakerphone',       color:'#DB2777', bg:'#FDF2F8'},
];

const PESSOAS = [
  {name:'Olimpio Culto',       ini:'OC', team:'civil',   role:'Gestor'},
  {name:'Ricardo Ferreira',    ini:'RF', team:'civil',   role:'Vendedor'},
  {name:'Marcos Pereira',      ini:'MP', team:'civil',   role:'Vendedor'},
  {name:'Carlos Mendonça',     ini:'CM', team:'civil',   role:'Vendedor'},
  {name:'Felipe Rodrigues',    ini:'FR', team:'civil',   role:'Vendedor'},
  {name:'Bruno Cavalcante',    ini:'BC', team:'civil',   role:'Vendedor'},
  {name:'Devidson Mansur',     ini:'DM', team:'atacado', role:'Gestor'},
  {name:'Lucas Barbosa',       ini:'LB', team:'atacado', role:'Vendedor'},
  {name:'Pedro Almeida',       ini:'PA', team:'atacado', role:'Vendedor'},
  {name:'Diego Nascimento',    ini:'DN', team:'atacado', role:'Vendedor'},
  {name:'Vitor Santos',        ini:'VS', team:'atacado', role:'Vendedor'},
  {name:'Thiago Carvalho',     ini:'TC', team:'atacado', role:'Vendedor'},
  {name:'Taina Andrade',       ini:'TA', team:'uno',     role:'Gestora'},
  {name:'Camila Souza',        ini:'CS', team:'uno',     role:'Vendedora'},
  {name:'Juliana Lima',        ini:'JL', team:'uno',     role:'Vendedora'},
  {name:'Fernanda Costa',      ini:'FC', team:'uno',     role:'Vendedora'},
  {name:'Patricia Oliveira',   ini:'PO', team:'uno',     role:'Vendedora'},
  {name:'Amanda Ribeiro',      ini:'AR', team:'uno',     role:'Vendedora'},
  {name:'Lorena Figueiredo',   ini:'LF', team:'cobr',    role:'Gestora'},
  {name:'Isabela Martins',     ini:'IM', team:'cobr',    role:'Analista'},
  {name:'Renata Cardoso',      ini:'RC', team:'cobr',    role:'Analista'},
  {name:'Tatiane Moura',       ini:'TM', team:'cobr',    role:'Analista'},
  {name:'Priscila Rocha',      ini:'PR', team:'cobr',    role:'Analista'},
  {name:'Vanessa Teixeira',    ini:'VT', team:'cobr',    role:'Analista'},
  {name:'Ana Paula Gomes',     ini:'AP', team:'atend',   role:'Gestora'},
  {name:'Larissa Campos',      ini:'LC', team:'atend',   role:'Atendente'},
  {name:'Mariana Azevedo',     ini:'MA', team:'atend',   role:'Atendente'},
  {name:'Gabriela Freitas',    ini:'GF', team:'atend',   role:'Atendente'},
  {name:'Jessica Pinto',       ini:'JP', team:'atend',   role:'Atendente'},
  {name:'Leticia Borges',      ini:'LB', team:'atend',   role:'Atendente'},
  {name:'Sebastião Correia',   ini:'SC', team:'fiscal',  role:'Gestor'},
  {name:'Eduardo Vieira',      ini:'EV', team:'fiscal',  role:'Analista'},
  {name:'Rafael Cunha',        ini:'RC', team:'fiscal',  role:'Analista'},
  {name:'Marcelo Dias',        ini:'MD', team:'fiscal',  role:'Analista'},
  {name:'Anderson Lima',       ini:'AL', team:'fiscal',  role:'Analista'},
  {name:'Rodrigo Melo',        ini:'RM', team:'fiscal',  role:'Analista'},
  {name:'Ana Beatriz Silva',   ini:'AB', team:'fin',     role:'Gestora'},
  {name:'Claudia Nunes',       ini:'CN', team:'fin',     role:'Analista'},
  {name:'Flavia Monteiro',     ini:'FM', team:'fin',     role:'Analista'},
  {name:'Simone Castro',       ini:'SC', team:'fin',     role:'Analista'},
  {name:'Denise Queiroz',      ini:'DQ', team:'fin',     role:'Analista'},
  {name:'Monica Araujo',       ini:'MN', team:'fin',     role:'Analista'},
  {name:'Daniela Nogueira',    ini:'DN', team:'mkt',     role:'Gestora'},
  {name:'Bianca Esteves',      ini:'BE', team:'mkt',     role:'Analista'},
  {name:'Natalia Ramos',       ini:'NR', team:'mkt',     role:'Analista'},
  {name:'Carolina Lopes',      ini:'CL', team:'mkt',     role:'Analista'},
  {name:'Viviane Fonseca',     ini:'VF', team:'mkt',     role:'Analista'},
  {name:'Aline Batista',       ini:'AB', team:'mkt',     role:'Analista'},
];

// helpers
const getTeam    = id => TEAMS.find(t => t.id === id) || {name:'—',color:'#9CA3AF',bg:'#F3F4F6',icon:'ti-user'};
const getPessoa  = sl => PESSOAS.find(p => slugify(p.name) === sl);
const slugify    = s  => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
const validEmail = e  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const formLink   = p  => `${API}/formulario.html?v=${slugify(p.name)}&t=${p.team}`;
const acompLink  = p  => `${API}/acompanhamento.html?v=${slugify(p.name)}&t=${p.team}`;

const maskCNPJ = v => { v=v.replace(/\D/g,'').slice(0,14); if(v.length>12)return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); if(v.length>8)return v.replace(/(\d{2})(\d{3})(\d{3})(\d+)/,'$1.$2.$3/$4'); if(v.length>5)return v.replace(/(\d{2})(\d{3})(\d+)/,'$1.$2.$3'); if(v.length>2)return v.replace(/(\d{2})(\d+)/,'$1.$2'); return v; };
const maskTel  = v => { v=v.replace(/\D/g,'').slice(0,11); if(v.length>10)return v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3'); if(v.length>6)return v.replace(/(\d{2})(\d{4,5})(\d{0,4})/,'($1) $2-$3'); if(v.length>2)return v.replace(/(\d{2})(\d+)/,'($1) $2'); return v; };
const maskCEP  = v => { v=v.replace(/\D/g,'').slice(0,8); return v.length>5?v.replace(/(\d{5})(\d+)/,'$1-$2'):v; };

function validarCNPJ(c){c=c.replace(/\D/g,'');if(c.length!==14||/^(\d)\1+$/.test(c))return false;let s=0,r,i;for(i=0;i<12;i++)s+=parseInt(c[i])*(i<4?5-i:13-i);r=s%11<2?0:11-s%11;if(r!==parseInt(c[12]))return false;s=0;for(i=0;i<13;i++)s+=parseInt(c[i])*(i<5?6-i:14-i);r=s%11<2?0:11-s%11;return r===parseInt(c[13]);}

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = 'toast show ' + type;
  const icons = {err:'alert-circle', ok:'check', '':'info-circle'};
  t.innerHTML = `<i class="ti ti-${icons[type]||'info-circle'}"></i> ${msg}`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

function logoHTML() {
  return `<div class="logo">
    <div class="logo-bolt"><i class="ti ti-bolt"></i></div>
    <div><div class="logo-top">Universo</div><div class="logo-bot">Elétrico</div></div>
  </div>`;
}

/* ── STAGE RULES & CHECKLIST ─────────────────────────────────────────── */
const STAGE_RULES = {
  'lib-cadastro': {
    label: 'Lib. p/ Cadastro', icon: 'ti-send', color: '#1B3FAB',
    campos: [
      { campo: 'responsavel',     label: 'Nome do Responsável',  tab: 'cliente'    },
      { campo: 'telefone',        label: 'Telefone / WhatsApp',  tab: 'cliente'    },
      { campo: 'cnpj',            label: 'CNPJ',                 tab: 'empresa'    },
      { campo: 'razao_social',    label: 'Razão Social',         tab: 'empresa'    },
      { campo: 'cep',             label: 'CEP',                  tab: 'endereco'   },
      { campo: 'logradouro',      label: 'Logradouro',           tab: 'endereco'   },
      { campo: 'cidade',          label: 'Cidade',               tab: 'endereco'   },
      { campo: 'uf',              label: 'UF',                   tab: 'endereco'   },
      { campo: 'cond_pagamento',  label: 'Cond. de Pagamento',   tab: 'cliente'    },
    ]
  },
  'lib-sistema': {
    label: 'Aprov. Crédito', icon: 'ti-credit-card', color: '#0891B2',
    campos: [
      { campo: 'limite_credito',      label: 'Limite de Crédito',   tab: 'financeiro' },
      { campo: 'forma_pagamento',     label: 'Forma de Pagamento',  tab: 'financeiro' },
      { campo: 'email_financeiro',    label: 'E-mail Financeiro',   tab: 'financeiro' },
      { campo: 'telefone_financeiro', label: 'Telefone Financeiro', tab: 'financeiro' },
    ]
  },
  'lib-fiscal': {
    label: 'Lib. p/ Fiscal', icon: 'ti-file-invoice', color: '#7C3AED',
    campos: [
      { campo: 'consumidor_final',      label: 'Consumidor Final',         tab: 'fiscal' },
      { campo: 'contribuinte',          label: 'Contribuinte ICMS',        tab: 'fiscal' },
      { campo: 'finalidade_mercadoria', label: 'Finalidade da Mercadoria', tab: 'fiscal' },
    ]
  },
  'cadastrado': {
    label: 'Cadastrado', icon: 'ti-circle-check', color: '#16A34A',
    campos: [
      { campo: 'fiscal_confirmado', label: 'Confirmado pelo Setor Fiscal', tab: 'fiscal', tipo: 'bool' },
      { campo: 'operador_nome',     label: 'Operador Responsável',         tab: 'registro' },
    ]
  },
};

const TAB_META = {
  cliente:    { label: 'Cliente',    icon: 'ti-user'           },
  empresa:    { label: 'Empresa',    icon: 'ti-building-store' },
  endereco:   { label: 'Endereço',   icon: 'ti-map-pin'        },
  fiscal:     { label: 'Fiscal',     icon: 'ti-file-invoice'   },
  financeiro: { label: 'Financeiro', icon: 'ti-cash'           },
  registro:   { label: 'Registro',   icon: 'ti-clock'          },
};

function mostrarChecklist(cadastro) {
  if (!cadastro) return;
  document.getElementById('checklist-modal')?.remove();

  const stages = ['lib-cadastro', 'lib-sistema', 'lib-fiscal', 'cadastrado'];
  const nextMap = {
    'preenchido': 'lib-cadastro', 'revisao': 'lib-cadastro', 'pendente': 'lib-cadastro',
    'lib-cadastro': 'lib-sistema', 'lib-sistema': 'lib-fiscal', 'lib-fiscal': 'cadastrado',
  };
  const nextStage = nextMap[cadastro.status] || null;

  function isFilled(r) {
    const val = cadastro[r.campo];
    if (r.tipo === 'array') return Array.isArray(val) && val.length > 0;
    if (r.tipo === 'bool')  return val === true;
    return val != null && String(val).trim() !== '';
  }

  const sectionsHTML = stages.map(key => {
    const regras = STAGE_RULES[key];
    const isNext = key === nextStage;
    const filled = regras.campos.filter(isFilled).length;
    const total  = regras.campos.length;
    const allDone = filled === total;

    const hColor = allDone ? '#16A34A' : isNext ? regras.color : '#9CA3AF';
    const hBg    = allDone ? '#F0FDF4' : isNext ? (regras.color + '14') : '#F9FAFB';
    const hBord  = allDone ? '#BBF7D0' : isNext ? (regras.color + '30') : '#F3F4F6';

    const fieldsHTML = regras.campos.map(r => {
      const ok = isFilled(r);
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:7px;background:${ok?'#F0FDF4':'#FEF2F2'};border:1px solid ${ok?'#BBF7D0':'#FECACA'};margin-bottom:3px">
        <i class="ti ti-${ok?'circle-check':'circle-x'}" style="font-size:12px;color:${ok?'#16A34A':'#DC2626'};flex-shrink:0"></i>
        <span style="font-size:12px;font-weight:500;color:${ok?'#166534':'#991B1B'}">${r.label}</span>
      </div>`;
    }).join('');

    const nextTag = isNext ? `<span style="font-size:9px;font-weight:700;background:${regras.color};color:#fff;padding:2px 7px;border-radius:20px;margin-left:4px;flex-shrink:0">PRÓXIMA</span>` : '';
    const countTag = `<span style="font-size:10px;font-weight:700;color:${allDone?'#16A34A':hColor};margin-left:auto;flex-shrink:0">${filled}/${total}</span>`;

    return `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:${hBg};border:1px solid ${hBord};border-radius:9px;margin-bottom:5px">
        <i class="ti ${regras.icon}" style="font-size:13px;color:${hColor};flex-shrink:0"></i>
        <span style="font-size:11px;font-weight:700;color:${hColor};min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${regras.label}</span>
        ${nextTag}${countTag}
      </div>
      <div style="padding:0 2px">${fieldsHTML}</div>
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'checklist-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.25)">
      <div style="padding:16px 20px 12px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:10px;background:#EEF3FF;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="ti ti-list-check" style="font-size:18px;color:#1B3FAB"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700;color:#111827">Checklist de Evolução</div>
          <div style="font-size:11px;color:#9CA3AF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px">${cadastro.empresa || cadastro.razao_social || '—'}</div>
        </div>
        <button onclick="document.getElementById('checklist-modal').remove()" style="width:28px;height:28px;border:none;background:transparent;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:16px" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='transparent'">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div style="padding:14px 16px;max-height:420px;overflow-y:auto">${sectionsHTML}</div>
      <div style="padding:10px 16px;border-top:1px solid #F3F4F6;display:flex;justify-content:flex-end;background:#FAFBFF">
        <button onclick="document.getElementById('checklist-modal').remove()" class="btn btn-ghost btn-sm">Fechar</button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

/* correct order: preenchido → lib-cadastro → lib-sistema → lib-fiscal → cadastrado */
function buildPipelineWithFields(c) {
  const SO = ['preenchido', 'lib-cadastro', 'lib-sistema', 'lib-fiscal', 'cadastrado'];
  const si = Math.max(0, SO.indexOf(c.status)); /* revisao/-1 → 0 (Comercial) */
  const stages = [
    { label: 'Comercial',      done: si >= 1, cur: si === 0 },
    { label: 'Cadastro',       done: si >= 2, cur: si === 1 },
    { label: 'Aprov. Crédito', done: si >= 3, cur: si === 2 },
    { label: 'Fiscal',         done: si >= 4, cur: si === 3 },
    { label: 'Cadastrado',     done: si >= 4, cur: false     },
  ];
  let html = '<div class="det-pipe-wrap"><div class="det-pipeline">';
  stages.forEach((s, i) => {
    if (i > 0) html += `<div class="det-pipe-conn${stages[i-1].done ? ' ps-done' : ''}"></div>`;
    html += `<div class="det-pipe-step${s.done ? ' ps-done' : s.cur ? ' ps-current' : ''}">
      <div class="det-pipe-dot">${s.done ? '<i class="ti ti-check" style="font-size:11px"></i>' : ''}</div>
      <div class="det-pipe-label">${s.label}</div>
    </div>`;
  });
  html += '</div>';
  if (c.tipo_solicitacao === 'sem-orcamento') {
    html += `<div class="pipe-notice"><i class="ti ti-file-off"></i> Cadastro sem orçamento — este cliente não possui número de orçamento vinculado</div>`;
  } else if (c.tipo_solicitacao === 'atualizacao-credito') {
    html += `<div class="pipe-notice" style="color:#D97706;background:#FFFBEB;border-top-color:#FDE68A"><i class="ti ti-coin"></i> Solicitação de ajuste de crédito — valor solicitado: <strong>${c.valor_solicitado_credito||'não informado'}</strong></div>`;
  }
  html += '</div>';
  return html;
}

function buildPipeline(status) { return buildPipelineWithFields({ status }); }

function refreshPipeline(c) {
  const el = document.querySelector('.det-pipe-wrap') || document.querySelector('.det-pipeline');
  if (el) el.outerHTML = buildPipelineWithFields(c);
}

/* Returns the next status if all its required fields are already filled, else null */
function getAutoAvancar(c) {
  const nextMap = {
    'preenchido':   'lib-cadastro',
    'revisao':      'lib-cadastro',
    'pendente':     'lib-cadastro',
    'lib-cadastro': 'lib-sistema',
    'lib-sistema':  'lib-fiscal',
    'lib-fiscal':   'cadastrado',
  };
  const proximo = nextMap[c.status];
  if (!proximo || !STAGE_RULES[proximo]) return null;
  const ok = STAGE_RULES[proximo].campos.every(r => {
    const val = c[r.campo];
    if (r.tipo === 'bool') return val === true;
    return val != null && String(val).trim() !== '';
  });
  return ok ? proximo : null;
}

function tipoTag(c) {
  if (!c?.tipo_solicitacao) return '';
  if (c.tipo_solicitacao === 'atualizacao-credito')
    return '<span class="tipo-tag cred"><i class="ti ti-coin" style="font-size:9px"></i> Atualiz. Crédito</span>';
  if (c.tipo_solicitacao === 'sem-orcamento')
    return '<span class="tipo-tag sem-orc"><i class="ti ti-file-off" style="font-size:9px"></i> Sem Orçamento</span>';
  return '';
}

function openPreview(url, nome, ext) {
  const isImg = ['jpg','jpeg','png','gif','webp','svg'].includes(ext);
  const isPDF = ext === 'pdf';
  const canPreview = isImg || isPDF;
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay';
  overlay.id = 'preview-overlay';
  overlay.onclick = e => { if (e.target === overlay) closePreview(); };
  const bodyHTML = canPreview
    ? (isImg ? `<img src="${url}" alt="${nome}">` : `<iframe src="${url}"></iframe>`)
    : `<div class="no-preview"><i class="ti ti-file-off"></i><div style="font-size:14px;font-weight:600;color:#6B7280">Pré-visualização não disponível</div><div style="font-size:12px">Use o botão Baixar para abrir este arquivo</div></div>`;
  overlay.innerHTML = `<div class="preview-box"><div class="preview-header"><i class="ti ti-paperclip" style="color:#6B8ADE;font-size:16px;flex-shrink:0"></i><span class="preview-fname">${nome}</span><a href="${url}" download="${nome}" class="preview-dl"><i class="ti ti-download"></i> Baixar</a><button class="preview-close" onclick="closePreview()"><i class="ti ti-x"></i></button></div><div class="preview-body">${bodyHTML}</div></div>`;
  document.body.appendChild(overlay);
  document.addEventListener('keydown', _escPreview);
}
function closePreview() {
  document.getElementById('preview-overlay')?.remove();
  document.removeEventListener('keydown', _escPreview);
}
function _escPreview(e) { if (e.key === 'Escape') closePreview(); }

function tipoCelula(c) {
  const t = c?.tipo_solicitacao;
  if (t === 'atualizacao-credito')
    return '<span class="tipo-tag cred"><i class="ti ti-coin" style="font-size:9px"></i> Ajuste de Crédito</span>';
  if (t === 'sem-orcamento')
    return '<span class="tipo-tag sem-orc"><i class="ti ti-file-off" style="font-size:9px"></i> Atualiz. Cliente</span>';
  return '<span class="tipo-tag" style="background:#F3F4F6;color:#6B7280;border:1px solid #E5E7EB"><i class="ti ti-clipboard-check" style="font-size:9px"></i> Padrão</span>';
}
