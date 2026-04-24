import { supabase, isSupabaseConfigured } from './supabase'
import type { Expertise, ExpertiseFormData } from '../types/expertise'
import { DEFAULT_BODY_CHECKS, DEFAULT_INSPECTION_CHECKS, DEFAULT_TIRE_INFO } from '../constants/expertise'

// Mock data for demo when Supabase is not configured
const mockExpertises: Expertise[] = [
  {
    id: 'mock-1',
    plate: '34 ABC 123',
    customer_name: 'Ahmet Yılmaz',
    km: '85000',
    transmission_type: 'Otomatik',
    photos: [],
    body_checks: DEFAULT_BODY_CHECKS,
    inspection_checks: DEFAULT_INSPECTION_CHECKS,
    tire_info: { ...DEFAULT_TIRE_INFO, tireType: 'Yaz', productionYear: '2022' },
    engine_note: 'Motor normal çalışıyor, yağ seviyesi normal.',
    mechanical_note: 'Fren balataları %60, amortisörler normal.',
    status: 'completed',
    created_by: 'mock-user-id',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mock-2',
    plate: '06 DEF 456',
    customer_name: 'Mehmet Kaya',
    km: '120000',
    transmission_type: 'Manuel',
    photos: [],
    body_checks: DEFAULT_BODY_CHECKS.map((c, i) => i === 3 ? { ...c, status: 'Boyalı', note: 'Hafif boya yapılmış' } : c),
    inspection_checks: DEFAULT_INSPECTION_CHECKS,
    tire_info: DEFAULT_TIRE_INFO,
    engine_note: '',
    mechanical_note: '',
    status: 'in_progress',
    created_by: 'mock-user-id',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-3',
    plate: '35 GHI 789',
    customer_name: null,
    km: '45000',
    transmission_type: 'CVT',
    photos: [],
    body_checks: DEFAULT_BODY_CHECKS,
    inspection_checks: DEFAULT_INSPECTION_CHECKS,
    tire_info: DEFAULT_TIRE_INFO,
    engine_note: '',
    mechanical_note: '',
    status: 'draft',
    created_by: 'mock-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

let mockData = [...mockExpertises]

export async function getExpertises(userId: string): Promise<{ data: Expertise[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: mockData.filter(e => e.created_by === userId || userId === 'mock-user-id'), error: null }
  }

  const { data, error } = await supabase
    .from('expertises')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getExpertiseById(id: string): Promise<{ data: Expertise | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const found = mockData.find(e => e.id === id)
    return { data: found || null, error: found ? null : new Error('Kayıt bulunamadı') }
  }

  const { data, error } = await supabase
    .from('expertises')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

export async function createExpertise(
  userId: string,
  formData: Partial<ExpertiseFormData>
): Promise<{ data: Expertise | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const newExpertise: Expertise = {
      id: `mock-${Date.now()}`,
      plate: formData.plate || '',
      customer_name: formData.customer_name || null,
      km: formData.km || null,
      transmission_type: formData.transmission_type || null,
      photos: [],
      body_checks: DEFAULT_BODY_CHECKS,
      inspection_checks: DEFAULT_INSPECTION_CHECKS,
      tire_info: DEFAULT_TIRE_INFO,
      engine_note: null,
      mechanical_note: null,
      status: 'draft',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockData = [newExpertise, ...mockData]
    return { data: newExpertise, error: null }
  }

  const { data, error } = await supabase
    .from('expertises')
    .insert({
      plate: formData.plate,
      customer_name: formData.customer_name || null,
      km: formData.km || null,
      transmission_type: formData.transmission_type || null,
      photos: [],
      body_checks: DEFAULT_BODY_CHECKS,
      inspection_checks: DEFAULT_INSPECTION_CHECKS,
      tire_info: DEFAULT_TIRE_INFO,
      engine_note: null,
      mechanical_note: null,
      status: 'draft',
      created_by: userId,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateExpertise(
  id: string,
  updates: Partial<ExpertiseFormData>
): Promise<{ data: Expertise | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const index = mockData.findIndex(e => e.id === id)
    if (index === -1) return { data: null, error: new Error('Kayıt bulunamadı') }
    
    mockData[index] = {
      ...mockData[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return { data: mockData[index], error: null }
  }

  const { data, error } = await supabase
    .from('expertises')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteExpertise(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    mockData = mockData.filter(e => e.id !== id)
    return { error: null }
  }

  const { error } = await supabase
    .from('expertises')
    .delete()
    .eq('id', id)

  return { error }
}
