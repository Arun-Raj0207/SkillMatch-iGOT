import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { DEPARTMENTS, DESIGNATIONS } from "../data/departments";

const SERVICE_CADRES = [
  "Indian Statistical Service (ISS)",
  "Subordinate Statistical Service (SSS)",
  "State Statistical Service",
  "Central Secretariat Service",
  "Other",
];

const GROUP_LEVELS = ["Group A", "Group B", "Group C"];

const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Gujarati",
  "Malayalam",
  "Odia",
  "Punjabi",
];

// Mirrors the "Technical Competencies" domain from the problem statement,
// so self-tagged tools map directly onto the AI competency framework.
const TECHNICAL_SKILLS = [
  "Python",
  "R",
  "SQL",
  "Stata",
  "SPSS",
  "SAS",
  "GIS",
  "Data Visualization",
  "AI / ML",
  "Cloud Computing",
  "Microsoft Excel",
  "Power BI",
  "Tableau",
  "Jupyter Notebook",
  "Pandas",
  "NumPy",
  "Matlab",
  "EViews",
  "Minitab",
  "QGIS",
  "ArcGIS",
  "MySQL",
  "PostgreSQL",
  "Oracle",
  "MongoDB",
  "Microsoft Access",
  "Google Sheets",
  "Git / GitHub",
  "Linux",
  "Docker",
];

