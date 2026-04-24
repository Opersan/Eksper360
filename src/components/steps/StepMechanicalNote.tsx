import { useState } from 'react'
import { Save } from 'lucide-react'

interface Props {
  note: string
  onSave: (note: string) => Promise<{ error: unknown } | undefined>
}

export default function StepMechanicalNote({ note, onSave }: Props) {
  const [value, setValue] = useState(note)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const result = await onSave(value)
    setSaving(false)
    if (result?.error) {
      setSaveError('Kaydedilemedi. Lütfen tekrar deneyin.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Mekanik durum hakkında gözlemlerinizi girin.
      </p>
      <div>
        <label className="label">Mekanik Kontrol Notu</label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          placeholder="Fren durumu, süspansiyon, direksiyon, vb..."
          className="input-field resize-none"
        />
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
