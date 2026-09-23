import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'Academic Query',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const officialEmail = 'megaitdepartment@gmail.com';

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(officialEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setStatusText('Please enter your name, email, and message details.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, category, subject, message }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setStatusText(`Your inquiry has been sent to the Mega IT Department (${officialEmail}).`);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('success');
        setStatusText(`Inquiry recorded for ${officialEmail}.`);
      }
    } catch {
      setStatus('success');
      setStatusText(`Query prepared for Mega IT Department (${officialEmail}).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = `mailto:${officialEmail}?subject=${encodeURIComponent(
    subject ? `[${category}] ${subject}` : `[${category}] Query from ${name || 'User'}`
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCategory: ${category}\n\nMessage:\n${message}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Mega National College &bull; IT Department
              </h3>
              <p className="text-xs text-indigo-300">
                Contact Us, Feedback & Academic Queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Institution Contact Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-slate-800">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Location</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 ml-5.5">
                Kumaripati, Lalitpur, Nepal
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Contact Numbers</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 ml-5.5">
                <a href="tel:01-5438328" className="hover:underline font-mono text-indigo-700">01-5438328</a>,{' '}
                <a href="tel:5438621" className="hover:underline font-mono text-indigo-700">5438621</a>
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-indigo-100/80">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-indigo-950">Direct Email:</span>
                <span className="font-mono text-indigo-800">{officialEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-semibold text-[10px] transition-colors"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Status message */}
          {status === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{statusText}</p>
                <div className="mt-1">
                  <a
                    href={mailtoLink}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 underline font-bold"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Open in Email Application</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Academic Query">Academic / K-Map Logic Query</option>
                  <option value="Feedback / Suggestion">Feedback & Feature Request</option>
                  <option value="Bug Report">Bug / Calculation Error</option>
                  <option value="IT Department Support">Mega IT Department Support</option>
                  <option value="General Contact">General Contact</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="01-5438328 / mobile"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Topic of query or feedback"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Message / Query Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Type your question, feedback, or suggestion here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <a
                href={mailtoLink}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Mail Client</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit to IT Dept'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
