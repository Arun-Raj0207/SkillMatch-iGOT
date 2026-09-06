import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

const widgets = [
  {
    title: "Org-wide average readiness",
    description: "TODO: Connect to an aggregate readiness endpoint once the admin backend is available.",
  },
  {
    title: "Competency distribution across officials",
    description: "TODO: Add aggregate domain/level distribution data from the admin backend.",
  },
  {
    title: "Most common gaps",
    description: "TODO: Add ranked competency-gap aggregation from the admin backend.",
  },
  {
    title: "Course uptake",
    description: "TODO: Add NSSTA programme enrolment/uptake data from the admin backend.",
  },
];

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">SkillMatch · Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Admin dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Structural scaffold only. Aggregate backend data is not wired yet.</p>
          </div>
          <Button variant="outline" onClick={logout}>Log out</Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {widgets.map((widget) => (
            <Card key={widget.title} className="min-h-48">
              <CardHeader>
                <CardTitle className="text-base">{widget.title}</CardTitle>
                <CardDescription>TODO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  {widget.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
