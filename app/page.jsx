"use client";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, DELIVERY_FEE, ZONES } from "./(sections)/data";

export default function Page() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [cap, setCap] = useState("");
  const [zoneOk, setZoneOk] = useState(true);
  const [method, setMethod] = useState("stripe"); // 'stripe' | 'paypal' | 'crypto'
  const [txhash, setTxhash] = useState("");

  useEffect(() => {
    const ok = ZONES.some(z => (cap && z.toLowerCase() === cap.toLowerCase()) || (address && address.toLowerCase().includes(z.toLowerCase())));
    setZoneOk(ok || (!cap && !address));
  }, [cap, address]);

  const total = useMemo(() => {
    const sum = cart.reduce((acc, it) => acc + it.price * it.qty, 0);
    return sum > 0 ? (sum + DELIVERY_FEE) : 0;
  }, [cart]);

  function addToCart(p) {
    setCart(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }
  function updateQty(id, qty) {
    setCart(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it));
  }
  function removeItem(id) {
    setCart(prev => prev.filter(it => it.id !== id));
  }

  async function doCheckout() {
    if (!zoneOk) {
      alert("Zona non servita. (Serviamo: 00188, 00189, Settebagni, Riano, Castelnuovo, Morlupo, Monterotondo, Ponte Storto, Fiano Romano)");
      return;
    }
    if (cart.length === 0) {
      alert("Il carrello è vuoto.");
      return;
    }
    const order = {
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      deliveryFee: DELIVERY_FEE,
      address,
      cap,
      method,
      txhash
    };
    if (method === "stripe") {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
      if (!res.ok) { alert("Errore Stripe"); return; }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Errore Stripe");
    } else if (method === "paypal") {
      // fallback classic PayPal link if serverless not configured
      const amount = total.toFixed(2);
      const params = new URLSearchParams({
        cmd: "_xclick",
        business: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || "nanocakes@vrabo.it",
        item_name: "Ordine NanoCakes",
        amount,
        currency_code: "EUR"
      });
      window.location.href = "https://www.paypal.com/cgi-bin/webscr?" + params.toString();
      await fetch("/api/order", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(order)});
    } else {
      if (!txhash) {
        alert("Inserisci l'hash della transazione crypto dopo il pagamento.");
        return;
      }
      const r = await fetch("/api/order", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(order)});
      if (r.ok) alert("Grazie! Ordine inviato. Riceverai conferma via email.");
      else alert("Ordine inviato ma email non inviata. Ti contatteremo.");
    }
  }

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rosa/40 to-panna" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border border-white/70 shadow-soft mb-6">
              <Image src="/favicon.png" alt="NanoCakes" width={96} height={96} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl mb-3">NanoCakes</h1>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">Torte della tradizione rivisitate. Ingredienti e allergeni chiari. Consegna a domicilio Roma Nord.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a href="#catalogo" className="btn">Ordina Subito</a>
              <a href="#preventivo" className="btn-outline">Richiedi Preventivo</a>
            </div>
          </div>
        </section>

        {/* CATALOGO */}
        <section id="catalogo" className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="font-serif text-3xl mb-6">Catalogo</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map(p => (
              <div key={p.id} className="card overflow-hidden">
                <div className="relative h-52">
                  {/* Use next/image with remote patterns would need config, so use plain img tag for simplicity */}
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{p.name}</h3>
                    <span className="text-cioc font-bold">€ {p.price}</span>
                  </div>
                  <p className="text-sm opacity-80 mt-1">{p.weight}</p>
                  <p className="text-sm mt-3"><span className="font-semibold">Ingredienti:</span> {p.ingredients}</p>
                  <p className="text-sm mt-1"><span className="font-semibold">Allergeni:</span> {p.allergens}</p>
                  <button className="btn mt-4 w-full" onClick={()=>addToCart(p)}>Aggiungi al carrello</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHECKOUT */}
        <section className="bg-white/60 border-y border-white/40">
          <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-2xl mb-3">Carrello</h3>
              {cart.length === 0 ? <p className="opacity-70">Nessun prodotto nel carrello.</p> : (
                <div className="space-y-3">
                  {cart.map(it => (
                    <div key={it.id} className="flex items-center justify-between gap-3">
                      <span>{it.name}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} value={it.qty} onChange={e=>updateQty(it.id, parseInt(e.target.value||'1'))} className="w-16 border rounded px-2 py-1" />
                        <span>€ {(it.price*it.qty).toFixed(2)}</span>
                        <button className="btn-outline" onClick={()=>removeItem(it.id)}>Rimuovi</button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t mt-3">
                    <div className="flex items-center justify-between">
                      <span>Consegna</span><span>€ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-lg mt-2">
                      <span>Totale</span><span>€ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-3">Checkout</h3>
              <div className="grid gap-3">
                <input placeholder="Indirizzo" value={address} onChange={e=>setAddress(e.target.value)} className="border rounded-xl px-4 py-3" />
                <input placeholder="CAP o Zona (00188, 00189, Riano, ...)" value={cap} onChange={e=>setCap(e.target.value)} className="border rounded-xl px-4 py-3" />
                {!zoneOk && <p className="text-red-600">Zona non servita.</p>}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='stripe'} onChange={()=>setMethod('stripe')} /> Carta (Stripe)</label>
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='paypal'} onChange={()=>setMethod('paypal')} /> PayPal</label>
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='crypto'} onChange={()=>setMethod('crypto')} /> Crypto</label>
                </div>
                {method==='crypto' && (
                  <div className="card p-4">
                    <p className="font-semibold mb-2">Paga su wallet (MATIC / ETH / USDT / DAI / USDC)</p>
                    <p className="text-sm">Indirizzo: <span className="font-mono">0xe77E6C411F2ee01F1cfbccCb1c418c80F1a534fe</span></p>
                    <input placeholder="TX hash (dopo pagamento)" className="border rounded-xl px-3 py-2 mt-2 w-full" value={txhash} onChange={e=>setTxhash(e.target.value)} />
                  </div>
                )}
                <button className="btn" onClick={doCheckout}>Conferma e paga</button>
                <p className="text-xs opacity-70">Pagamenti sicuri. Email assistenza: <a className="underline" href="mailto:nanocakes@vrabo.it">nanocakes@vrabo.it</a> · Tel: +39 380 000 0000</p>
              </div>
            </div>
          </div>
        </section>

        {/* PREVENTIVO */}
        <section id="preventivo" className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="font-serif text-3xl mb-6">Richiesta Preventivo</h2>
          <PreventivoForm />
        </section>
      </main>
      <CookieBanner />
      <Footer />
    </>
  );
}

