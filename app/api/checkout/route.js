export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { items = [], deliveryFee = 0 } = await req.json();
  const total = items.reduce((a,b)=>a + (b.price * (b.qty||1)), 0) + (deliveryFee||0);
  const amount = Math.max(0, Number(total||0)).toFixed(2);

  // Fallback PayPal "Buy Now"
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: "nanocakes@vrabo.it",
    item_name: "Ordine NanoCakes",
    amount,
    currency_code: "EUR"
  });

  return new Response(JSON.stringify({ url: "https://www.paypal.com/cgi-bin/webscr?" + params.toString() }), { status: 200 });
}
