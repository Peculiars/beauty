import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-zinc-950 px-6 pb-16 pt-20 sm:px-10 sm:pt-24">
        {/* decorative ghost text */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(80px,18vw,200px)] font-light tracking-widest text-white/[0.03]"
        >
          CONTACT
        </span>

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-zinc-500">
            <span className="h-px w-7 bg-zinc-700" />
            Meenah Fashion Room
          </p>
          <h1 className="font-serif text-[clamp(36px,6vw,80px)] font-light leading-[1.1] tracking-tight text-white">
            We&apos;re here to
            <br />
            <em className="font-light italic">help you shine.</em>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            Have a question, a styling request, or just want to say hello?
            Reach out — we&apos;d love to hear from you.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2">

          {/* ── Left: Info ── */}
          <div>
            <h2 className="mb-8 border-b border-zinc-200 pb-5 font-serif text-2xl font-normal tracking-tight text-zinc-900">
              Get in touch
            </h2>

            {/* Contact cards */}
            <div className="divide-y divide-zinc-100">
              <div className="flex items-start gap-4 py-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-950">
                  <Mail className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">Email</p>
                  <a
                    href="mailto:meenahfashionroom@gmail.com"
                    className="text-sm font-medium text-zinc-900 transition hover:underline"
                  >
                    meenahfashionroom@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-950">
                  <Phone className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">Phone</p>
                  <a
                    href="tel:+2347015518667"
                    className="text-sm font-medium text-zinc-900 transition hover:underline"
                  >
                    +234 701 551 8667
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-950">
                  <MapPin className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">Address</p>
                  <p className="text-sm font-medium leading-6 text-zinc-900">
                    13, Gbajumo Street, Balogun,
                    <br />
                    Lagos Island, Lagos
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-8 rounded-2xl bg-zinc-950 p-7 text-white">
              <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                Working Hours
              </p>
              <div className="space-y-3">
                {[
                  ["Monday – Friday", "9:00 AM – 6:00 PM"],
                  ["Saturday", "10:00 AM – 4:00 PM"],
                  ["Sunday", "Closed"],
                ].map(([day, time]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between border-b border-white/10 pb-3 text-sm last:border-none last:pb-0"
                  >
                    <span className="text-zinc-300">{day}</span>
                    <span className="text-zinc-500">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div>
            <h2 className="mb-8 border-b border-zinc-200 pb-5 font-serif text-2xl font-normal tracking-tight text-zinc-900">
              Send a message
            </h2>

            <ContactForm />

            <Link
              href="/"
              className="mt-4 block text-center text-xs uppercase tracking-[0.15em] text-zinc-400 transition hover:text-zinc-900"
            >
              ← Back to shop
            </Link>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="mt-16">
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-zinc-400">
            <span className="h-px w-7 bg-zinc-200" />
            Find us on the map
          </p>
          <div className="h-[320px] overflow-hidden rounded-2xl border border-zinc-200 sm:h-[380px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7300744978604!2d3.3909252!3d6.4531137!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2d2cb72701%3A0x0!2zMTMgR2JhanVtbyBTdCwgQmFsb2d1biwgTGFnb3MgSXNsYW5k!5e0!3m2!1sen!2sng!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Meenah Fashion Room location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}