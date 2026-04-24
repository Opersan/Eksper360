import type { BodyCheck, InspectionCheck, TireInfo } from '../types/expertise'

export const BODY_PARTS: string[] = [
  'Kaput',
  'Tavan',
  'Bagaj',
  'Sol Ön Çamurluk',
  'Sağ Ön Çamurluk',
  'Sol Ön Kapı',
  'Sağ Ön Kapı',
  'Sol Arka Kapı',
  'Sağ Arka Kapı',
  'Sol Arka Çamurluk',
  'Sağ Arka Çamurluk',
]

export const BODY_STATUSES: string[] = [
  'Orijinal',
  'Boyalı',
  'Değişen',
  'Lokal Boyalı',
  'Hasarlı',
]

export const INSPECTION_ITEMS: string[] = [
  'Farlar',
  'Stop Lambaları',
  'Camlar',
  'Aynalar',
  'Klima',
  'Multimedya',
  'Emniyet Kemeri',
  'Airbag',
  'Fren Sistemi',
  'Süspansiyon',
]

export const INSPECTION_RESULTS: string[] = [
  'Uygun',
  'Uygun Değil',
  'Kontrol Edilmedi',
]

export const TRANSMISSION_TYPES: string[] = [
  'Manuel',
  'Otomatik',
  'Yarı Otomatik',
  'CVT',
]

export const TIRE_TYPES: string[] = [
  'Yaz',
  'Kış',
  'Dört Mevsim',
]

export const DEFAULT_BODY_CHECKS: BodyCheck[] = BODY_PARTS.map((partName) => ({
  partName,
  status: 'Orijinal',
  note: '',
}))

export const DEFAULT_INSPECTION_CHECKS: InspectionCheck[] = INSPECTION_ITEMS.map((name) => ({
  name,
  result: 'Uygun',
  note: '',
}))

export const DEFAULT_TIRE_INFO: TireInfo = {
  tireType: '',
  productionYear: '',
  frontLeft: '',
  frontRight: '',
  rearLeft: '',
  rearRight: '',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  reported: 'Raporlandı',
}

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  reported: 'bg-purple-100 text-purple-700',
}

export const STEPS = [
  { id: 1, title: 'Genel Bilgiler' },
  { id: 2, title: 'Kaporta' },
  { id: 3, title: 'Kontroller' },
  { id: 4, title: 'Lastik' },
  { id: 5, title: 'Motor' },
  { id: 6, title: 'Mekanik' },
  { id: 7, title: 'Önizleme' },
]
