import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-14 sm:px-10">

        {/* ── Main row ── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">

          {/* Brand */}
          <div className="max-w-sm">
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="font-serif text-base font-semibold tracking-wide">
                Meenah Fashion Room
              </span>
            </div>
            <p className="text-sm leading-7 text-zinc-400">
              A beautiful home for bold style and effortless shopping. Curated
              fashion for the modern Lagos woman.
            </p>
          </div>

          {/* Contact info */}
          <ul className="space-y-4">
            <li>
              <a
                href="mailto:meenahfashionroom@gmail.com"
                className="flex items-start gap-3 text-sm text-zinc-400 transition hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600" strokeWidth={1.5} />
                meenahfashionroom@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+2347015518667"
                className="flex items-start gap-3 text-sm text-zinc-400 transition hover:text-white"
              >
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600" strokeWidth={1.5} />
                +234 701 551 8667
              </a>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600" strokeWidth={1.5} />
              <span>
                13, Gbajumo Street, Balogun,
                <br />
                Lagos Island, Lagos
              </span>
            </li>
          </ul>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
            © {year} Meenah Fashion Room. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-white/30 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4H8C5.79 4 4 5.79 4 8v8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2347015518667"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-white/30 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 2.001C6.478 2.001 2 6.478 2 12c0 1.897.518 3.672 1.42 5.194L2 22l4.975-1.394A9.95 9.95 0 0012 22c5.522 0 10-4.477 10-10S17.521 2 11.999 2zm.001 18a7.95 7.95 0 01-4.075-1.123l-.293-.174-3.044.852.833-3.023-.19-.31A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="#"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-white/30 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}