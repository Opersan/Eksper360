import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Download, CheckCircle, XCircle, Minus, Car } from 'lucide-react'
import { getExpertiseById, updateExpertise } from '../services/expertiseService'
import type { Expertise } from '../types/expertise'
import { STATUS_LABELS, STATUS_COLORS } from '../constants/expertise'
import { formatDate } from '../utils/date'
import { downloadPDF } from '../utils/pdf'

export default function ExpertiseReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expertise, setExpertise] = useState<Expertise | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    getExpertiseById(id).then(({ data }) => {
      if (data) {
        setExpertise(data)
        // Mark as reported
        if (data.status === 'completed') {
          updateExpertise(id, { status: 'reported' })
        }
      }
      setLoading(false)
    })
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    await downloadPDF('report-content', `Ekspertiz_${expertise?.plate}.pdf`)
    setPdfLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!expertise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Rapor yüklenemedi.</p>
      </div>
    )
  }

  const nonOriginalParts = expertise.body_checks.filter(c => c.status !== 'Orijinal')
  const issues = expertise.inspection_checks.filter(c => c.result === 'Uygun Değil')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="no-print bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/expertises/${id}`)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Ekspertiz Raporu</h1>
            <p className="text-xs text-gray-500">{expertise.plate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="btn-secondary flex items-center gap-2 text-sm py-1.5"
          >
            {pdfLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={14} />
            )}
            PDF İndir
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center gap-2 text-sm py-1.5"
          >
            <Printer size={14} />
            Yazdır
          </button>
        </div>
      </div>

      {/* A4 Report */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div
          ref={printRef}
          id="report-content"
          className="bg-white shadow-xl rounded-xl overflow-hidden"
          style={{ minWidth: '600px' }}
        >
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Car size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">OTO EKSPERTİZ RAPORU</h1>
                  <p className="text-blue-200 text-sm mt-0.5">Araç Değerlendirme ve İnceleme Belgesi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Rapor Tarihi</p>
                <p className="font-semibold">{new Date().toLocaleDateString('tr-TR')}</p>
                <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[expertise.status]} bg-opacity-90`}>
                  {STATUS_LABELS[expertise.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Vehicle Info */}
            <section>
              <SectionTitle>Araç Bilgileri</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <ReportField label="Plaka" value={expertise.plate} highlight />
                <ReportField label="Müşteri Adı" value={expertise.customer_name || '—'} />
                <ReportField label="Kilometre" value={expertise.km ? `${expertise.km} km` : '—'} />
                <ReportField label="Şanzıman" value={expertise.transmission_type || '—'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <ReportField label="Ekspertiz Tarihi" value={formatDate(expertise.created_at)} />
                <ReportField label="Son Güncelleme" value={formatDate(expertise.updated_at)} />
              </div>
            </section>

            <Divider />

            {/* Photos */}
            {expertise.photos.length > 0 && (
              <>
                <section>
                  <SectionTitle>Araç Fotoğrafları</SectionTitle>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {expertise.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Araç fotoğrafı ${i + 1}`}
                        className="w-full rounded-lg object-cover aspect-video border border-gray-200"
                      />
                    ))}
                  </div>
                </section>
                <Divider />
              </>
            )}

            {/* Body Checks */}
            <section>
              <SectionTitle>
                Kaporta Değerlendirmesi
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({nonOriginalParts.length} adet sorunlu parça)
                </span>
              </SectionTitle>
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Parça</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Durum</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expertise.body_checks.map((check) => (
                      <tr key={check.partName} className={check.status !== 'Orijinal' ? 'bg-orange-50/30' : ''}>
                        <td className="py-2.5 px-4 font-medium text-gray-800">{check.partName}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            check.status === 'Orijinal' ? 'bg-green-100 text-green-700' :
                            check.status === 'Hasarlı' || check.status === 'Değişen' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {check.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{check.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Divider />

            {/* Inspection Checks */}
            <section>
              <SectionTitle>
                İç / Dış Kontrol Sonuçları
                {issues.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({issues.length} adet sorun)
                  </span>
                )}
              </SectionTitle>
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Kontrol</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Sonuç</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expertise.inspection_checks.map((check) => (
                      <tr key={check.name} className={check.result === 'Uygun Değil' ? 'bg-red-50/30' : ''}>
                        <td className="py-2.5 px-4 font-medium text-gray-800">{check.name}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {check.result === 'Uygun' && <CheckCircle size={13} className="text-green-500" />}
                            {check.result === 'Uygun Değil' && <XCircle size={13} className="text-red-500" />}
                            {check.result === 'Kontrol Edilmedi' && <Minus size={13} className="text-gray-400" />}
                            <span className={
                              check.result === 'Uygun' ? 'text-green-600' :
                              check.result === 'Uygun Değil' ? 'text-red-600' : 'text-gray-500'
                            }>
                              {check.result}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{check.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Divider />

            {/* Tire Info */}
            <section>
              <SectionTitle>Lastik Bilgileri</SectionTitle>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ReportField label="Lastik Tipi" value={expertise.tire_info.tireType || '—'} />
                <ReportField label="Üretim Yılı" value={expertise.tire_info.productionYear || '—'} />
                <div />
                <ReportField label="Sol Ön" value={expertise.tire_info.frontLeft || '—'} />
                <ReportField label="Sağ Ön" value={expertise.tire_info.frontRight || '—'} />
                <div />
                <ReportField label="Sol Arka" value={expertise.tire_info.rearLeft || '—'} />
                <ReportField label="Sağ Arka" value={expertise.tire_info.rearRight || '—'} />
              </div>
            </section>

            {/* Notes */}
            {(expertise.engine_note || expertise.mechanical_note) && (
              <>
                <Divider />
                <section>
                  <SectionTitle>Kontrol Notları</SectionTitle>
                  <div className="mt-3 grid sm:grid-cols-2 gap-4">
                    {expertise.engine_note && (
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Motor Kontrol</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{expertise.engine_note}</p>
                      </div>
                    )}
                    {expertise.mechanical_note && (
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Mekanik Kontrol</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{expertise.mechanical_note}</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            <Divider />

            {/* Footer */}
            <footer className="text-center text-xs text-gray-400 pt-4">
              <p>Bu rapor Oto Ekspertiz Sistemi tarafından oluşturulmuştur.</p>
              <p className="mt-1">Rapor No: {expertise.id.slice(0, 8).toUpperCase()} · {new Date().toLocaleDateString('tr-TR')}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
      <div className="w-1 h-5 bg-blue-600 rounded-full" />
      {children}
    </h2>
  )
}

function ReportField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-blue-700 text-base' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

function Divider() {
  return <hr className="border-gray-100" />
}
