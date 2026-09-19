import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookies")({
  component: Cookies,
  head: () => ({ meta: [{ title: "Cookie Policy | Shefa Venturez" }] }),
});

function Cookies() {
  return (
    <LegalPage title="Cookie Policy" updated="19 September 2026">
      <p>The public site does not use advertising cookies.</p>
      <p>
        If you sign in to the staff dashboard, we set a secure session cookie so you stay signed in. That cookie is first-party and is not used for ads.
      </p>
      <p>You can delete cookies in your browser. Signing out of the dashboard also ends the staff session.</p>
    </LegalPage>
  );
}
