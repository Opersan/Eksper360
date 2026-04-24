import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Camera, Save } from 'lucide-react'
import type { Expertise } from '../../types/expertise'
import { TRANSMISSION_TYPES } from '../../constants/expertise'

const PLATE_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])\s?[A-ZÇŞÜĞİÖ]{1,3}\s?[0-9]{2,4}$/i

const schema = z.object({
  plate: z.string()
    .min(1, 'Plaka zorunludur')
    .refine(v => PLATE_REGEX.test(v.trim()), 'Geçersiz plaka formatı (örn: 34 ABC 123)'),
  customer_name: z.string().optional(),
  km: z.string().optional(),
  transmission_type: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  expertise: Expertise
  onSave: (updates: Partial<Expertise>) => Promise<{ error: unknown } | undefined>
  onPhotoUpload: (file: File) => Promise<{ url: string | null; error: string | null }>
}

export default function StepGeneralInfo({ expertise, onSave, onPhotoUpload }: Props): JSX.Element {
  const [photos, setPhotos] = useState<string[]>(expertise.photos || [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      plate: expertise.plate,
      customer_name: expertise.customer_name || '',
      km: expertise.km || '',
      transmission_type: expertise.transmission_type || '',
    },
  })

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    setUploading(true)
    setUploadError(null)
    const newPhotos: string[] = []
    
    for (const file of files.slice(0, 2 - photos.length)) {
      const { url, error } = await onPhotoUpload(file)
      if (url) {
        newPhotos.push(url)
      } else {
        setUploadError(error || 'Fotoğraf yüklenemedi.')
      }
    }
    
    const updated = [...photos, ...newPhotos]
    setPhotos(updated)
    await onSave({ photos: updated })
    setUploading(false)
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = async (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    await onSave({ photos: updated })
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    await onSave({ ...data, photos })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Plaka <span className="text-red-500">*</span>
          </label>
          {(() => {
            const plateField = register('plate')
            return (
              <input
                {...plateField}
                onChange={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^0-9A-Za-zÇçŞşÜüĞğİiÖö\s]/g, '')
                    .toUpperCase()
                    .slice(0, 9)
                  plateField.onChange(e)
                }}
                type="text"
                maxLength={9}
                placeholder="34 ABC 123"
                className="input-field uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            )
          })()}
          {errors.plate && <p className="mt-1 text-xs text-red-600">{errors.plate.message}</p>}
        </div>

        <div>
          <label className="label">Müşteri Adı</label>
          <input {...register('customer_name')} type="text" className="input-field" />
        </div>

        <div>
          <label className="label">Kilometre</label>
          <input {...register('km')} type="text" placeholder="85000" className="input-field" />
        </div>

        <div>
          <label className="label">Şanzıman Tipi</label>
          <select {...register('transmission_type')} className="input-field">
            <option value="">Seçin</option>
            {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="label flex items-center gap-2">
          <Camera size={16} className="text-gray-500" />
          Araç Fotoğrafları (maks. 2)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={photo} alt={`Fotoğraf ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 2 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={20} />
                  <span className="text-xs">Fotoğraf Ekle</span>
                </>
              )}
            </button>
          )}
        </div>
        {uploadError && (
          <p className="mt-1 text-xs text-red-600">{uploadError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      <button
        type="submit"
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
    </form>
  )
}
