export type ExpertiseStatus = 'draft' | 'in_progress' | 'completed' | 'reported'

export interface BodyCheck {
  partName: string
  status: string
  note: string
}

export interface InspectionCheck {
  name: string
  result: string
  note: string
}

export interface TireInfo {
  tireType: string
  productionYear: string
  frontLeft: string
  frontRight: string
  rearLeft: string
  rearRight: string
}

export interface Expertise {
  id: string
  plate: string
  customer_name: string | null
  km: string | null
  transmission_type: string | null
  photos: string[]
  body_checks: BodyCheck[]
  inspection_checks: InspectionCheck[]
  tire_info: TireInfo
  engine_note: string | null
  mechanical_note: string | null
  status: ExpertiseStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface ExpertiseFormData {
  plate: string
  customer_name: string
  km: string
  transmission_type: string
  photos: string[]
  body_checks: BodyCheck[]
  inspection_checks: InspectionCheck[]
  tire_info: TireInfo
  engine_note: string
  mechanical_note: string
  status: ExpertiseStatus
}
