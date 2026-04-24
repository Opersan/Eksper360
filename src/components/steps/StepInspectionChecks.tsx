import { useState } from 'react'
import { Save } from 'lucide-react'
import type { InspectionCheck } from '../../types/expertise'
import { INSPECTION_RESULTS } from '../../constants/expertise'

interface Props {
  checks: InspectionCheck[]
  onSave: (checks: InspectionCheck[]) => Promise<{ error: unknown } | undefined>
}

const RESULT_COLORS: Record<string, string> = {
  'Uygun': 'bg-green-100 text-green-700 border-green-200',
  'Uygun Değil': 'bg-red-100 text-red-700 border-red-200',
  'Kontrol Edilmedi': 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function StepInspectionChecks({ checks, onSave }: Props) {
  const [items, setItems] = useState<InspectionCheck[]>(checks)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateItem = (index: number, field: keyof InspectionCheck, value: string) => {
    setItems(items.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(items)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Her kontrol kalemi için sonuç girin.</p>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.name} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="sm:w-40 font-medium text-gray-900 text-sm flex-shrink-0">
                {item.name}
              </div>
              <div className="flex gap-2 flex-1">
                {INSPECTION_RESULTS.map((result) => (
                  <button
                    key={result}
                    type="button"
                    onClick={() => updateItem(i, 'result', result)}
                    className={`flex-1 sm:flex-none px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                      item.result === result
                        ? RESULT_COLORS[result]
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {result}
                  </button>
                ))}
              </div>
            </div>
            {item.result === 'Uygun Değil' && (
              <div className="mt-2 sm:ml-40 sm:pl-3">
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => updateItem(i, 'note', e.target.value)}
                  placeholder="Açıklama girin..."
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
