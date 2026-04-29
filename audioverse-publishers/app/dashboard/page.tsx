import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getPublisher, isAdminEmail } from "@/lib/middleware/auth";
import { adsTxtLineFor } from "@/lib/utils/publisher-id";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { VerificationLayer, type LayerState } from "@/components/dashboard/VerificationLayer";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { PublisherIdDisplay } from "@/components/dashboard/PublisherIdDisplay";
import { AdsTxtLineDisplay } from "@/components/dashboard/AdsTxtLineDisplay";
import { CheckNowButton } from "@/components/dashboard/CheckNowButton";
import { findCountry } from "@/lib/utils/country-list";
import { signOut } from "@/app/auth/actions";
import type { VerificationAttemptRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Dashboard — AudioVerse Publishers" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const publisher = await getPublisher(user.id);
  if (!publisher) redirect("/onboarding");

  const admin = createAdminClient();
  const { data: activityData } = await admin
    .from("verification_attempts")
    .select("*")
    .eq("publisher_id", publisher.id)
    .order("attempted_at", { ascending: false })
    .limit(10);
  const activity = (activityData as VerificationAttemptRow[] | null) ?? [];

  const layers = buildLayers(publisher);
  const percent = Math.round(
    (layers.filter((l) => l.state === "verified").length / layers.length) * 100,
  );

  const country = publisher.primary_country ? findCountry(publisher.primary_country) : undefined;
  const line = adsTxtLineFor(publisher.publisher_id);
  const platformLabel =
    publisher.platform_type === "website"
      ? "Website"
      : publisher.platform_type === "ios_app"
        ? "iOS App"
        : publisher.platform_type === "android_app"
          ? "Android App"
          : "—";
  const platformTarget = publisher.platform_type === "website" ? publisher.domain : publisher.bundle_id;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
            Audio<span className="text-primary">Verse</span>
          </Link>
          <p className="mt-0.5 text-sm text-white/50">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdminEmail(user.email) ? (
            <Link href="/admin" className="av-btn-secondary">
              Admin
            </Link>
          ) : null}
          <form action={signOut}>
            <button type="submit" className="av-btn-secondary">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Status overview */}
      <section className="av-card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusBadge status={publisher.status} size="lg" />
            <h1 className="mt-2 text-xl font-semibold text-white">
              {percent === 100 ? "You're all set." : `${percent}% complete`}
            </h1>
            <p className="text-sm text-white/60">
              {publisher.status === "active"
                ? "Ads are eligible to serve."
                : publisher.status === "pending"
                  ? "Under manual review — we'll email you when it's ready."
                  : "Finish the steps below to go live."}
            </p>
          </div>
          <CheckNowButton />
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="av-card lg:col-span-2">
          <h2 className="mb-4 font-semibold text-white">Verification layers</h2>
          <div>
            {layers.map((l) => (
              <VerificationLayer
                key={l.name}
                name={l.name}
                state={l.state}
                method={l.method}
                at={l.at}
                action={l.action}
              />
            ))}
          </div>
        </section>

        <section className="av-card space-y-4">
          <h2 className="font-semibold text-white">Your details</h2>
          <PublisherIdDisplay publisherId={publisher.publisher_id} />
          <AdsTxtLineDisplay line={line} />
          <dl className="space-y-2 text-sm">
            <Row label="Platform" value={platformLabel} />
            <Row
              label={publisher.platform_type === "website" ? "Domain" : "Bundle ID"}
              value={platformTarget ?? "—"}
              mono
            />
            <Row
              label="Monthly users"
              value={publisher.monthly_users?.toLocaleString() ?? "—"}
            />
            <Row
              label="Country"
              value={country ? `${country.flag} ${country.name}` : "—"}
            />
          </dl>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold text-white">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            icon="📡"
            title="Check ads.txt"
            description="Re-run the ads.txt verification right now."
            actionLabel="Re-check"
            href="/dashboard"
            disabled
          />
          {!publisher.phone_verified ? (
            <QuickAction
              icon="📱"
              title="Verify phone"
              description="Get a verification code via SMS to secure your account."
              actionLabel="Verify phone"
              href="/onboarding"
            />
          ) : null}
          <QuickAction
            icon="💳"
            title="Connect payment"
            description="Add a Stripe account to receive monthly payouts."
            actionLabel="Coming in Phase 2"
            disabled
          />
          <QuickAction
            icon="📦"
            title="Download SDK"
            description="Install the AudioVerse SDK in your app or site."
            actionLabel="View docs"
            href="/docs"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="av-card">
          <h2 className="mb-3 font-semibold text-white">Next steps</h2>
          <NextSteps publisher={publisher} />
        </div>
        <div className="av-card">
          <h2 className="mb-3 font-semibold text-white">Recent activity</h2>
          <ActivityLog items={activity} />
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Helpers — kept inline so the page stays a single server component.
// ---------------------------------------------------------------------------
interface Layer {
  name: string;
  state: LayerState;
  method?: string | null;
  at?: string | null;
  action?: React.ReactNode;
}

function buildLayers(p: Awaited<ReturnType<typeof getPublisher>>): Layer[] {
  if (!p) return [];
  return [
    {
      name: "Email verified",
      state: p.email_verified ? "verified" : "not_started",
      at: p.email_verified_at,
    },
    {
      name: "Domain verified",
      state: p.domain_verified ? "verified" : "not_started",
      method: p.domain_verification_method,
      at: p.domain_verified_at,
      action: !p.domain_verified ? (
        <Link href="/onboarding" className="av-btn-secondary">
          Verify
        </Link>
      ) : null,
    },
    {
      name: "ads.txt verified",
      state: p.ads_txt_verified
        ? "verified"
        : p.ads_txt_last_checked
          ? "pending"
          : "not_started",
      at: p.ads_txt_verified_at ?? p.ads_txt_last_checked,
    },
    {
      name: "Phone verified",
      state: p.phone_verified ? "verified" : "not_started",
      at: p.phone_verified_at,
    },
    {
      name: "Payment connected",
      state: p.payout_enabled ? "verified" : "not_started",
    },
  ];
}

function Row({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/50">{label}</dt>
      <dd className={`text-right text-white/90 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function NextSteps({
  publisher,
}: {
  publisher: NonNullable<Awaited<ReturnType<typeof getPublisher>>>;
}) {
  const items: { label: string; done: boolean; href: string; eta: string }[] = [
    {
      label: "Verify your domain",
      done: publisher.domain_verified,
      href: "/onboarding",
      eta: "~2 min",
    },
    {
      label: "Add the ads.txt line",
      done: publisher.ads_txt_verified,
      href: "/docs#ads-txt",
      eta: "~5 min",
    },
    {
      label: "Verify your phone number",
      done: publisher.phone_verified,
      href: "/onboarding",
      eta: "~1 min",
    },
    {
      label: "Connect a payout method",
      done: publisher.payout_enabled,
      href: "/dashboard",
      eta: "~3 min",
    },
  ];
  const incomplete = items.filter((i) => !i.done);
  if (incomplete.length === 0) {
    return <p className="text-sm text-white/60">Everything's set up. Sit back and collect revenue.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {incomplete.map((i) => (
        <li key={i.label} className="flex items-center justify-between gap-3">
          <span className="text-white/80">⏳ {i.label}</span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-white/40">{i.eta}</span>
            <Link href={i.href} className="av-btn-secondary px-3 py-1 text-xs">
              Start
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}
