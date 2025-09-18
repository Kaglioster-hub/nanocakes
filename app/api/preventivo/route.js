export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseRecipients() {
  const env = process.env.MAIL_RECIPIENTS || "fabry15.98@tiscali.it,nanocakes@vrabo.it";
  return env.split(",").map(s => s.trim()).filter(Boolean);
}

export async function POST(req) {
  const data = await req.json();
  const recipients = parseRecipients();
  const fromAddr = process.env.ADMIN_EMAIL || recipients[0];

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const { nome="", email="", telefono="", prodotto="", data:giorno="", note="" } = data || {};
      const html = `
        <h2>Richiesta Preventivo</h2>
        <p><b>Nome:</b> ${nome}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Telefono:</b> ${telefono}</p>
        <p><b>Prodotto:</b> ${prodotto}</p>
        <p><b>Data consegna:</b> ${giorno}</p>
        <p><b>Note:</b> ${note}</p>
      `;
      await transporter.sendMail({ from: fromAddr, to: recipients, subject: "Richiesta Preventivo – NanoCakes", html });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: e.message }), { status: 200 });
  }
}
