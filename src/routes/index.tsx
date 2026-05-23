import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, GraduationCap, IndianRupee, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Built for Indian Class 11–12 students
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Discover your career, college &amp;{" "}
          <span className="text-primary">scholarship</span> path after 12th.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          AI-powered guidance for students who feel overwhelmed about the future. Tell us
          about you in 5 minutes — get a personalised roadmap.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Get my roadmap <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="rounded-xl px-6 py-3 text-base font-semibold hover:bg-accent"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Free during MVP. No spam, ever.</p>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Career Discovery",
              text: "3–7 careers matched to your stream, interests, and skills — with why-it-fits, salary, and a clear degree path.",
            },
            {
              icon: GraduationCap,
              title: "College Match",
              text: "Dream, Realistic, and Safe college picks based on your marks, budget, and preferred location.",
            },
            {
              icon: IndianRupee,
              title: "Scholarship Match",
              text: "Scholarships you actually qualify for — with the reason explained. 100+ Indian programs.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["1", "Tell us about you", "Stream, marks, interests, budget — 5 minutes."],
            ["2", "AI does the matching", "We analyse your profile against careers, colleges, and scholarships."],
            ["3", "Get your roadmap", "A clean dashboard with everything you need to plan after 12th."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="font-display text-4xl font-bold text-primary">{n}</div>
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        After12 AI · MVP · Built with care for Indian students
      </footer>
    </div>
  );
}
