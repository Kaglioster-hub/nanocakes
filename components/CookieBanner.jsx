"use client";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ok = localStorage.getItem("nc-cookies-ok");
    if (!ok) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-50">
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur border border-white/40 rounded-2xl shadow-soft p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm">
          Usiamo cookie tecnici per migliorare l’esperienza e strumenti di terze parti. Continuando accetti la nostra <a href="/privacy" className="underline">Privacy & Cookie Policy</a>.
        </p>
        <button className="btn" onClick={()=>{localStorage.setItem("nc-cookies-ok","1");setShow(false);}}>Accetto</button>
      </div>
    </div>
  );
}
