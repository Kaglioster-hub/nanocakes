export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const data = await req.json();
  const admin = process.env.ADMIN_EMAIL || "nanocakes@vrabo.it";
  const { items = [], deliveryFee = 0, address = "", cap = "", method = "", txhash = "" } = data || {};
  const total = items.reduce((a,b)=>a + (b.price * (b.qty||1)), 0) + (deliveryFee||0);

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const itemsHtml = items.map(i => `<li>${i.name} x ${i.qty} = € ${(i.price*(i.qty||1)).toFixed(2)}</li>`).join("");
      const html = `
        <h2>Nuovo ordine NanoCakes</h2>
        <p><b>Metodo:</b> ${method}</p>
        <p><b>Indirizzo:</b> ${address} (${cap})</p>
        <ul>${itemsHtml}</ul>
        <p><b>Consegna:</b> € ${(deliveryFee||0).toFixed(2)}</p>
        <p><b>Totale:</b> € ${total.toFixed(2)}</p>
        ${txhash ? `<p><b>TX Hash:</b> ${txhash}</p>` : ""}
      `;
      await transporter.sendMail({ from: admin, to: admin, subject: "Nuovo ordine NanoCakes", html });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: e.message }), { status: 200 });
  }
}
