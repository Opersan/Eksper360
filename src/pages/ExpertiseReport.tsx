import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Download, CheckCircle, XCircle, Minus } from 'lucide-react'
import { getExpertiseById, updateExpertise } from '../services/expertiseService'
import type { BodyCheck, Expertise } from '../types/expertise'
import { formatDate } from '../utils/date'
import { downloadPDF } from '../utils/pdf'

// ─── Renk haritası ────────────────────────────────────────────────────────────
const BODY_COLORS: Record<string, { fill: string; stroke: string }> = {
  'Orijinal':     { fill: '#dcfce7', stroke: '#16a34a' },
  'Boyalı':       { fill: '#fef9c3', stroke: '#ca8a04' },
  'Değişen':      { fill: '#fee2e2', stroke: '#dc2626' },
  'Lokal Boyalı': { fill: '#ffedd5', stroke: '#ea580c' },
  'Hasarlı':      { fill: '#fecaca', stroke: '#991b1b' },
}

const BADGE: Record<string, string> = {
  'Orijinal':     'bg-green-100 text-green-700',
  'Boyalı':       'bg-yellow-100 text-yellow-700',
  'Değişen':      'bg-red-100 text-red-700',
  'Lokal Boyalı': 'bg-orange-100 text-orange-700',
  'Hasarlı':      'bg-red-200 text-red-900',
}

// ─── Bölüm başlığı ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-900 text-white text-center py-2 font-bold text-sm tracking-wide uppercase">
      {children}
    </div>
  )
}

// ─── Mini sayfa başlığı ───────────────────────────────────────────────────────
function PageBand({ reportNo, plate }: { reportNo: string; plate: string }) {
  return (
    <div className="bg-orange-600 text-white px-6 py-2.5 flex justify-between items-center">
      <span className="font-extrabold text-sm tracking-widest">EKSPERTİZ</span>
      <div className="grid grid-cols-2 gap-x-3 text-xs">
        <span className="text-orange-200">Rapor No</span><span>: {reportNo}</span>
        <span className="text-orange-200">Plaka</span><span>: {plate}</span>
      </div>
    </div>
  )
}

