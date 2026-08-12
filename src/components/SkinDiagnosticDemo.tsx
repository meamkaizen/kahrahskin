import React, { useState } from 'react';
import { SkinDiagnosticResult } from '../types';
import { Sparkles, Camera, Upload, X, CheckCircle2, AlertTriangle, Info, RefreshCw, ArrowRight } from 'lucide-react';

interface SkinDiagnosticDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToWaitlist: () => void;
}

const PRESET_PROFILES = [
  {
    id: 'hyperpigmentation',
    title: 'Melanin Profile A',
    subtitle: 'Post-Inflammatory Hyperpigmentation',
    concerns: ['Post-acne dark marks', 'Uneven tone on jawline', 'Sensitivity'],
    imageSample: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    analysis: {
      skinTypeSummary: 'Melanin-Rich Type IV-VI with PIH Vulnerability',
      melaninHealthNote: 'Naturally high epidermal melanin offers rich photo-protection, but reactive melanocytes trigger lingering brown marks after minor inflammation.',
      metrics: [
        { name: 'Hydration Index', score: 82, status: 'optimal' as const, insight: 'Strong stratum corneum water retention.' },
        { name: 'Barrier Integrity', score: 79, status: 'balanced' as const, insight: 'Slight lipid imbalance around T-zone.' },
        { name: 'Pigment Uniformity', score: 62, status: 'needs_attention' as const, insight: 'Localized melanocyte overactivity detected.' },
        { name: 'Cellular Turnover', score: 70, status: 'balanced' as const, insight: 'Gentle enzymatic exfoliation recommended.' }
      ],
      keyIngredientsToLookFor: ['Azelaic Acid 10%', 'Niacinamide 5%', 'Tranexamic Acid', 'Alpha Arbutin', 'SPF 30+ Mineral Sunscreen'],
      ingredientsToAvoid: ['Harsh Hydroquinone bleached creams', 'Abrasive physical scrubs', 'High-concentration Glycolic Acid peels'],
      recommendedVendorCategories: ['Melanin-First Serums', 'Barrier Repair Creams', 'Zero-White-Cast Sunscreens'],
      compassionateAdvice: 'Your skin is actively protecting itself. Avoid aggressive spot treatments; consistency with gentle tyrosinase inhibitors will yield lasting clarity without damaging your natural glow.'
    }
  },
  {
    id: 'dehydrated_barrier',
    title: 'Melanin Profile B',
    subtitle: 'Transepidermal Moisture Loss',
    concerns: ['Tightness after cleansing', 'Flakiness', 'Dull surface reflection'],
    imageSample: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    analysis: {
      skinTypeSummary: 'Dehydrated Lipid-Deficient Skin Barrier',
      melaninHealthNote: 'Lower ceramide concentration in the lipid matrix leads to accelerated moisture evaporation.',
      metrics: [
        { name: 'Hydration Index', score: 54, status: 'needs_attention' as const, insight: 'Marked moisture deficit in upper epidermis.' },
        { name: 'Barrier Integrity', score: 60, status: 'needs_attention' as const, insight: 'Compromised ceramide and lipid sheath.' },
        { name: 'Pigment Uniformity', score: 85, status: 'optimal' as const, insight: 'Even tone with minimal discoloration.' },
        { name: 'Cellular Turnover', score: 76, status: 'balanced' as const, insight: 'Normal cell renewal rate.' }
      ],
      keyIngredientsToLookFor: ['Multi-Molecular Hyaluronic Acid', 'Ceramides NP/AP/EOP', 'Squalane', 'Centella Asiatica', 'Glycerin'],
      ingredientsToAvoid: ['Drying denatured alcohol', 'Fragrance-heavy cleansers', 'Clay detox masks'],
      recommendedVendorCategories: ['Barrier Restoration Creams', 'Hydration Toners', 'Nourishing Face Oils'],
      compassionateAdvice: 'Prioritize barrier flooding before introducing any active acids. Layering hydrating essences on damp skin will instantly restore softness and elasticity.'
    }
  }
];

