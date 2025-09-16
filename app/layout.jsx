export const metadata = {
  title: "NanoCakes – Dolci artigianali con consegna",
  description: "Torte della tradizione rivisitate, ingredienti e allergeni chiari, consegna a domicilio Roma Nord.",
  themeColor: "#3E2723",
  icons: { icon: "/favicon.png" }
};

import "./../styles/globals.css";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
