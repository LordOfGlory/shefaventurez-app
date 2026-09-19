import { useState } from "react";
import { WA_MENU, WHATSAPP_DISPLAY } from "@/lib/content";

const ICON = (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1s-.7.9-.8 1c-.2.1-.3.2-.6.1a7.3 7.3 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.1-.3c0-.1 0-.3-.1-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.4c.1.2 1.6 2.4 3.8 3.4 1.4.6 1.9.7 2.6.6.4 0 1.3-.2 1.5-.5s.6-.6.7-.8.1-.4 0-.5-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
  </svg>
);

export function WaDock() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div
          className="mb-3 w-72 rounded-xl border border-line bg-paper p-4 shadow-lg"
          role="dialog"
          aria-label="Message Shefa on WhatsApp"
        >
          <p className="text-sm font-semibold">WhatsApp {WHATSAPP_DISPLAY}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">Choose a topic. The first message is already written for you.</p>
          <ul className="mt-3 grid gap-2">
            {WA_MENU.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="block rounded-md border border-line px-3 py-2.5 text-sm hover:border-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-wa text-paper shadow-lg"
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp menu" : `Chat on WhatsApp ${WHATSAPP_DISPLAY}`}
        onClick={() => setOpen((v) => !v)}
      >
        {ICON}
      </button>
    </div>
  );
}
