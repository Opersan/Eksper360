import { useState } from 'react'
import { Save } from 'lucide-react'

interface Props {
  note: string
  onSave: (note: string) => Promise<{ error: unknown } | undefined>
}

export default function StepEngineNote({ note, onSave }: Props) {
  const [value, setValue] = useState(note)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(value)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Motor durumu hakkında gözlemlerinizi girin.
      </p>
      <div>
        <label className="label">Motor Kontrol Notu</label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          placeholder="Motor çalışma durumu, yağ sızıntısı, ses anomalileri, vb..."
          className="input-field resize-none"
        />
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
