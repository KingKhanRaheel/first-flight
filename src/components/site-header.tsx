import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          After12<span className="text-gradient-brand">.ai</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Settings
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-xl bg-gradient-brand px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 hover:-translate-y-0.5"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
