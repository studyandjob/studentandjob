// Shared vocabulary + scoring logic for the AI job-matching feature.
//
// The SAME lists are used on the admin "Add Job" form (education_required /
// skills_required) and on the candidate profile builder (education /
// skills). Matching only works well when both sides pick from a shared
// vocabulary, so keep this file as the single source of truth for both.

export const SECTORS = [
  { value: 'Federal', label: 'Federal (وفاقی)' },
  { value: 'Punjab', label: 'Punjab (پنجاب)' },
  { value: 'Sindh', label: 'Sindh (سندھ)' },
  { value: 'Balochistan', label: 'Balochistan (بلوچستان)' },
  { value: 'KPK', label: 'KPK (خیبر پختونخوا)' },
  { value: 'Azad Kashmir', label: 'Azad Kashmir (آزاد کشمیر)' },
];

export const JOB_TYPES = ['Government', 'Private'];

export const APPLICATION_MODES = ['Online', 'Manual/By Post'];

export const JOB_CATEGORIES = [
  'Teaching / Education',
  'Healthcare / Medical',
  'Information Technology (IT)',
  'Banking / Finance',
  'Police',
  'Forces / Defence',
  'Internships',
  'Clerical / Administration',
  'Engineering',
  'Sales & Marketing',
  'Driving / Transport',
  'Labour / Support Staff',
  'Legal',
  'Management',
  'Other',
];

export const EDUCATION_LEVELS = [
  'Middle / Primary',
  'Matric',
  'Intermediate / FA / FSc',
  'Diploma (DAE)',
  'Bachelor (BA / BSc)',
  'Bachelor (BS - 4 Year)',
  'BBA',
  'B.Ed',
  'LLB',
  'MBBS',
  'Engineering (BE / BSc Engg)',
  'Master (MA / MSc)',
  'MBA',
  'M.Ed',
  'MPhil',
  'PhD',
  'Other',
];

export const SKILLS_LIST = [
  'Computer Basics',
  'MS Office',
  'Typing (English)',
  'Typing (Urdu)',
  'Accounting',
  'Data Entry',
  'Teaching',
  'Nursing / Paramedic',
  'Driving (LTV/HTV)',
  'Security / Guard Duties',
  'Sales & Marketing',
  'Customer Service',
  'Graphic Design',
  'Web Development',
  'Software Development',
  'Networking',
  'Electrician',
  'Plumbing',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'English Communication',
  'Legal Drafting',
  'Lab Technician',
  'Banking Operations',
  'Store / Inventory Management',
  'Other',
];

/**
 * Scores how well a candidate profile matches a job posting.
 * Returns { score (0-100), matchedEducation, matchedSkills, reasons[] }.
 *
 * Logic (deliberately simple + explainable, "AI-powered" via weighted
 * multi-attribute scoring rather than an opaque black box):
 *  - Education overlap: 50% weight — does the candidate hold any of the
 *    education levels the job asks for? (If the job lists none, this
 *    attribute is treated as satisfied so it doesn't unfairly penalise
 *    jobs that are open to any education level.)
 *  - Skills overlap: 40% weight — proportion of the job's required skills
 *    the candidate also lists.
 *  - Sector/location preference: 10% weight — bonus if the candidate's
 *    preferred sector matches the job's sector.
 */
export function scoreJobMatch(candidate, job) {
  if (!candidate || !job) return { score: 0, matchedEducation: [], matchedSkills: [], reasons: [] };

  const candidateEducation = candidate.education_levels || [];
  const candidateSkills = candidate.skills || [];
  const jobEducation = job.education_required || [];
  const jobSkills = job.skills_required || [];

  // Education
  let educationScore = 1; // default: satisfied if job has no requirement
  const matchedEducation = jobEducation.filter((lvl) => candidateEducation.includes(lvl));
  if (jobEducation.length > 0) {
    educationScore = matchedEducation.length > 0 ? 1 : 0;
  }

  // Skills
  let skillsScore = 1;
  const matchedSkills = jobSkills.filter((s) => candidateSkills.includes(s));
  if (jobSkills.length > 0) {
    skillsScore = matchedSkills.length / jobSkills.length;
  }

  // Sector preference bonus
  const sectorScore = candidate.sector_preference && job.sector && candidate.sector_preference === job.sector ? 1 : 0;

  const score = Math.round(educationScore * 50 + skillsScore * 40 + sectorScore * 10);

  const reasons = [];
  if (jobEducation.length > 0 && matchedEducation.length > 0) {
    reasons.push(`Education matches: ${matchedEducation.join(', ')}`);
  }
  if (jobSkills.length > 0 && matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length}/${jobSkills.length} required skills matched`);
  }
  if (sectorScore) reasons.push('Preferred sector matches');

  return { score: Math.min(100, score), matchedEducation, matchedSkills, reasons };
}

/**
 * Filters + sorts jobs by match score for a candidate.
 * @param {number} minScore - jobs below this score are dropped (default 30)
 */
export function getMatchingJobs(candidate, jobs = [], minScore = 30) {
  return jobs
    .map((job) => ({ job, match: scoreJobMatch(candidate, job) }))
    .filter(({ match }) => match.score >= minScore)
    .sort((a, b) => b.match.score - a.match.score);
}
