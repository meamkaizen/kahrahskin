import React, { useState, forwardRef } from 'react';
import { UserRole, WaitlistSubmission } from '../types';
import { Sparkles, ArrowRight, User, Store, Mail, AlertCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface WaitlistSectionProps {
  onSuccess: (data: any) => void;
  selectedRole?: UserRole;
}

const SKIN_CONCERNS_OPTIONS = [
  'Hyperpigmentation / Dark Marks',
  'Breakouts & Acne Management',
  'Barrier Damage & Redness',
  'Transepidermal Moisture Loss',
  'Sensitivity & Eczema Prone',
  'Sun Care for Melanin Skin',
];

const VENDOR_TYPES_OPTIONS = [
  'Independent Clean Formulator',
  'Dermatological Sun Care Brand',
  'Melanin Serum Specialist',
  'Clinical Dermatology Practice',
  'Ingredient Lab / Supplier',
];

export const WaitlistSection = forwardRef<HTMLDivElement, WaitlistSectionProps>(
  ({ onSuccess, selectedRole = 'seeker' }, ref) => {
    const [role, setRole] = useState<UserRole>(selectedRole);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
    const [vendorType, setVendorType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const toggleConcern = (concern: string) => {
      if (selectedConcerns.includes(concern)) {
        setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
      } else {
        setSelectedConcerns([...selectedConcerns, concern]);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage('');

      if (!email || !email.includes('@')) {
        setErrorMessage('Enter a valid email address');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            role,
            skinConcerns: selectedConcerns,
            vendorType: role === 'vendor' ? vendorType : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setErrorMessage(data.error || 'Failed to submit. Please try again.');
          setIsSubmitting(false);
          return;
        }

        onSuccess(data);
        setEmail('');
        setName('');
        setSelectedConcerns([]);
        setVendorType('');
      } catch (err) {
        console.error('Waitlist submit error:', err);
        setErrorMessage('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <section ref={ref} id="waitlist" className="py-24 bg-[#FAF6F0]/90 text-[#2C1D18] border-t border-[#E8DFD3] relative overflow-hidden">
        {/* Background Subtle Pattern */}
        <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <p className="font-eyebrow text-[#8C4A27] text-xs font-bold tracking-widest uppercase mb-3">
              BECOME A FOUNDING MEMBER
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C1D18] tracking-tight">
              Join the KAHRÀH Waitlist
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#64748B] mt-3 max-w-lg mx-auto leading-relaxed">
              Be the first to access live smartphone AI skin diagnostics and transparent, verified formulation matching.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/95 border border-[#E8DFD3] p-8 sm:p-10 rounded-[5px] shadow-sm relative"
          >
            {/* Dual Role Selector */}
            <div className="flex bg-[#FAF6F0] p-1.5 rounded-[5px] mb-8 border border-[#E8DFD3]">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`flex-1 py-3 px-4 rounded-[5px] text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'seeker'
                    ? 'bg-[#8C4A27] text-[#FFFDF9] shadow-xs'
                    : 'text-[#64748B] hover:text-[#2C1D18]'
                }`}
              >
                <User className={`w-4 h-4 ${role === 'seeker' ? 'text-[#FFFDF9]' : ''}`} />
                <span>I'm a Skincare Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex-1 py-3 px-4 rounded-[5px] text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'vendor'
                    ? 'bg-[#8C4A27] text-[#FFFDF9] shadow-xs'
                    : 'text-[#64748B] hover:text-[#2C1D18]'
                }`}
              >
                <Store className={`w-4 h-4 ${role === 'vendor' ? 'text-[#FFFDF9]' : ''}`} />
                <span>I'm a Verified Vendor / Brand</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="waitlist-name" className="block text-xs font-eyebrow font-bold text-[#64748B] mb-1.5">
                    FIRST NAME <span className="text-[#94A3B8] text-[10px] font-normal">(OPTIONAL)</span>
                  </label>
                  <input
                    id="waitlist-name"
                    type="text"
                    placeholder="e.g. Amara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF6F0]/50 border border-[#E8DFD3] rounded-[5px] text-sm text-[#2C1D18] placeholder-[#94A3B8] focus:outline-none input-warm-focus"
                  />
                </div>

                <div>
                  <label htmlFor="waitlist-email" className="block text-xs font-eyebrow font-bold text-[#64748B] mb-1.5">
                    EMAIL ADDRESS <span className="text-[#8C4A27]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      placeholder={role === 'seeker' ? 'amara@example.com' : 'brand@verifiedskincare.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0]/50 border border-[#E8DFD3] rounded-[5px] text-sm text-[#2C1D18] placeholder-[#94A3B8] focus:outline-none input-warm-focus"
                    />
                  </div>
                </div>
              </div>

              {/* Seeker Option: Skin Concerns Checkboxes */}
              {role === 'seeker' && (
                <div>
                  <label className="block text-xs font-eyebrow font-bold text-[#64748B] mb-2">
                    PRIMARY SKIN INTERESTS <span className="text-[#94A3B8] text-[10px] font-normal">(OPTIONAL)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SKIN_CONCERNS_OPTIONS.map((concern) => {
                      const isChecked = selectedConcerns.includes(concern);
                      return (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => toggleConcern(concern)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-[5px] border text-left text-xs transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#8C4A27]/10 border-[#8C4A27] text-[#2C1D18] font-semibold'
                              : 'bg-[#FAF6F0]/50 border-[#E8DFD3] text-[#64748B] hover:border-[#8C4A27]/50'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-[#8C4A27] border-[#8C4A27] text-white'
                                : 'border-[#E8DFD3]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{concern}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vendor Option: Brand Category Selection */}
              {role === 'vendor' && (
                <div>
                  <label htmlFor="vendor-type" className="block text-xs font-eyebrow font-bold text-[#64748B] mb-1.5">
                    BRAND / FORMULATOR CLASSIFICATION
                  </label>
                  <select
                    id="vendor-type"
                    value={vendorType}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF6F0]/50 border border-[#E8DFD3] rounded-[5px] text-sm text-[#2C1D18] focus:outline-none input-warm-focus"
                  >
                    <option value="">Select your brand category...</option>
                    {VENDOR_TYPES_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-3 rounded-[5px] border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 font-sans font-bold text-sm text-[#FFFDF9] bg-[#8C4A27] hover:bg-[#70381C] active:bg-[#582B14] rounded-[5px] shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer border border-[#8C4A27]"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {role === 'seeker'
                        ? 'Join the Priority Waitlist'
                        : 'Submit Vendor Verification Application'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#FFFDF9] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-[11px] text-[#64748B]">
              By joining, you agree to receive launch updates. No spam. Privacy guaranteed.
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
);
