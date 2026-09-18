import React, { useState, useRef } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { ConsultationFormState, SubmittedBooking, SiteSettings } from '../types';
import { saveInquiry } from '../services/inquiryService';
import { SocialsInquiryPopup } from './SocialsInquiryPopup';

const INITIAL_FORM: ConsultationFormState = {
  fullName: '',
  email: '',
  projectType: 'Video Editing',
  estimatedBudget: '',
  brief: '',
  links: '',
};

const BUDGET_PRESETS = [
  { label: '$100 – $500', value: '100 - 500' },
  { label: '$500 – $1.5k', value: '500 - 1500' },
  { label: '$1.5k – $3k', value: '1500 - 3000' },
  { label: '$3k – $5k', value: '3000 - 5000' },
];

interface ConsultationFormSectionProps {
  settings?: SiteSettings;
}

export const ConsultationFormSection: React.FC<ConsultationFormSectionProps> = ({ settings }) => {
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBooking | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showSocialsPopup, setShowSocialsPopup] = useState(false);
  const [botTrap, setBotTrap] = useState('');
  const [botcheckChecked, setBotcheckChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  const lastSubmitTimeRef = useRef<number>(0);
  const lastSubmittedSignatureRef = useRef<string>('');

  const [customBudgetInput, setCustomBudgetInput] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    userInteractedRef.current = true;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectBudgetPreset = (presetValue: string) => {
    userInteractedRef.current = true;
    setCustomBudgetInput('');
    setFormData((prev) => ({ ...prev, estimatedBudget: presetValue }));
  };

  const handleCustomBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userInteractedRef.current = true;
    const val = e.target.value;
    setCustomBudgetInput(val);
    setFormData((prev) => ({ ...prev, estimatedBudget: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    // Anti-Bot Protection 1: Honeypot trap check (both hidden text and Web3Forms botcheck)
    if ((botTrap && botTrap.trim().length > 0) || botcheckChecked) {
      // Silently simulate success for bots without executing dispatch
      setSubmittedBooking({
        ...formData,
        id: `ZH-${Math.floor(100000 + Math.random() * 900000)}`,
        submittedAt: new Date().toLocaleString(),
        status: 'new',
      });
      return;
    }

    // Accidental double-click debounce: prevent identical rapid submission within 2.5s
    const now = Date.now();
    const currentSignature = `${formData.fullName.trim()}_${formData.email.trim()}_${formData.brief.trim()}`;
    if (now - lastSubmitTimeRef.current < 2500 && lastSubmittedSignatureRef.current === currentSignature) {
      return;
    }
    lastSubmitTimeRef.current = now;
    lastSubmittedSignatureRef.current = currentSignature;

    if (!formData.fullName.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    const generatedId = `ZH-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingRecord: SubmittedBooking & { _bot_trap?: string; botcheck?: boolean } = {
      ...formData,
      id: generatedId,
      submittedAt: new Date().toLocaleString(),
      status: 'new',
      _bot_trap: botTrap,
      botcheck: botcheckChecked,
    };

    // Save and dispatch through our resilient multi-channel Web3Forms system
    try {
      await saveInquiry(bookingRecord, settings?.inquiryWebhookUrl, settings?.web3formsAccessKey);
    } catch (err) {
      console.warn('Inquiry dispatch caught error:', err);
    }

    setSubmittedBooking(bookingRecord);
    setShowSocialsPopup(true);
    setIsSubmitting(false);
  };

  const handleCopyId = () => {
    if (!submittedBooking) return;
    navigator.clipboard.writeText(submittedBooking.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setShowSocialsPopup(false);
    setFormData(INITIAL_FORM);
    setBotTrap('');
    setBotcheckChecked(false);
    setFormError(null);
    userInteractedRef.current = false;
    lastSubmittedSignatureRef.current = '';
  };

  const formattedBudget = submittedBooking?.estimatedBudget
    ? (submittedBooking.estimatedBudget.startsWith('$')
        ? submittedBooking.estimatedBudget
        : `$${submittedBooking.estimatedBudget}`)
    : 'Flexible / Open';

  return (
    <section
      id="start"
      className="py-16 sm:py-24 relative bg-[#fafafa] overflow-hidden"
    >
      {/* Calm, quiet background - clean subtle atmospheric aura without saturated clashing blobs */}
      <div className="absolute inset-0 pointer-events-none blueprint-sheet opacity-35" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Inviting, confident header with consistent typography */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-12 sm:mb-16"
        >
          <div className="mb-2.5 inline-block transform -rotate-1 select-none">
            <span className="font-handwriting text-2xl sm:text-3xl text-zinc-900 font-bold tracking-wide block">
              Tell me about your project
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
            Let's{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent font-extrabold drop-shadow-xs">
              create
            </span>{' '}
            together.
          </h2>

          <p className="mt-3.5 text-zinc-600 text-sm sm:text-base font-body font-normal leading-relaxed">
            Tell me about your footage and storytelling vision. Direct 1-on-1 partnership from the first cut to after you hit post.
          </p>
        </motion.div>

        {/* Elevated Form Card - Quiet, crisp, highly legible */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.02)] relative"
        >
          {/* Personal response badge - high contrast dark pill with glowing emerald beacon, impossible to blend */}
          <div className="inline-flex sm:absolute sm:-top-4 sm:right-8 items-center gap-2 px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-100 rounded-full shadow-md mb-6 sm:mb-0 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-semibold tracking-wide">I reply personally within 12 hours.</span>
          </div>

          {submittedBooking ? (
            /* Streamlined, calm success confirmation card with single New Inquiry button */
            <div id="booking-confirmation-card" className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900">
                  Inquiry Received
                </h3>
                <p className="text-sm text-zinc-600 font-normal max-w-md mx-auto">
                  Thank you, <span className="text-zinc-900 font-semibold">{submittedBooking.fullName}</span>. 
                  Your project brief has been logged and sent directly to Zolepto. I will personally review your vision and reach out to <span className="text-zinc-900 font-medium">{submittedBooking.email}</span> shortly.
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Inquiry Reference
                    </span>
                    <span className="font-mono text-base font-bold text-zinc-900 tracking-wider">
                      {submittedBooking.id}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block">Target Budget:</span>
                    <span className="text-zinc-800 font-medium block">{formattedBudget}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Contact:</span>
                    <span className="text-zinc-800 font-medium truncate block">{submittedBooking.email}</span>
                  </div>
                </div>

                {submittedBooking.brief && (
                  <div className="pt-3 border-t border-zinc-200 text-xs">
                    <span className="text-zinc-500 block font-mono">Project Summary:</span>
                    <p className="text-zinc-700 font-normal mt-1 italic">"{submittedBooking.brief}"</p>
                  </div>
                )}
              </div>

              {/* Minimal Single-Action Button for New Inquiry */}
              <div className="flex items-center justify-center pt-2">
                <button
                  id="new-inquiry-reset-btn"
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Inquiry</span>
                </button>
              </div>
            </div>
          ) : (
            /* Streamlined, inviting human-centered form */
            <form id="consultation-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Web3Forms Built-in Anti-Spam Honeypot */}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                checked={botcheckChecked}
                onChange={(e) => setBotcheckChecked(e.target.checked)}
              />

              {/* Auxiliary Scraper Deflector Trap */}
              <div aria-hidden="true" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0, overflow: 'hidden' }}>
                <label htmlFor="company_bot_trap_field">Do not fill this field</label>
                <input
                  id="company_bot_trap_field"
                  type="text"
                  name="_bot_trap"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="form-fullname" className="block text-xs font-semibold text-zinc-700">
                    Your Name <span className="text-zinc-400">*</span>
                  </label>
                  <input
                    id="form-fullname"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="form-email" className="block text-xs font-semibold text-zinc-700">
                    Your Email <span className="text-zinc-400">*</span>
                  </label>
                  <input
                    id="form-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. abc@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Estimated Budget (Presets + Custom Input) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700">
                  Estimated Budget
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSelectBudgetPreset(preset.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer text-center ${
                        formData.estimatedBudget === preset.value
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                          : 'bg-zinc-50/70 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Name Your Own Price custom input field */}
                <div className="pt-1">
                  <input
                    id="form-custom-budget"
                    type="text"
                    value={customBudgetInput}
                    onChange={handleCustomBudgetChange}
                    placeholder="e.g. $500 or flexible"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50/70 border border-zinc-200 text-xs sm:text-sm font-mono text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Project Vision (Brief) */}
              <div className="space-y-1.5">
                <label htmlFor="form-brief" className="block text-xs font-semibold text-zinc-700">
                  Your Vision
                </label>
                <textarea
                  id="form-brief"
                  name="brief"
                  rows={4}
                  value={formData.brief}
                  onChange={handleChange}
                  placeholder="e.g. High-energy cuts with rhythmic sound design, punchy match cuts, and visual retention hooks that keep viewers locked in until the final frame..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all resize-none"
                />
              </div>

              {/* Row 4: Reference Links */}
              <div className="space-y-1.5">
                <label htmlFor="form-links" className="block text-xs font-semibold text-zinc-700">
                  Reference Links <span className="text-zinc-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="form-links"
                  name="links"
                  type="text"
                  value={formData.links || ''}
                  onChange={handleChange}
                  placeholder="e.g. drive.google.com/..., youtube.com/watch?v=..., dropbox.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all"
                />
              </div>

              {/* Submit Button - Clear, high-contrast, action-focused */}
              <div className="pt-2 flex justify-end">
                <button
                  id="submit-consultation-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-body font-semibold text-sm tracking-normal transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Brief...</span>
                    </span>
                  ) : (
                    <>
                      <span>Send Project</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Floating Animated Socials Popup at the bottom of the website */}
      <SocialsInquiryPopup
        isOpen={showSocialsPopup}
        onClose={() => setShowSocialsPopup(false)}
        settings={settings}
      />
    </section>
  );
};
