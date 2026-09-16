import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Mail, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ConsultationFormState, SubmittedBooking } from '../types';
import { saveInquiry, buildMailtoUrl, buildGmailWebUrl } from '../services/inquiryService';

const INITIAL_FORM: ConsultationFormState = {
  fullName: '',
  email: '',
  projectType: 'Commercial / Brand Video',
  estimatedBudget: '',
  brief: '',
  links: '',
};

const BUDGET_PRESETS = [
  { label: '$1.5k – $3k', value: '1500 - 3000' },
  { label: '$3k – $6k', value: '3000 - 6000' },
  { label: '$6k – $12k', value: '6000 - 12000' },
  { label: '$12k+', value: '12000+' },
];

interface ConsultationFormSectionProps {
  settings?: {
    contactEmail?: string;
  };
}

export const ConsultationFormSection: React.FC<ConsultationFormSectionProps> = ({ settings }) => {
  const contactEmail = settings?.contactEmail || 'zolepto@gmail.com';
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBooking | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectBudgetPreset = (presetValue: string) => {
    setFormData((prev) => ({ ...prev, estimatedBudget: presetValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    const generatedId = `ZH-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingRecord: SubmittedBooking = {
      ...formData,
      id: generatedId,
      submittedAt: new Date().toLocaleString(),
      status: 'new',
    };

    // Save immediately to Firestore & local storage with zero delay
    await saveInquiry(bookingRecord);
    setSubmittedBooking(bookingRecord);
    setIsSubmitting(false);
  };

  const handleCopyId = () => {
    if (!submittedBooking) return;
    navigator.clipboard.writeText(submittedBooking.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopySummary = () => {
    if (!submittedBooking) return;
    const summaryText = `Project Inquiry ${submittedBooking.id}\nName: ${submittedBooking.fullName}\nEmail: ${submittedBooking.email}\nScope: ${submittedBooking.projectType}\nBudget: ${formattedBudget}\nLinks: ${submittedBooking.links || 'None'}\nBrief: ${submittedBooking.brief || 'None'}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setFormData(INITIAL_FORM);
  };

  const formattedBudget = submittedBooking?.estimatedBudget
    ? (submittedBooking.estimatedBudget.startsWith('$')
        ? submittedBooking.estimatedBudget
        : `$${submittedBooking.estimatedBudget}`)
    : 'To be discussed';

  const emailSubject = submittedBooking ? `Project Inquiry ${submittedBooking.id} — ${submittedBooking.fullName}` : '';
  const emailBody = submittedBooking
    ? `Hi Zolepto,\n\nI have submitted project inquiry ${submittedBooking.id}.\n\nClient Name: ${submittedBooking.fullName}\nEmail: ${submittedBooking.email}\nProject Type: ${submittedBooking.projectType}\nBudget: ${formattedBudget}\nLinks: ${submittedBooking.links || 'N/A'}\n\nProject Brief:\n${submittedBooking.brief || 'To be discussed'}`
    : '';

  const mailtoLink = submittedBooking ? buildMailtoUrl(contactEmail, emailSubject, emailBody) : '#';
  const gmailWebLink = submittedBooking ? buildGmailWebUrl(contactEmail, emailSubject, emailBody) : '#';

  return (
    <section
      id="start"
      className="py-24 sm:py-32 relative rounded-t-[36px] sm:rounded-t-[48px] -mt-8 sm:-mt-10 z-40 bg-white border-t border-zinc-200/90 shadow-[0_-24px_50px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Apple-style clean header with motion blur-in */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-12 sm:mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold block mb-2">
            DIRECT COLLABORATION // INTAKE
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950">
            Let's create together.
          </h2>

          <p className="mt-3.5 text-zinc-600 text-sm sm:text-base font-normal leading-relaxed">
            Share a brief overview of your footage and storytelling vision. I review all inquiries personally and reply within 12 business hours.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative"
        >
          {/* Subtle tape accent on top right corner */}
          <div className="hidden sm:block absolute -top-3.5 right-8 px-3.5 py-1 bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-600 rounded-xs rotate-1 shadow-2xs">
            1-ON-1 DIRECT INTAKE
          </div>

          {submittedBooking ? (
            /* Success confirmation card */
            <div id="booking-confirmation-card" className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900">
                  Inquiry Received
                </h3>
                <p className="text-sm text-zinc-600 font-normal max-w-md mx-auto">
                  Thank you, <span className="text-zinc-900 font-semibold">{submittedBooking.fullName}</span>. 
                  Your project brief has been routed directly to Zolepto.
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
                    <span className="text-zinc-500 block">Focus / Scope:</span>
                    <span className="text-zinc-800 font-medium truncate block">{submittedBooking.projectType}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Target Budget:</span>
                    <span className="text-zinc-800 font-medium block">{formattedBudget}</span>
                  </div>
                  <div className="col-span-2">
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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  id="direct-gmail-web-send"
                  href={gmailWebLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm tracking-wide transition-colors text-center shadow-sm cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-zinc-300" />
                  <span>Send via Gmail Web</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <a
                  id="direct-mailto-send"
                  href={mailtoLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs sm:text-sm tracking-wide transition-colors text-center border border-zinc-300 cursor-pointer"
                >
                  <span>Open Default Email Client</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs sm:text-sm font-semibold tracking-wide transition-colors text-center cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  <span>{copiedSummary ? 'Brief Copied' : 'Copy Brief'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-transparent hover:bg-zinc-100 text-zinc-600 text-xs sm:text-sm font-medium tracking-wide transition-colors text-center cursor-pointer"
                >
                  New Inquiry
                </button>
              </div>
            </div>
          ) : (
            /* Streamlined, simplified form */
            <form id="consultation-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="form-fullname" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Your Name / Brand <span className="text-zinc-400">*</span>
                  </label>
                  <input
                    id="form-fullname"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="form-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Email Address <span className="text-zinc-400">*</span>
                  </label>
                  <input
                    id="form-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@studio.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Service and Budget (Typing Input + Presets) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="form-projectType" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Project Type
                  </label>
                  <select
                    id="form-projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all"
                  >
                    <option value="Commercial / Brand Video">Commercial / Brand Video</option>
                    <option value="YouTube Documentary / Long-Form">YouTube Documentary / Long-Form</option>
                    <option value="Short-Form Viral Suite">Short-Form Content (TikTok / Reels)</option>
                    <option value="Motion Graphics & Graphic Design">Motion Graphics & Graphic Design</option>
                    <option value="1-on-1 Consultation & Strategy">1-on-1 Consultation & Strategy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="form-budget" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                      Estimated Budget (USD)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">or click preset</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-mono font-medium">$</span>
                    <input
                      id="form-budget"
                      name="estimatedBudget"
                      type="text"
                      value={formData.estimatedBudget}
                      onChange={handleChange}
                      placeholder="e.g. 3,500"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all font-mono"
                    />
                  </div>

                  {/* Budget Quick-Select Chips with accessible mobile grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {BUDGET_PRESETS.map((p) => {
                      const isSelected = formData.estimatedBudget === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => handleSelectBudgetPreset(p.value)}
                          className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center border text-center ${
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200/90 text-zinc-700 active:scale-98'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 3: Reference Links (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="form-links" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Drive or Inspo Links <span className="text-zinc-400 text-[11px] font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="form-links"
                  name="links"
                  type="url"
                  value={formData.links || ''}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all"
                />
              </div>

              {/* Row 4: Project Brief */}
              <div className="space-y-1.5">
                <label htmlFor="form-brief" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Project Brief & Vision
                </label>
                <textarea
                  id="form-brief"
                  name="brief"
                  rows={4}
                  value={formData.brief}
                  onChange={handleChange}
                  placeholder="Tell us about the project goals, style inspiration, desired timeline, or any specific requests..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-800 transition-all resize-none"
                />
              </div>

              {/* Submit Button & Reassurance */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs text-zinc-500 font-mono">
                    Direct personal reply from Zolepto within 12h
                  </p>
                </div>

                <button
                  id="submit-consultation-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Routing Brief...</span>
                    </span>
                  ) : (
                    <>
                      <span>Send Project Inquiry</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
