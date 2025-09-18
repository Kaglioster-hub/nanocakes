"use client";
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
  const [method, setMethod] = useState("stripe");
  const [txhash, setTxhash] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1200);
  }

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
    showToast(`Aggiunto: ${p.name}`);
  }

  function updateQty(id, qty) {
    setCart(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it));
  }
  function removeItem(id) { setCart(prev => prev.filter(it => it.id !== id)); }

  async function doCheckout() {
    if (!zoneOk) { alert("Zona non servita."); return; }
    if (cart.length === 0) { alert("Carrello vuoto."); return; }
    const order = { items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })), deliveryFee: DELIVERY_FEE, address, cap, method, txhash };
    if (method === "stripe") {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
      const data = await res.json().catch(()=>({}));
      if (res.ok && data?.url) window.location.href = data.url; else alert("Errore Stripe");
    } else if (method === "paypal") {
      const amount = total.toFixed(2);
      const params = new URLSearchParams({ cmd: "_xclick", business: "nanocakes@vrabo.it", item_name: "Ordine NanoCakes", amount, currency_code: "EUR" });
      window.location.href = "https://www.paypal.com/cgi-bin/webscr?" + params.toString();
      await fetch("/api/order", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(order)});
    } else {
      if (!txhash) { alert("Inserisci TX hash dopo il pagamento."); return; }
      const r = await fetch("/api/order", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(order)});
      if (r.ok) showToast("Ordine inviato ✓"); else alert("Ordine inviato ma email non inviata.");
    }
  }

  const cartCount = cart.reduce((a,b)=>a+b.qty,0);

  return (
    <>
      <Header cartCount={cartCount} />
      <main>
        {/* HERO compatta */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rosa/30 to-panna" />
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
            <h1 className="font-serif text-4xl md:text-5xl mb-2">NanoCakes</h1>
            <p className="text-base opacity-80 max-w-2xl mx-auto">Torte della tradizione rivisitate. Consegna Roma Nord.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <a href="#catalogo" className="btn px-4 py-2">Ordina</a>
              <a href="#preventivo" className="btn-outline px-4 py-2">Preventivo</a>
            </div>
          </div>
        </section>

        {/* CATALOGO compatto */}
        <section id="catalogo" className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="font-serif text-2xl mb-4">Catalogo</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map(p => (
              <div key={p.id} className="card overflow-hidden">
                <div className="relative h-40">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-base">{p.name}</h3>
                    <span className="text-cioc font-bold">€ {p.price}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{p.weight}</p>
                  <p className="text-xs mt-2"><span className="font-semibold">Ingredienti:</span> {p.ingredients}</p>
                  <p className="text-xs mt-1"><span className="font-semibold">Allergeni:</span> {p.allergens}</p>
                  <button className="btn mt-3 w-full px-3 py-2" onClick={()=>addToCart(p)}>Aggiungi al carrello</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHECKOUT */}
        <section id="carrello" className="bg-white/60 border-y border-white/40">
          <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-xl mb-3">Carrello</h3>
              {cart.length === 0 ? <p className="opacity-70">Nessun prodotto nel carrello.</p> : (
                <div className="space-y-2">
                  {cart.map(it => (
                    <div key={it.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm">{it.name}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} value={it.qty} onChange={e=>updateQty(it.id, parseInt(e.target.value||"1"))} className="w-14 border rounded px-2 py-1 text-sm" />
                        <span className="text-sm">€ {(it.price*it.qty).toFixed(2)}</span>
                        <button className="btn-outline px-3 py-1 text-sm" onClick={()=>removeItem(it.id)}>Rimuovi</button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t mt-2 text-sm">
                    <div className="flex items-center justify-between"><span>Consegna</span><span>€ {DELIVERY_FEE.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between font-semibold text-base mt-1"><span>Totale</span><span>€ {total.toFixed(2)}</span></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3">Checkout</h3>
              <div className="grid gap-2">
                <input placeholder="Indirizzo" value={address} onChange={e=>setAddress(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" />
                <input placeholder="CAP o Zona (00188, 00189, Riano, ...)" value={cap} onChange={e=>setCap(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" />
                {!zoneOk && <p className="text-red-600 text-sm">Zona non servita.</p>}
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='stripe'} onChange={()=>setMethod('stripe')} /> Carta</label>
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='paypal'} onChange={()=>setMethod('paypal')} /> PayPal</label>
                  <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='crypto'} onChange={()=>setMethod('crypto')} /> Crypto</label>
                </div>
                {method==='crypto' && (
                  <div className="card p-3 text-sm">
                    <p className="font-semibold mb-1">Wallet: <span className="font-mono">0xe77E6C411F2ee01F1cfbccCb1c418c80F1a534fe</span></p>
                    <input placeholder="TX hash (dopo pagamento)" className="border rounded-xl px-3 py-2 mt-2 w-full text-sm" value={txhash} onChange={e=>setTxhash(e.target.value)} />
                  </div>
                )}
                <button className="btn px-4 py-2" onClick={doCheckout}>Conferma e paga</button>
                <p className="text-xs opacity-70">Assistenza: <a className="underline" href="mailto:nanocakes@vrabo.it">nanocakes@vrabo.it</a> · +39 380 000 0000</p>
              </div>
            </div>
          </div>
        </section>

        {/* PREVENTIVO (client) */}
        <section id="preventivo" className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="font-serif text-2xl mb-4">Richiesta Preventivo</h2>
          <PreventivoForm onSuccess={()=>showToast("Preventivo inviato ✓")} />
        </section>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-cioc text-panna px-4 py-2 rounded-xl shadow-soft">{toast}</div>
      )}

      <CookieBanner />
      <Footer />
    </>
  );
}

function PreventivoForm({ onSuccess }) {
  const [form, setForm] = useState({ nome:"", email:"", telefono:"", prodotto:"", data:"", note:"" });
  const [sent, setSent] = useState(false);

  async function submit(e){
    e.preventDefault();
    try {
      const res = await fetch("/api/preventivo", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(()=>({}));
      if (res.ok && (data?.ok !== false)) {
        setSent(true);
        onSuccess && onSuccess();
      } else {
        alert("Invio non riuscito. Riprova più tardi.");
      }
    } catch {
      alert("Invio non riuscito. Controlla la connessione.");
    }
  }

  if(sent) return <div className="card p-5"><p className="font-semibold">Richiesta inviata! Ti ricontatteremo a breve.</p></div>;

  return (
    <form onSubmit={submit} className="card p-5 grid gap-2">
      <input required placeholder="Nome e cognome" value={form.nome} onChange={e=>setForm(f=>({...f, nome:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" />
      <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" />
      <input placeholder="Telefono" value={form.telefono} onChange={e=>setForm(f=>({...f, telefono:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" />
      <input placeholder="Dolce richiesto / per quante persone" value={form.prodotto} onChange={e=>setForm(f=>({...f, prodotto:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" />
      <input type="date" value={form.data} onChange={e=>setForm(f=>({...f, data:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" />
      <textarea placeholder="Note" value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} className="border rounded-xl px-3 py-2 text-sm" rows={4} />
      <button className="btn px-4 py-2">Invia richiesta</button>
      <p className="text-xs opacity-70">Email ricezione: nanocakes@vrabo.it</p>
    </form>
  );
}
