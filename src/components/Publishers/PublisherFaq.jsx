import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'What is the minimum traffic requirement?',
    a: 'There is no strict minimum, but we recommend at least 10,000 monthly active users to generate meaningful revenue. Our SDK is lightweight and won\'t impact your app\'s performance regardless of scale.',
  },
  {
    q: 'How does the revenue share work?',
    a: 'Publishers receive 60% of net ad revenue. AudioVerse retains 40% to cover ad operations, demand partnerships, and platform maintenance. Revenue is calculated on a per-impression basis using verified CPM rates.',
  },
  {
    q: 'When and how do I get paid?',
    a: 'Payments are issued on Net 30 terms via wire transfer or PayPal. You\'ll receive a detailed revenue report on the 1st of each month, with payment processed by the 30th. Minimum payout threshold is $100.',
  },
  {
    q: 'What ad formats are supported?',
    a: 'We support Pre-Roll Audio, Mid-Roll Audio, Companion Banners, In-Game Audio, and Contextual Audio ads. Each format is designed to maximize revenue while maintaining a great user experience.',
  },
  {
    q: 'How long does SDK integration take?',
    a: 'Most developers complete integration in under 30 minutes. Our SDK supports JavaScript, React, iOS (Swift), and Android (Kotlin). We provide code examples, documentation, and dedicated integration support.',
  },
  {
    q: 'Can I control which ads appear in my app?',
    a: 'Yes. You can set category blocklists, competitor exclusions, and content filters through your publisher dashboard. We also apply brand safety filters on all ads by default.',
  },
  {
    q: 'What reporting and analytics are available?',
    a: 'Real-time dashboards show impressions, fill rate, CPM, revenue, and audience insights. You can export data via API or CSV. We also provide A/B testing tools for ad placement optimization.',
  },
  {
    q: 'Is the ads.txt file required?',
    a: 'While not strictly required, an ads.txt file significantly improves fill rates and CPMs by verifying you as an authorized seller. Our generator creates an IAB-compliant file in seconds.',
  },
];

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

export default function PublisherFaq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Frequently Asked Questions</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Everything you need to know about publishing with AudioVerse.
        </p>

        <div className="max-w-3xl mx-auto space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronIcon open={openIndex === i} />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 border-t border-white/[0.06]">
                      <p className="text-sm text-gray-400 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
