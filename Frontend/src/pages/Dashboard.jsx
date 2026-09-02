import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// Placeholder for now — this becomes the real Competency Assessment
// dashboard in the next build step. For now it just confirms the
// profile pipeline (register -> profile setup -> saved row) works.
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) return <div className="page-center">Loading...</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      {!profile?.profile_completed ? (
        <p>
          Your profile isn't complete yet. <Link to="/profile-setup">Finish it here</Link>.
        </p>
      ) : (
        <div className="profile-summary">
          <p><strong>Designation:</strong> {profile.designation}</p>
          <p><strong>Department:</strong> {profile.department}</p>
          <p><strong>Job role:</strong> {profile.job_role}</p>
          <p><strong>Education:</strong> {profile.education}</p>
          <p><strong>Experience:</strong> {profile.years_experience} years</p>
          <Link to="/profile-setup">Edit profile</Link>
        </div>
      )}

      <p className="dashboard-note">
        Competency scoring and skill-gap results will appear here once the assessment module is built.
      </p>
    </div>
  );
}
