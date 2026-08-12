import React, { useRef } from 'react';
import { UserRole } from '../types';
import { 
  UserCheck, 
  Store, 
  Sparkles, 
  ShieldCheck, 
  Microscope, 
  CheckCircle2, 
  TrendingUp, 
  Cpu, 
  Lock, 
  ArrowRight,
  GitFork
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

interface EcosystemTreeProps {
  onSelectRoleForWaitlist: (role: UserRole) => void;
}

interface TreeBranch {
  id: string;
  stepNumber: string;
  category: string;
  centerIcon: React.ElementType;
  seekerCard: {
    title: string;
    subtitle: string;
    points: string[];
    badge: string;
  };
  vendorCard: {
    title: string;
    subtitle: string;
    points: string[];
    badge: string;
  };
}

const TREE_BRANCHES: TreeBranch[] = [
  {
    id: 'diagnostics-insights',
    stepNumber: '01',
    category: 'DIAGNOSTICS & MARKET DEMAND',
    centerIcon: Microscope,
    seekerCard: {
      title: '30s AI Optical Skin Scan',
      subtitle: 'Instant clinical-grade analysis using photo upload or preset skin profile',
      points: [
        'Real-time moisture & skin barrier health scoring',
        'Fitzpatrick melanin concentration profile detection',
        'Early hyperpigmentation & inflammation mapping',
      ],
      badge: 'USER: AI ANALYSIS',
    },
    vendorCard: {
      title: 'Real-time Skin Concern Analytics',
      subtitle: 'Market demand data across melanin-rich skin demographics',
      points: [
        'Aggregated insights on prevailing barrier issues & acne trends',
        'Direct connection to high-intent consumer segments',
        'Data-driven demand signals for product inventory planning',
      ],
      badge: 'VENDOR: DEMAND INSIGHTS',
    },
  },
  {
    id: 'matching-verification',
    stepNumber: '02',
    category: 'BIOCOMPATIBLE MATCHING',
    centerIcon: Cpu,
    seekerCard: {
      title: 'Smart Ingredient Compatibility',
      subtitle: 'Zero fillers, zero harsh steroids, zero guesswork',
      points: [
        'Personalized compatibility score for every product',
        'Strict safety filtering against skin-barrier disruptors',
        'Customized daily routines tailored to your specific goals',
      ],
      badge: 'USER: PERSONAL MATCH',
    },
    vendorCard: {
      title: 'Targeted Catalog Placement',
      subtitle: 'Reach buyers whose diagnostic scans match your formulas',
      points: [
        'Zero wasted ad spend on unaligned audiences',
        'Instant customer matching based on active ingredient profiles',
        'Showcase verified clinical lab results directly in-app',
      ],
      badge: 'VENDOR: PRECISION TARGETING',
    },
  },
  {
    id: 'commerce-integrity',
    stepNumber: '03',
    category: 'TRUSTED MARKETPLACE COMMERCE',
    centerIcon: ShieldCheck,
    seekerCard: {
      title: '100% Counterfeit-Free Shopping',
      subtitle: 'Buy directly from certified lab formulators with total confidence',
      points: [
        'Guaranteed authentic products with batch traceability',
        'Full ingredient transparency & sourcing breakdowns',
        'Zero bleaching additives or misleading cosmetic claims',
      ],
      badge: 'USER: GUARANTEED INTEGRITY',
    },
    vendorCard: {
      title: 'Verified Brand Certification',
      subtitle: 'Stand out in an overcrowded marketplace of unverified claims',
      points: [
        'KAHRÀH Verified Lab Seal of Authenticity',
        'Direct-to-consumer sales channel with built-in trust',
        'Exclusive early-access vendor onboarding benefits',
      ],
      badge: 'VENDOR: BRAND CREDIBILITY',
    },
  },
  {
    id: 'tracking-retention',
    stepNumber: '04',
    category: 'PROGRESS & RETENTION',
    centerIcon: TrendingUp,
    seekerCard: {
      title: 'Measurable Skin Journey Tracking',
      subtitle: 'Watch your barrier heal and hyperpigmentation fade over time',
      points: [
        '30/60/90-day side-by-side AI skin photo timeline',
        'Adaptive routine updates as your skin barrier strengthens',
        'Empowering skin confidence backed by clinical progress data',
      ],
      badge: 'USER: CLINICAL PROGRESS',
    },
    vendorCard: {
      title: 'Customer Efficacy & Retention Loop',
      subtitle: 'Build long-term customer relationships rooted in real results',
      points: [
        'Direct customer feedback loops on formulation performance',
        'Automated replenishment subscriptions for high-repeat buyers',
        'R&D insights for next-gen melanin skincare formulations',
      ],
      badge: 'VENDOR: REPEAT GROWTH',
    },
  },
];

export const EcosystemTree: React.FC<EcosystemTreeProps> = ({
  onSelectRoleForWaitlist,
}) => {
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: treeContainerRef,
    offset: ['start 70%', 'end 90%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section 
      id="ecosystem"
      ref={treeContainerRef}
      className="py-24 bg-[#FAF6F0]/90 backdrop-blur-[2px] border-t border-[#E8DFD3] relative overflow-hidden"
    >
      {/* Background Subtle Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8C4A27]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="font-eyebrow text-[#8C4A27] text-xs font-bold tracking-widest uppercase mb-3">
            TWO SIDES • ONE CONNECTED ECOSYSTEM
          </p>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C1D18] tracking-tight leading-tight">
            How KAHRÀH Connects Seekers & Verified Brands
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#64748B] mt-4 leading-relaxed">
            Scroll down to explore how user diagnostics on the left connect directly to vendor capabilities on the right along our interactive ecosystem tree.
          </p>

          {/* Desktop Dual Labels Indicator Bar */}
          <div className="mt-10 hidden md:grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-4 rounded-[5px] bg-white border border-[#E8DFD3] shadow-xs flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-[5px] bg-[#8C4A27] text-[#FFFDF9] flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4 text-[#FFFDF9]" />
              </div>
              <div className="text-left">
                <div className="font-sans font-bold text-sm text-[#2C1D18]">FOR SKINCARE SEEKERS</div>
                <div className="text-xs text-[#64748B]">Left Side • User Journey</div>
              </div>
            </div>

            <div className="p-4 rounded-[5px] bg-white border border-[#E8DFD3] shadow-xs flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-[5px] bg-[#8C4A27] text-[#FFFDF9] flex items-center justify-center font-bold">
                <Store className="w-4 h-4 text-[#FFFDF9]" />
              </div>
              <div className="text-left">
                <div className="font-sans font-bold text-sm text-[#2C1D18]">FOR VERIFIED VENDORS</div>
                <div className="text-xs text-[#64748B]">Right Side • Brand Capabilities</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TREE CONTAINER WITH CENTRAL STICKY-PROGRESS TRUNK LINE */}
        <div className="relative mt-8">
          
          {/* Central Vertical Trunk Background Guide (Desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-12 w-1 bg-[#E8DFD3] rounded-full z-0" />

          {/* Animated Growing Central Trunk Line (Desktop) */}
          <motion.div 
            style={{ height: lineHeight }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 w-1 bg-gradient-to-b from-[#8C4A27] via-[#A85A32] to-[#5C2D15] rounded-full z-10 origin-top shadow-[0_0_12px_rgba(140,74,39,0.3)]"
          />

          {/* Tree Branches Stack */}
          <div className="space-y-16 md:space-y-24 relative z-20">
            {TREE_BRANCHES.map((branch) => {
              const CenterIcon = branch.centerIcon;

              return (
                <div key={branch.id} className="relative">
                  
                  {/* Category Header Label (Center or Top) */}
                  <div className="text-center mb-6 md:mb-8">
                    <p className="text-[#8C4A27] text-xs font-eyebrow tracking-widest uppercase font-bold">
                      STEP {branch.stepNumber} • {branch.category}
                    </p>
                  </div>

                  {/* Side-by-Side Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-stretch relative">

                    {/* Central Node Circle (Desktop overlayed between columns) */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: false, margin: '-100px' }}
                        transition={{ duration: 0.4 }}
                        className="w-12 h-12 rounded-[5px] bg-[#8C4A27] border-2 border-[#5C2D15] text-[#FFFDF9] flex items-center justify-center shadow-md group"
                      >
                        <CenterIcon className="w-5 h-5 text-[#FFFDF9]" />
                      </motion.div>
                    </div>

                    {/* LEFT CARD: USER / SKINCARE SEEKER */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                      className="bg-white/95 border border-[#E8DFD3] hover:border-[#8C4A27]/50 rounded-[5px] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Left Connector Branch Line (Desktop) */}
                      <div className="hidden md:block absolute right-0 top-1/2 w-8 h-[2px] bg-dashed border-t-2 border-dashed border-[#8C4A27]/30 translate-x-full pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] sm:text-[11px] font-eyebrow text-[#8C4A27] font-bold tracking-wider uppercase">
                            {branch.seekerCard.badge}
                          </span>
                          <UserCheck className="w-4 h-4 text-[#8C4A27]" />
                        </div>

                        <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#2C1D18] mb-2 group-hover:text-[#8C4A27] transition-colors">
                          {branch.seekerCard.title}
                        </h3>
                        <p className="font-sans text-xs sm:text-sm text-[#64748B] mb-6">
                          {branch.seekerCard.subtitle}
                        </p>

                        <ul className="space-y-3">
                          {branch.seekerCard.points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2C1D18]">
                              <CheckCircle2 className="w-4 h-4 text-[#8C4A27] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4 border-t border-[#FAF6F0] flex items-center justify-between text-xs text-[#64748B] font-medium">
                        <span>User Experience</span>
                        <span className="text-[#2C1D18] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                          Seeker Feature →
                        </span>
                      </div>
                    </motion.div>

                    {/* RIGHT CARD: VERIFIED VENDOR / BRAND */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                      className="bg-white/95 border border-[#E8DFD3] hover:border-[#8C4A27]/50 rounded-[5px] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Right Connector Branch Line (Desktop) */}
                      <div className="hidden md:block absolute left-0 top-1/2 w-8 h-[2px] bg-dashed border-t-2 border-dashed border-[#8C4A27]/30 -translate-x-full pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] sm:text-[11px] font-eyebrow text-[#8C4A27] font-bold tracking-wider uppercase">
                            {branch.vendorCard.badge}
                          </span>
                          <Store className="w-4 h-4 text-[#8C4A27]" />
                        </div>

                        <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#2C1D18] mb-2 group-hover:text-[#8C4A27] transition-colors">
                          {branch.vendorCard.title}
                        </h3>
                        <p className="font-sans text-xs sm:text-sm text-[#64748B] mb-6">
                          {branch.vendorCard.subtitle}
                        </p>

                        <ul className="space-y-3">
                          {branch.vendorCard.points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2C1D18]">
                              <CheckCircle2 className="w-4 h-4 text-[#8C4A27] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4 border-t border-[#FAF6F0] flex items-center justify-between text-xs text-[#64748B] font-medium">
                        <span>Brand Portal</span>
                        <span className="text-[#2C1D18] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                          Vendor Ability →
                        </span>
                      </div>
                    </motion.div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>



      </div>
    </section>
  );
};
