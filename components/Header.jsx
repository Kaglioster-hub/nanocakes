"use client";
import Image from "next/image";
import Link from "next/link";

export default function Header({ cartCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 bg-panna/85 backdrop-blur border-b border-white/40">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/favicon.png" alt="NanoCakes" width={28} height={28} className="rounded-full border border-white/70" />
          <span className="font-serif text-lg">NanoCakes</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#catalogo" className="hover:underline">Catalogo</Link>
          <Link href="#preventivo" className="hover:underline">Preventivo</Link>
          <Link href="#carrello" className="hover:underline relative">
            <span className="pr-5">Carrello</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 text-[10px] bg-oro text-cioc px-1.5 py-0.5 rounded-full border border-white/70">{cartCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
