import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, Search, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('q1');
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FAQItem[] = [
    {
      id: 'q1',
      question: 'What is KAHRÀH?',
      answer:
        'A skincare app that helps you understand your skin, know what it needs, and build a routine that actually makes sense for you. We want to take the confusion out of skincare so you can feel confident in your own skin.',
      category: 'brand',
    },
    {
      id: 'q2',
      question: 'Who founded KAHRÀH, and why?',
      answer:
        'Adebayo Barakah Olamiposi, who spent years trying to understand their own skin and never found advice that felt personal. Everyone was handed the same generic routine, so they built something that starts with you instead.',
      category: 'brand',
    },
    {
      id: 'q3',
      question: 'What does KAHRÀH do?',
      answer: 'Five things:',
      bullets: [
        'AI Skin Analysis — understand your skin and your concerns.',
        'Personalised Recommendations — products suggested for your skin, not everyone’s.',
        'Skin Tracking — follow your routine and your progress over time.',
        'Verified Marketplace — find skincare sellers you can trust.',
        'Community — meet people whose skin behaves like yours.',
      ],
      category: 'general',
    },
    {
      id: 'q4',
      question: 'What happens to my photos and data?',
      answer:
        'Your skin photos and information are personal, so we only collect what we need to give you the service, and we explain plainly how it is stored and used. You should always know what is happening with your information.',
      category: 'privacy',
    },
    {
      id: 'q5',
      question: 'Can it help with acne or eczema?',
      answer:
        'It can point out possible concerns and suggest products that may help. But it is not a dermatologist and it does not diagnose. If something looks serious or is not improving, please see a professional.',
      category: 'ai',
    },
    {
      id: 'q6',
      question: 'How do you check the vendors?',
      answer:
        'Nobody should end up with a fake or questionable product. Vendors go through verification before they can sell here — we check their business details, where their products come from, and other supporting documents.',
      category: 'vendors',
    },
    {
      id: 'q7',
      question: 'How does the skin scan work?',
      answer:
        'It uses your camera to look at what is visible on your skin, combines that with the details you give us, and hands back a clear summary of your skin and any concerns. It is skincare guidance, not a medical diagnosis.',
      category: 'ai',
    },
    {
      id: 'q8',
      question: 'How are products chosen for me?',
      answer:
        'It goes off your skin profile, your concerns, and your preferences. Nothing is picked at random — products are matched to what you are actually trying to achieve with your skin.',
      category: 'ai',
    },
    {
      id: 'q9',
      question: 'What is the tracking journal?',
      answer:
        'Your skincare diary. Log your routine, the products you use, and how your skin changes, so over time you can see what is working for you and what is not.',
      category: 'general',
    },
    {
      id: 'q10',
      question: 'Can I talk to someone about my skin?',
      answer:
        'The AI is there whenever you need it, to help you make sense of your skin, ingredients, products, and routines. When something needs professional attention, you can connect with a qualified dermatologist through the app.',
      category: 'ai',
    },
    {
      id: 'q11',
      question: 'Do you allow bleaching or whitening products?',
      answer:
        'No. KAHRÀH is not built around changing or ‘fixing’ anyone’s natural skin tone. The focus is healthy skin, understanding your skin, and caring for the skin you have.',
      category: 'melanin',
    },
    {
      id: 'q12',
      question: 'Why does skincare AI often get skin tones wrong?',
      answer:
        'A lot of it was trained on data that does not represent different skin tones equally. We use diverse skin data and test across different tones so the system is not built around one type of skin. It is something we will keep watching and improving.',
      category: 'melanin',
    },
    {
      id: 'q13',
      question: 'What do I get for joining the waitlist?',
      answer:
        'Early access. Waitlist members are among the first to try the AI skin analysis when it launches, and any early-access benefits go to them first.',
      category: 'general',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const term = searchTerm.toLowerCase();
    const haystack = [item.question, item.answer, ...(item.bullets ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });

  return (
    <section id="faq" className="py-24 bg-[#FAF6F0]/90 backdrop-blur-[2px] border-t border-[#E8DFD3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="font-eyebrow text-[#8C4A27] font-bold block mb-3 uppercase tracking-wider text-xs">
            QUESTIONS & TRANSPARENCY
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#2C1D18]">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#64748B] mt-3">
            Straight answers about how KAHRÀH works, what happens to your data, and who we let sell here.
          </p>
        </motion.div>

        {/* Search Control */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search questions (e.g. privacy, acne, eczema, vendors, skin tones)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/95 border border-[#E8DFD3] rounded-[5px] text-sm text-[#2C1D18] placeholder-[#94A3B8] focus:outline-none input-warm-focus transition-all"
            />
          </div>
        </motion.div>

        {/* Smooth Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E8DFD3] rounded-[5px] text-xs text-[#64748B]">
              No questions found matching your search. Try searching for "privacy", "acne", or "vendors".
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className={`bg-white/95 border rounded-[5px] overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'border-[#8C4A27] shadow-sm ring-1 ring-[#8C4A27]/20'
                      : 'border-[#E8DFD3] hover:border-[#8C4A27]/40'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-sans text-base sm:text-lg font-bold text-[#2C1D18] hover:text-[#8C4A27] focus:outline-none cursor-pointer group"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isOpen ? 'bg-[#8C4A27]' : 'bg-[#E8DFD3] group-hover:bg-[#8C4A27]/60'}`} />
                      {faq.question}
                    </span>
                    <div className={`p-1 rounded-[5px] transition-colors ${isOpen ? 'bg-[#8C4A27]/10' : 'bg-[#FAF6F0]'}`}>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C4A27] shrink-0 transition-transform duration-300 ease-in-out ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[#64748B] font-sans leading-relaxed border-t border-[#E8DFD3]/60 bg-[#FAF6F0]/40">
                          <p>{faq.answer}</p>
                          {faq.bullets && (
                            <ul className="mt-3 space-y-2">
                              {faq.bullets.map((bullet) => (
                                <li key={bullet} className="flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C4A27] shrink-0 mt-[0.45rem]" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};