const initialForm = {
  full_name: "",
  designation: "",
  department: "",
  job_role: "",
  service_cadre: "",
  group_level: "",
  posting_location: "",
  preferred_language: "",
  technical_skills: [],
  education: "",
  years_experience: "",
  past_trainings: "",
};

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);

  const departmentSuggestions = useMemo(() => {
    const query = form.department.trim().toLowerCase();

    if (!query) {
      return DEPARTMENTS.slice(0, 10);
    }

    return DEPARTMENTS.filter((dept) => dept.toLowerCase().includes(query)).slice(0, 12);
  }, [form.department]);

  const designationSuggestions = useMemo(() => {
    const query = form.designation.trim().toLowerCase();

    if (!query) {
      return DESIGNATIONS.slice(0, 10);
    }

    return DESIGNATIONS.filter((designation) =>
      designation.toLowerCase().includes(query)
    ).slice(0, 12);
  }, [form.designation]);

  const serviceSuggestions = useMemo(() => {
    const query = form.service_cadre.trim().toLowerCase();

    if (!query) {
      return SERVICE_CADRES;
    }

    return SERVICE_CADRES.filter((service) =>
      service.toLowerCase().includes(query)
    );
  }, [form.service_cadre]);

  const groupSuggestions = useMemo(() => {
    const query = form.group_level.trim().toLowerCase();

    if (!query) {
      return GROUP_LEVELS;
    }

    return GROUP_LEVELS.filter((group) =>
      group.toLowerCase().includes(query)
    );
  }, [form.group_level]);

  const languageSuggestions = useMemo(() => {
    const query = form.preferred_language.trim().toLowerCase();

    if (!query) {
      return LANGUAGES;
    }

    return LANGUAGES.filter((language) =>
      language.toLowerCase().includes(query)
    );
  }, [form.preferred_language]);

  // Pre-fill the form if the official already has a profile (edit mode)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadExisting() {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setForm({
          full_name: data.full_name ?? "",
          designation: data.designation ?? "",
          department: data.department ?? "",
          job_role: data.job_role ?? "",
          service_cadre: data.service_cadre ?? "",
          group_level: data.group_level ?? "",
          posting_location: data.posting_location ?? "",
          preferred_language: data.preferred_language ?? "",
          technical_skills: data.technical_skills ?? [],
          education: data.education ?? "",
          years_experience: String(data.years_experience ?? ""),
          past_trainings: data.past_trainings ?? "",
        });
      }
      setLoading(false);
    }
    loadExisting();
  }, [user?.id]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDepartmentSelect(value) {
    updateField("department", value);
    setShowDepartmentSuggestions(false);
  }

  function handleDesignationSelect(value) {
    updateField("designation", value);
    setShowDesignationSuggestions(false);
  }

  function toggleSkill(skill) {
    setForm((prev) => {
      const has = prev.technical_skills.includes(skill);
      return {
        ...prev,
        technical_skills: has
          ? prev.technical_skills.filter((s) => s !== skill)
          : [...prev.technical_skills, skill],
      };
    });
  }

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (form.technical_skills.length === 0) {
    setError("Please select at least one technical tool you currently use.");
    return;
  }

  setSaving(true);

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: form.full_name,
    designation: form.designation,
    department: form.department,
    job_role: form.job_role,
    service_cadre: form.service_cadre,
    group_level: form.group_level,
    posting_location: form.posting_location,
    preferred_language: form.preferred_language,
    technical_skills: form.technical_skills,
    education: form.education,
    years_experience: Number(form.years_experience) || 0,
    past_trainings: form.past_trainings,
    profile_completed: true,
  });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    // This is the handoff point: once saved, the Competency Assessment
    // module reads this row to build the official's current-skill profile.
    navigate("/dashboard");
  }

  if (loading) return <div className="page-center">Loading your profile...</div>;

  return (
    <div className="form-page">
      <form className="profile-card" onSubmit={handleSubmit}>
        <h1>Tell us about your role</h1>
        <p className="auth-subtitle">
          This replaces a resume upload — it's what the skill-gap assessment runs against.
        </p>

        {error && <div className="form-error">{error}</div>}

        <label>
          Full name
          <input
            value={form.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            required
          />
        </label>

        <div className="form-row">
          <label className="searchable-field">
            Designation
            <div className="searchable-input-wrap">
              <input
                type="text"
                className={`searchable-input ${form.designation.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                placeholder="e.g. Junior Statistical Officer"
                value={form.designation}
                onFocus={() => {
                  if (!form.designation.trim()) {
                    setShowDesignationSuggestions(true);
                  }
                }}
                onBlur={() => window.setTimeout(() => setShowDesignationSuggestions(false), 120)}
                onChange={(e) => {
                  updateField("designation", e.target.value);
                  setShowDesignationSuggestions(!e.target.value.trim());
                }}
                required
                autoComplete="off"
              />

              {!form.designation.trim() && (
                <button
                  type="button"
                  className="dropdown-arrow-button"
                  aria-label="Show designation suggestions"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowDesignationSuggestions(true)}
                >
                  ▾
                </button>
              )}

              {form.designation.trim() && (
                <button
                  type="button"
                  className="dropdown-clear-button"
                  aria-label="Clear designation"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateField("designation", "");
                    setShowDesignationSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}

              {showDesignationSuggestions && !form.designation.trim() && (
                <ul className="searchable-dropdown" role="listbox" aria-label="Designation suggestions">
                  {designationSuggestions.length > 0 ? (
                    designationSuggestions.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="searchable-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDesignationSelect(item)}
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="searchable-empty">No matching designation</li>
                  )}
                </ul>
              )}
            </div>
          </label>

          <label className="searchable-field">
            Department
            <div className="searchable-input-wrap">
              <input
                type="text"
                className={`searchable-input ${form.department.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                placeholder="Select or type your Ministry / Department"
                value={form.department}
                onFocus={() => {
                  if (!form.department.trim()) {
                    setShowDepartmentSuggestions(true);
                  }
                }}
                onBlur={() => window.setTimeout(() => setShowDepartmentSuggestions(false), 120)}
                onChange={(e) => {
                  updateField("department", e.target.value);
                  setShowDepartmentSuggestions(!e.target.value.trim());
                }}
                required
                autoComplete="off"
              />

              {!form.department.trim() && (
                <button
                  type="button"
                  className="dropdown-arrow-button"
                  aria-label="Show department suggestions"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowDepartmentSuggestions(true)}
                >
                  ▾
                </button>
              )}

              {form.department.trim() && (
                <button
                  type="button"
                  className="dropdown-clear-button"
                  aria-label="Clear department"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateField("department", "");
                    setShowDepartmentSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}

              {showDepartmentSuggestions && !form.department.trim() && (
                <ul className="searchable-dropdown" role="listbox" aria-label="Department suggestions">
                  {departmentSuggestions.length > 0 ? (
                    departmentSuggestions.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="searchable-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDepartmentSelect(item)}
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="searchable-empty">No matching department</li>
                  )}
                </ul>
              )}
            </div>
          </label>
        </div>

        <div className="form-row">
          <label className="searchable-field">
            Service / Cadre
            <div className="searchable-input-wrap">
              <input
                type="text"
                className={`searchable-input ${form.service_cadre.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                placeholder="Select your service"
                value={form.service_cadre}
                onFocus={() => {
                  if (!form.service_cadre.trim()) {
                    setShowServiceSuggestions(true);
                  }
                }}
                onBlur={() =>
                  window.setTimeout(
                    () => setShowServiceSuggestions(false),
                    120
                  )
                }
                onChange={(e) => {
                  updateField("service_cadre", e.target.value);
                  setShowServiceSuggestions(!e.target.value.trim());
                }}
                required
                autoComplete="off"
              />

              {!form.service_cadre.trim() && (
                <button
                  type="button"
                  className="dropdown-arrow-button"
                  aria-label="Show service suggestions"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowServiceSuggestions(true)}
                >
                  ▾
                </button>
              )}

              {form.service_cadre.trim() && (
                <button
                  type="button"
                  className="dropdown-clear-button"
                  aria-label="Clear service"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateField("service_cadre", "");
                    setShowServiceSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}

              {showServiceSuggestions && !form.service_cadre.trim() && (
                <ul
                  className="searchable-dropdown"
                  role="listbox"
                  aria-label="Service / Cadre suggestions"
                >
                  {serviceSuggestions.length > 0 ? (
                    serviceSuggestions.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="searchable-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            updateField("service_cadre", item);
                            setShowServiceSuggestions(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="searchable-empty">
                      No matching service
                    </li>
                  )}
                </ul>
              )}
            </div>
          </label>

          <label className="searchable-field">
            Group
            <div className="searchable-input-wrap">
              <input
                type="text"
                className={`searchable-input ${form.group_level.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                placeholder="Select group"
                value={form.group_level}
                onFocus={() => {
                  if (!form.group_level.trim()) {
                    setShowGroupSuggestions(true);
                  }
                }}
                onBlur={() =>
                  window.setTimeout(
                    () => setShowGroupSuggestions(false),
                    120
                  )
                }
                onChange={(e) => {
                  updateField("group_level", e.target.value);
                  setShowGroupSuggestions(!e.target.value.trim());
                }}
                required
                autoComplete="off"
              />

              {!form.group_level.trim() && (
                <button
                  type="button"
                  className="dropdown-arrow-button"
                  aria-label="Show group suggestions"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowGroupSuggestions(true)}
                >
                  ▾
                </button>
              )}

              {form.group_level.trim() && (
                <button
                  type="button"
                  className="dropdown-clear-button"
                  aria-label="Clear group"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateField("group_level", "");
                    setShowGroupSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}

              {showGroupSuggestions && !form.group_level.trim() && (
                <ul
                  className="searchable-dropdown"
                  role="listbox"
                  aria-label="Group suggestions"
                >
                  {groupSuggestions.length > 0 ? (
                    groupSuggestions.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="searchable-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            updateField("group_level", item);
                            setShowGroupSuggestions(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="searchable-empty">
                      No matching group
                    </li>
                  )}
                </ul>
              )}
            </div>
          </label>
        </div>

        <label>
          Current job role / assignment
          <textarea
            placeholder="What does your day-to-day work actually involve right now?"
            value={form.job_role}
            onChange={(e) => updateField("job_role", e.target.value)}
            rows={3}
            required
          />
        </label>

        <div className="form-row">
          <label>
            Current posting location
            <input
              placeholder="e.g. Field Office, Bengaluru"
              value={form.posting_location}
              onChange={(e) => updateField("posting_location", e.target.value)}
              required
            />
          </label>

          <label className="searchable-field">
            Preferred learning language
            <div className="searchable-input-wrap">
              <input
                type="text"
                className={`searchable-input ${form.preferred_language.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                placeholder="Select a language"
                value={form.preferred_language}
                onFocus={() => {
                  if (!form.preferred_language.trim()) {
                    setShowLanguageSuggestions(true);
                  }
                }}
                onBlur={() =>
                  window.setTimeout(
                    () => setShowLanguageSuggestions(false),
                    120
                  )
                }
                onChange={(e) => {
                  updateField("preferred_language", e.target.value);
                  setShowLanguageSuggestions(!e.target.value.trim());
                }}
                required
                autoComplete="off"
              />

              {!form.preferred_language.trim() && (
                <button
                  type="button"
                  className="dropdown-arrow-button"
                  aria-label="Show language suggestions"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowLanguageSuggestions(true)}
                >
                  ▾
                </button>
              )}

              {form.preferred_language.trim() && (
                <button
                  type="button"
                  className="dropdown-clear-button"
                  aria-label="Clear language"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateField("preferred_language", "");
                    setShowLanguageSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}

              {showLanguageSuggestions && !form.preferred_language.trim() && (
                <ul
                  className="searchable-dropdown"
                  role="listbox"
                  aria-label="Preferred learning language suggestions"
                >
                  {languageSuggestions.length > 0 ? (
                    languageSuggestions.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="searchable-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            updateField("preferred_language", item);
                            setShowLanguageSuggestions(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="searchable-empty">
                      No matching language
                    </li>
                  )}
                </ul>
              )}
            </div>
          </label>
        </div>

        <div className="form-row">
          <label>
            Educational qualification
            <input
              placeholder="e.g. M.Sc Statistics"
              value={form.education}
              onChange={(e) => updateField("education", e.target.value)}
              required
            />
          </label>

          <label>
            Years of experience
            <input
              type="number"
              min="0"
              value={form.years_experience}
              onChange={(e) => updateField("years_experience", e.target.value)}
              required
            />
          </label>
        </div>

        <fieldset className="skills-fieldset">
          <legend>
  Technical tools you currently use <span className="required-mark">*</span>
</legend>
          <div className="checkbox-grid">
            {TECHNICAL_SKILLS.map((skill) => (
              <label key={skill} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.technical_skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                {skill}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Trainings completed so far (optional)
          <textarea
            placeholder="List any courses or training programmes you've already completed"
            value={form.past_trainings}
            onChange={(e) => updateField("past_trainings", e.target.value)}
            rows={3}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save and continue"}
        </button>
      </form>
    </div>
  );
}
