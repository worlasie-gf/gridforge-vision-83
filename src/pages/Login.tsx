import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import PrivateMeta from "@/components/PrivateMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const next = sanitizeNext(searchParams.get("next"));

  if (user) {
    navigate(next, { replace: true });
  }

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(`Could not sign in with ${provider === "google" ? "Google" : "Apple"}. Please try again.`);
      return;
    }
    if (result.redirected) return;
    navigate(next, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Generic message — do not reveal which part failed.
          setError("Invalid email or password.");
          return;
        }
        navigate(next, { replace: true });
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError("Could not create the account. Please try again.");
          return;
        }
        setMessage("Check your email to confirm your account, then sign in.");
        setMode("sign-in");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      <PrivateMeta title="Sign in — GridForge" />
      <header className="px-6 py-4">
        <Link to="/">
          <img src={logo} alt="GridForge Energy" className="h-16 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#273A59]">
            {mode === "sign-in" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[#5A6B82]">
            {mode === "sign-in"
              ? "Access your GridForge account."
              : "Create an account to connect your utility data."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#273A59]">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#273A59]">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-[#4EB3A6]">{message}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4EB3A6] text-white hover:bg-[#3d9a8e]"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs text-[#8FA1B5]">or</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("google")}
            className="mt-4 w-full border-[#E2E8F0] text-[#273A59] hover:bg-[#F7FAFC]"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("apple")}
            className="mt-3 w-full border-[#E2E8F0] text-[#273A59] hover:bg-[#F7FAFC]"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.5.96 1.39 2.1 2.94 3.6 2.88 1.44-.06 1.99-.93 3.73-.93s2.23.93 3.76.9c1.55-.03 2.54-1.41 3.49-2.8 1.1-1.61 1.55-3.17 1.58-3.25-.04-.02-3.02-1.16-3.04-4.6zM14.16 4.06c.79-.96 1.32-2.29 1.18-3.62-1.14.05-2.52.76-3.33 1.72-.73.85-1.38 2.2-1.2 3.5 1.27.1 2.56-.65 3.35-1.6z" />
            </svg>
            Continue with Apple
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError(null);
              setMessage(null);
            }}
            className="mt-4 w-full text-center text-sm text-[#5A6B82] hover:text-[#273A59]"
          >
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
};

function sanitizeNext(value: string | null): string {
  if (!value) return "/";
  // Same-origin relative paths only.
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default Login;
