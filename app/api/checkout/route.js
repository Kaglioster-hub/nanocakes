export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCents(eur) {
  const n = Number(eur || 0);
  return Math.round(n * 100);
}

export async function POST(req) {
  const { items = [], deliveryFee = 0 } = await req.json();
  const currency = "EUR";

  // Se ho Stripe, creo una Checkout Session
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);

    const line_items = items.map(i => ({
      price_data: {
        currency,
        product_data: { name: i.name },
        unit_amount: toCents(i.price),
      },
      quantity: i.qty || 1,
    }));

    if (deliveryFee && Number(deliveryFee) > 0) {
      line_items.push({
        price_data: {
          currency,
          product_data: { name: "Consegna" },
          unit_amount: toCents(deliveryFee),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL || "https://nanocakes.vrabo.it/success",
      cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL || "https://nanocakes.vrabo.it/cancel",
      // opzionale: metadata per riconciliare
      metadata: { site: "nanocakes" },
    });

    return new Response(JSON.stringify({ provider: "stripe", url: session.url }), { status: 200 });
  }

  // Fallback PayPal “Buy Now”
  const total = items.reduce((a,b)=>a + (b.price * (b.qty||1)), 0) + (deliveryFee||0);
  const amount = Math.max(0, Number(total||0)).toFixed(2);
  const business = process.env.PAYPAL_BUSINESS || process.env.PAYPAL_BUSINESS_EMAIL;

  if (!business) {
    return new Response(JSON.stringify({ ok:false, error:"PAYPAL_BUSINESS(MERCHANT_ID) non configurato" }), { status: 200 });
  }

  const params = new URLSearchParams({
    cmd: "_xclick",
    business,
    item_name: "Ordine NanoCakes",
    amount,
    currency_code: currency
  });

  return new Response(JSON.stringify({ provider: "paypal", url: "https://www.paypal.com/cgi-bin/webscr?" + params.toString() }), { status: 200 });
}
