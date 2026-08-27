import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PrivateMeta from "@/components/PrivateMeta";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import logo from "@/assets/logo.png";

type Status = "processing" | "success" | "error";

/**
 * OAuth callback. The authorization code and state are passed to the backend
 * exactly once and never stored anywhere in the browser.
 */
const PgeCallback = () => {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState<string>("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const providerError = params.get("error");

    // Remove the code from the address bar immediately.
    window.history.replaceState({}, document.title, window.location.pathname);

    if (providerError) {
      setStatus("error");
      setMessage("The authorization was not completed.");
      return;
    }
    if (!code || !state) {
      setStatus("error");
      setMessage("The authorization response was incomplete.");
      return;
    }

    supabase.functions
      .invoke("utility-oauth-callback", { body: { code, state } })
      .then(({ data, error }) => {
        if (error || !data?.ok) {
          setStatus("error");
          setMessage(data?.error ?? "Something went wrong. Please try again.");
        } else {
          setStatus("success");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      <PrivateMeta title="Connecting your utility — GridForge" />
      <header className="px-6 py-4">
        <Link to="/">
          <img src={logo} alt="GridForge Energy" className="h-16 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center shadow-sm">
          {status === "processing" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#4EB3A6]" />
              <h1 className="mt-6 text-xl font-semibold text-[#273A59]">Finishing the connection…</h1>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#4EB3A6]" />
              <h1 className="mt-6 text-xl font-semibold text-[#273A59]">You're connected</h1>
              <p className="mt-2 text-sm text-[#5A6B82]">
                Your PG&amp;E authorization is complete. GridForge will begin verifying your data.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-10 w-10 text-red-500" />
              <h1 className="mt-6 text-xl font-semibold text-[#273A59]">Connection failed</h1>
              <p className="mt-2 text-sm text-[#5A6B82]">{message}</p>
              <Button asChild className="mt-6 bg-[#4EB3A6] text-white hover:bg-[#3d9a8e]">
                <Link to="/connect/pge">Try again</Link>
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PgeCallback;
