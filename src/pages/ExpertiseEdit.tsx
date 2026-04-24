import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getExpertiseById, updateExpertise } from '../services/expertiseService'
import { uploadPhoto } from '../services/storageService'
import { useAuth } from '../hooks/useAuth'
import type { Expertise } from '../types/expertise'
import {
  DEFAULT_BODY_CHECKS,
  DEFAULT_INSPECTION_CHECKS,
  DEFAULT_TIRE_INFO,
  STEPS,
} from '../constants/expertise'

// Step components
import StepGeneralInfo from '../components/steps/StepGeneralInfo'
import StepBodyChecks from '../components/steps/StepBodyChecks'
import StepInspectionChecks from '../components/steps/StepInspectionChecks'
import StepTireInfo from '../components/steps/StepTireInfo'
import StepEngineNote from '../components/steps/StepEngineNote'
import StepMechanicalNote from '../components/steps/StepMechanicalNote'
import StepPreview from '../components/steps/StepPreview'

export default function ExpertiseEdit() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expertise, setExpertise] = useState<Expertise | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getExpertiseById(id).then(({ data, error }) => {
      if (error || !data) {
        setError('Ekspertiz bulunamadı')
      } else {
        // Ensure defaults
        setExpertise({
          ...data,
          body_checks: data.body_checks?.length ? data.body_checks : DEFAULT_BODY_CHECKS,
          inspection_checks: data.inspection_checks?.length ? data.inspection_checks : DEFAULT_INSPECTION_CHECKS,
          tire_info: data.tire_info && Object.keys(data.tire_info).length ? data.tire_info : DEFAULT_TIRE_INFO,
        })
      }
      setLoading(false)
    })
  }, [id])

  const handleSaveStep = async (updates: Partial<Expertise>) => {
    if (!id || !expertise) return
    setSaving(true)
    const { data, error } = await updateExpertise(id, updates)
    if (!error && data) {
      setExpertise(data)
    }
    setSaving(false)
    return { error }
  }

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    if (!user || !id) return null
    const { url } = await uploadPhoto(user.id, id, file)
    return url
  }

  const handleComplete = async () => {
    if (!id) return
    setSaving(true)
    await updateExpertise(id, { status: 'completed' })
    setSaving(false)
    navigate(`/expertises/${id}`)
  }

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
        <p className="text-red-500">{error || 'Ekspertiz yüklenemedi'}</p>
        <button onClick={() => navigate('/expertises')} className="mt-4 btn-secondary">
          Geri Dön
        </button>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepGeneralInfo
            expertise={expertise}
            onSave={handleSaveStep}
            onPhotoUpload={handlePhotoUpload}
          />
        )
      case 2:
        return (
          <StepBodyChecks
            bodyChecks={expertise.body_checks}
            onSave={(body_checks) => handleSaveStep({ body_checks, status: 'in_progress' })}
          />
        )
      case 3:
        return (
          <StepInspectionChecks
            checks={expertise.inspection_checks}
            onSave={(inspection_checks) => handleSaveStep({ inspection_checks })}
          />
        )
      case 4:
        return (
          <StepTireInfo
            tireInfo={expertise.tire_info}
            onSave={(tire_info) => handleSaveStep({ tire_info })}
          />
        )
      case 5:
        return (
          <StepEngineNote
            note={expertise.engine_note || ''}
            onSave={(engine_note) => handleSaveStep({ engine_note })}
          />
        )
      case 6:
        return (
          <StepMechanicalNote
            note={expertise.mechanical_note || ''}
            onSave={(mechanical_note) => handleSaveStep({ mechanical_note })}
          />
        )
      case 7:
        return (
          <StepPreview
            expertise={expertise}
            onComplete={handleComplete}
            saving={saving}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/expertises/${id}`)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ekspertiz Düzenle</h1>
          <p className="text-sm text-gray-500">{expertise.plate}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="card p-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'text-green-700 bg-green-50 hover:bg-green-100'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={14} />
                  ) : (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                      isCurrent ? 'bg-white text-blue-600 border-white' : 'border-current'
                    }`}>
                      {step.id}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight size={14} className="text-gray-300 mx-0.5 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Adım {currentStep}: {STEPS[currentStep - 1].title}
          </h2>
        </div>
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 7 && (
        <div className="flex justify-between gap-3">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Önceki
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
            className="btn-primary flex items-center gap-2"
          >
            Sonraki
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
