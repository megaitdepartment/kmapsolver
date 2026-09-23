import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface FooterProps {
  onOpenQueryModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Academic Query',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const officialEmail = 'megaitdepartment@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(officialEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please fill in your name, email address, and message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus('success');
        setStatusMessage(
          `Thank you! Your query has been routed to the Mega IT Department (${officialEmail}).`
        );
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: 'Academic Query',
          subject: '',
          message: '',
        });
      } else {
        // Fallback or validation error
        setSubmitStatus('success');
        setStatusMessage(
          `Message recorded. You can also send directly to ${officialEmail}.`
        );
      }
    } catch (err) {
      // Offline fallback with direct email link readiness
      setSubmitStatus('success');
      setStatusMessage(
        `Query prepared for Mega IT Department (${officialEmail}). Click "Send via Email Client" below if needed.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = `mailto:${officialEmail}?subject=${encodeURIComponent(
    formData.subject ? `[${formData.category}] ${formData.subject}` : `[${formData.category}] Query from ${formData.name || 'Student'}`
  )}&body=${encodeURIComponent(
    `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\nCategory: ${formData.category}\n\nMessage:\n${formData.message}`
  )}`;

  return (
    <footer className="w-full bg-slate-900 text-slate-200 border-t border-slate-800 shrink-0 mt-auto">
      {/* Top Banner Accent */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 w-full" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: College Identity & Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Mega National College
                </h2>
                <p className="text-xs text-indigo-300 font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Kumaripati, Lalitpur, Nepal</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated to academic excellence, innovative IT education, and engineering problem-solving. This interactive Karnaugh Map minimization tool is supported by the Mega IT Department for students, educators, and digital logic learners.
            </p>

            {/* Quick Contact Badges */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Contact Numbers:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:01-5438328"
                    className="font-mono text-indigo-300 hover:text-white underline-offset-2 hover:underline transition-colors"
                  >
                    01-5438328
                  </a>
                  <span className="text-slate-600">|</span>
                  <a
                    href="tel:5438621"
                    className="font-mono text-indigo-300 hover:text-white underline-offset-2 hover:underline transition-colors"
                  >
                    5438621
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>IT Dept Email:</span>
                <button
                  onClick={handleCopyEmail}
                  className="group flex items-center gap-1.5 font-mono text-indigo-300 hover:text-white transition-colors text-xs"
                  title="Click to copy email address"
                >
                  <span>{officialEmail}</span>
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-indigo-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Official Web & Social Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Official Links & Social Media
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://megacollege.edu.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors group"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                  <span>megacollege.edu.np</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>

                <a
                  href="https://www.facebook.com/megacollege.edu.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>

                <a
                  href="https://www.linkedin.com/company/megacollege/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>College LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>

                <a
                  href="https://www.linkedin.com/in/mega-it-bb2bb6438/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 border border-indigo-800/80 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>Mega IT LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Academic & Department Information (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Department of IT & Computing
              </span>
              <h3 className="text-sm font-semibold text-white">
                Digital Logic & Architecture Lab
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Boolean Algebra & Karnaugh Mapping (2 to 6 Variables)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Quine-McCluskey (Tabular) & Petrick's Method Simplifier</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Sum-of-Products (SOP) & Product-of-Sums (POS) Minimization</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Exportable TikZ / LaTeX Diagrams & Printable Exam Sheets</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Institutional Support</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                For student project consultations, logic lab assistance, or bug reports, submit your query directly via the form.
              </p>
            </div>
          </div>

          {/* Column 3: Contact Us, Feedback & Section for Queries (5 cols) */}
          <div className="lg:col-span-5 space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Contact Us, Feedback & Queries
                  </h3>
                  <p className="text-[11px] text-indigo-300">
                    Routed to <span className="font-mono">{officialEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Status Alerts */}
            {submitStatus === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={mailtoLink}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-300 underline font-semibold hover:text-white"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Open in Email App</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Interactive Query / Feedback Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shrestha"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Academic Query">Academic / K-Map Query</option>
                    <option value="Feedback / Suggestion">Feedback & Feature Request</option>
                    <option value="Bug Report">Bug / Calculation Issue</option>
                    <option value="IT Department Support">IT Department Inquiry</option>
                    <option value="General Contact">General Contact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="01-5438328 or mobile"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Summary of your question or feedback"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Message / Query Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe your query, suggestion, or feedback here..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <span className="text-[10px] text-slate-400">
                  Direct destination: <strong className="text-indigo-300">{officialEmail}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={mailtoLink}
                    title="Send via your default mail client"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mail App</span>
                  </a>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Query</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Mega National College. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">&bull;</span>
            <span className="text-slate-400">Kumaripati, Lalitpur, Nepal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://megacollege.edu.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-300 transition-colors"
            >
              Official Website
            </a>
            <span className="text-slate-700">&bull;</span>
            <a
              href="mailto:megaitdepartment@gmail.com"
              className="text-slate-400 hover:text-indigo-300 transition-colors"
            >
              megaitdepartment@gmail.com
            </a>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-400">01-5438328 / 5438621</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
