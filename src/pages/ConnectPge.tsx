import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PrivateMeta from "@/components/PrivateMeta";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import logo from "@/assets/logo.png";

/**
 * PG&E Share My Data entry point (Third Party Portal / Scope Selection URL).
 *
 * The route is publicly reachable so a PG&E-initiated authorization can land
 * here, but it renders only explanatory copy. No connection status, account
 * details, authorization records, or usage data are rendered or fetched before
 * the visitor is authenticated. It stays out of public navigation, out of the
 * sitemap, and carries noindex, nofollow.
 */
const ConnectPge = () => {
  const { user, loading, signOut } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("utility-authorize-start");
      if (fnError || !data?.url) {
        setError(data?.error ?? "PG&E connection is not available yet. Please check back soon.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const signInHref = `/login?next=${encodeURIComponent("/connect/pge")}`;

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      <PrivateMeta title="Connect your PG&E account — GridForge" />
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="GridForge Energy" className="h-16 w-auto" />
        </Link>
        {user && (
          <button
            onClick={() => signOut()}
            className="text-sm text-[#5A6B82] hover:text-[#273A59]"
          >
            Sign out
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-10 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4EB3A6]/10">
            <Zap className="h-6 w-6 text-[#4EB3A6]" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[#273A59]">
            Connect your PG&amp;E account to GridForge
          </h1>
          <p className="mt-3 text-[#5A6B82] leading-relaxed">
            GridForge uses PG&amp;E's Share My Data program to receive the electricity data
            you choose to share. You'll be sent to PG&amp;E to review and approve exactly
            what is shared, and you can revoke that authorization at any time — either
            with PG&amp;E or here.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#F7FAFC] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#7DD3A5]" />
            <p className="text-sm text-[#5A6B82]">
              GridForge never sees your PG&amp;E password. Authorization happens entirely on
              PG&amp;E's website, and your data is only ever handled server-side.
            </p>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {loading ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#5A6B82]" />
            </div>
          ) : user ? (
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="mt-8 w-full bg-[#4EB3A6] text-white hover:bg-[#3d9a8e]"
            >
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect PG&amp;E Account
            </Button>
          ) : (
            <>
              <Button asChild className="mt-8 w-full bg-[#4EB3A6] text-white hover:bg-[#3d9a8e]">
                <a href={signInHref}>Sign in to continue</a>
              </Button>
              <p className="mt-3 text-center text-sm text-[#8FA1B5]">
                You'll come straight back here after signing in.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConnectPge;
