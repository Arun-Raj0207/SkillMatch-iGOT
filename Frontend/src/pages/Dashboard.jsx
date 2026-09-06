import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";

const domains = [
  ["statistical", "Statistical"],
  ["technical", "Technical"],
  ["digitalGovernance", "Digital Governance"],
  ["behavioural", "Behavioural"],
];

function levelVariant(level) {
  if (level === "Advanced") return "success";
  if (level === "Intermediate") return "warning";
  return "secondary";
}

function DomainCard({ name, label, data }) {
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const gaps = Array.isArray(data?.gaps) ? data.gaps : [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{label}</CardTitle>
            <CardDescription className="mt-1">Competency domain</CardDescription>
          </div>
          <Badge variant={levelVariant(data?.level)}>{data?.level || "Not rated"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex items-end justify-between gap-4">
          <span className="text-3xl font-bold tracking-tight">{Number(data?.score ?? 0)}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <Progress value={Number(data?.score ?? 0)} />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ListBlock title="Strengths" items={strengths} />
          <ListBlock title="Gaps" items={gaps} emptyText="No gaps identified" />
        </div>
      </CardContent>
    </Card>
  );
}

function ListBlock({ title, items, emptyText = "None identified" }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2 leading-5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card><CardContent className="space-y-4 p-6"><Skeleton className="h-10 w-28" /><Skeleton className="h-2 w-full" /></CardContent></Card>
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAssessment() {
      setLoading(true);
      setError("");
      try {
        const data = await api.getLatestAssessment();
        if (active) setAssessment(data);
      } catch (err) {
        if (active) {
          if (err?.status === 404) setAssessment(null);
          else setError(err?.message || "Unable to load your assessment.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAssessment();
    return () => { active = false; };
  }, []);

  async function handleRunAssessment() {
    if (running) return;
    setError("");
    setRunning(true);
    try {
      const data = await api.runAssessment();
      setAssessment(data);
    } catch (err) {
      setError(err?.message || "The assessment could not be completed.");
    } finally {
      setRunning(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  const userName = user?.user_metadata?.full_name;
  const gaps = Array.isArray(assessment?.top_priority_gaps) ? assessment.top_priority_gaps : [];
  const courses = Array.isArray(assessment?.recommended_courses) ? assessment.recommended_courses : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">SkillMatch · Competency assessment</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {userName ? `Welcome, ${userName}` : "Your competency dashboard"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/profile-setup">Edit profile</Link></Button>
            <Button variant="outline" onClick={logout}>Log out</Button>
          </div>
        </header>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        {!assessment ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No assessment yet</CardTitle>
              <CardDescription>Your competency profile has not been assessed yet. Run the AI assessment to generate your readiness score, priority gaps, and course recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={handleRunAssessment} disabled={running}>
                {running ? "Running assessment…" : "Run my assessment"}
              </Button>
              {running && <p className="mt-3 text-sm text-muted-foreground">The AI assessment can take several seconds. Please keep this page open.</p>}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-4">
                <CardDescription>Overall readiness</CardDescription>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <CardTitle className="text-5xl font-bold tracking-tight">{Number(assessment.overall_readiness ?? 0)}<span className="text-2xl text-muted-foreground">/100</span></CardTitle>
                  <Button variant="outline" onClick={handleRunAssessment} disabled={running}>
                    {running ? "Reassessing…" : "Run again"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent><Progress value={Number(assessment.overall_readiness ?? 0)} className="h-3" /></CardContent>
            </Card>

            {assessment.summary && (
              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="text-base">Your assessment summary</CardTitle></CardHeader>
                <CardContent><p className="max-w-4xl text-base leading-7 text-muted-foreground">{assessment.summary}</p></CardContent>
              </Card>
            )}

            <section>
              <div className="mb-4"><h2 className="text-xl font-semibold tracking-tight">Competency domains</h2><p className="text-sm text-muted-foreground">Your current readiness across the four assessment domains.</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                {domains.map(([name, label]) => <DomainCard key={name} name={name} label={label} data={assessment.domains?.[name]} />)}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Top priority gaps</CardTitle><CardDescription>The three areas that should have the biggest impact on your development.</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gaps.map((gap, index) => (
                      <div key={`${gap.domain}-${gap.competency}-${index}`} className="rounded-md border p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline">{gap.domain}</Badge><span className="font-medium">{gap.competency}</span></div>
                        <p className="text-sm leading-6 text-muted-foreground">{gap.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {courses.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Recommended courses</CardTitle><CardDescription>Learning programmes matched to your current gaps.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="rounded-md border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{course.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{course.description}</p></div><Badge variant="secondary">{course.level}</Badge></div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{course.durationWeeks} weeks</span>{Array.isArray(course.matchedGaps) && course.matchedGaps.map((gap) => <Badge key={gap} variant="outline">{gap}</Badge>)}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>

            {courses.length === 0 && <p className="rounded-md border border-dashed px-4 py-4 text-sm text-muted-foreground">No matching NSSTA programme was found for your current gaps yet.</p>}
          </>
        )}
      </main>
    </div>
  );
}
