const { assessCompetency } = require('../services/geminiService');
const { recommendCourses } = require('../services/courseRecommendationService');

/**
 * GET /api/competency/assess
 * Returns the caller's most recently saved assessment, if one exists, without
 * calling the AI again. Used when the dashboard just needs to display
 * whatever was last computed.
 */
async function getLatestAssessment(req, res) {
  const { data, error } = await req.supabase
    .from('competency_assessments')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch competency assessment.', detail: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'No assessment found yet for this user.' });
  }

  return res.status(200).json(data);
}

/**
 * POST /api/competency/assess
 * Fetches the caller's own profile, runs a fresh AI assessment against it,
 * saves the result, and returns it. This is the one that costs an AI call —
 * the frontend should only hit this on an explicit "run my assessment"
 * action, not on every dashboard load.
 */
async function runAssessment(req, res) {
  const { data: profile, error: profileError } = await req.supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: 'Failed to fetch profile.', detail: profileError.message });
  }

  if (!profile) {
    return res.status(400).json({
      error: 'No profile found for this user. Complete profile setup before requesting an assessment.',
    });
  }

  let assessment;
  try {
    assessment = await assessCompetency(profile);
  } catch (err) {
    return res.status(502).json({ error: 'Competency assessment failed.', detail: err.message });
  }

  const recommendedCourses = recommendCourses(assessment.topPriorityGaps, profile);

  const row = {
    user_id: req.user.id,
    overall_readiness: assessment.overallReadiness ?? null,
    domains: assessment.domains ?? {},
    top_priority_gaps: assessment.topPriorityGaps ?? [],
    recommended_courses: recommendedCourses,
    summary: assessment.summary ?? '',
  };

  const { data: saved, error: saveError } = await req.supabase
    .from('competency_assessments')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();

  if (saveError) {
    // The assessment itself succeeded even if saving failed — still return it
    // so the user isn't stuck with nothing, but flag that persistence failed.
    return res.status(207).json({
      warning: 'Assessment generated but could not be saved.',
      detail: saveError.message,
      assessment,
    });
  }

  return res.status(200).json(saved);
}

module.exports = { getLatestAssessment, runAssessment };
