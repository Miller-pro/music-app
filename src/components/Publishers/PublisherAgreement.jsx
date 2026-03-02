import { motion } from 'framer-motion';

const TERMS = [
  { label: 'Revenue Share', value: '60% Publisher / 40% Platform' },
  { label: 'Payment Terms', value: 'Net 30' },
  { label: 'Payment Methods', value: 'Wire Transfer, PayPal' },
  { label: 'Minimum Payout', value: '$100' },
  { label: 'Reporting', value: 'Real-time dashboard + monthly reports' },
  { label: 'Contract Length', value: 'Month-to-month (cancel anytime)' },
  { label: 'Ad Quality', value: 'Brand safety filters, category controls' },
  { label: 'Support', value: 'Dedicated account manager for 100K+ MAU' },
];

export default function PublisherAgreement() {
  return (
    <section className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Revenue Share Terms</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Transparent, publisher-friendly terms. No hidden fees.
        </p>

        <div className="glass rounded-2xl p-6 lg:p-8 max-w-2xl mx-auto">
          <div className="space-y-0">
            {TERMS.map((term, i) => (
              <div
                key={term.label}
                className={`flex items-center justify-between py-3.5 ${
                  i < TERMS.length - 1 ? 'border-b border-white/[0.06]' : ''
                }`}
              >
                <span className="text-sm text-gray-400">{term.label}</span>
                <span className="text-sm font-semibold text-white">{term.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating a publisher account, you agree to the AudioVerse Publisher Terms of Service.
              Full agreement available upon account creation. Revenue share rates are guaranteed for
              the duration of your partnership. AudioVerse reserves the right to update platform
              policies with 30 days notice.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
