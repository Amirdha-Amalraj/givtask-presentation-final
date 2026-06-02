import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List, RefreshCw, AlertCircle } from 'lucide-react'
import MainLayout from '../../components/layout/MainLayout.jsx'
import TaskCard from '../../components/dashboard/TaskCard.jsx'
import { ngoCategories } from '../../data/index.js'
import { tasksApi } from '../../services/api.js'

const locationOptions = ['All', 'Remote', 'On-site', 'Hybrid']
const typeOptions     = ['All', 'Volunteer', 'Paid']

// Map frontend filter values to backend query params
const TYPE_MAP = { Volunteer: 'volunteer', Paid: 'paid' }
const LOC_MAP  = { Remote: 'remote', 'On-site': 'onsite', Hybrid: 'hybrid' }

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-royal-50 text-royal-700 border border-royal-200 rounded-full text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors"><X size={12} /></button>
    </span>
  )
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-xs font-bold text-navy-800 uppercase tracking-widest mb-2 hover:text-royal-600 transition-colors"
      >
        {title}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

export default function TasksPage() {
  const [tasks,       setTasks]      = useState([])
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState('')
  const [query,       setQuery]      = useState('')
  const [typeFilter,  setType]       = useState('All')
  const [locFilter,   setLoc]        = useState('All')
  const [catFilter,   setCat]        = useState([])
  const [gridView,    setGridView]   = useState(true)
  const [filtersOpen, setFilters]    = useState(false)

  const toggleCat = (cat) =>
    setCat(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {}
      if (query)              filters.search    = query
      if (typeFilter !== 'All') filters.task_type = TYPE_MAP[typeFilter]
      if (locFilter  !== 'All') filters.work_mode = LOC_MAP[locFilter]
      if (catFilter.length === 1) filters.category = catFilter[0]

      const data = await tasksApi.list(filters)
      // If multiple categories selected, filter client-side
      const result = catFilter.length > 1
        ? data.filter(t => catFilter.includes(t.category))
        : data
      setTasks(result)
    } catch (err) {
      setError(err.message || 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }, [query, typeFilter, locFilter, catFilter])

  // Debounced fetch — re-fetch when filters change
  useEffect(() => {
    const t = setTimeout(fetchTasks, query ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchTasks])

  const activeFilters = [
    ...(typeFilter !== 'All' ? [{ label: typeFilter, clear: () => setType('All') }] : []),
    ...(locFilter  !== 'All' ? [{ label: locFilter,  clear: () => setLoc('All')  }] : []),
    ...catFilter.map(c => ({ label: c, clear: () => toggleCat(c) })),
  ]

  return (
    <MainLayout>
      {/* Page header */}
      <div className="bg-white border-b border-[#F1F5F9] pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">Browse Opportunities</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <p className="text-slate-500 text-sm">
                  {loading ? 'Loading…' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} available`}
                  {' '}· Volunteer &amp; paid NGO work
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGridView(v => !v)}
                className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-navy-700 hover:border-navy-300 transition-colors"
              >
                {gridView ? <List size={16} /> : <LayoutGrid size={16} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks, organisations, or skills…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${filtersOpen ? 'bg-royal-600 text-white border-royal-600' : 'bg-white border-[#E2E8F0] text-navy-700 hover:border-navy-300'}`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:flex flex-col gap-5 w-56 flex-shrink-0">
            <FilterGroup title="Type">
              {typeOptions.map(o => (
                <label key={o} className="flex items-center gap-2 cursor-pointer py-1 group">
                  <input type="radio" name="type" checked={typeFilter === o} onChange={() => setType(o)} className="accent-royal-600" />
                  <span className={`text-sm transition-colors ${typeFilter === o ? 'text-royal-700 font-semibold' : 'text-navy-600 group-hover:text-navy-900'}`}>{o}</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Location">
              {locationOptions.map(o => (
                <label key={o} className="flex items-center gap-2 cursor-pointer py-1 group">
                  <input type="radio" name="location" checked={locFilter === o} onChange={() => setLoc(o)} className="accent-royal-600" />
                  <span className={`text-sm transition-colors ${locFilter === o ? 'text-royal-700 font-semibold' : 'text-navy-600 group-hover:text-navy-900'}`}>{o}</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Category">
              {ngoCategories.slice(0, 8).map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer py-1 group">
                  <input type="checkbox" checked={catFilter.includes(c)} onChange={() => toggleCat(c)} className="accent-royal-600 rounded" />
                  <span className={`text-sm transition-colors ${catFilter.includes(c) ? 'text-royal-700 font-semibold' : 'text-navy-600 group-hover:text-navy-900'}`}>{c}</span>
                </label>
              ))}
            </FilterGroup>

            {activeFilters.length > 0 && (
              <button
                onClick={() => { setType('All'); setLoc('All'); setCat([]) }}
                className="text-xs font-semibold text-red-500 hover:underline text-left"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter panel */}
            {filtersOpen && (
              <div className="lg:hidden mb-5 card p-5 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-navy-800 mb-2">Type</p>
                    <div className="flex flex-wrap gap-1.5">
                      {typeOptions.map(o => (
                        <button key={o} onClick={() => setType(o)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${typeFilter === o ? 'bg-royal-600 text-white border-royal-600' : 'bg-white text-navy-700 border-[#E2E8F0] hover:border-royal-300'}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-800 mb-2">Location</p>
                    <div className="flex flex-wrap gap-1.5">
                      {locationOptions.map(o => (
                        <button key={o} onClick={() => setLoc(o)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${locFilter === o ? 'bg-royal-600 text-white border-royal-600' : 'bg-white text-navy-700 border-[#E2E8F0] hover:border-royal-300'}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-5">
                {activeFilters.map((f, i) => (
                  <FilterPill key={i} label={f.label} onRemove={f.clear} />
                ))}
              </div>
            )}

            {/* States */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <RefreshCw size={24} className="text-royal-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading tasks from server…</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-navy-900 mb-1">Could not load tasks</p>
                  <p className="text-sm text-slate-500 max-w-sm">{error}</p>
                  <p className="text-xs text-slate-400 mt-1">Make sure the backend is running on http://127.0.0.1:5000</p>
                </div>
                <button
                  onClick={fetchTasks}
                  className="px-4 py-2 bg-royal-600 text-white text-sm font-semibold rounded-xl hover:bg-royal-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                  <Search size={22} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">No tasks found</h3>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => { setType('All'); setLoc('All'); setCat([]); setQuery('') }}
                    className="mt-4 text-sm text-royal-600 font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && tasks.length > 0 && (
              <div className={gridView ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} compact={gridView} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
