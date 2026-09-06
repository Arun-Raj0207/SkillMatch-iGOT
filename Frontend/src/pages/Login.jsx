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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border bg-background shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <div className="text-lg font-semibold tracking-tight">SkillMatch</div>
            <p className="mt-10 max-w-sm text-3xl font-semibold leading-tight">Competency intelligence for India's Official Statistical System.</p>
          </div>
          <p className="text-sm text-primary-foreground/70">AI-enabled assessment · Skill-gap analysis · Learning recommendations</p>
        </div>

        <form className="space-y-6 p-6 sm:p-10" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm text-muted-foreground lg:hidden">SkillMatch</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to view your competency assessment.</p>
          </div>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="space-y-5">
            <label className="!gap-2 !text-sm !font-medium !text-foreground">
              Email
              <input className="!rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm focus:!border-ring" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="!gap-2 !text-sm !font-medium !text-foreground">
              Password
              <input className="!rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm focus:!border-ring" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          </div>

          <Button className="!mt-0 w-full" size="lg" type="submit" disabled={submitting}>
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
