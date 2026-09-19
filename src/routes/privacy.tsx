import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/content";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({ meta: [{ title: "Privacy Policy | Shefa Venturez" }] }),
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="19 September 2026">
      <p>
        Shefa Venturez collects only what we need to reply to you, enroll you, or send a file you asked for. We do not sell personal data.
      </p>
      <p>When you write, enroll, or download a PDF we may store your name, email, phone, and the message you sent.</p>
      <p>
        Payment references and notices are stored so we can match a transfer to a place. Bank and mobile-money numbers used to receive fees are shown only after you enroll — not on public pages.
      </p>
      <p>
        Staff sign-in uses email and password on this site. Session cookies stay on shefaventurez.com. We use them to keep the dashboard signed in.
      </p>
      <p>
        Questions: {CONTACT_EMAIL} or WhatsApp {WHATSAPP_DISPLAY}.
      </p>
    </LegalPage>
  );
}
