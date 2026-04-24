import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
  FileText,
  Car,
  User,
  Gauge,
  Settings,
  CheckCircle,
  XCircle,
  Minus,
} from 'lucide-react'
import { getExpertiseById } from '../services/expertiseService'
import type { Expertise } from '../types/expertise'
import { STATUS_LABELS, STATUS_COLORS } from '../constants/expertise'
import { formatDate } from '../utils/date'

export default function ExpertiseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expertise, setExpertise] = useState<Expertise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getExpertiseById(id).then(({ data, error }) => {
      if (error || !data) setError('Ekspertiz bulunamadı')
      else setExpertise(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !expertise) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || 'Yüklenemedi'}</p>
        <button onClick={() => navigate('/expertises')} className="mt-4 btn-secondary">
          Geri Dön
        </button>
      </div>
    )
  }

  const nonOriginalParts = expertise.body_checks.filter(c => c.status !== 'Orijinal')
  const issues = expertise.inspection_checks.filter(c => c.result === 'Uygun Değil')

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/expertises')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{expertise.plate}</h1>
            <p className="text-sm text-gray-500">{formatDate(expertise.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[expertise.status]}`}>
            {STATUS_LABELS[expertise.status]}
          </span>
          <Link to={`/expertises/${id}/edit`} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            <Edit3 size={14} />
            Düzenle
          </Link>
          <Link to={`/expertises/${id}/report`} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
            <FileText size={14} />
            Rapor
          </Link>
        </div>
      </div>

      {/* General Info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Car size={18} className="text-blue-600" />
          Araç Bilgileri
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoItem icon={<Car size={16} />} label="Plaka" value={expertise.plate} />
          <InfoItem icon={<User size={16} />} label="Müşteri" value={expertise.customer_name || '—'} />
          <InfoItem icon={<Gauge size={16} />} label="Kilometre" value={expertise.km ? `${expertise.km} km` : '—'} />
          <InfoItem icon={<Settings size={16} />} label="Şanzıman" value={expertise.transmission_type || '—'} />
        </div>
      </div>

      {/* Photos */}
      {expertise.photos.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Araç Fotoğrafları</h2>
          <div className="grid grid-cols-2 gap-3">
            {expertise.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Araç fotoğrafı ${i + 1}`}
                className="w-full rounded-xl object-cover aspect-video border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Body Checks */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">
          Kaporta Bilgileri
          {nonOriginalParts.length > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              {nonOriginalParts.length} sorun
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {expertise.body_checks.map(check => (
            <div
              key={check.partName}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="text-sm text-gray-700">{check.partName}</span>
              <div className="flex items-center gap-2">
                {check.note && (
                  <span className="text-xs text-gray-500 italic">{check.note}</span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  check.status === 'Orijinal'
                    ? 'bg-green-100 text-green-700'
                    : check.status === 'Hasarlı' || check.status === 'Değişen'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {check.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Checks */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">
          İç / Dış Kontroller
          {issues.length > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {issues.length} sorun
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {expertise.inspection_checks.map(check => (
            <div
              key={check.name}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="text-sm text-gray-700">{check.name}</span>
              <div className="flex items-center gap-1.5">
                {check.result === 'Uygun' && <CheckCircle size={14} className="text-green-500" />}
                {check.result === 'Uygun Değil' && <XCircle size={14} className="text-red-500" />}
                {check.result === 'Kontrol Edilmedi' && <Minus size={14} className="text-gray-400" />}
                <span className={`text-xs font-medium ${
                  check.result === 'Uygun' ? 'text-green-600' :
                  check.result === 'Uygun Değil' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {check.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tire Info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Lastik Bilgileri</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoItem label="Lastik Tipi" value={expertise.tire_info.tireType || '—'} />
          <InfoItem label="Üretim Yılı" value={expertise.tire_info.productionYear || '—'} />
          <div />
          <InfoItem label="Sol Ön" value={expertise.tire_info.frontLeft || '—'} />
          <InfoItem label="Sağ Ön" value={expertise.tire_info.frontRight || '—'} />
          <div />
          <InfoItem label="Sol Arka" value={expertise.tire_info.rearLeft || '—'} />
          <InfoItem label="Sağ Arka" value={expertise.tire_info.rearRight || '—'} />
        </div>
      </div>

      {/* Notes */}
      {(expertise.engine_note || expertise.mechanical_note) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {expertise.engine_note && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Motor Kontrol Notu</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{expertise.engine_note}</p>
            </div>
          )}
          {expertise.mechanical_note && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Mekanik Kontrol Notu</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{expertise.mechanical_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
