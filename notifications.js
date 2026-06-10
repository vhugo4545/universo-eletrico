// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS — E-mail (Gmail) + WhatsApp (Z-API)
// Disparado automaticamente quando status muda para 'cadastrado'
// ═══════════════════════════════════════════════════════════════════
const nodemailer = require('nodemailer');
const axios      = require('axios');

// ─── E-MAIL ───────────────────────────────────────────────────────────────────
async function enviarEmail(cadastro) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('[EMAIL] Variáveis GMAIL_USER / GMAIL_PASS não configuradas — pulando');
    return;
  }

  const destinatario = cadastro.email_responsavel || cadastro.email_empresa;
  if (!destinatario) {
    console.warn(`[EMAIL] Sem e-mail no cadastro ${cadastro.id} — pulando`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });

  const html = `
  <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#F0F4FF;padding:24px;border-radius:16px">

    <!-- Header -->
    <div style="background:#1B3FAB;border-radius:12px;padding:22px 28px;text-align:center;margin-bottom:20px">
      <div style="font-size:28px;margin-bottom:6px">⚡</div>
      <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-.3px">Universo Elétrico</div>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #EAF0FB">
      <h2 style="color:#111827;margin:0 0 12px;font-size:20px">Cadastro Aprovado ✅</h2>
      <p style="color:#374151;line-height:1.7;margin:0 0 16px">
        Olá, <strong>${cadastro.responsavel || cadastro.razao_social}</strong>! Temos uma ótima notícia:
      </p>
      <div style="background:#DCFCE7;border:1px solid #86EFAC;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="color:#166534;margin:0;font-size:15px;font-weight:600">
          ✅ O cadastro de <strong>${cadastro.razao_social}</strong> foi finalizado com sucesso!
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #F3F4F6">CNPJ</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #F3F4F6;text-align:right;font-family:monospace">${cadastro.cnpj}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Vendedor</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right">${cadastro.vendedor_nome}</td>
        </tr>
      </table>
      <p style="color:#374151;line-height:1.7;margin:0;font-size:13px">
        Em caso de dúvidas, entre em contato diretamente com seu vendedor.
      </p>
    </div>

    <!-- Footer -->
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin-top:16px">
      Universo Elétrico — Sistema de Cadastro · Este é um e-mail automático
    </p>
  </div>`;

  await transporter.sendMail({
    from: `"Universo Elétrico" <${process.env.GMAIL_USER}>`,
    to:   destinatario,
    subject: `✅ Cadastro aprovado — ${cadastro.razao_social}`,
    html,
  });

  console.log(`[EMAIL] ✅ Enviado para ${destinatario} — ${cadastro.razao_social}`);
}

// ─── WHATSAPP (Z-API) ─────────────────────────────────────────────────────────
async function enviarWhatsApp(cadastro) {
  const instanceId  = process.env.ZAPI_INSTANCE_ID;
  const token       = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token) {
    console.warn('[WHATSAPP] Variáveis ZAPI_INSTANCE_ID / ZAPI_TOKEN não configuradas — pulando');
    return;
  }

  const telRaw = cadastro.telefone || cadastro.telefone_empresa;
  if (!telRaw) {
    console.warn(`[WHATSAPP] Sem telefone no cadastro ${cadastro.id} — pulando`);
    return;
  }

  const telefone = formatarTelefone(telRaw);
  const mensagem =
    `Olá, *${cadastro.responsavel || cadastro.razao_social}*! 👋\n\n` +
    `✅ O cadastro da empresa *${cadastro.razao_social}* foi *finalizado com sucesso* na Universo Elétrico!\n\n` +
    `📋 CNPJ: ${cadastro.cnpj}\n` +
    `👤 Vendedor: ${cadastro.vendedor_nome}\n\n` +
    `Seu cadastro já está ativo em nosso sistema. Em caso de dúvidas, fale diretamente com seu vendedor.\n\n` +
    `_Universo Elétrico — Sistema de Cadastro_`;

  await axios.post(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    { phone: telefone, message: mensagem },
    {
      headers: clientToken ? { 'Client-Token': clientToken } : {},
      timeout: 10000,
    }
  );

  console.log(`[WHATSAPP] ✅ Enviado para ${telefone} — ${cadastro.razao_social}`);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatarTelefone(tel) {
  const d = tel.replace(/\D/g, '');
  // Já tem DDI 55 e tem 12-13 dígitos → usa como está
  if (d.startsWith('55') && d.length >= 12) return d;
  return '55' + d;
}

// ─── DISPARAR OS DOIS ─────────────────────────────────────────────────────────
async function enviarNotificacoes(cadastro) {
  console.log(`[NOTIF] 🔔 Disparando notificações — ${cadastro.razao_social}`);
  const [email, whats] = await Promise.allSettled([
    enviarEmail(cadastro),
    enviarWhatsApp(cadastro),
  ]);
  if (email.status === 'rejected')
    console.error('[NOTIF] ❌ Erro e-mail:', email.reason?.message);
  if (whats.status === 'rejected')
    console.error('[NOTIF] ❌ Erro WhatsApp:', whats.reason?.message);
}

module.exports = { enviarNotificacoes };
