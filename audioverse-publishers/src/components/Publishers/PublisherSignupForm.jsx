'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Publisher signup CTA. The old Vite version was a self-contained lead form
 * that generated fake credentials client-side and emailed them via EmailJS.
 * In the merged app the real signup lives at /auth/signup (Supabase-backed),
 * so this is now a CTA that routes there. The `formRef` prop is preserved so
 * the page's "Get started" scroll-to-form behaviour keeps working.
 */
export default function PublisherSignupForm({ formRef }) {
  return (
    <section ref={formRef} className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Become a Publisher</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Create your account, verify your platform, and get API credentials —
          all in a few minutes.
        </p>

        <div className="glass rounded-2xl p-6 lg:p-8 max-w-2xl mx-auto text-center">
          <ul className="text-sm text-gray-300 space-y-2 mb-8 inline-block text-left">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              60% revenue share, paid monthly
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Brand-safe, IAB-compliant demand
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Real-time analytics dashboard
            </li>
          </ul>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold text-sm transition-colors shadow-lg shadow-primary-500/30"
            >
              Create Publisher Account
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors border border-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
