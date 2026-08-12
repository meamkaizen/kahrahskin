import React, { useState, useEffect, useRef } from 'react';
import { UserRole, WaitlistSubmission } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FAQ } from './components/FAQ';
import { SkinDiagnosticDemo } from './components/SkinDiagnosticDemo';
import { WaitlistSuccessModal } from './components/WaitlistSuccessModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';

export default function App() {
  const [waitlistCount, setWaitlistCount] = useState(1428);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<WaitlistSubmission | null>(null);
  const [privacyModalType, setPrivacyModalType] = useState<'privacy' | 'terms' | null>(null);
  const [targetRoleForWaitlist, setTargetRoleForWaitlist] = useState<UserRole>('seeker');

  const waitlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch live waitlist counter from server
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/waitlist/stats');
        const data = await res.json();
        if (data.totalWaitlistCount) {
          setWaitlistCount(data.totalWaitlistCount);
        }
      } catch (err) {
        console.warn('Could not load waitlist stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleScrollToWaitlist = () => {
    if (waitlistRef.current) {
      waitlistRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuccessRegistration = (data: any) => {
    if (data.entry) {
      setSubmissionSuccess(data.entry);
      if (data.stats?.totalWaitlistCount) {
        setWaitlistCount(data.stats.totalWaitlistCount);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1D18] flex flex-col font-sans selection:bg-[#8C4A27]/20 selection:text-[#2C1D18] relative">
      {/* Global Background Image Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=2000&q=80"
          alt="Smooth skin portrait background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-20 mix-blend-multiply filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF6F0]/80 via-[#FAF6F0]/85 to-[#F3ECE1]/90" />
      </div>

      {/* Sticky Top Header */}
      <Header
        onScrollToWaitlist={handleScrollToWaitlist}
      />

      <main className="flex-1 relative z-10">
        {/* Redesigned Hero Section with Waitlist Experience & Three.js Light Shaders */}
        <Hero
          ref={waitlistRef}
          waitlistCount={waitlistCount}
          onSuccessRegistration={handleSuccessRegistration}
          selectedRole={targetRoleForWaitlist}
        />

        {/* Frequently Asked Questions */}
        <FAQ />
      </main>

      {/* Interactive AI Diagnostic Demo Modal */}
      <SkinDiagnosticDemo
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onScrollToWaitlist={handleScrollToWaitlist}
      />

      {/* Registration Success Confirmation Modal */}
      {submissionSuccess && (
        <WaitlistSuccessModal
          submission={submissionSuccess}
          onClose={() => setSubmissionSuccess(null)}
        />
      )}

      {/* Privacy Policy & Terms Modal */}
      <PrivacyTermsModal
        type={privacyModalType}
        onClose={() => setPrivacyModalType(null)}
      />
    </div>
  );
}

