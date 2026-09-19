import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AdminField, af } from "@/components/admin-form";
import { getAdminSettings, saveAdminSettings } from "@/lib/payments";
import { safeLoad } from "@/lib/admin-load";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/content";

const EMPTY = {
  bank_name: "",
  bank_account_name: "Shefa Venturez",
  bank_usd_account: "",
  bank_ugx_account: "",
  bank_branch: "",
  bank_swift: "",
  momo_number: WHATSAPP_DISPLAY,
  momo_name: "Shefa Venturez",
  vip_whatsapp_invite: "",
  staff_emails: "",
};

export const Route = createFileRoute("/admin/settings")({
  loader: () => safeLoad(() => getAdminSettings(), EMPTY),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const settings = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Fill bank account numbers here first. They appear on the student pay page after enrollment as “Pay by bank”. Leave a field empty if you do not want it shown. Mobile money uses WhatsApp {WHATSAPP_DISPLAY} unless you change it. {CONTACT_EMAIL}.
        </p>
      </div>
      <form
        className="space-y-4 rounded-xl border border-line bg-paper p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMsg("");
          const fd = new FormData(e.currentTarget);
          try {
            await saveAdminSettings({
              data: {
                bank_name: String(fd.get("bank_name") || "").trim(),
                bank_account_name: String(fd.get("bank_account_name") || "").trim(),
                bank_usd_account: String(fd.get("bank_usd_account") || "").trim(),
                bank_ugx_account: String(fd.get("bank_ugx_account") || "").trim(),
                bank_branch: String(fd.get("bank_branch") || "").trim(),
                bank_swift: String(fd.get("bank_swift") || "").trim(),
                momo_number: String(fd.get("momo_number") || "").trim(),
                momo_name: String(fd.get("momo_name") || "").trim(),
                vip_whatsapp_invite: String(fd.get("vip_whatsapp_invite") || "").trim(),
                staff_emails: String(fd.get("staff_emails") || "").trim(),
              },
            });
            setMsg("Saved.");
            await router.invalidate();
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Could not save. Sign in again if the session expired.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2 className="font-semibold">Pay by bank</h2>
        <AdminField label="Bank name" hint="Shown on the student pay page. Example: your bank’s public name — not required.">
          <input name="bank_name" className={af} defaultValue={settings.bank_name} />
        </AdminField>
        <AdminField label="Account name">
          <input name="bank_account_name" className={af} defaultValue={settings.bank_account_name} />
        </AdminField>
        <AdminField label="USD account number" hint="Leave empty until the number is confirmed. Do not invent it.">
          <input name="bank_usd_account" className={af} inputMode="numeric" defaultValue={settings.bank_usd_account} />
        </AdminField>
        <AdminField label="UGX account number">
          <input name="bank_ugx_account" className={af} inputMode="numeric" defaultValue={settings.bank_ugx_account} />
        </AdminField>
        <AdminField label="Branch (optional)">
          <input name="bank_branch" className={af} defaultValue={settings.bank_branch} />
        </AdminField>
        <AdminField label="SWIFT (optional)">
          <input name="bank_swift" className={af} defaultValue={settings.bank_swift} />
        </AdminField>
        <h2 className="pt-4 font-semibold">Uganda mobile money</h2>
        <AdminField label="Number" hint="Defaults to the company WhatsApp number.">
          <input name="momo_number" className={af} defaultValue={settings.momo_number || WHATSAPP_DISPLAY} />
        </AdminField>
        <AdminField label="Name on the account">
          <input name="momo_name" className={af} defaultValue={settings.momo_name} />
        </AdminField>
        <h2 className="pt-4 font-semibold">After you mark paid</h2>
        <AdminField label="VIP WhatsApp group invite" hint="https://chat.whatsapp.com/… — shown only after you confirm payment.">
          <input name="vip_whatsapp_invite" className={af} placeholder="https://chat.whatsapp.com/…" defaultValue={settings.vip_whatsapp_invite} />
        </AdminField>
        <h2 className="pt-4 font-semibold">Staff emails</h2>
        <AdminField label="Who can open this dashboard" hint="Comma-separated. Your own email stays on the list so you cannot lock yourself out.">
          <textarea name="staff_emails" rows={3} className={af} defaultValue={settings.staff_emails} placeholder="you@example.com" />
        </AdminField>
        {msg ? <p className="text-sm">{msg}</p> : null}
        <button disabled={busy} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50" type="submit">
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
      <p className="text-sm text-muted">
        Transactions live under{" "}
        <Link to="/admin/payments" className="underline">
          Payments
        </Link>
        .
      </p>
    </div>
  );
}
