const axios = require('axios');
const { getEligibilityReference } = require('../data/upscEligibilityCriteria');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL;

function ensureConfig() {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable.');
  }

  if (!AI_MODEL) {
    throw new Error('Missing AI_MODEL environment variable.');
  }
}

async function openRouterChat(messages, temperature = 0.2, max_tokens = 512) {
  ensureConfig();

  try {
    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: AI_MODEL,
        messages,
        temperature,
        max_tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'SkillMatch',
        },
        timeout: 30_000,
      }
    );

    const choices = resp?.data?.choices;
    const content =
      Array.isArray(choices) && choices.length > 0
        ? choices[0]?.message?.content || choices[0]?.message || choices[0]?.text
        : null;

    if (!content) {
      throw new Error('OpenRouter returned an empty response.');
    }

    return content;
  } catch (err) {
    if (err.isAxiosError) {
      const status = err.response?.status;
      const data = err.response?.data;
      throw new Error(
        `OpenRouter request failed${status ? ` (status ${status})` : ''}: ${
          data ? JSON.stringify(data) : err.message
        }`
      );
    }

    throw new Error(`OpenRouter request failed: ${err.message}`);
  }
}

function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') {
    return { parsed: null, error: new SyntaxError('Response is not text.') };
  }

  const originalText = text;
  const trimmed = originalText.trim();

  function tryParse(candidate, depth = 0) {
    if (!candidate || typeof candidate !== 'string') {
      return { parsed: null, error: new SyntaxError('Candidate is not a string.') };
    }

    const candidateText = candidate.trim();
    if (!candidateText) {
      return { parsed: null, error: new SyntaxError('Candidate is empty.') };
    }

    try {
      const parsedValue = JSON.parse(candidateText);

      if (
        typeof parsedValue === 'string' &&
        depth < 2 &&
        parsedValue.trim() &&
        ((parsedValue.trim().startsWith('{') && parsedValue.trim().endsWith('}')) ||
          (parsedValue.trim().startsWith('[') && parsedValue.trim().endsWith(']')))
      ) {
        return tryParse(parsedValue, depth + 1);
      }

      return { parsed: parsedValue, error: null };
    } catch (err) {
      return { parsed: null, error: err };
    }
  }

  function stripOuterFences(value) {
    return value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  const cleanedText = stripOuterFences(trimmed);

  // 1) Try direct parse of the cleaned text
  const directAttempt = tryParse(cleanedText);
  if (directAttempt.parsed !== null && typeof directAttempt.parsed === 'object') {
    return directAttempt;
  }

  let lastError = directAttempt.error;
  const parsedCandidates = [];

  // 2) Extract JSON content from fenced blocks if present
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match;
  while ((match = fenceRegex.exec(originalText)) !== null) {
    const candidateAttempt = tryParse(match[1]);
    if (candidateAttempt.parsed !== null && typeof candidateAttempt.parsed === 'object') {
      return candidateAttempt;
    }
    lastError = candidateAttempt.error || lastError;
  }

  // 3) Search for top-level JSON-like substrings by scanning braces/brackets
  const candidates = [];
  let stack = [];
  let firstOpenPos = -1;

  for (let i = 0; i < originalText.length; i++) {
    const ch = originalText[i];
    if (ch === '{' || ch === '[') {
      stack.push(ch);
      if (stack.length === 1) {
        firstOpenPos = i;
      }
    } else if (ch === '}' || ch === ']') {
      if (stack.length === 0) {
        continue;
      }
      const last = stack[stack.length - 1];
      if ((last === '{' && ch === '}') || (last === '[' && ch === ']')) {
        stack.pop();
        if (stack.length === 0 && firstOpenPos !== -1) {
          candidates.push(originalText.substring(firstOpenPos, i + 1));
          firstOpenPos = -1;
        }
      } else {
        stack = [];
        firstOpenPos = -1;
      }
    }
  }

  for (const candidate of candidates) {
    const candidateAttempt = tryParse(candidate);
    if (candidateAttempt.parsed !== null && typeof candidateAttempt.parsed === 'object') {
      parsedCandidates.push(candidateAttempt.parsed);
    } else {
      lastError = candidateAttempt.error || lastError;
    }
  }

  if (parsedCandidates.length > 0) {
    parsedCandidates.sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length);
    return { parsed: parsedCandidates[0], error: null };
  }

  return { parsed: null, error: lastError || new SyntaxError('Could not extract valid JSON.') };
}

