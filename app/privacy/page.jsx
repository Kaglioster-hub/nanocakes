export const metadata = { title: "Privacy & Cookie – NanoCakes" };
export default function Privacy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl mb-4">Privacy & Cookie Policy</h1>
      <p className="opacity-80 mb-3">Questa è una policy di esempio. Personalizzala in base al tuo titolare del trattamento, finalità e strumenti di tracciamento.</p>
      <h2 className="font-semibold mt-6">Cookie</h2>
      <p className="opacity-80">Usiamo cookie tecnici e strumenti di terze parti (Stripe, PayPal) per il pagamento.</p>
      <h2 className="font-semibold mt-6">Contatti</h2>
      <p className="opacity-80">Scrivi a <a className="underline" href="mailto:nanocakes@vrabo.it">nanocakes@vrabo.it</a>.</p>
    </main>
  );
}
