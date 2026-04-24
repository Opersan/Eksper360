import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Search,
  ClipboardList,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getExpertises } from '../services/expertiseService'
import type { Expertise, ExpertiseStatus } from '../types/expertise'
import { STATUS_LABELS, STATUS_COLORS } from '../constants/expertise'
import { formatDate } from '../utils/date'

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'draft', label: 'Taslak' },
  { value: 'in_progress', label: 'Devam Eden' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'reported', label: 'Raporlandı' },
]

export default function ExpertiseList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expertises, setExpertises] = useState<Expertise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getExpertises(user.id).then(({ data }) => {
      setExpertises(data || [])
      setLoading(false)
    })
  }, [user])

  const filtered = expertises.filter((e) => {
    const matchSearch = e.plate.toLowerCase().includes(search.toLowerCase()) ||
      (e.customer_name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ekspertizler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{expertises.length} kayıt</p>
        </div>
        <button
          onClick={() => navigate('/expertises/new')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Yeni Ekspertiz</span>
          <span className="sm:hidden">Yeni</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Plaka veya müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Ekspertiz bulunamadı</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || statusFilter !== 'all'
                ? 'Arama kriterlerinizi değiştirin'
                : 'Yeni bir ekspertiz oluşturun'}
            </p>
            {!search && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/expertises/new')}
                className="mt-4 btn-primary text-sm"
              >
                İlk Ekspertizi Oluştur
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header - Desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">Plaka</div>
              <div className="col-span-3">Müşteri</div>
              <div className="col-span-2">KM</div>
              <div className="col-span-2">Tarih</div>
              <div className="col-span-2">Durum</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.map((exp) => (
                <div
                  key={exp.id}
                  className="px-4 sm:px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/expertises/${exp.id}`)}
                >
                  {/* Mobile */}
                  <div className="sm:hidden flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.plate}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {exp.customer_name || '—'} · {exp.km ? `${exp.km} km` : '—'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(exp.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[exp.status]}`}>
                        {STATUS_LABELS[exp.status]}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <span className="font-semibold text-gray-900">{exp.plate}</span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-600 truncate">
                      {exp.customer_name || '—'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {exp.km ? `${exp.km} km` : '—'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatDate(exp.created_at)}
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[exp.status]}`}>
                        {STATUS_LABELS[exp.status]}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
