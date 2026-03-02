import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

// EmailJS config — replace with real values
const EMAILJS_SERVICE_ID = 'service_audioverse';
const EMAILJS_TEMPLATE_ID = 'template_publisher';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

function generateId(prefix) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

const INITIAL_FORM = {
  companyName: '',
  contactName: '',
  email: '',
  website: '',
  platform: '',
  mau: '',
  description: '',
};

export default function PublisherSignupForm({ formRef }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const isValid = form.companyName && form.contactName && form.email && form.website;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');

    const pubId = generateId('pub');
    const apiKey = `ak_live_${crypto.randomUUID().replace(/-/g, '')}`;

    // Store credentials
    const creds = { pubId, apiKey, ...form, createdAt: new Date().toISOString() };
    try {
      const stored = JSON.parse(localStorage.getItem('audioverse_publisher_creds') || '[]');
      stored.push(creds);
      localStorage.setItem('audioverse_publisher_creds', JSON.stringify(stored));
    } catch { /* ignore storage errors */ }

    // Send email notification
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          company_name: form.companyName,
          contact_name: form.contactName,
          email: form.email,
          website: form.website,
          platform: form.platform,
          mau: form.mau,
          description: form.description,
          pub_id: pubId,
          api_key: apiKey,
          to_email: 'deanm@mediaverse.ai',
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch {
      // Email send failed — credentials still generated
      console.warn('EmailJS send failed — credentials generated locally');
    }

    setCredentials({ pubId, apiKey });
    setSubmitting(false);
  };

  const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2';

  return (
    <section ref={formRef} className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Publisher Sign Up</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Create your account and receive API credentials instantly.
        </p>

        <div className="glass rounded-2xl p-6 lg:p-8 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!credentials ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={update('companyName')}
                      placeholder="Acme Music Inc."
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Name *</label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={update('contactName')}
                      placeholder="Jane Doe"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="jane@acmemusic.com"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website *</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={update('website')}
                      placeholder="https://acmemusic.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Platform Type</label>
                    <select
                      value={form.platform}
                      onChange={update('platform')}
                      className={inputClass}
                    >
                      <option value="">Select platform...</option>
                      <option value="music-streaming">Music Streaming</option>
                      <option value="podcast">Podcast Platform</option>
                      <option value="radio">Internet Radio</option>
                      <option value="gaming">Gaming / Interactive</option>
                      <option value="fitness">Fitness / Wellness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Monthly Active Users</label>
                    <select
                      value={form.mau}
                      onChange={update('mau')}
                      className={inputClass}
                    >
                      <option value="">Select range...</option>
                      <option value="<10k">Less than 10K</option>
                      <option value="10k-100k">10K - 100K</option>
                      <option value="100k-500k">100K - 500K</option>
                      <option value="500k-1m">500K - 1M</option>
                      <option value="1m+">1M+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Tell us about your platform</label>
                  <textarea
                    value={form.description}
                    onChange={update('description')}
                    placeholder="Brief description of your app and audience..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-colors shadow-lg shadow-primary-500/30"
                >
                  {submitting ? 'Creating Account...' : 'Create Publisher Account'}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-bold mb-2">Account Created!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Save your credentials below. Your API key will not be shown again.
                </p>

                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="glass-light rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Publisher ID
                    </label>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-primary-300 font-mono">{credentials.pubId}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(credentials.pubId).catch(() => {})}
                        className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="glass-light rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      API Key
                    </label>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-accent-400 font-mono break-all">{credentials.apiKey}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(credentials.apiKey).catch(() => {})}
                        className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 shrink-0 ml-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setCredentials(null); setForm(INITIAL_FORM); }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
                >
                  Create Another Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