// The competency rubric the AI scores every official against. Pulled directly
// from the four domains named in the problem statement. Exported so other
// modules (e.g. an admin analytics view, or the future Quiz Engine) can
// reference the same taxonomy instead of re-declaring it.
const COMPETENCY_FRAMEWORK = {
  statistical: {
    label: 'Statistical Competencies',
    coreAreas: [
      'Survey Design',
      'Sampling',
      'National Accounts',
      'Price Statistics',
      'Labour Statistics',
      'Agricultural Statistics',
      'Industrial Statistics',
      'SDG Indicators',
      'Metadata Standards',
      'Data Quality Frameworks',
    ],
  },
  technical: {
    label: 'Technical Competencies',
    coreAreas: [
      'Python',
      'R',
      'SQL',
      'Stata',
      'SPSS',
      'SAS',
      'GIS',
      'Data Visualization',
      'AI/ML',
      'Cloud Computing',
      'APIs',
      'Open Data',
    ],
  },
  digitalGovernance: {
    label: 'Digital Governance',
    coreAreas: [
      'Cybersecurity',
      'Data Privacy',
      'Digital Signatures',
      'Government Cloud',
      'Digital Public Infrastructure',
    ],
  },
  behavioural: {
    label: 'Behavioural and Managerial Competencies',
    coreAreas: [
      'Leadership',
      'Communication',
      'Project Management',
      'Ethics',
      'Decision Making',
      'Change Management',
    ],
  },
};

function buildFrameworkReference() {
  return Object.values(COMPETENCY_FRAMEWORK)
    .map((domain) => `- ${domain.label}: ${domain.coreAreas.join(', ')}`)
    .join('\n');
}

/**
 * Scores an official's profile against the competency framework and returns
 * per-domain gaps. Unlike the old resume flow, the input here is already
 * structured (a Supabase `profiles` row), so this only needs a single AI
 * pass — no separate extraction step.
 */
