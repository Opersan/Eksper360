import { useState } from 'react'
import { Save } from 'lucide-react'
import type { BodyCheck } from '../../types/expertise'
import { BODY_STATUSES } from '../../constants/expertise'

interface Props {
  bodyChecks: BodyCheck[]
  onSave: (checks: BodyCheck[]) => Promise<{ error: unknown } | undefined>
}

const STATUS_COLORS: Record<string, string> = {
  'Orijinal': 'bg-green-100 text-green-700 border-green-200',
  'Boyalı': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Değişen': 'bg-red-100 text-red-700 border-red-200',
  'Lokal Boyalı': 'bg-orange-100 text-orange-700 border-orange-200',
  'Hasarlı': 'bg-red-200 text-red-800 border-red-300',
}

export default function StepBodyChecks({ bodyChecks, onSave }: Props) {
  const [checks, setChecks] = useState<BodyCheck[]>(bodyChecks)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateCheck = (index: number, field: keyof BodyCheck, value: string) => {
    const updated = checks.map((c, i) => i === index ? { ...c, [field]: value } : c)
    setChecks(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(checks)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Her kaporta parçası için durum ve not girin.</p>

      <div className="space-y-3">
        {checks.map((check, i) => (
          <div key={check.partName} className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="sm:w-44 font-medium text-gray-900 text-sm flex-shrink-0">
                {check.partName}
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {BODY_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateCheck(i, 'status', status)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      check.status === status
                        ? STATUS_COLORS[status] || 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            {check.status !== 'Orijinal' && (
              <div className="mt-2 sm:ml-44 sm:pl-3">
                <input
                  type="text"
                  value={check.note}
                  onChange={(e) => updateCheck(i, 'note', e.target.value)}
                  placeholder="Not ekle..."
                  className="input-field text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

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