function PreventivoForm(){
  const [form, setForm] = useState({ nome:"", email:"", telefono:"", prodotto:"", data:"", note:"" });
  const [sent, setSent] = useState(false);

  async function submit(e){
    e.preventDefault();
    const res = await fetch("/api/preventivo", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    if(res.ok) setSent(true);
    else alert("Errore invio preventivo: riprova.");
  }
  if(sent) return <div className="card p-6"><p className="font-semibold">Richiesta inviata! Ti ricontatteremo a breve.</p></div>;

  return (
    <form onSubmit={submit} className="card p-6 grid gap-3">
      <input required placeholder="Nome e cognome" value={form.nome} onChange={e=>setForm(f=>({...f, nome:e.target.value}))} className="border rounded-xl px-4 py-3" />
      <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} className="border rounded-xl px-4 py-3" />
      <input placeholder="Telefono" value={form.telefono} onChange={e=>setForm(f=>({...f, telefono:e.target.value}))} className="border rounded-xl px-4 py-3" />
      <input placeholder="Dolce richiesto / kg / persone" value={form.prodotto} onChange={e=>setForm(f=>({...f, prodotto:e.target.value}))} className="border rounded-xl px-4 py-3" />
      <input type="date" placeholder="Data consegna" value={form.data} onChange={e=>setForm(f=>({...f, data:e.target.value}))} className="border rounded-xl px-4 py-3" />
      <textarea placeholder="Note" value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} className="border rounded-xl px-4 py-3" rows={4} />
      <button className="btn">Invia richiesta</button>
      <p className="text-xs opacity-70">Email ricezione: nanocakes@vrabo.it</p>
    </form>
  );
}
