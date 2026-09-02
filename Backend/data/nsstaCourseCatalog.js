// Stand-in for a live NSSTA/iGOT course feed, which isn't accessible for
// this build. Every title here is a real, publicly announced NSSTA
// programme (from NSSTA's official announcements and MoSPI training
// calendars) — this is a static mock of real programme names, not
// fabricated course titles. Swap this file for a real API client later
// without touching anything that calls recommendCourses().

const NSSTA_COURSE_CATALOG = [
  {
    id: 'nssta-induction-sss',
    title: 'Induction Training Programme for SSS Officers',
    description:
      'Mandatory 4-week foundational training for new Subordinate Statistical Service recruits, covering statistical tools and demographic/population analysis.',
    domain: 'statistical',
    tags: ['Sampling', 'Data Quality Frameworks', 'Metadata Standards'],
    targetCadre: 'Subordinate Statistical Service (SSS)',
    level: 'Beginner',
    durationWeeks: 4,
  },
  {
    id: 'nssta-national-accounts-gdp',
    title: 'National Accounts & GDP Estimation',
    description: 'Covers National Accounts, GDP estimation methodology, Economic Census, and Index of Industrial Production (IIP).',
    domain: 'statistical',
    tags: ['National Accounts', 'Industrial Statistics'],
    targetCadre: 'Both',
    level: 'Intermediate',
    durationWeeks: 1,
  },
  {
    id: 'nssta-agri-statistics',
    title: 'Agricultural and Allied Statistics with Special Focus on Agriculture Surveys',
    description: 'Run jointly with ICAR-IASRI, covering agricultural survey design and allied statistics.',
    domain: 'statistical',
    tags: ['Agricultural Statistics', 'Survey Design'],
    targetCadre: 'Indian Statistical Service (ISS)',
    level: 'Intermediate',
    durationWeeks: 1,
  },
  {
    id: 'nssta-macro-diagnostics',
    title: 'Macroeconomic Diagnostics, Financial Programming, and Policies',
    description: 'Run with IMF SARTTAC for ISS/IES officer trainees, covering macroeconomic analysis and financial programming.',
    domain: 'statistical',
    tags: ['Price Statistics', 'National Accounts'],
    targetCadre: 'Indian Statistical Service (ISS)',
    level: 'Advanced',
    durationWeeks: 3,
  },
  {
    id: 'nssta-communication-skills',
    title: 'Communication Skill Development for Senior Statistical Officers',
    description: 'Behavioural/managerial training for SSO-cadre officers within SSS.',
    domain: 'behavioural',
    tags: ['Communication', 'Leadership'],
    targetCadre: 'Subordinate Statistical Service (SSS)',
    level: 'Intermediate',
    durationWeeks: 1,
  },
  {
    id: 'nssta-field-enumerators',
    title: 'Online Certificate Course for Field Survey Enumerators',
    description: 'Self-paced online modules for field-level survey data collection staff.',
    domain: 'statistical',
    tags: ['Survey Design', 'Data Quality Frameworks'],
    targetCadre: 'Both',
    level: 'Beginner',
    durationWeeks: 2,
  },
  {
    id: 'nssta-census-training',
    title: 'Census Operations Training',
    description: 'Covers census enumeration procedures and data quality for census-related field staff.',
    domain: 'statistical',
    tags: ['Data Quality Frameworks', 'Metadata Standards'],
    targetCadre: 'Both',
    level: 'Beginner',
    durationWeeks: 1,
  },
];

module.exports = { NSSTA_COURSE_CATALOG };
