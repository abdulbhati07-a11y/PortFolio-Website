import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaCertificate, FaExternalLinkAlt, FaPaperPlane, FaCheck, FaCopy, FaClock } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { DEVELOPER_INFO } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';
import Magnetic from './ui/Magnetic';

/* ─── Social Link Card ────────────────────────────────────────────────── */
const LinkCard = ({ icon: Icon, title, handle, link, color, download }) => (
  <m.a
    href={link}
    download={download}
    target={download ? undefined : '_blank'}
    rel={download ? undefined : 'noopener noreferrer'}
    whileHover={{ y: -4 }}
    className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center text-center cursor-pointer group transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-glass/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <FaExternalLinkAlt size={11} className="text-text-tertiary" aria-hidden="true" />
    </div>
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={22} style={{ color }} aria-hidden="true" />
    </div>
    <h3 className="font-sans text-sm font-semibold text-text-primary mb-0.5 tracking-tight">{title}</h3>
    <p className="font-mono text-[10px] text-text-secondary tracking-widest uppercase">{handle}</p>
  </m.a>
);

/* ─── Local time in my timezone ───────────────────────────────────────── */
const LocalTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Karachi',
        }).format(new Date())
      );
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="flex items-center gap-2 text-text-secondary text-xs font-mono">
      <FaClock size={11} className="text-accent-cyan" aria-hidden="true" />
      {time} — my local time (PKT)
    </span>
  );
};

/* ─── Copyable email row ──────────────────────────────────────────────── */
const CopyEmail = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DEVELOPER_INFO.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the mailto link still works.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={`mailto:${DEVELOPER_INFO.email}`}
        className="text-text-primary text-sm hover:text-accent-cyan transition-colors break-all"
      >
        {DEVELOPER_INFO.email}
      </a>
      <button
        onClick={copy}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
        className="w-7 h-7 rounded-md border border-glass/10 bg-glass/5 flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors shrink-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <m.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <FaCheck size={10} className="text-accent-emerald" />
            </m.span>
          ) : (
            <m.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <FaCopy size={10} />
            </m.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

/* ─── Contact Form ────────────────────────────────────────────────────── */
const fields = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
];

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 20) errs.message = 'Message must be at least 20 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus('sending');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

    emailjs
      .send(serviceId, templateId, {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject || 'New Portfolio Message',
        message: form.message,
        to_name: 'Developer',
      }, publicKey)
      .then(() => {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
        setStatus('error');
      });
  };

  const inputClass = (field) =>
    `w-full bg-glass/[0.04] border ${errors[field] ? 'border-accent-emerald/60' : 'border-glass/[0.08]'} rounded-xl px-4 py-3 text-text-primary font-sans text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/60 focus:bg-glass/[0.06] transition-all duration-300`;

  const labelClass = 'font-mono text-[11px] text-text-secondary tracking-widest uppercase mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ name, label, type, placeholder, required }) => (
          <div key={name}>
            <label htmlFor={`contact-${name}`} className={labelClass}>
              {label} {required && <span className="text-accent-cyan" aria-hidden="true">*</span>}
            </label>
            <input
              id={`contact-${name}`}
              type={type}
              name={name}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className={inputClass(name)}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
            />
            {errors[name] && (
              <p id={`contact-${name}-error`} className="text-accent-emerald text-xs mt-1 ml-1" role="alert">
                {errors[name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClass}>Subject</label>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          placeholder="What's this about? (optional)"
          value={form.subject}
          onChange={handleChange}
          className={inputClass('subject')}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-accent-cyan" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Tell me about your project or just say hi..."
          value={form.message}
          onChange={handleChange}
          rows={5}
          className={`${inputClass('message')} resize-none`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-accent-emerald text-xs mt-1 ml-1" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="text-accent-emerald text-sm text-center" role="alert">
          Something went wrong. Please try again, or email me directly using the address on the right.
        </p>
      )}

      <m.button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        whileHover={status === 'idle' || status === 'error' ? { scale: 1.02 } : {}}
        whileTap={status === 'idle' || status === 'error' ? { scale: 0.98 } : {}}
        className={`flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-sans font-semibold text-sm transition-all duration-300 ${
          status === 'sent'
            ? 'bg-accent-emerald/20 border border-accent-emerald/40 text-accent-emerald cursor-default'
            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
        } ${status === 'sending' ? 'opacity-70 cursor-wait' : ''}`}
      >
        {status === 'sent' ? (
          <><FaCheck size={14} /> Message Sent Successfully!</>
        ) : status === 'sending' ? (
          <>
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <><FaPaperPlane size={13} /> Send Message</>
        )}
      </m.button>
    </form>
  );
};

/* ─── Contact Section ─────────────────────────────────────────────────── */
const Contact = () => {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      <SectionHeading
        index="07"
        eyebrow="Get in touch"
        title="Let's"
        accent="Connect"
        subtitle="Have a project in mind or want to collaborate? Drop me a message and I'll get back to you soon."
        align="center"
        className="mb-12"
      />

      {/* Resume + Certificate CTAs */}
      <Reveal className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-5xl mx-auto">
        <Magnetic>
          <a href={DEVELOPER_INFO.resume} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">
            <FaDownload size={15} /> Download Resume
          </a>
        </Magnetic>
        <Magnetic>
          <a href={DEVELOPER_INFO.certificates} download className="btn-secondary text-base">
            <FaCertificate size={15} /> Download Certificate
          </a>
        </Magnetic>
      </Reveal>

      {/* Form + info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12 max-w-5xl mx-auto">
        <Reveal className="lg:col-span-3">
          <div className="glass-card rounded-3xl p-6 sm:p-8 h-full">
            <h3 className="font-display text-xl font-bold text-text-primary mb-6 tracking-tight">Send a Message</h3>
            <ContactForm />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-5 h-full">
            <h3 className="font-display text-lg font-bold text-text-primary tracking-tight">Contact Info</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaEnvelope size={14} className="text-accent-cyan" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">Email</div>
                  <CopyEmail />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaGithub size={14} className="text-accent-emerald" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">GitHub</div>
                  <a href={DEVELOPER_INFO.github} target="_blank" rel="noopener noreferrer" className="text-text-primary text-sm hover:text-accent-emerald transition-colors">
                    @abdulbhati07-a11y
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaLinkedin size={14} className="text-accent-emerald" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">LinkedIn</div>
                  <a href={DEVELOPER_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-primary text-sm hover:text-accent-emerald transition-colors">
                    Muhammad Abdullah Bhatti
                  </a>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <span className="text-text-secondary text-xs font-sans">Available for freelance &amp; full-time roles</span>
              </div>
              <LocalTime />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Social links grid */}
      <Reveal className="max-w-5xl mx-auto">
        <h3 className="font-mono text-xs text-text-secondary tracking-widest uppercase mb-5 text-center">Or find me on</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <LinkCard icon={FaGithub} title="GitHub" handle="Code & Repos" link={DEVELOPER_INFO.github} color="#8b9bb4" />
          <LinkCard icon={FaLinkedin} title="LinkedIn" handle="Professional" link={DEVELOPER_INFO.linkedin} color="#0A66C2" />
          <LinkCard icon={FaEnvelope} title="Email" handle="Direct Message" link={`mailto:${DEVELOPER_INFO.email}`} color="#00D9FF" />
          <LinkCard icon={FaCertificate} title="Certificates" handle="Achievements" link={DEVELOPER_INFO.certificates} color="#A855F7" download />
        </div>
      </Reveal>
    </section>
  );
};

export default Contact;
