import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  generateRecommendations,
  getLatestRecommendations,
} from "@/lib/recommendations.functions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  IndianRupee,
  ExternalLink,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchRecs = useServerFn(getLatestRecommendations);
  const regen = useServerFn(generateRecommendations);
  const [profile, setProfile] = useState<any>(null);
  const [recs, setRecs] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      if (!p?.completed_onboarding) {
        navigate({ to: "/onboarding" });
        return;
      }
      const r = await fetchRecs();
      setRecs(r);
      setBootstrapped(true);
    })();
  }, [user, fetchRecs, navigate]);

  const handleRegenerate = async () => {
    setBusy(true);
    try {
      toast.loading("Refreshing your roadmap...", { id: "regen" });
      const fresh = await regen({ data: {} });
      setRecs({ ...recs, ...fresh, generated_at: new Date().toISOString() });
      toast.success("Updated!", { id: "regen" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed", { id: "regen" });
    } finally {
      setBusy(false);
    }
  };

  if (loading || !bootstrapped) {
    return (
      <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
        <SiteHeader />
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const careers = recs?.careers ?? [];
  const colleges = recs?.colleges ?? { dream: [], realistic: [], safe: [] };
  const scholarships = recs?.scholarships ?? [];

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* WELCOME */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              Hi {profile?.name || "there"} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s your personalised roadmap for life after 12th.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/onboarding"
              className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Edit profile
            </Link>
            <Button onClick={handleRegenerate} disabled={busy} variant="default">
              <RefreshCw className={`mr-1.5 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* CAREERS */}
        <Section icon={Briefcase} title="Career Matches" count={careers.length}>
          <div className="grid gap-4 md:grid-cols-2">
            {careers.map((c: any) => (
              <div key={c.career_id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <Badge variant="secondary" className="bg-primary-soft text-accent-foreground">
                    {c.confidence}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-3 rounded-lg bg-primary-soft/60 p-3 text-sm">
                  <span className="font-semibold">Why it fits: </span>
                  {c.why_fit}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Meta label="Salary" value={c.salary_range} />
                  <Meta label="Difficulty" value={c.difficulty} />
                </dl>
                {c.degree_paths?.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Path: </span>
                    {c.degree_paths.join(" · ")}
                  </p>
                )}
                {c.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 5).map((s: string) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* COLLEGES */}
        <Section icon={GraduationCap} title="College Match">
          <div className="grid gap-4 md:grid-cols-3">
            <Bucket label="Dream" tone="primary" items={colleges.dream} />
            <Bucket label="Realistic" tone="success" items={colleges.realistic} />
            <Bucket label="Safe" tone="warning" items={colleges.safe} />
          </div>
        </Section>

        {/* SCHOLARSHIPS */}
        <Section icon={IndianRupee} title="Scholarships you qualify for" count={scholarships.length}>
          <div className="grid gap-4 md:grid-cols-2">
            {scholarships.map((s: any) => (
              <div key={s.scholarship_id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug">{s.name}</h3>
                  <Badge className="shrink-0 bg-success/10 text-success-foreground" variant="secondary">
                    {s.amount}
                  </Badge>
                </div>
                <div className="mt-2 rounded-lg bg-primary-soft/60 p-3 text-sm">
                  <span className="font-semibold">Why you qualify: </span>
                  {s.why_eligible}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{s.eligibility_text}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Deadline: <span className="font-medium text-foreground">{s.deadline || "Rolling"}</span>
                  </span>
                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Apply <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {scholarships.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                No scholarships matched. Try widening your income bracket or marks in your profile.
              </p>
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, count, children }: any) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {count != null && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-muted px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium">{value}</dd>
    </div>
  );
}

function Bucket({ label, tone, items }: { label: string; tone: string; items: any[] }) {
  const toneClass =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "success"
        ? "bg-success text-success-foreground"
        : "bg-warning text-warning-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{items?.length ?? 0}</span>
      </div>
      <ul className="space-y-3">
        {(items ?? []).map((c) => (
          <li key={c.id} className="rounded-lg border border-border/40 bg-background/60 p-3">
            <p className="text-sm font-semibold leading-tight">{c.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {c.city}, {c.state} · {c.type}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fees ₹{(c.fees_min / 1000).toFixed(0)}k–{(c.fees_max / 1000).toFixed(0)}k · Cutoff {c.cutoff_min}%
            </p>
          </li>
        ))}
        {(items ?? []).length === 0 && (
          <li className="text-xs text-muted-foreground">No matches in this bucket.</li>
        )}
      </ul>
    </div>
  );
}
