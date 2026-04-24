import { CheckCircle, Loader2 } from 'lucide-react'
import type { Expertise } from '../../types/expertise'
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/expertise'
import { formatDate } from '../../utils/date'

interface Props {
  expertise: Expertise
  onComplete: () => Promise<void>
  saving: boolean
}

export default function StepPreview({ expertise, onComplete, saving }: Props) {
  const nonOriginalParts = expertise.body_checks.filter(c => c.status !== 'Orijinal')
  const issues = expertise.inspection_checks.filter(c => c.result === 'Uygun Değil')

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Tüm bilgileri kontrol edin. Hazırsa ekspertizi tamamlayın.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Plaka" value={expertise.plate} />
        <SummaryCard label="Müşteri" value={expertise.customer_name || '—'} />
        <SummaryCard label="Kilometre" value={expertise.km ? `${expertise.km} km` : '—'} />
        <SummaryCard label="Şanzıman" value={expertise.transmission_type || '—'} />
        <SummaryCard label="Durum" value={STATUS_LABELS[expertise.status]} />
        <SummaryCard label="Tarih" value={formatDate(expertise.created_at)} />
      </div>

      {/* Body Issues */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Kaporta Durumu
          {nonOriginalParts.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
              {nonOriginalParts.length} sorunlu parça
            </span>
          )}
        </h3>
        {nonOriginalParts.length === 0 ? (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle size={14} /> Tüm parçalar orijinal
          </p>
        ) : (
          <ul className="space-y-1">
            {nonOriginalParts.map(p => (
              <li key={p.partName} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="font-medium">{p.partName}:</span>
                <span className="text-orange-600">{p.status}</span>
                {p.note && <span className="text-gray-500">({p.note})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inspection Issues */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Kontrol Sonuçları
          {issues.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
              {issues.length} sorun
            </span>
          )}
        </h3>
        {issues.length === 0 ? (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle size={14} /> Tüm kontroller uygun
          </p>
        ) : (
          <ul className="space-y-1">
            {issues.map(i => (
              <li key={i.name} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="font-medium">{i.name}:</span>
                <span className="text-red-600">{i.result}</span>
                {i.note && <span className="text-gray-500">({i.note})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tire */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Lastik Bilgileri</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-600">Tip: <span className="text-gray-900">{expertise.tire_info.tireType || '—'}</span></span>
          <span className="text-gray-600">Üretim: <span className="text-gray-900">{expertise.tire_info.productionYear || '—'}</span></span>
        </div>
      </div>

      {/* Notes */}
      {expertise.engine_note && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Motor Notu</h3>
          <p className="text-sm text-gray-700">{expertise.engine_note}</p>
        </div>
      )}

      {expertise.mechanical_note && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Mekanik Not</h3>
          <p className="text-sm text-gray-700">{expertise.mechanical_note}</p>
        </div>
      )}

      {/* Current status warning */}
      {expertise.status === 'completed' || expertise.status === 'reported' ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Bu ekspertiz zaten tamamlandı.
          </span>
        </div>
      ) : (
        <button
          onClick={onComplete}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle size={18} />
          )}
          {saving ? 'Tamamlanıyor...' : 'Ekspertizi Tamamla'}
        </button>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-gray-200">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
