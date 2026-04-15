import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: "I don't want ads in my app",
    a: "Our ads are audio-only pre-rolls — similar to what Spotify uses. They play before music starts, not during. Average 90% completion rate means users accept them. You control frequency and can disable ads entirely while still using the free content library.",
  },
  {
    q: "I have a premium app — ads feel cheap",
    a: "You can disable ads completely and use our music library as a premium content perk for your users. Many fitness and meditation apps use our content ad-free. You still get free hosting and content — just no revenue share.",
  },
  {
    q: "I already use Spotify API",
    a: "Spotify API costs $99–$500/month and doesn't let you monetize the music. With AudioVerse, you get free content AND earn $720+/month. You can run both side-by-side and compare results.",
  },
  {
    q: "This sounds too good to be true",
    a: "Our model is simple: we make money when you make money. 60/40 revenue split on audio ads. 127 apps are using this today. We use Cloudflare R2 with zero egress fees, which is how we can offer free hosting.",
  },
  {
    q: "I don't have time for this",
    a: "5 minutes to add the ads.txt line + 10 minutes for SDK integration = 15 minutes total. Or use our white-glove onboarding and we do everything for you in 0 minutes of your time.",
  },
  {
    q: "What if I want to remove it later?",
    a: "Delete one line from your app-ads.txt file. Remove the SDK import. No contracts, no lock-in, no cancellation process. Your users, your app, your choice — always.",
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-1 text-left group"
      >
        <span className="text-white/80 font-medium text-sm group-hover:text-white transition-colors pr-4">
          {faq.q}
        </span>
        <span className={`text-white/30 transition-transform shrink-0 ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 px-1 text-white/50 text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="px-4 py-16 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Common Objections</h2>
        <p className="text-white/40 text-center mb-10">We've heard them all — here are honest answers</p>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
