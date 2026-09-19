import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/content";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({ meta: [{ title: "Terms of Service | Shefa Venturez" }] }),
});

function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="19 September 2026">
      <p>These terms cover IT work, authorized cybersecurity, and academy training offered by Shefa Venturez.</p>
      <p>IT and security work starts only after a written scope. Security testing does not start without written authorization.</p>
      <p>
        Academy places are confirmed after we see the payment. Students join one school at a time. Tuition is in US dollars; Uganda payers may also use a UGX bank transfer or mobile money.
      </p>
      <p>Forex training is education. It is not investment advice, account management, or a promise of income. Trading can result in loss of capital.</p>
      <p>Contact: {CONTACT_EMAIL}.</p>
    </LegalPage>
  );
}
