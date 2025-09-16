import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-panna/80 backdrop-blur border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/favicon.png" alt="NanoCakes" width={36} height={36} className="rounded-full border border-white/70" />
          <span className="font-serif text-xl">NanoCakes</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="#catalogo" className="hover:underline">Catalogo</Link>
          <Link href="#preventivo" className="hover:underline">Preventivo</Link>
          <Link href="#contatti" className="hover:underline">Contatti</Link>
        </nav>
      </div>
    </header>
  );
}
