import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateRecommendations } from "@/lib/recommendations.functions";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(generateRecommendations);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm((f) => ({
              ...f,
              name: data.name || user.user_metadata?.name || "",
              class: data.class || "12",
              state: data.state || "",
              social_category: data.social_category || "General",
              stream: data.stream || "Science",
              subjects: (data.subjects || []).join(", "),
              marks_percent: data.marks_percent?.toString() || "",
              career_interests: (data.career_interests || []).join(", "),
              skills: (data.skills || []).join(", "),
              budget_min: data.budget_min || 50000,
              budget_max: data.budget_max || 200000,
              preferred_location: data.preferred_location || "",
              college_type: data.college_type || "Any",
              income_bracket: data.income_bracket || "<6L",
              gender: data.gender || "",
              minority_category: data.minority_category || "",
              extracurriculars: data.extracurriculars || "",
            }));
          }
        });
    }
  }, [user]);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: form.name,
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
        completed_onboarding: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      toast.loading("Generating your personalised roadmap...", { id: "gen" });
      await generate({ data: {} });
      toast.success("Your roadmap is ready!", { id: "gen" });
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not save profile", { id: "gen" });
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    {
      title: "About you",
      content: (
        <>
          <Field label="Your name">
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Raheel" />
          </Field>
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
          <Field label="Social category (helps match scholarships)">
            <Select value={form.social_category} onValueChange={(v) => update("social_category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["General","OBC","SC","ST","EWS"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </>
      ),
    },
    {
      title: "Academics",
      content: (
        <>
          <Field label="Stream">
            <Select value={form.stream} onValueChange={(v) => update("stream", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Science","Commerce","Humanities"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Subjects (comma separated)">
            <Input value={form.subjects} onChange={(e) => update("subjects", e.target.value)} placeholder="Physics, Chemistry, Maths, English" />
          </Field>
          <Field label="Latest marks %">
            <Input type="number" min={0} max={100} value={form.marks_percent} onChange={(e) => update("marks_percent", e.target.value)} placeholder="85" />
          </Field>
        </>
      ),
    },
    {
      title: "Interests & skills",
      content: (
        <>
          <Field label="Career interests (comma separated)">
            <Input value={form.career_interests} onChange={(e) => update("career_interests", e.target.value)} placeholder="design, business, AI" />
          </Field>
          <Field label="Skills (comma separated)">
            <Input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="writing, coding, public speaking" />
          </Field>
          <Field label="Extracurriculars (optional)">
            <Textarea value={form.extracurriculars} onChange={(e) => update("extracurriculars", e.target.value)} placeholder="Debate club, basketball team..." rows={2} />
          </Field>
        </>
      ),
    },
    {
      title: "Preferences",
      content: (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget min (₹/year)">
              <Input type="number" value={form.budget_min} onChange={(e) => update("budget_min", e.target.value)} />
            </Field>
            <Field label="Budget max (₹/year)">
              <Input type="number" value={form.budget_max} onChange={(e) => update("budget_max", e.target.value)} />
            </Field>
          </div>
          <Field label="Preferred location (optional)">
            <Input value={form.preferred_location} onChange={(e) => update("preferred_location", e.target.value)} placeholder="Anywhere in India" />
          </Field>
          <Field label="College type">
            <Select value={form.college_type} onValueChange={(v) => update("college_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Any","Government","Private"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Family income bracket">
            <Select value={form.income_bracket} onValueChange={(v) => update("income_bracket", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["<2L","<2.5L","<3L","<5L","<6L","<8L","<15L",">15L"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender (optional)">
              <Select value={form.gender || "none"} onValueChange={(v) => update("gender", v === "none" ? "" : v)}>
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
              <Input value={form.minority_category} onChange={(e) => update("minority_category", e.target.value)} placeholder="e.g. Muslim, Christian" />
            </Field>
          </div>
        </>
      ),
    },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          After12<span className="text-primary">.ai</span>
        </div>

        <div className="mb-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-primary-soft"}`} />
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{steps[step].title}</h2>
          <div className="mt-6 space-y-4">{steps[step].content}</div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || busy}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={busy} size="lg">
                {busy ? "Generating..." : "Get my roadmap"} <Sparkles className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
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
