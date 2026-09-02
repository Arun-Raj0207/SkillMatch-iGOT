// Ground-truth entry criteria for the two statistical service cadres this
// platform targets, sourced from actual UPSC (ISS) and SSC (SSS/JSO) exam
// requirements — used in place of Mission Karmayogi's FRAC (Framework for
// Roles, Activities and Competencies), which isn't publicly accessible in a
// usable dataset form. This gives the AI a real, defensible baseline to
// score "expected competency" against, instead of an invented rubric.
//
// Sourced from current UPSC IES/ISS exam notifications and SSC CGL Junior
// Statistical Officer (JSO) eligibility criteria, both under the Ministry of
// Statistics & Programme Implementation (MoSPI). Age limits and application
// details change per notification year and aren't included here — they're
// not relevant to competency scoring, only qualification and subject-matter
// requirements are.

const UPSC_ELIGIBILITY_CRITERIA = {
  'Indian Statistical Service (ISS)': {
    recruitingBody: 'UPSC (combined Indian Economic Service / Indian Statistical Service examination)',
    grade: 'Group A, Gazetted',
    minimumQualification:
      "Bachelor's degree with Statistics, Mathematical Statistics, or Applied Statistics as one of the main subjects, OR a Master's degree in Statistics, Mathematical Statistics, or Applied Statistics, from a recognised Indian or foreign university.",
    expectedBaseline:
      'Strong theoretical grounding in statistics at degree level or above. Entrants are expected to already have core statistical theory (sampling theory, estimation, probability) rather than acquire it on the job — so gaps for ISS officers should focus on applied/technical/governance areas, not basic statistical theory.',
  },
  'Subordinate Statistical Service (SSS)': {
    recruitingBody: 'SSC CGL (Junior Statistical Officer post, cadre-controlled by MoSPI)',
    grade: 'Group B, Non-Gazetted',
    minimumQualification:
      "Bachelor's degree in any subject with at least 60% marks in Mathematics at the 12th standard level, OR a Bachelor's degree in any subject with Statistics as one of the subjects at degree level. Freshers are eligible — no prior work experience required at entry.",
    expectedBaseline:
      'Foundational quantitative ability (either via a strong Math background or a Statistics subject at degree level), not necessarily a full statistics degree. All new recruits undergo a mandatory 4-week induction at NSSTA covering statistical tools and demographic/population analysis before being posted to an NSSO division (Survey Design & Research, Field Operations, Data Processing, or Coordination & Publication). Gaps for SSS officers should assume less pre-existing statistical depth than ISS officers, and weigh induction-stage fundamentals more heavily for newer recruits.',
  },
};

// Cadres that don't have one single, publicly codified national exam
// (state cadres vary by state; "Other" and "Central Secretariat Service"
// aren't statistics-specific). We're honest about not having a sourced
// baseline for these rather than inventing one.
const GENERIC_BASELINE_NOTE =
  'No single publicly codified national eligibility standard applies to this service/cadre. Score based on the specific education, job role, and experience described in the profile, without assuming a particular entry qualification bar.';

/**
 * Returns the eligibility/baseline text relevant to a given service_cadre
 * value (as stored on the `profiles` table), for embedding directly into
 * the competency assessment prompt.
 */
function getEligibilityReference(serviceCadre) {
  const entry = UPSC_ELIGIBILITY_CRITERIA[serviceCadre];

  if (!entry) {
    return GENERIC_BASELINE_NOTE;
  }

  return (
    `Recruiting body: ${entry.recruitingBody}\n` +
    `Grade: ${entry.grade}\n` +
    `Minimum qualification: ${entry.minimumQualification}\n` +
    `Expected baseline: ${entry.expectedBaseline}`
  );
}

module.exports = { UPSC_ELIGIBILITY_CRITERIA, getEligibilityReference };