async function assessCompetency(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('A profile object is required for competency assessment.');
  }

  ensureConfig();

  const relevantProfile = {
    designation: profile.designation ?? '',
    previousDesignation: profile.previous_designation ?? '',
    department: profile.department ?? '',
    serviceCadre: profile.service_cadre ?? '',
    groupLevel: profile.group_level ?? '',
    jobRole: profile.job_role ?? '',
    postingLocation: profile.posting_location ?? '',
    education: profile.education ?? '',
    yearsExperience: profile.years_experience ?? 0,
    technicalSkills: profile.technical_skills ?? [],
    leadershipExperience: profile.leadership_experience ?? '',
    digitalGovernanceExperience: profile.digital_governance_experience ?? '',
    pastTrainings: profile.past_trainings ?? '',
  };

  const system =
    'You are a competency assessment assistant for officials in India\'s Official Statistical System. ' +
    'Score the official against the supplied competency framework using their profile data. ' +
    'Be evidence-based: only credit a competency area if the profile actually supports it ' +
    '(job role, self-tagged tools, described experience, past trainings, education, years of experience). ' +
    'Do not assume competencies the profile gives no evidence for. ' +
    'Group level is a rough proxy for expected seniority, not a guarantee of skill — score what the profile shows, not what the grade implies. ' +
    'Return ONLY valid JSON with no markdown, no code fences (```), no explanation text, and no additional characters before or after the JSON.';

  const outputShape = {
    overallReadiness: 0,
    domains: {
      statistical: { score: 0, level: 'Beginner', strengths: ['', ''], gaps: ['', ''] },
      technical: { score: 0, level: 'Beginner', strengths: ['', ''], gaps: ['', ''] },
      digitalGovernance: { score: 0, level: 'Beginner', strengths: ['', ''], gaps: ['', ''] },
      behavioural: { score: 0, level: 'Beginner', strengths: ['', ''], gaps: ['', ''] },
    },
    topPriorityGaps: [
      { domain: '', competency: '', reason: '' },
      { domain: '', competency: '', reason: '' },
      { domain: '', competency: '', reason: '' },
    ],
    summary: '',
  };

  const eligibilityReference = getEligibilityReference(profile.service_cadre);

  const prompt =
    'Competency framework (score the official against these named areas only, per domain):\n' +
    buildFrameworkReference() +
    '\n\nEntry qualification baseline for this official\'s service/cadre (use this to calibrate what should already be assumed vs. what counts as a genuine gap — do not mark something a "gap" if it is below what their cadre\'s entry bar already requires):\n' +
    eligibilityReference +
    '\n\nOfficial\'s profile data:\n' +
    JSON.stringify(relevantProfile, null, 2) +
    '\n\nReturn valid JSON matching exactly this shape:\n' +
    JSON.stringify(outputShape, null, 2) +
    '\nRules:\n' +
    '- Scores are integers 0-100.\n' +
    '- "level" must be one of: Beginner, Intermediate, Advanced.\n' +
    '- Each domain gets exactly 2 strengths and exactly 2 gaps, naming specific coreAreas from that domain.\n' +
    '- If a domain has no supporting evidence at all, still return it with low scores and gaps naming the most foundational missing coreAreas — never omit a domain.\n' +
    '- topPriorityGaps has exactly 3 entries, the most important gaps across all domains combined, ranked by priority.\n' +
    '- "reason" is one short phrase (under 12 words) tying the gap to the official\'s actual role or seniority.\n' +
    '- "summary" is 2-3 plain-language sentences suitable for the official\'s own dashboard — direct, encouraging, specific.\n' +
    'Return ONLY valid JSON. No markdown fences, no explanations, no extra text.';

  try {
    const content = await openRouterChat(
      [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      0.2,
      1800
    );

    console.info('[Competency Assessment] Raw response:', content);

    const { parsed, error } = extractJsonFromText(content);
    if (parsed === null) {
      console.error('[Competency Assessment] Parse failed:', error?.message || 'unknown error');
      console.error('[Competency Assessment] Raw model response:', content);
      throw new Error(
        `Failed to parse OpenRouter competency assessment response. Raw response: ${JSON.stringify(content)}`
      );
    }

    return parsed;
  } catch (err) {
    if (err.isAxiosError) {
      const status = err.response?.status;
      const data = err.response?.data;
      throw new Error(
        `OpenRouter request failed${status ? ` (status ${status})` : ''}: ${
          data ? JSON.stringify(data) : err.message
        }`
      );
    }

    if (err instanceof SyntaxError) {
      throw new Error(`Failed to parse OpenRouter competency assessment response: ${err.message}`);
    }

    throw new Error(`Competency assessment failed: ${err.message}`);
  }
}

async function callAI(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string.');
  }

  ensureConfig();

  try {
    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'SkillMatch',
        },
        timeout: 30_000,
      }
    );

    const choices = resp?.data?.choices;
    const content =
      Array.isArray(choices) && choices.length > 0
        ? choices[0]?.message?.content || choices[0]?.message || choices[0]?.text
        : null;

    if (!content) {
      throw new Error('OpenRouter returned an empty response.');
    }

    return content;
  } catch (err) {
    if (err.isAxiosError) {
      const status = err.response?.status;
      const data = err.response?.data;
      throw new Error(
        `OpenRouter request failed${status ? ` (status ${status})` : ''}: ${
          data ? JSON.stringify(data) : err.message
        }`
      );
    }

    throw new Error(`OpenRouter API call failed: ${err.message}`);
  }
}

module.exports = {
  assessCompetency,
  callAI,
  COMPETENCY_FRAMEWORK,
};
