import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getExpertises } from '../services/expertiseService'
import type { Expertise } from '../types/expertise'
import { STATUS_LABELS, STATUS_COLORS } from '../constants/expertise'
import { formatDateShort } from '../utils/date'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expertises, setExpertises] = useState<Expertise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getExpertises(user.id).then(({ data }) => {
      setExpertises(data || [])
      setLoading(false)
    })
  }, [user])

  const total = expertises.length
  const inProgress = expertises.filter(e => e.status === 'in_progress').length
  const completed = expertises.filter(e => e.status === 'completed' || e.status === 'reported').length
  const recent = expertises.slice(0, 5)

  const stats = [
    {
      label: 'Toplam Ekspertiz',
      value: total,
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Devam Eden',
      value: inProgress,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      border: 'border-yellow-100',
    },
    {
      label: 'Tamamlanan',
      value: completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-100',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Hoş geldiniz,{' '}
            <span className="font-medium text-gray-700">{user?.email || 'Eksper'}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/expertises/new')}
          className="btn-primary flex items-center gap-2 hidden sm:flex"
        >
          <PlusCircle size={16} />
          Yeni Ekspertiz
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`card p-5 border ${border} flex items-center gap-4`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '–' : value}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Son Ekspertizler</h2>
          <button
            onClick={() => navigate('/expertises')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Henüz ekspertiz kaydı yok.</p>
            <button
              onClick={() => navigate('/expertises/new')}
              className="mt-3 btn-primary text-sm"
            >
              İlk Ekspertizi Oluştur
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((exp) => (
              <div
                key={exp.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/expertises/${exp.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {exp.plate.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{exp.plate}</p>
                    <p className="text-xs text-gray-500">
                      {exp.customer_name || 'Müşteri belirtilmedi'} · {formatDateShort(exp.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[exp.status]}`}
                  >
                    {STATUS_LABELS[exp.status]}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile New Button */}
      <div className="sm:hidden">
        <button
          onClick={() => navigate('/expertises/new')}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          <PlusCircle size={18} />
          Yeni Ekspertiz Oluştur
        </button>
      </div>
    </div>
  )
}