// ─── Araç kaporta diyagramı (SVG) ────────────────────────────────────────────
function CarBodyDiagram({ bodyChecks }: { bodyChecks: BodyCheck[] }) {
  const col = (name: string) => {
    const status = bodyChecks.find(c => c.partName === name)?.status || 'Orijinal'
    return BODY_COLORS[status] || { fill: '#f1f5f9', stroke: '#94a3b8' }
  }
  const f = (n: string) => col(n).fill
  const s = (n: string) => col(n).stroke

  return (
    <svg viewBox="0 0 200 390" className="w-44 mx-auto" style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.15))' }}>
      {/* Dış gövde */}
      <path d="M62,10 Q100,5 138,10 L154,28 L164,62 L164,328 L152,368 Q100,376 48,368 L36,328 L36,62 L46,28 Z"
        fill="#e2e8f0" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Kaput */}
      <path d="M64,13 Q100,9 136,13 L148,28 L150,96 L50,96 L52,28 Z"
        fill={f('Kaput')} stroke={s('Kaput')} strokeWidth="1.5" />
      {/* Ön cam */}
      <path d="M67,98 L133,98 L128,118 L72,118 Z"
        fill="rgba(186,230,253,0.7)" stroke="#7dd3fc" strokeWidth="0.75" />
      {/* Tavan */}
      <rect x="57" y="120" width="86" height="130" rx="3"
        fill={f('Tavan')} stroke={s('Tavan')} strokeWidth="1.5" />
      {/* Arka cam */}
      <path d="M72,252 L128,252 L133,272 L67,272 Z"
        fill="rgba(186,230,253,0.7)" stroke="#7dd3fc" strokeWidth="0.75" />
      {/* Bagaj */}
      <path d="M50,274 L150,274 L148,352 Q100,364 52,352 Z"
        fill={f('Bagaj')} stroke={s('Bagaj')} strokeWidth="1.5" />
      {/* Sol Ön Çamurluk */}
      <path d="M37,30 L56,30 L56,96 L38,96 L37,62 Z"
        fill={f('Sol Ön Çamurluk')} stroke={s('Sol Ön Çamurluk')} strokeWidth="1.5" />
      {/* Sağ Ön Çamurluk */}
      <path d="M163,30 L144,30 L144,96 L162,96 L163,62 Z"
        fill={f('Sağ Ön Çamurluk')} stroke={s('Sağ Ön Çamurluk')} strokeWidth="1.5" />
      {/* Sol Ön Kapı */}
      <rect x="36" y="120" width="19" height="64" rx="2"
        fill={f('Sol Ön Kapı')} stroke={s('Sol Ön Kapı')} strokeWidth="1.5" />
      {/* Sağ Ön Kapı */}
      <rect x="145" y="120" width="19" height="64" rx="2"
        fill={f('Sağ Ön Kapı')} stroke={s('Sağ Ön Kapı')} strokeWidth="1.5" />
      {/* Sol Arka Kapı */}
      <rect x="36" y="186" width="19" height="64" rx="2"
        fill={f('Sol Arka Kapı')} stroke={s('Sol Arka Kapı')} strokeWidth="1.5" />
      {/* Sağ Arka Kapı */}
      <rect x="145" y="186" width="19" height="64" rx="2"
        fill={f('Sağ Arka Kapı')} stroke={s('Sağ Arka Kapı')} strokeWidth="1.5" />
      {/* Sol Arka Çamurluk */}
      <path d="M37,252 L56,252 L56,354 L37,338 Z"
        fill={f('Sol Arka Çamurluk')} stroke={s('Sol Arka Çamurluk')} strokeWidth="1.5" />
      {/* Sağ Arka Çamurluk */}
      <path d="M163,252 L144,252 L144,354 L163,338 Z"
        fill={f('Sağ Arka Çamurluk')} stroke={s('Sağ Arka Çamurluk')} strokeWidth="1.5" />
      {/* Tekerlekler */}
      <ellipse cx="38" cy="77"  rx="7" ry="11" fill="#1f2937" />
      <ellipse cx="162" cy="77" rx="7" ry="11" fill="#1f2937" />
      <ellipse cx="38" cy="308"  rx="7" ry="11" fill="#1f2937" />
      <ellipse cx="162" cy="308" rx="7" ry="11" fill="#1f2937" />
    </svg>
  )
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
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

  const reportNo = expertise.id.replace(/-/g, '').slice(0, 10).toUpperCase()
  const reportDate = new Date().toLocaleDateString('tr-TR')
  const nonOriginal = expertise.body_checks.filter(c => c.status !== 'Orijinal')

  return (
    <div className="min-h-screen bg-gray-300">
      {/* Toolbar */}
      <div className="no-print bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/expertises/${id}`)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Ekspertiz Raporu</h1>
            <p className="text-xs text-gray-500">{expertise.plate}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            {pdfLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download size={14} />}
            PDF İndir
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 text-sm py-1.5">
            <Printer size={14} />
            Yazdır
          </button>
        </div>
      </div>

      {/* Rapor sayfaları */}
      <div id="report-content" ref={printRef} className="max-w-3xl mx-auto py-6 px-4 space-y-6 print:space-y-0 print:py-0 print:px-0 print:max-w-full">

        {/* ═══ SAYFA 1: Ana Bilgiler ═══ */}
        <div className="bg-white shadow-xl print:shadow-none print:break-after-page">
          {/* Turuncu başlık */}
          <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-start">
            <div>
              <div className="text-2xl font-extrabold tracking-widest">EKSPERTİZ</div>
              <div className="text-orange-200 text-xs mt-0.5">Oto Ekspertiz Sistemi</div>
            </div>
            <div className="text-right text-xs min-w-[170px]">
              <div className="grid grid-cols-2 gap-x-2">
                <span className="text-orange-200 text-right">Rapor No</span><span className="font-bold">: {reportNo}</span>
                <span className="text-orange-200 text-right">Tarih</span><span>: {reportDate}</span>
                <span className="text-orange-200 text-right">Plaka</span><span className="font-bold">: {expertise.plate}</span>
                <span className="text-orange-200 text-right">KM</span><span>: {expertise.km || '—'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Rapor Bilgileri + Hizmetler */}
            <div className="grid grid-cols-2 border border-gray-300 rounded overflow-hidden">
              <div>
                <SectionTitle>RAPOR BİLGİLERİ</SectionTitle>
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      ['Rapor No', reportNo],
                      ['Araç Kabul Tarihi', formatDate(expertise.created_at)],
                      ['Son Güncelleme', formatDate(expertise.updated_at)],
                    ].map(([l, v]) => (
                      <tr key={l} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-500 w-36">{l}</td>
                        <td className="py-2 px-3 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-l border-gray-300">
                <SectionTitle>UYGULANAN HİZMETLER</SectionTitle>
                <div className="grid grid-cols-2 gap-y-2 p-3 text-xs">
                  {['Kaporta / Boya Kontrol', 'İç Kontrol', 'Motor Kontrol', 'Mekanik Kontrol', 'Lastik Kontrol', 'OBD/Beyin Kontrol'].map(srv => (
                    <div key={srv} className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Araç Bilgileri */}
            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>ARAÇ BİLGİLERİ</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 text-xs divide-x divide-y divide-gray-200">
                {[
                  ['Plaka', expertise.plate],
                  ['Müşteri', expertise.customer_name || '—'],
                  ['Vites', expertise.transmission_type || '—'],
                  ['KM', expertise.km || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="p-2.5">
                    <div className="text-gray-400 mb-0.5">{label}</div>
                    <div className="font-semibold">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Araç Görselleri */}
            {expertise.photos.length > 0 && (
              <div className="border border-gray-300 rounded overflow-hidden">
                <SectionTitle>ARAÇ GÖRSELLERİ</SectionTitle>
                <div className="grid grid-cols-2 gap-3 p-4">
                  {expertise.photos.map((photo, i) => (
                    <img key={i} src={photo} alt={`Fotoğraf ${i + 1}`} className="w-full rounded aspect-video object-cover border border-gray-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Bilgilendirme */}
            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>BİLGİLENDİRME</SectionTitle>
              <div className="p-3 text-xs text-gray-600 space-y-1 leading-relaxed">
                <p>* Plastik aksamların kontrolü yapılmamaktadır.</p>
                <p>* Sökülüp takılan kaporta parçaları değişmiş kabul edilir.</p>
                <p>* Yazılan kilometre bilgisi gösterge ekranındaki km bilgisidir, kesinlik teşkil etmez.</p>
                <p>* Kayıt bilgileri, varsa ruhsat, yoksa müşteri beyanı dikkate alınır.</p>
                <p>* Bu rapor ekspertizi yaptıran kişi için geçerlidir, 3. şahıslara devredilemez.</p>
              </div>
            </div>

            {/* Onay */}
            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>ONAY</SectionTitle>
              <div className="grid grid-cols-3 divide-x text-center text-xs py-8">
                <div className="px-4">
                  <div className="font-bold mb-2">Müşteri Onayı</div>
                  <div className="text-gray-500">{expertise.customer_name || '—'}</div>
                </div>
                <div className="px-4">
                  <div className="font-bold mb-2">Firma Onayı</div>
                </div>
                <div className="px-4">
                  <div className="font-bold mb-2">Satıcı Onayı</div>
                  <div className="text-gray-400">GSM:</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SAYFA 2: Kaporta / Boya ═══ */}
        <div className="bg-white shadow-xl print:shadow-none print:break-after-page">
          <PageBand reportNo={reportNo} plate={expertise.plate} />
          <div className="p-5">
            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>KAPORTA / BOYA EKSPERTİZ RAPORU</SectionTitle>
              {/* Renk açıklaması */}
              <div className="flex flex-wrap gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs">
                {Object.entries(BODY_COLORS).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded border" style={{ background: val.fill, borderColor: val.stroke }} />
                    <span>{key}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-5 p-4">
                {/* Araç diyagramı */}
                <div className="flex-shrink-0">
                  <CarBodyDiagram bodyChecks={expertise.body_checks} />
                </div>
                {/* Tablo */}
                <div className="flex-1 min-w-0">
                  <table className="w-full text-xs border border-gray-200 rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left py-2 px-2 font-semibold border-b border-gray-200">Parça</th>
                        <th className="text-left py-2 px-2 font-semibold border-b border-gray-200">Durum</th>
                        <th className="text-left py-2 px-2 font-semibold border-b border-gray-200">Not</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expertise.body_checks.map((check, i) => (
                        <tr key={check.partName} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                          <td className="py-1.5 px-2 border-b border-gray-100 font-medium">{check.partName}</td>
                          <td className="py-1.5 px-2 border-b border-gray-100">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${BADGE[check.status] || 'bg-gray-100 text-gray-600'}`}>
                              {check.status}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 border-b border-gray-100 text-gray-500">{check.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {nonOriginal.length > 0 && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs">
                      <p className="font-bold text-amber-800 mb-1">Kaporta/Boya Kontrol Özeti:</p>
                      <p className="text-amber-700 leading-relaxed">
                        {nonOriginal.map(c => `${c.partName}: ${c.status}${c.note ? ` (${c.note})` : ''}`).join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SAYFA 3: İç/Dış Kontrol + Lastik ═══ */}
        <div className="bg-white shadow-xl print:shadow-none print:break-after-page">
          <PageBand reportNo={reportNo} plate={expertise.plate} />
          <div className="p-5 space-y-4">
            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>İÇ/DIŞ KONTROL EKSPERTİZ RAPORU</SectionTitle>
              <table className="w-full text-xs">
                <tbody>
                  {expertise.inspection_checks.map((check, i) => (
                    <tr key={check.name} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <td className="py-2 px-3 font-medium w-44">{check.name} Kontrolü</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {check.result === 'Uygun' && <><CheckCircle size={12} className="text-green-600" /><span className="text-green-700">İyi</span></>}
                          {check.result === 'Uygun Değil' && <><XCircle size={12} className="text-red-600" /><span className="text-red-700 font-semibold">Kötü</span></>}
                          {check.result === 'Kontrol Edilmedi' && <><Minus size={12} className="text-gray-400" /><span className="text-gray-500">Kontrol Edilmedi</span></>}
                        </div>
                        {check.note && <p className="mt-0.5 text-xs font-semibold text-gray-700">Not: {check.note}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-gray-300 rounded overflow-hidden">
              <SectionTitle>LASTİK KONTROL EKSPERTİZ RAPORU</SectionTitle>
              <div className="grid grid-cols-2 divide-x divide-y text-xs">
                {[
                  ['Ön Sol Lastik Derinliği', expertise.tire_info.frontLeft],
                  ['Ön Sağ Lastik Derinliği', expertise.tire_info.frontRight],
                  ['Arka Sol Lastik Derinliği', expertise.tire_info.rearLeft],
                  ['Arka Sağ Lastik Derinliği', expertise.tire_info.rearRight],
                ].map(([label, val]) => (
                  <div key={label} className="p-2.5">
                    <div className="text-gray-400 mb-0.5">{label}</div>
                    <div className="font-semibold">{val ? `${val} mm` : '—'}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x border-t border-gray-200 text-xs">
                <div className="p-2.5">
                  <div className="text-gray-400 mb-0.5">Lastik Türü</div>
                  <div className="font-semibold">{expertise.tire_info.tireType || '—'}</div>
                </div>
                <div className="p-2.5">
                  <div className="text-gray-400 mb-0.5">Üretim Yılı</div>
                  <div className="font-semibold">{expertise.tire_info.productionYear || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SAYFA 4: Motor + Mekanik Notlar (varsa) ═══ */}
        {(expertise.engine_note || expertise.mechanical_note) && (
          <div className="bg-white shadow-xl print:shadow-none">
            <PageBand reportNo={reportNo} plate={expertise.plate} />
            <div className="p-5 space-y-4">
              {expertise.engine_note && (
                <div className="border border-gray-300 rounded overflow-hidden">
                  <SectionTitle>MOTOR KONTROL EKSPERTİZ RAPORU</SectionTitle>
                  <div className="p-4 text-sm text-gray-800 whitespace-pre-wrap">{expertise.engine_note}</div>
                </div>
              )}
              {expertise.mechanical_note && (
                <div className="border border-gray-300 rounded overflow-hidden">
                  <SectionTitle>MEKANİK KONTROL EKSPERTİZ RAPORU</SectionTitle>
                  <div className="p-4 text-sm text-gray-800 whitespace-pre-wrap">{expertise.mechanical_note}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


