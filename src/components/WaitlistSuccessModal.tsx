import React from 'react';
import { WaitlistSubmission } from '../types';
import { CheckCircle2, ExternalLink, FileText } from 'lucide-react';

interface WaitlistSuccessModalProps {
  submission: WaitlistSubmission;
  onClose: () => void;
  surveyUrl?: string;
}

export const WaitlistSuccessModal: React.FC<WaitlistSuccessModalProps> = ({
  submission,
  onClose,
  surveyUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfA8VxuX-UffZ71L5TFEnVwDN9CRo75cbPCiZOLMh1j_Es7Lg/viewform",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231815]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E6E0D8] rounded-2xl p-6 sm:p-8 shadow-2xl my-8 text-center overflow-hidden">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#8C4A27]/10 border border-[#8C4A27]/20 flex items-center justify-center text-[#8C4A27]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <span className="font-eyebrow text-[#8C4A27] text-xs font-bold block mb-1 uppercase tracking-widest">
          EMAIL CONFIRMED & REGISTERED
        </span>

        <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#1C1615]">
          Your email has been added successfully!
        </h2>

        <p className="font-sans text-xs sm:text-sm text-[#52453E] mt-2 leading-relaxed">
          Thanks for joining KAHRÀH! We've reserved your spot on the waitlist with <strong className="text-[#1C1615]">{submission.email}</strong>.
        </p>

        {/* Survey Callout Card */}
        <div className="my-6 p-5 bg-white border border-[#8C4A27]/30 rounded-xl text-left space-y-3 shadow-xs relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#8C4A27]/10 text-[#8C4A27] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold text-[#1C1615]">
                Quick Skincare Survey
              </h3>
              <p className="font-sans text-xs text-[#6B5E57] mt-0.5 leading-relaxed">
                If you don't mind, could you answer these survey questions to help us tailor our AI skin models to your needs?
              </p>
            </div>
          </div>

          <a
            href={surveyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#8C4A27] hover:bg-[#70381C] text-[#FFFDF9] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer no-underline border border-[#8C4A27]"
          >
            <span>Answer Survey Questions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#FAF7F2] hover:bg-[#E6E0D8] text-[#1C1615] border border-[#E6E0D8] font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Return to KAHRÀH Homepage
        </button>

      </div>
    </div>
  );
};


