import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/disclaimer")({
  component: Disclaimer,
  head: () => ({ meta: [{ title: "Disclaimer | Shefa Venturez" }] }),
});

function Disclaimer() {
  return (
    <LegalPage title="Disclaimer" updated="19 September 2026">
      <p>We do not invent clients, awards, pass rates, or profit figures.</p>
      <p>Cybersecurity services are authorized and defensive only. We do not scan, test, or access systems without written permission and a defined window.</p>
      <p>
        Forex content — including the free PDF and Telegram insights — is education. It is not a signal service. Capital can be lost.
      </p>
      <p>Academy fees are paid by bank transfer or Uganda mobile money after enrollment. Do not pay anyone who is not using the official WhatsApp or email.</p>
    </LegalPage>
  );
}
