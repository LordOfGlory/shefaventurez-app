import { createFileRoute, Link } from "@tanstack/react-router";
import { listAllArticles, listAllPages, listAllPrograms, listAllServices, listDownloadStats, listEnrollments, listInquiries } from "@/lib/cms";
import { listPayments } from "@/lib/payments";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [inquiries, enrollments, payments, downloads, pages, programs, articles, services] = await Promise.all([
      safeLoad(() => listInquiries(), []),
      safeLoad(() => listEnrollments(), []),
      safeLoad(() => listPayments(), []),
      safeLoad(() => listDownloadStats(), { total: 0, unique_emails: 0, last_7_days: 0, rows: [] }),
      safeLoad(() => listAllPages(), []),
      safeLoad(() => listAllPrograms(), []),
      safeLoad(() => listAllArticles(), []),
      safeLoad(() => listAllServices(), []),
    ]);
    return {
      inquiries: inquiries.length,
      enrollments: enrollments.length,
      awaiting: payments.filter((p) => p.status === "awaiting_confirm").length,
      downloads: downloads.total,
      pages: pages.length,
      programs: programs.length,
      articles: articles.length,
      services: services.length,
    };
  },
  component: Overview,
});

function Overview() {
  const d = Route.useLoaderData();
  const cards = [
    ["/admin/pages", "Pages", d.pages],
    ["/admin/programs", "Programs", d.programs],
    ["/admin/services", "Services", d.services],
    ["/admin/articles", "Articles", d.articles],
    ["/admin/inquiries", "Inquiries", d.inquiries],
    ["/admin/enrollments", "Enrollments", d.enrollments],
    ["/admin/payments", "Awaiting confirm", d.awaiting],
    ["/admin/downloads", "PDF downloads", d.downloads],
  ] as const;
  return (
    <div>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Edit public pages, programs and articles. Students pay by bank (USD / UGX) or Uganda mobile money. Fill account numbers under Settings before you send anyone to Enroll.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([to, label, n]) => (
          <Link key={to} to={to} className="rounded-xl border border-line bg-paper p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{n}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
