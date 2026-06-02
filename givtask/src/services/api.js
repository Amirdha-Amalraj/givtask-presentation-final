/**
 * GivTask API Service
 * All communication with the Flask backend goes through this file.
 * Base URL: http://127.0.0.1:5000
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

// ── Org logo colour palette (deterministic by ngo_id) ──────────────────────
const LOGO_COLORS = [
  'from-royal-500 to-royal-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-sky-700',
  'from-teal-500 to-teal-700',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-indigo-700',
]

function orgLogoColor(ngoId) {
  return LOGO_COLORS[(ngoId - 1) % LOGO_COLORS.length]
}

function orgInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * Normalize a raw backend task into the shape expected by TaskCard and all
 * dashboard components.
 *
 * Backend shape:
 *   { id, title, description, category, required_skills: [],
 *     work_mode, task_type, ngo_id, ngo_name, created_at, application_count }
 *
 * Frontend shape (TaskCard expects):
 *   { id, title, description, org, orgLogo, orgLogoColor, type, location,
 *     skills, category, applicants, duration, budget, featured, status }
 */
export function normalizeTask(t) {
  const workModeMap = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' }
  const typeMap     = { volunteer: 'Volunteer', paid: 'Paid' }

  return {
    id:           t.id,
    title:        t.title,
    description:  t.description,
    category:     t.category || 'General',
    skills:       Array.isArray(t.required_skills)
                    ? t.required_skills
                    : (t.required_skills || '').split(',').map(s => s.trim()).filter(Boolean),
    type:         typeMap[t.task_type] || 'Volunteer',
    location:     workModeMap[t.work_mode] || 'Remote',
    org:          t.ngo_name || 'NGO',
    orgLogo:      orgInitials(t.ngo_name || 'NGO'),
    orgLogoColor: orgLogoColor(t.ngo_id || 1),
    applicants:   t.application_count ?? 0,
    ngo_id:       t.ngo_id,
    created_at:   t.created_at,
    // Fields not yet in backend — sensible defaults
    duration:     'TBD',
    budget:       t.task_type === 'paid' ? 'Negotiable' : null,
    featured:     false,
    status:       'open',
    // Keep originals for detail page
    work_mode:    t.work_mode,
    task_type:    t.task_type,
  }
}

// ── Core fetch helper ──────────────────────────────────────────────────────

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res  = await fetch(BASE_URL + path, opts)
  const json = await res.json()

  if (!res.ok) {
    // Throw an error whose message is the backend's human-readable text
    throw new Error(json.message || `Request failed (${res.status})`)
  }
  return json.data        // unwrap { success, message, data }
}

// ── AUTH ───────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Login
   * POST /api/login
   * Returns: { id, full_name, email, role, city, state, skills }
   */
  login(email, password) {
    return request('POST', '/api/login', { email, password })
  },

  /**
   * Register
   * POST /api/register
   * Returns: user object with skills
   */
  register({ full_name, email, password, role, city = '', state = '', skills = [] }) {
    return request('POST', '/api/register', { full_name, email, password, role, city, state, skills })
  },

  /**
   * Get user profile
   * GET /api/users/:id
   * Returns: user object with skills[]
   */
  getUser(userId) {
    return request('GET', `/api/users/${userId}`)
  },

  /**
   * Update user profile (full_name, city, state)
   * PUT /api/users/:id
   */
  updateProfile(userId, { full_name, city, state }) {
    return request('PUT', `/api/users/${userId}`, { full_name, city, state })
  },

  /**
   * Update user skills
   * PUT /api/users/:id/skills
   */
  updateSkills(userId, skills) {
    return request('PUT', `/api/users/${userId}/skills`, { skills })
  },
}

// ── TASKS ──────────────────────────────────────────────────────────────────

export const tasksApi = {
  /**
   * GET /api/tasks
   * Filters: { search, task_type, work_mode, category, ngo_id }
   * Returns: normalized task[]
   */
  async list(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search)    params.set('search',    filters.search)
    if (filters.task_type) params.set('task_type', filters.task_type)
    if (filters.work_mode) params.set('work_mode', filters.work_mode)
    if (filters.category)  params.set('category',  filters.category)
    if (filters.ngo_id)    params.set('ngo_id',    filters.ngo_id)

    const qs   = params.toString()
    const data = await request('GET', `/api/tasks${qs ? '?' + qs : ''}`)
    return (data || []).map(normalizeTask)
  },

  /**
   * GET /api/tasks/:id
   * Returns: normalized task
   */
  async get(id) {
    const data = await request('GET', `/api/tasks/${id}`)
    return normalizeTask(data)
  },

  /**
   * POST /api/tasks
   * Payload: { ngo_id, title, description, category, required_skills,
   *            work_mode, task_type }
   * Returns: normalized task
   */
  async create(payload) {
    const data = await request('POST', '/api/tasks', payload)
    return normalizeTask(data)
  },

  /**
   * PUT /api/tasks/:id
   * Returns: normalized task
   */
  async update(id, payload) {
    const data = await request('PUT', `/api/tasks/${id}`, payload)
    return normalizeTask(data)
  },

  /**
   * DELETE /api/tasks/:id
   * Payload: { ngo_id }
   */
  delete(id, ngoId) {
    return request('DELETE', `/api/tasks/${id}`, { ngo_id: ngoId })
  },
}

// ── APPLICATIONS ───────────────────────────────────────────────────────────

export const applicationsApi = {
  /**
   * POST /api/applications
   * Payload: { task_id, applicant_id }
   * Returns: application object with task embedded
   */
  apply(taskId, applicantId) {
    return request('POST', '/api/applications', {
      task_id:      taskId,
      applicant_id: applicantId,
    })
  },

  /**
   * GET /api/applications/task/:taskId
   * Returns: application[] each with { applicant: { id, full_name, email, role, city, state } }
   */
  forTask(taskId) {
    return request('GET', `/api/applications/task/${taskId}`)
  },

  /**
   * GET /api/applications/user/:userId
   * Returns: application[] each with { task: normalized }
   */
  async forUser(userId) {
    const data = await request('GET', `/api/applications/user/${userId}`)
    return (data || []).map(app => ({
      ...app,
      task: app.task ? normalizeTask(app.task) : null,
    }))
  },

  /**
   * PATCH /api/applications/:id/status
   * Payload: { status, ngo_id }
   * Returns: updated application with applicant
   */
  updateStatus(appId, status, ngoId) {
    return request('PATCH', `/api/applications/${appId}/status`, {
      status,
      ngo_id: ngoId,
    })
  },
}
