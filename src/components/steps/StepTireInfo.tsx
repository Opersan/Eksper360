import { useState } from 'react'
import { Save } from 'lucide-react'
import type { TireInfo } from '../../types/expertise'
import { TIRE_TYPES } from '../../constants/expertise'

interface Props {
  tireInfo: TireInfo
  onSave: (info: TireInfo) => Promise<{ error: unknown } | undefined>
}

const TIRE_POSITIONS = [
  { key: 'frontLeft', label: 'Sol Ön' },
  { key: 'frontRight', label: 'Sağ Ön' },
  { key: 'rearLeft', label: 'Sol Arka' },
  { key: 'rearRight', label: 'Sağ Arka' },
] as const

export default function StepTireInfo({ tireInfo, onSave }: Props) {
  const [info, setInfo] = useState<TireInfo>(tireInfo)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const update = (field: keyof TireInfo, value: string) => {
    setInfo({ ...info, [field]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const result = await onSave(info)
    setSaving(false)
    if (result?.error) {
      setSaveError('Kaydedilemedi. Lütfen tekrar deneyin.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Lastik Tipi</label>
          <select
            value={info.tireType}
            onChange={(e) => update('tireType', e.target.value)}
            className="input-field"
          >
            <option value="">Seçin</option>
            {TIRE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Üretim Yılı</label>
          <input
            type="text"
            value={info.productionYear}
            onChange={(e) => update('productionYear', e.target.value)}
            placeholder="2022"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="label">Lastik Bilgileri</label>
        <div className="grid grid-cols-2 gap-3">
          {TIRE_POSITIONS.map(({ key, label }) => (
            <div key={key} className="p-3 rounded-xl border border-gray-200 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
              <input
                type="text"
                value={info[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder="Örn: 205/55R16"
                className="input-field text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {saveError && <p className="text-xs text-red-600">{saveError}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : saved ? (
          <>✓ Kaydedildi</>
        ) : (
          <>
            <Save size={16} />
            Kaydet
          </>
        )}
      </button>
    </div>
  )
}
