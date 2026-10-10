import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { isAdminAccount, login, register } from "../api/auth.js";
import LocalStorageService from "../admin/services/localStorageService.js";

export default function Auth({ adminMode = false }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = mode === "signup"
        ? await register({ name: name.trim(), email: email.trim(), password })
        : await login({ email: email.trim(), password });
      const payload = result.data?.data;

      if (result.status >= 400 || !result.data?.success || !payload?.accessToken) {
        setError(result.message || result.data?.message || "Please check your details and try again.");
        return;
      }

      LocalStorageService.setAuthData(payload);

      if (adminMode) {
        if (!isAdminAccount(payload.user)) {
          LocalStorageService.clearAuthData();
          setError("This account does not have administrator access.");
          return;
        }
        navigate("/admin", { replace: true });
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo.startsWith("/") ? redirectTo : "/", { replace: true });
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSignup = mode === "signup" && !adminMode;

  return (
    <>
      <Seo title={adminMode ? "Admin sign in" : isSignup ? "Create account" : "Login"} description="Sign in or create your Velvet Spice account." />
      <section className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
        <div className="hidden overflow-hidden rounded-3xl luxury-shadow lg:block">
          <img src="https://images.unsplash.com/photo-1506629905607-d9f297d00127?auto=format&fit=crop&w=1200&q=85" alt="Jewellery styling" className="h-[680px] w-full object-cover" />
        </div>
        <div className="rounded-3xl bg-white/60 p-6 shadow-2xl backdrop-blur dark:bg-white/5 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D4A373]">{adminMode ? "Administrator access" : "Members lounge"}</p>
          <h1 className="mt-3 font-display text-5xl">{isSignup ? "Create account" : adminMode ? "Admin sign in" : "Welcome back"}</h1>
          <p className="mt-3 opacity-70">{adminMode ? "Sign in with an administrator account." : isSignup ? "Join Velvet Spice for a more personal shopping experience." : "Sign in to continue to your account."}</p>

          <form onSubmit={submit} className="mt-7 grid gap-4">
            {isSignup && <Input label="Full name" value={name} onChange={setName} autoComplete="name" required />}
            <Input label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} required />
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            <button disabled={submitting} className="rounded-full rose-gradient px-6 py-3 font-bold text-[#1A1A1A] disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          {!adminMode ? (
            <p className="mt-6 text-center text-sm">
              {isSignup ? "Already have an account? " : "New to Velvet Spice? "}
              <button className="font-bold text-[#A66C46]" onClick={() => { setError(""); setMode(isSignup ? "login" : "signup"); }}>
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </p>
          ) : (
            <p className="mt-6 text-center text-sm"><Link className="font-semibold text-[#A66C46]" to="/">Back to shop</Link></p>
          )}
        </div>
      </section>
    </>
  );
}

function Input({ label, type = "text", value, onChange, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-[#D4A373]/20 bg-white/80 px-4 py-3 outline-none focus:border-[#D4A373] dark:bg-white/10" {...props} />
    </label>
  );
}
