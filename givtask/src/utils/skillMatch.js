/**
 * Skill-Based Matching Engine
 * Compares a user's skills against a task's required skills
 * and returns a match score and metadata.
 */

/**
 * Normalise a skill string for comparison (lowercase, trim whitespace)
 */
function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ').trim()
}

/**
 * Calculate match score between user skills and task required skills.
 *
 * @param {string[]} userSkills   – skills from the logged-in user's profile
 * @param {string[]} taskSkills   – required_skills from a task
 * @returns {{ score: number, matchCount: number, totalRequired: number, matchingSkills: string[] }}
 */
export function calcMatchScore(userSkills = [], taskSkills = []) {
  if (!taskSkills || taskSkills.length === 0) {
    return { score: 50, matchCount: 0, totalRequired: 0, matchingSkills: [] }
  }

  const normUser = (userSkills || []).map(normalise)
  const matchingSkills = []

  for (const ts of taskSkills) {
    const normTs = normalise(ts)
    // Match if skill is contained OR contains the task skill (handles "UI/UX Design" vs "UX Design")
    const matched = normUser.some(us =>
      us === normTs || us.includes(normTs) || normTs.includes(us)
    )
    if (matched) matchingSkills.push(ts)
  }

  const matchCount = matchingSkills.length
  const totalRequired = taskSkills.length
  const score = Math.round((matchCount / totalRequired) * 100)

  return { score, matchCount, totalRequired, matchingSkills }
}

/**
 * Sort an array of tasks by match score (highest first).
 * Attaches a `matchScore` object to each task.
 *
 * @param {Object[]} tasks
 * @param {string[]} userSkills
 * @returns {Object[]} tasks with `matchScore` attached, sorted desc
 */
export function sortTasksByMatch(tasks = [], userSkills = []) {
  return tasks
    .map(task => ({
      ...task,
      matchScore: calcMatchScore(userSkills, task.skills || []),
    }))
    .sort((a, b) => b.matchScore.score - a.matchScore.score)
}

/**
 * Get a human-readable match label for a score.
 */
export function matchLabel(score) {
  if (score >= 80) return 'Excellent match'
  if (score >= 60) return 'Good match'
  if (score >= 40) return 'Partial match'
  return 'Low match'
}

/**
 * Get the Tailwind color classes for a match score badge.
 */
export function matchColor(score) {
  if (score >= 80) return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' }
  if (score >= 60) return { bg: 'bg-royal-500/20',   text: 'text-royal-300',   border: 'border-royal-500/30' }
  if (score >= 40) return { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/30' }
  return                   { bg: 'bg-white/10',       text: 'text-slate-400',   border: 'border-white/10' }
}
