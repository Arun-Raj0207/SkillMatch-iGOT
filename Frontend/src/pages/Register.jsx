import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const authData = await register({ email, password, fullName });
      if (!authData?.session && !authData?.user) throw new Error("Registration did not complete successfully.");
      navigate("/profile-setup");
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
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
            <p className="mt-10 max-w-sm text-3xl font-semibold leading-tight">Build a clearer picture of the skills that power official statistics.</p>
          </div>
          <p className="text-sm text-primary-foreground/70">Complete your profile once. Let the assessment map the next steps.</p>
        </div>

        <form className="space-y-6 p-6 sm:p-10" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm text-muted-foreground lg:hidden">SkillMatch</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">For officials completing skill and training assessments.</p>
          </div>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="space-y-5">
            <label className="!gap-2 !text-sm !font-medium !text-foreground">Full name<input className="!rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
            <label className="!gap-2 !text-sm !font-medium !text-foreground">Email<input className="!rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="!gap-2 !text-sm !font-medium !text-foreground">Password<input className="!rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>
          </div>

          <Button className="!mt-0 w-full" size="lg" type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</Button>

          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
