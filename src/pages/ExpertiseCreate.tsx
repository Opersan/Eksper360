import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { createExpertise } from '../services/expertiseService'
import { TRANSMISSION_TYPES } from '../constants/expertise'

const PLATE_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])\s?[A-ZÇŞÜĞİÖ]{1,3}\s?[0-9]{2,4}$/i

const schema = z.object({
  plate: z.string()
    .min(1, 'Plaka zorunludur')
    .refine(v => PLATE_REGEX.test(v.trim()), 'Geçersiz plaka formatı (örn: 34 ABC 123)')
    .transform(v => v.toUpperCase().trim()),
  customer_name: z.string().optional(),
  km: z.string().optional(),
  transmission_type: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ExpertiseCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setError(null)
    setLoading(true)

    try {
      const { data: expertise, error: createError } = await createExpertise(user.id, data)
      if (createError) {
        setError('Kayıt oluşturulurken hata: ' + createError.message)
        return
      }
      navigate(`/expertises/${expertise!.id}/edit`)
    } catch {
      setError('Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ekspertiz</h1>
        <p className="text-sm text-gray-500 mt-1">Temel araç bilgilerini girerek başlayın.</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Car size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Araç Bilgileri</h2>
            <p className="text-xs text-gray-500">Kaydedildikten sonra detaylı form açılır</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {errors.plate && (
              <p className="mt-1 text-xs text-red-600">{errors.plate.message}</p>
            )}
          </div>

          <div>
            <label className="label">Müşteri Adı</label>
            <input
              {...register('customer_name')}
              type="text"
              placeholder="Ad Soyad (opsiyonel)"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">KM</label>
              <input
                {...register('km')}
                type="text"
                placeholder="85000"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Şanzıman</label>
              <select {...register('transmission_type')} className="input-field">
                <option value="">Seçin</option>
                {TRANSMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/expertises')}
              className="btn-secondary flex-1"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Devam Et <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
