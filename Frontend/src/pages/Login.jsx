import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden flex-col justify-between bg-black p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">S</div><div className="text-lg font-semibold tracking-tight">SkillMatch</div></div>
            <p className="mt-12 max-w-md text-4xl font-semibold leading-[1.08] tracking-tight">Competency intelligence for India's Official Statistical System.</p>
          </div>
          <p className="text-sm text-zinc-400">AI-enabled assessment · Skill-gap analysis · Learning recommendations</p>
        </div>

        <form className="space-y-7 p-6 sm:p-10 lg:p-12" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm text-muted-foreground lg:hidden">SkillMatch</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to view your competency assessment.</p>
          </div>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="space-y-5">
            <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
              Email
              <input className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 focus:!border-black focus:!ring-1 focus:!ring-black" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
              Password
              <input className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 focus:!border-black focus:!ring-1 focus:!ring-black" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          </div>

          <Button className="!mt-4 h-11 w-full !rounded-lg !bg-black !text-white hover:!bg-zinc-800" size="lg" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here? <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
