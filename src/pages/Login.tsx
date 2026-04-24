import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Eye, EyeOff, LogIn } from 'lucide-react'
import { signIn } from '../services/authService'
import { setMockSession } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabase'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)

    try {
      const { data: authData, error: authError } = await signIn(data.email, data.password)

      if (authError) {
        setError(authError.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.')
        return
      }

      if (!isSupabaseConfigured && authData?.user) {
        setMockSession({ id: authData.user.id, email: data.email })
      }

      navigate('/dashboard')
    } catch {
      setError('Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setValue('email', 'demo@ekspertiz.com')
    setValue('password', 'demo1234')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Car size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Oto Ekspertiz</h1>
          <p className="text-gray-500 mt-1 text-sm">Veri Toplama ve Raporlama Sistemi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Giriş Yap</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">E-posta Adresi</label>
              <input
                {...register('email')}
                type="email"
                placeholder="eksper@sirket.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Demo Hesabı</p>
            <p className="text-xs text-blue-600">E-posta: demo@ekspertiz.com</p>
            <p className="text-xs text-blue-600">Şifre: demo1234</p>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-2 text-xs text-blue-700 font-medium hover:underline"
            >
              Demo bilgilerini doldur →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Oto Ekspertiz Sistemi
        </p>
      </div>
    </div>
  )
}
