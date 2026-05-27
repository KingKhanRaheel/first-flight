import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateRecommendations } from "@/lib/recommendations.functions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

import { INDIA_STATES_UTS as STATES } from "@/lib/india-states";

const emptyForm = {
  name: "",
  class: "12",
  state: "",
  social_category: "General",
  stream: "Science",
  subjects: "",
  marks_percent: "",
  career_interests: "",
  skills: "",
  budget_min: 50000,
  budget_max: 200000,
  preferred_location: "",
  college_type: "Any",
  income_bracket: "<6L",
  gender: "",
  minority_category: "",
  extracurriculars: "",
};

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const regen = useServerFn(generateRecommendations);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setForm({
          name: data.name || user.user_metadata?.name || "",
          class: data.class || "12",
          state: data.state || "",
          social_category: data.social_category || "General",
          stream: data.stream || "Science",
          subjects: (data.subjects || []).join(", "),
          marks_percent: data.marks_percent?.toString() || "",
          career_interests: (data.career_interests || []).join(", "),
          skills: (data.skills || []).join(", "),
          budget_min: data.budget_min ?? 50000,
          budget_max: data.budget_max ?? 200000,
          preferred_location: data.preferred_location || "",
          college_type: data.college_type || "Any",
          income_bracket: data.income_bracket || "<6L",
          gender: data.gender || "",
          minority_category: data.minority_category || "",
          extracurriculars: data.extracurriculars || "",
        });
      }
      setLoaded(true);
    })();
  }, [user]);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent, alsoRegen = false) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: form.name.trim(),
          class: form.class,
          state: form.state,
          social_category: form.social_category,
          stream: form.stream,
          subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
          marks_percent: form.marks_percent ? Number(form.marks_percent) : null,
          career_interests: form.career_interests.split(",").map((s) => s.trim()).filter(Boolean),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          budget_min: Number(form.budget_min),
          budget_max: Number(form.budget_max),
          preferred_location: form.preferred_location,
          college_type: form.college_type,
          income_bracket: form.income_bracket,
          gender: form.gender || null,
          minority_category: form.minority_category || null,
          extracurriculars: form.extracurriculars,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
      if (alsoRegen) await runRegenerate();
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const runRegenerate = async () => {
    setRegenerating(true);
    toast.loading("Regenerating your AI roadmap...", { id: "regen" });
    try {
      await regen({ data: {} });
      toast.success("Your roadmap has been refreshed!", { id: "regen" });
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not regenerate", { id: "regen" });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading || !loaded) {
    return (
      <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
        <SiteHeader />
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold md:text-4xl">Profile settings</h1>
        <p className="mt-1 text-muted-foreground">
          Update your details and refresh your personalised roadmap.
        </p>

        <form
          onSubmit={(e) => handleSave(e, false)}
          className="mt-8 space-y-6"
        >
          {/* Account */}
          <Card title="Account">
            <Field label="Email">
              <Input value={email} disabled />
              <p className="mt-1 text-xs text-muted-foreground">
                Email can&apos;t be changed right now.
              </p>
            </Field>
            <Field label="Your name">
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                required
              />
            </Field>
          </Card>

          {/* About you */}
          <Card title="About you">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Class">
                <Select value={form.class} onValueChange={(v) => update("class", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="State">
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Social category">
              <Select value={form.social_category} onValueChange={(v) => update("social_category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["General","OBC","SC","ST","EWS"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender (optional)">
                <Select
                  value={form.gender || "none"}
                  onValueChange={(v) => update("gender", v === "none" ? "" : v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Prefer not to say</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Minority (optional)">
                <Input
                  value={form.minority_category}
                  onChange={(e) => update("minority_category", e.target.value)}
                  placeholder="e.g. Muslim, Christian"
                />
              </Field>
            </div>
          </Card>

          {/* Academics */}
          <Card title="Academics">
            <Field label="Stream">
              <Select value={form.stream} onValueChange={(v) => update("stream", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Science","Commerce","Humanities"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subjects (comma separated)">
              <Input
                value={form.subjects}
                onChange={(e) => update("subjects", e.target.value)}
                placeholder="Physics, Chemistry, Maths, English"
              />
            </Field>
            <Field label="Latest marks %">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.marks_percent}
                onChange={(e) => update("marks_percent", e.target.value)}
                placeholder="85"
              />
            </Field>
          </Card>

          {/* Interests */}
          <Card title="Interests & skills">
            <Field label="Career interests (comma separated)">
              <Input
                value={form.career_interests}
                onChange={(e) => update("career_interests", e.target.value)}
                placeholder="design, business, AI"
              />
            </Field>
            <Field label="Skills (comma separated)">
              <Input
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="writing, coding, public speaking"
              />
            </Field>
            <Field label="Extracurriculars (optional)">
              <Textarea
                value={form.extracurriculars}
                onChange={(e) => update("extracurriculars", e.target.value)}
                placeholder="Debate club, basketball team..."
                rows={2}
              />
            </Field>
          </Card>

          {/* Preferences */}
          <Card title="Preferences">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget min (₹/year)">
                <Input
                  type="number"
                  value={form.budget_min}
                  onChange={(e) => update("budget_min", e.target.value)}
                />
              </Field>
              <Field label="Budget max (₹/year)">
                <Input
                  type="number"
                  value={form.budget_max}
                  onChange={(e) => update("budget_max", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Preferred location (optional)">
              <Input
                value={form.preferred_location}
                onChange={(e) => update("preferred_location", e.target.value)}
                placeholder="Anywhere in India"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="College type">
                <Select value={form.college_type} onValueChange={(v) => update("college_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Any","Government","Private"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Family income bracket">
                <Select value={form.income_bracket} onValueChange={(v) => update("income_bracket", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["<2L","<2.5L","<3L","<5L","<6L","<8L","<15L",">15L"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="submit" variant="outline" disabled={saving || regenerating}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSave(e as any, true)}
              disabled={saving || regenerating}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              {regenerating
                ? "Generating..."
                : saving
                  ? "Saving..."
                  : "Save & re-run AI"}
            </Button>
          </div>
        </form>

        {/* Re-run only */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Just re-run recommendations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Regenerate using your already-saved profile, without making changes above.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={runRegenerate}
              disabled={regenerating || saving}
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Generating..." : "Re-run recommendations"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