export const SkinDiagnosticDemo: React.FC<SkinDiagnosticDemoProps> = ({
  isOpen,
  onClose,
  onScrollToWaitlist,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('hyperpigmentation');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SkinDiagnosticResult | null>(PRESET_PROFILES[0].analysis);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'complete'>('complete');

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (!found) return;

    setSelectedPreset(presetId);
    setUploadedImage(null);
    setAnalyzing(true);
    setScanStep('scanning');

    setTimeout(() => {
      setResult(found.analysis);
      setAnalyzing(false);
      setScanStep('complete');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setAnalyzing(true);
      setScanStep('scanning');

      try {
        const res = await fetch('/api/skin-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            imageMimeType: file.type,
            concerns: ['Custom image diagnostic'],
          }),
        });

        const data = await res.json();
        if (data.success && data.analysis) {
          setResult(data.analysis);
        }
      } catch (err) {
        console.error('Custom image scan failed:', err);
      } finally {
        setAnalyzing(false);
        setScanStep('complete');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#4E342E]/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#F8F4EE] border border-[#D7CCC8] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#4E342E] text-[#F8F4EE]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D7CCC8]" />
            <div>
              <h2 className="font-sans text-lg font-bold">KAHRÀH Live AI Diagnostic Engine</h2>
              <p className="font-sans text-xs text-[#D7CCC8]">Simulated Algorithmic Dermatology Experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#D7CCC8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Preset Selection & Scanner Viewfinder */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-eyebrow text-[#6D4C41] mb-2">
                1. SELECT PROFILE OR UPLOAD PHOTO
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PRESET_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      selectedPreset === p.id && !uploadedImage
                        ? 'border-[#8D6E63] bg-[#4E342E] text-[#F8F4EE] shadow-sm'
                        : 'border-[#D7CCC8] bg-white text-[#4E342E] hover:border-[#8D6E63]'
                    }`}
                  >
                    <div className="font-bold">{p.title}</div>
                    <div className={`text-[11px] truncate ${selectedPreset === p.id && !uploadedImage ? 'text-[#D7CCC8]' : 'text-[#8D6E63]'}`}>
                      {p.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload Input Button */}
              <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-[#8D6E63] rounded-xl text-xs font-medium text-[#4E342E] hover:bg-[#D7CCC8]/20 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#8D6E63]" />
                <span>{uploadedImage ? 'Change Uploaded Photo' : 'Upload Your Own Face Photo'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Viewfinder Frame with AI Scan Effect */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-[#D7CCC8] bg-black">
              <img
                src={
                  uploadedImage ||
                  PRESET_PROFILES.find((p) => p.id === selectedPreset)?.imageSample
                }
                alt="Diagnostic Viewfinder"
                className="w-full h-full object-cover"
              />

              {/* Scanning Overlay Animation */}
              {scanStep === 'scanning' && (
                <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[1px]">
                  <div className="absolute left-0 right-0 h-[3px] bg-[#8C4A27] shadow-[0_0_12px_#8C4A27] animate-scan-sweep" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#0F172A]/90 px-4 py-2 rounded-[1px] border border-[#8C4A27] flex items-center gap-2 text-xs font-mono text-[#F8FAFC]">
                      <RefreshCw className="w-3.5 h-3.5 text-[#CBD5E1] animate-spin" />
                      <span>ANALYZING MELANIN INDEX...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnostic Bounding Overlays */}
              {scanStep === 'complete' && (
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#0F172A]/80 text-[#CBD5E1] px-2 py-1 rounded-[1px] text-[10px] font-mono border border-[#8C4A27]/40">
                      LIVE AI SKIN SCORE: {result?.metrics[0]?.score || 82}%
                    </span>
                    <span className="bg-[#0F172A]/80 text-[#F8FAFC] px-2 py-1 rounded-[1px] text-[10px] font-mono border border-[#8C4A27]">
                      MELANIN FITZPATRICK V-VI
                    </span>
                  </div>
                  {/* Subtle target crosshairs */}
                  <div className="self-center w-28 h-28 border border-dashed border-[#8C4A27]/70 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#8C4A27]" />
                  </div>
                  <div className="text-[10px] text-right font-mono text-[#F8FAFC] bg-black/60 px-2 py-0.5 rounded-[1px] self-end">
                    ALGORITHMIC PRECISION ✓
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Diagnostic Report */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-eyebrow text-[#8C4A27] block mb-1">2. DIAGNOSTIC REPORT</span>
              <h3 className="font-sans text-xl font-bold text-[#0F172A]">
                {result?.skinTypeSummary}
              </h3>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed bg-white/70 p-3 rounded-[1px] border border-[#CBD5E1]">
                <Info className="w-3.5 h-3.5 text-[#8C4A27] inline mr-1.5" />
                {result?.melaninHealthNote}
              </p>
            </div>

            {/* Metrics Breakdown Bar */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans font-semibold text-[#475569] uppercase tracking-wider">
                Skin Barrier & Biomarker Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result?.metrics.map((m, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-[1px] border border-[#CBD5E1]">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-medium text-[#0F172A]">{m.name}</span>
                      <span className="font-mono font-bold text-[#8C4A27]">{m.score}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#CBD5E1]/40 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#0F172A] to-[#8C4A27] rounded-full transition-all duration-500"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#64748B]">{m.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulated Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-950/5 border border-emerald-900/10 p-3.5 rounded-xl">
                <h5 className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Actives to Seek
                </h5>
                <ul className="text-xs text-[#4E342E] space-y-1 list-disc list-inside">
                  {result?.keyIngredientsToLookFor.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/5 border border-amber-900/10 p-3.5 rounded-xl">
                <h5 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Formulations to Avoid
                </h5>
                <ul className="text-xs text-[#4E342E] space-y-1 list-disc list-inside">
                  {result?.ingredientsToAvoid.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compassionate Advice Banner */}
            <div className="p-4 bg-[#4E342E] text-[#F8F4EE] rounded-xl border border-[#6D4C41]">
              <span className="text-[10px] font-eyebrow text-[#D7CCC8] block mb-1">
                COMPASSIONATE DERMATOLOGICAL ADVICE
              </span>
              <p className="text-xs leading-relaxed text-[#D7CCC8]">
                "{result?.compassionateAdvice}"
              </p>
            </div>

            {/* CTA to Join Waitlist for Full Access */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-[#8D6E63]">
                Full live smartphone AI diagnostics will launch in Beta Phase 1.
              </span>
              <button
                onClick={() => {
                  onClose();
                  onScrollToWaitlist();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#4E342E] hover:bg-[#5D4037] text-[#F8F4EE] text-xs font-semibold rounded-full flex items-center justify-center gap-2 group transition-all"
              >
                <span>Get Early Diagnostic Access</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D7CCC8] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
