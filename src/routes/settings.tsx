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
import { Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const regen = useServerFn(generateRecommendations);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialName, setInitialName] = useState("");
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
        .select("name")
        .eq("id", user.id)
        .single();
      const n = data?.name ?? user.user_metadata?.name ?? "";
      setName(n);
      setInitialName(n);
      setLoaded(true);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      setInitialName(name.trim());
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
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

  const dirty = name.trim() !== initialName.trim();

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

        {/* Edit name */}
        <form
          onSubmit={handleSave}
          className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8"
        >
          <h2 className="text-xl font-semibold">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is how we&apos;ll greet you across the app.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                Email can&apos;t be changed right now.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={!dirty || saving || !name.trim()}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>

        {/* Re-run AI */}
        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Re-run AI recommendations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate a fresh set of career matches, college buckets and scholarships
                based on your current profile. To update the underlying inputs
                (marks, stream, interests), use{" "}
                <Link to="/onboarding" className="text-primary hover:underline">
                  edit profile
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleRegenerate} disabled={regenerating}>
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
              />
              {regenerating ? "Generating..." : "Re-run recommendations"}
            </Button>
            <Link
              to="/onboarding"
              className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Edit profile inputs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
