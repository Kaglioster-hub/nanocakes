"use client";
import Image from "next/image";
import Link from "next/link";

export default function Header({ cartCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 bg-panna/85 backdrop-blur border-b border-white/40">
      <div className="max-w-6xl mx-auto px-3 pt-3">
        {/* Logo sopra + scritta sotto */}
        <div className="flex flex-col items-center select-none">
          <Image
            src="/branding/NanoCakes_Logo_FlatLusso_512.png"   // cambia se il tuo PNG è altrove
            alt="Logo NanoCakes"
            width={64}
            height={64}
            className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-full border border-white/70 shadow-soft mb-1"
            priority
          />
          <span className="text-2xl md:text-3xl leading-none font-nc-script text-amber-900">
            NanoCakes
          </span>
        </div>

        {/* Nav */}
        <nav className="mt-2 mb-3 flex items-center justify-center gap-6 text-sm md:text-base">
          <Link href="#catalogo" className="hover:underline">Catalogo</Link>
          <Link href="#preventivo" className="hover:underline">Preventivo</Link>
          <Link href="#contatti" className="hover:underline">Contatti</Link>

          <Link href="#carrello" className="relative hover:underline">
            <span className="pr-5">Carrello</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 text-[10px] bg-oro text-cioc px-1.5 py-0.5 rounded-full border border-white/70">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
