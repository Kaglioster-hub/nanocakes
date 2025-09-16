export default function Footer() {
  return (
    <footer id="contatti" className="mt-16 bg-cioc text-panna">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl mb-3">NanoCakes</h3>
          <p className="opacity-90">Dolci artigianali con consegna Roma Nord.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contatti</h4>
          <ul className="space-y-1 opacity-90">
            <li>Email: <a href="mailto:nanocakes@vrabo.it" className="underline">nanocakes@vrabo.it</a></li>
            <li>WhatsApp/Tel: <a href="tel:+393800000000" className="underline">+39 380 000 0000</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Legali</h4>
          <ul className="space-y-1 opacity-90">
            <li><a className="underline" href="/privacy">Privacy & Cookie</a></li>
            <li>© {new Date().getFullYear()} NanoCakes</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
