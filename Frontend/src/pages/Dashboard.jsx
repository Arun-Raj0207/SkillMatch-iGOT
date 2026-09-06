import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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

function DomainCard({ label, data }) {
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const gaps = Array.isArray(data?.gaps) ? data.gaps : [];
  const score = Number(data?.score ?? 0);

  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-gray-950">
              {label}
            </CardTitle>
            <CardDescription className="mt-1 text-gray-500">
              Competency domain
            </CardDescription>
          </div>

          <Badge variant={levelVariant(data?.level)}>
            {data?.level || "Not rated"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-4xl font-bold tracking-tight text-gray-950">
              {score}
            </span>
            <span className="ml-1 text-sm text-gray-400">/ 100</span>
          </div>
        </div>

        <Progress value={score} className="h-2 bg-gray-100" />

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <ListBlock title="Strengths" items={strengths} />
          <ListBlock
            title="Gaps"
            items={gaps}
            emptyText="No gaps identified"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ListBlock({ title, items, emptyText = "None identified" }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="space-y-2.5 text-sm text-gray-700">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-2.5 leading-5"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-8 text-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>

          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Card className="border-gray-200 bg-white">
          <CardContent className="space-y-5 p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
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

        if (active) {
          setAssessment(data);
        }
      } catch (err) {
        if (active) {
          if (err?.status === 404) {
            setAssessment(null);
          } else {
            setError(
              err?.message || "Unable to load your assessment."
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAssessment();

    return () => {
      active = false;
    };
  }, []);

  async function handleRunAssessment() {
    if (running) return;

    setError("");
    setRunning(true);

    try {
      const data = await api.runAssessment();
      setAssessment(data);
    } catch (err) {
      setError(
        err?.message || "The assessment could not be completed."
      );
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const userName = user?.user_metadata?.full_name;

  const gaps = Array.isArray(assessment?.top_priority_gaps)
    ? assessment.top_priority_gaps
    : [];

  const courses = Array.isArray(assessment?.recommended_courses)
    ? assessment.recommended_courses
    : [];

  const overallReadiness = Number(
    assessment?.overall_readiness ?? 0
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-xs font-bold text-white">
                S
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                SkillMatch
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              {userName
                ? `Welcome, ${userName}`
                : "Your competency dashboard"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              AI-powered competency assessment and development insights
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            >
              <Link to="/profile-setup">Edit profile</Link>
            </Button>

            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            >
              Log out
            </Button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-950">Error:</span>{" "}
            {error}
          </div>
        )}

        {/* Empty State */}
        {!assessment ? (
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                <span className="text-sm font-bold">AI</span>
              </div>

              <CardTitle className="text-xl text-gray-950">
                No assessment yet
              </CardTitle>

              <CardDescription className="max-w-2xl text-sm leading-6 text-gray-500">
                Your competency profile has not been assessed yet.
                Run the AI assessment to generate your readiness
                score, priority gaps, and course recommendations.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                size="lg"
                onClick={handleRunAssessment}
                disabled={running}
                className="bg-black text-white hover:bg-gray-800"
              >
                {running
                  ? "Running assessment..."
                  : "Run my assessment"}
              </Button>

              {running && (
                <p className="mt-3 text-sm text-gray-400">
                  The AI assessment can take several seconds. Please
                  keep this page open.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Readiness */}
            <Card className="mb-6 overflow-hidden border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                      Overall readiness
                    </p>

                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-bold tracking-tight text-gray-950">
                        {overallReadiness}
                      </span>

                      <span className="text-lg text-gray-400">
                        /100
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleRunAssessment}
                    disabled={running}
                    className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    {running ? "Reassessing..." : "Run again"}
                  </Button>
                </div>

                <div className="mt-7">
                  <Progress
                    value={overallReadiness}
                    className="h-3 bg-gray-100"
                  />
                </div>

                <div className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  <span>Needs development</span>
                  <span>Strong readiness</span>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {assessment.summary && (
              <Card className="mb-8 border-gray-200 bg-black text-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">
                    Your assessment summary
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="max-w-4xl text-sm leading-7 text-gray-300 sm:text-base">
                    {assessment.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Competency Domains */}
            <section className="mb-8">
              <div className="mb-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                  Assessment
                </p>

                <h2 className="text-xl font-bold tracking-tight text-gray-950">
                  Competency domains
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your current readiness across the four assessment
                  domains.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {domains.map(([name, label]) => (
                  <DomainCard
                    key={name}
                    label={label}
                    data={assessment.domains?.[name]}
                  />
                ))}
              </div>
            </section>

            {/* Lower Section */}
            <section className="grid gap-6 lg:grid-cols-2">

              {/* Priority Gaps */}
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-base font-semibold text-gray-950">
                    Top priority gaps
                  </CardTitle>

                  <CardDescription className="text-gray-500">
                    The areas that should have the biggest impact on
                    your development.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-5">
                  {gaps.length > 0 ? (
                    <div className="space-y-3">
                      {gaps.map((gap, index) => (
                        <div
                          key={`${gap.domain}-${gap.competency}-${index}`}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {gap.domain}
                            </Badge>

                            <span className="text-sm font-semibold text-gray-950">
                              {gap.competency}
                            </span>
                          </div>

                          <p className="text-sm leading-6 text-gray-500">
                            {gap.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No priority gaps were identified.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              {courses.length > 0 ? (
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold text-gray-950">
                      Recommended courses
                    </CardTitle>

                    <CardDescription className="text-gray-500">
                      Learning programmes matched to your current
                      competency gaps.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-5">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-950">
                              {course.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-gray-500">
                              {course.description}
                            </p>
                          </div>

                          <Badge variant="secondary">
                            {course.level}
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {course.durationWeeks} weeks
                            </span>

                            {Array.isArray(course.matchedGaps) &&
                              course.matchedGaps.map((gap) => (
                                <Badge
                                  key={gap}
                                  variant="outline"
                                >
                                  {gap}
                                </Badge>
                              ))}
                          </div>

                          {course.sourceUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                            >
                              <a
                                href={course.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on iGOT
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-950">
                      Recommended courses
                    </CardTitle>

                    <CardDescription className="text-gray-500">
                      Learning programmes matched to your current
                      competency gaps.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5">
                      <p className="text-sm leading-6 text-gray-500">
                        No matching NSSTA programme was found for
                        your current gaps yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
