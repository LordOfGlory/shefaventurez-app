import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>;
  }
  if (user) return <Navigate to="/admin" />;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim() || "Staff";
    try {
      if (!authEnabled) throw new Error("Sign-in is disabled.");
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email, password, name });
        if (err) throw new Error(err.message || "Could not create the account.");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message || "Could not sign in.");
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-fog p-6">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-paper p-6">
        <div>
          <img src="/img/logo.png" alt="Shefa Venturez" className="h-8 w-auto" />
          <p className="kicker mt-6 text-muted">
            <i />
            Staff
          </p>
          <h1 className="mt-3 text-xl font-semibold">{mode === "up" ? "Create staff account" : "Sign in"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Dashboard access is limited to staff. The first account you create here becomes the admin.
          </p>
        </div>
        {authEnabled ? (
          <>
            <form className="space-y-3" onSubmit={onSubmit}>
              {mode === "up" ? (
                <label className="block text-sm">
                  Name
                  <input name="name" required minLength={2} className="mt-1 w-full rounded-md border border-line px-3 py-2" autoComplete="name" />
                </label>
              ) : null}
              <label className="block text-sm">
                Email
                <input name="email" type="email" required className="mt-1 w-full rounded-md border border-line px-3 py-2" autoComplete="email" />
              </label>
              <label className="block text-sm">
                Password
                <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-md border border-line px-3 py-2" autoComplete={mode === "up" ? "new-password" : "current-password"} />
              </label>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button disabled={busy} className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-50" type="submit">
                {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
              </button>
            </form>
            <button type="button" className="text-sm text-blue" onClick={() => setMode(mode === "up" ? "in" : "up")}>
              {mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line" />
              </div>
              <p className="relative mx-auto w-fit bg-paper px-2 text-xs text-muted">or</p>
            </div>
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/admin" })}
                className="w-full rounded-md border border-line px-4 py-2 text-sm hover:bg-fog"
              >
                Continue with {p.label}
              </button>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
