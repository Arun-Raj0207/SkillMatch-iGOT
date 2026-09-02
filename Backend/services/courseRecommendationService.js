const { NSSTA_COURSE_CATALOG } = require('../data/nsstaCourseCatalog');

/**
 * Matches a list of competency gaps against the mocked NSSTA catalog by tag
 * overlap and cadre relevance. Deliberately not AI-driven — this is plain
 * matching logic, which is faster, free, and fully predictable. Swap
 * NSSTA_COURSE_CATALOG for a real iGOT/NSSTA feed later without touching
 * this function's signature or callers.
 *
 * @param {Array<{domain: string, competency: string}>} gaps - e.g. assessment.topPriorityGaps
 * @param {{ service_cadre?: string }} profile
 * @returns {Array} ranked course matches, each with a matchReason
 */
function recommendCourses(gaps, profile = {}) {
  if (!Array.isArray(gaps) || gaps.length === 0) {
    return [];
  }

  const cadre = profile.service_cadre || '';

  const scored = NSSTA_COURSE_CATALOG.map((course) => {
    let score = 0;
    const matchedGaps = [];

    for (const gap of gaps) {
      const competencyName = (gap.competency || '').toLowerCase();
      const domainMatches = gap.domain === course.domain;
      const tagMatches = course.tags.some((tag) => tag.toLowerCase() === competencyName);

      if (tagMatches) {
        score += 3;
        matchedGaps.push(gap.competency);
      } else if (domainMatches) {
        score += 1;
      }
    }

    if (course.targetCadre === cadre) {
      score += 1;
    } else if (course.targetCadre === 'Both') {
      score += 0.5;
    }

    return { course, score, matchedGaps };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ course, matchedGaps }) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      durationWeeks: course.durationWeeks,
      matchedGaps,
    }));
}

module.exports = { recommendCourses };
