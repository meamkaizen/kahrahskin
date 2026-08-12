import React from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';

interface PrivacyTermsModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4E342E]/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#F8F4EE] border border-[#D7CCC8] rounded-2xl shadow-2xl overflow-hidden my-8 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#D7CCC8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8D6E63]" />
            <h3 className="font-sans text-xl font-bold text-[#4E342E]">
              {type === 'privacy' ? 'KAHRÀH Skin Privacy Policy' : 'KAHRÀH Terms of Service'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#D7CCC8]/40 text-[#4E342E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-[#5D4037] max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-[#4E342E]">
                At KAHRÀH, your skin scan data and privacy are held with absolute clinical confidentiality.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">1. Face Imagery & Biometric Data</h4>
              <p>
                Smartphone photos and live diagnostic video frames are processed in encrypted volatile memory solely to calculate your Fitzpatrick Melanin Index, barrier moisture, and hyperpigmentation metrics. Facial imagery is never permanently stored on public cloud buckets without explicit user consent.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">2. Zero Data Selling</h4>
              <p>
                We do NOT sell, rent, or trade your personal email, diagnostic metrics, or skin profiles to third-party ad brokers or social media networks.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">3. Verified Vendor Matching</h4>
              <p>
                When you receive product matches, vendors only see aggregated ingredient interest metrics. Your identity remains anonymous.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">4. Data Deletion Rights</h4>
              <p>
                You may request complete deletion of your waitlist email or diagnostic profile at any time by emailing privacy@kahrah.com.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#4E342E]">
                Terms governing your use of KAHRÀH's pre-launch waitlist and AI diagnostic previews.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">1. Diagnostic Disclaimer</h4>
              <p>
                KAHRÀH's AI skin diagnostics provide algorithmic dermatological analysis for educational and personalized product matching. It does not replace emergency medical advice or diagnose malignant skin conditions (such as melanoma). Consult a board-certified dermatologist for medical emergencies.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">2. Waitlist Beta Spots</h4>
              <p>
                Waitlist positions and referral spot boosts guarantee priority invitation sequence for Phase 2 beta rollout.
              </p>
              <h4 className="font-sans font-bold text-[#4E342E] text-sm">3. Vendor Integrity Agreement</h4>
              <p>
                All founding vendors agree to submit lab formulation certificates and abstain from marketing skin bleaching products.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-[#D7CCC8] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#4E342E] text-[#F8F4EE] text-xs font-semibold rounded-full hover:bg-[#5D4037]"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
