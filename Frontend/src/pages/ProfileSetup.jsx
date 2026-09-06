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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-medium text-zinc-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
      <form
        className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        onSubmit={handleSubmit}
      >
        <div className="mb-8 border-b border-zinc-200 pb-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-zinc-950">SkillMatch</p>
              <p className="text-xs text-zinc-500">Official profile</p>
            </div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Tell us about your role
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            This profile powers your competency assessment and learning recommendations.
          </p>
        </div>

        {error && (
          <div className="mb-7 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <section>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-zinc-950">Professional details</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Tell us where you currently work and what your role involves.
              </p>
            </div>

            <div className="space-y-5">
              <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                Full name
                <input
                  className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  required
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="searchable-field !gap-2 !text-sm !font-medium !text-zinc-900">
                  Designation
                  <div className="searchable-input-wrap !mt-1.5">
                    <input
                      type="text"
                      className={`searchable-input !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black ${form.designation.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                      placeholder="e.g. Junior Statistical Officer"
                      value={form.designation}
                      onFocus={() => {
                        if (!form.designation.trim()) setShowDesignationSuggestions(true);
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
                        className="dropdown-arrow-button !text-zinc-500"
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
                        className="dropdown-clear-button !text-zinc-500"
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

                <label className="searchable-field !gap-2 !text-sm !font-medium !text-zinc-900">
                  Department
                  <div className="searchable-input-wrap !mt-1.5">
                    <input
                      type="text"
                      className={`searchable-input !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black ${form.department.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                      placeholder="Select or type your Ministry / Department"
                      value={form.department}
                      onFocus={() => {
                        if (!form.department.trim()) setShowDepartmentSuggestions(true);
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
                        className="dropdown-arrow-button !text-zinc-500"
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
                        className="dropdown-clear-button !text-zinc-500"
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

              <div className="grid gap-5 md:grid-cols-2">
                <label className="searchable-field !gap-2 !text-sm !font-medium !text-zinc-900">
                  Service / Cadre
                  <div className="searchable-input-wrap !mt-1.5">
                    <input
                      type="text"
                      className={`searchable-input !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black ${form.service_cadre.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                      placeholder="Select your service"
                      value={form.service_cadre}
                      onFocus={() => {
                        if (!form.service_cadre.trim()) setShowServiceSuggestions(true);
                      }}
                      onBlur={() => window.setTimeout(() => setShowServiceSuggestions(false), 120)}
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
                        className="dropdown-arrow-button !text-zinc-500"
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
                        className="dropdown-clear-button !text-zinc-500"
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
                      <ul className="searchable-dropdown" role="listbox" aria-label="Service / Cadre suggestions">
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
                          <li className="searchable-empty">No matching service</li>
                        )}
                      </ul>
                    )}
                  </div>
                </label>

                <label className="searchable-field !gap-2 !text-sm !font-medium !text-zinc-900">
                  Group
                  <div className="searchable-input-wrap !mt-1.5">
                    <input
                      type="text"
                      className={`searchable-input !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black ${form.group_level.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                      placeholder="Select group"
                      value={form.group_level}
                      onFocus={() => {
                        if (!form.group_level.trim()) setShowGroupSuggestions(true);
                      }}
                      onBlur={() => window.setTimeout(() => setShowGroupSuggestions(false), 120)}
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
                        className="dropdown-arrow-button !text-zinc-500"
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
                        className="dropdown-clear-button !text-zinc-500"
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
                      <ul className="searchable-dropdown" role="listbox" aria-label="Group suggestions">
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
                          <li className="searchable-empty">No matching group</li>
                        )}
                      </ul>
                    )}
                  </div>
                </label>
              </div>

              <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                Current job role / assignment
                <textarea
                  className="!mt-1.5 !min-h-[96px] !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !py-3 !text-sm !leading-6 !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                  placeholder="What does your day-to-day work actually involve right now?"
                  value={form.job_role}
                  onChange={(e) => updateField("job_role", e.target.value)}
                  rows={3}
                  required
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                  Current posting location
                  <input
                    className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                    placeholder="e.g. Field Office, Bengaluru"
                    value={form.posting_location}
                    onChange={(e) => updateField("posting_location", e.target.value)}
                    required
                  />
                </label>

                <label className="searchable-field !gap-2 !text-sm !font-medium !text-zinc-900">
                  Preferred learning language
                  <div className="searchable-input-wrap !mt-1.5">
                    <input
                      type="text"
                      className={`searchable-input !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black ${form.preferred_language.trim() ? "has-clear-icon" : "has-dropdown-icon"}`}
                      placeholder="Select a language"
                      value={form.preferred_language}
                      onFocus={() => {
                        if (!form.preferred_language.trim()) setShowLanguageSuggestions(true);
                      }}
                      onBlur={() => window.setTimeout(() => setShowLanguageSuggestions(false), 120)}
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
                        className="dropdown-arrow-button !text-zinc-500"
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
                        className="dropdown-clear-button !text-zinc-500"
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
                      <ul className="searchable-dropdown" role="listbox" aria-label="Preferred learning language suggestions">
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
                          <li className="searchable-empty">No matching language</li>
                        )}
                      </ul>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="border-t border-zinc-200 pt-8">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-zinc-950">Experience & skills</h2>
              <p className="mt-1 text-sm text-zinc-500">
                These details help SkillMatch identify relevant competency gaps.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                  Educational qualification
                  <input
                    className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                    placeholder="e.g. M.Sc Statistics"
                    value={form.education}
                    onChange={(e) => updateField("education", e.target.value)}
                    required
                  />
                </label>

                <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                  Years of experience
                  <input
                    className="!mt-1.5 !h-11 !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !text-sm !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                    type="number"
                    min="0"
                    value={form.years_experience}
                    onChange={(e) => updateField("years_experience", e.target.value)}
                    required
                  />
                </label>
              </div>

              <fieldset className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                <legend className="px-1 text-sm font-semibold text-zinc-950">
                  Technical tools you currently use <span className="text-zinc-500">*</span>
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {TECHNICAL_SKILLS.map((skill) => (
                    <label
                      key={skill}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white px-3 py-2.5 text-sm font-normal text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                    >
                      <input
                        className="h-4 w-4 rounded border-zinc-300 text-black accent-black focus:ring-black"
                        type="checkbox"
                        checked={form.technical_skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="!gap-2 !text-sm !font-medium !text-zinc-900">
                Trainings completed so far <span className="font-normal text-zinc-500">(optional)</span>
                <textarea
                  className="!mt-1.5 !min-h-[96px] !rounded-lg !border !border-zinc-300 !bg-white !px-3.5 !py-3 !text-sm !leading-6 !text-zinc-950 placeholder:!text-zinc-400 focus:!border-black focus:!ring-1 focus:!ring-black"
                  placeholder="List any courses or training programmes you've already completed"
                  value={form.past_trainings}
                  onChange={(e) => updateField("past_trainings", e.target.value)}
                  rows={3}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500">
              Your profile information is used to personalize your competency assessment.
            </p>
            <button
              className="!m-0 inline-flex h-11 w-full items-center justify-center rounded-lg !bg-black px-6 text-sm font-semibold !text-white shadow-sm transition hover:!bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
