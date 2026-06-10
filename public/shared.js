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
