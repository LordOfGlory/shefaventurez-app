import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const HTML_DEST: Record<string, string> = {
  consultation: "/consultation",
  contact: "/contact",
  about: "/about",
  academy: "/academy",
  download: "/download",
  enroll: "/enroll",
  "it-services": "/it-services",
  cybersecurity: "/cybersecurity",
  "academy-forex": "/academy/forex",
  "academy-it": "/academy/it",
  "academy-cyber": "/academy/cyber",
  "service-mobile": "/services/mobile",
  "service-web": "/services/web",
};

export function AppNotFound() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const path = window.location.pathname;
    if (!/\.html$/i.test(path)) return;
    const name = path.split("/").pop()?.replace(/\.html$/i, "") || "";
    const dest = HTML_DEST[name] || path.replace(/\.html$/i, "") || "/";
    window.location.replace(dest);
  }, [pathname]);

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center">
      <div>
        <p className="text-sm text-muted">404</p>
        <h1 className="mt-2 text-2xl font-semibold">This page is not on the site.</h1>
        <p className="mt-3 text-sm text-muted">Use Home, Consultation, or Academy.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-block rounded-md bg-ink px-4 py-2 text-sm text-paper">
            Home
          </Link>
          <Link to="/consultation" className="inline-block rounded-md border border-line px-4 py-2 text-sm">
            Consultation
          </Link>
          <Link to="/academy" className="inline-block rounded-md border border-line px-4 py-2 text-sm">
            Academy
          </Link>
        </div>
      </div>
    </main>
  );
}
