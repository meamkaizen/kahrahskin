import React, { useState } from 'react';
import {
  Scan,
  Sparkles,
  LineChart,
  MessageSquare,
  Store,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Bot
} from 'lucide-react';
import { motion } from 'motion/react';

interface BrandFunction {
  id: string;
  badge: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  accentColor: string;
  highlights: string[];
  fullDetail: string;
  roleBenefit: string;
}

const BRAND_FUNCTIONS: BrandFunction[] = [
  {
    id: 'ai-scan',
    badge: 'OPTICAL COMPUTER VISION',
    title: '1. Live AI Optical Skin Scan',
    shortDesc: 'Photo-based diagnostic scanner calibrated specifically for Fitzpatrick V–VI skin tones.',
    icon: Scan,
    accentColor: '#8C4A27',
    highlights: [
      'Sub-surface Melanin Fitzpatrick index analysis',
      'Skin barrier hydration & transepidermal water loss metrics',
      'Hyperpigmentation depth & inflammation mapping'
    ],
    fullDetail: 'Utilizing advanced computer vision models trained on clinical melanin-rich skin datasets, the AI Scan captures macro-level imagery through uploaded facial photos or skin samples. It analyzes skin barrier integrity, erythema, and pigment distribution in under 10 seconds with clinical accuracy.',
    roleBenefit: 'For Seekers: Instant objective diagnostic score without expensive clinic visits.'
  },
  {
    id: 'ai-recommendation',
    badge: 'ALGORITHMIC MATCHING',
    title: '2. Smart AI Recommendations',
    shortDesc: 'Ingredient-first recommendation engine that screens out harsh irritants and recommends active formulas.',
    icon: Sparkles,
    accentColor: '#A85A32',
    highlights: [
      'Personalized active ingredient dosing (Tranexamic, Azelaic, Ceramides)',
      'Automated screening against steroids, hydroquinone & bleaching agents',
      'Routine synergy & pH compatibility scoring'
    ],
    fullDetail: 'Our AI engine matches your optical scan metrics with verified product formulations. Instead of sponsored ads, recommendations are mathematically scored based on biochemical compatibility, ensuring non-comedogenic, non-irritating formulas tailored to your unique barrier.',
    roleBenefit: 'For Seekers & Brands: Transparent compatibility score for every product in our catalog.'
  },
  {
    id: 'tracking-journal',
    badge: 'BARRIER PROGRESS LOG',
    title: '3. Interactive Tracking Journal',
    shortDesc: 'Visual skin diary to monitor long-term barrier recovery, product performance, and environmental triggers.',
    icon: LineChart,
    accentColor: '#8C4A27',
    highlights: [
      'Side-by-side photographic timeline & hyperpigmentation fading maps',
      'Daily routine compliance & UV / climate exposure logging',
      'Barrier restoration health trend charts'
    ],
    fullDetail: 'Track your skin transformation over weeks and months. The journal automatically correlates daily environmental factors (UV index, humidity) and product usage with changes in your skin score, giving you empirical proof of what truly works.',
    roleBenefit: 'For Seekers: Objective timeline tracking to prove product efficacy over time.'
  },
  {
    id: 'chat-system',
    badge: '24/7 DERMATOLOGICAL ASSISTANT',
    title: '4. AI Specialist Chat & Consultation',
    shortDesc: 'Conversational AI skin assistant for instant ingredient breakdowns and direct specialist guidance.',
    icon: MessageSquare,
    accentColor: '#A85A32',
    highlights: [
      'Instant ingredient safety decoder & routine troubleshooting',
      'Context-aware answers based on your live scan history',
      'Seamless bridge to verified human dermatologists & formulators'
    ],
    fullDetail: 'Ask anything about skincare ingredients, layer ordering, or flare-ups. The AI chat system references your diagnostic history to provide personalized, clinically grounded advice instantly, with the option to escalate complex concerns to verified specialists.',
    roleBenefit: 'For Seekers: 24/7 expert guidance without guesswork or endless online forum searching.'
  },
  {
    id: 'marketplace',
    badge: 'VERIFIED ECOSYSTEM',
    title: '5. Transparent Formulators Marketplace',
    shortDesc: 'Vetted marketplace connecting skin seekers directly with ethical, verified skincare formulators.',
    icon: Store,
    accentColor: '#8C4A27',
    highlights: [
      'Strict verification protocol for ethical, melanin-safe ingredients',
      'Full batch transparency & lab certificate verification',
      'Direct brand-to-seeker communication and custom formulation requests'
    ],
    fullDetail: 'Every brand and product on the KAHRÀH marketplace undergoes rigorous vetting to ensure zero harmful bleaches, steroids, or unlisted irritants. Brands receive aggregated, privacy-first skin insight trends to develop better formulas.',
    roleBenefit: 'For Brands: Direct access to hyper-targeted consumers who value scientific transparency.'
  }
];

export const FounderNote: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ai-scan');

  return (
    <section id="brand-functions" className="py-24 bg-[#FAF6F0]/90 backdrop-blur-[2px] border-t border-[#E8DFD3] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Function Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {BRAND_FUNCTIONS.map((fn) => {
            const Icon = fn.icon;
            const isActive = activeTab === fn.id;
            return (
              <button
                key={fn.id}
                onClick={() => setActiveTab(fn.id)}
                className={`p-4 rounded-[5px] text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between h-full ${
                  isActive
                    ? 'bg-[#8C4A27] text-[#FFFDF9] border-[#8C4A27] shadow-md -translate-y-0.5'
                    : 'bg-white/90 text-[#2C1D18] border-[#E8DFD3] hover:border-[#8C4A27]/50 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-[5px] ${isActive ? 'bg-white/20 text-white' : 'bg-[#FAF6F0] text-[#8C4A27]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-[#FFFDF9]" />}
                  </div>
                  <span className={`block text-[10px] font-eyebrow font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-[#E8DFD3]' : 'text-[#8C4A27]'}`}>
                    {fn.badge}
                  </span>
                  <h3 className="font-sans text-sm font-bold leading-snug">
                    {fn.title.split('. ')[1]}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* 5 Brand Functions Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRAND_FUNCTIONS.map((fn) => {
            const Icon = fn.icon;
            return (
              <div
                key={fn.id}
                onClick={() => setActiveTab(fn.id)}
                className={`bg-white/90 border rounded-[5px] p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group ${
                  activeTab === fn.id ? 'border-[#8C4A27] ring-1 ring-[#8C4A27]' : 'border-[#E8DFD3] hover:border-[#8C4A27]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-[5px] bg-[#8C4A27]/10 text-[#8C4A27]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-eyebrow font-bold text-[#8C4A27] bg-[#8C4A27]/10 px-2 py-1 rounded-[5px]">
                    {fn.badge}
                  </span>
                </div>

                <h4 className="font-sans text-lg font-bold text-[#2C1D18] mb-2 group-hover:text-[#8C4A27] transition-colors">
                  {fn.title}
                </h4>

                <p className="font-sans text-xs text-[#64748B] leading-relaxed mb-4">
                  {fn.shortDesc}
                </p>

                <div className="pt-3 border-t border-[#FAF6F0] flex items-center justify-between text-xs text-[#8C4A27] font-semibold">
                  <span>Explore Function</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

