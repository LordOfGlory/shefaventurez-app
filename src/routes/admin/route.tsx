import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getStaffSession } from "@/lib/staff";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/programs", label: "Programs" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/articles", label: "Articles" },
  { to: "/admin/inquiries", label: "Inquiries" },
  { to: "/admin/enrollments", label: "Enrollments" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/downloads", label: "PDF downloads" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function NavLinks({ className }: { className?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={className}>
      {NAV.map((item) => {
        const active = "end" in item && item.end ? path === item.to : path === item.to || path.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`block whitespace-nowrap py-1 ${active ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const [staff, setStaff] = useState<{ isStaff: boolean; email: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setStaff(null);
      return;
    }
    let cancelled = false;
    getStaffSession()
      .then((s) => {
        if (!cancelled) setStaff(s);
      })
      .catch(() => {
        if (!cancelled) setStaff({ isStaff: false, email: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending || (user && !staff)) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!staff?.isStaff) {
    return (
      <main className="grid min-h-screen place-items-center bg-fog p-6">
        <div className="max-w-md rounded-xl border border-line bg-paper p-6">
          <h1 className="text-xl font-semibold">Staff only</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {staff?.email ? `${staff.email} is signed in, but it is not on the staff list.` : "This account is not staff."} Ask an existing admin to add the email under Settings, then sign in again.
          </p>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/" className="text-sm text-blue">
              Back to the site
            </Link>
            <UserButton />
          </div>
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-screen bg-fog">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-line bg-paper p-5 md:block">
          <p className="text-xs uppercase tracking-wider text-muted">Dashboard</p>
          <p className="mt-1 font-semibold">Shefa Venturez</p>
          <NavLinks className="mt-8 space-y-2 text-sm" />
          <Link to="/" className="mt-8 block py-1 text-sm text-muted hover:text-ink">
            View site
          </Link>
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-line bg-paper px-5 py-3">
            <p className="text-sm font-medium">Admin</p>
            <UserButton />
          </header>
          <div className="flex gap-3 overflow-x-auto border-b border-line bg-paper px-5 py-3 text-sm md:hidden">
            <NavLinks className="flex gap-4" />
          </div>
          <div className="p-5 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
