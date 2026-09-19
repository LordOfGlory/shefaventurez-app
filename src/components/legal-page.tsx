import { PublicShell } from "@/components/site-chrome";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="kicker text-muted">
          <i />
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        <div className="prose-shefa mt-8">{children}</div>
      </article>
    </PublicShell>
  );
}
