import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaCertificate, FaExternalLinkAlt, FaPaperPlane, FaCheck } from 'react-icons/fa';
import { DEVELOPER_INFO } from '../utils/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Social Link Card ────────────────────────────────────────────────── */
const LinkCard = ({ icon: Icon, title, handle, link, color, download }) => (
  <motion.a
    href={link}
    download={download}
    target={download ? undefined : '_blank'}
    rel={download ? undefined : 'noopener noreferrer'}
    variants={itemVariants}
    whileHover={{ y: -4 }}
    className="glass-card p-6 rounded-2xl flex flex-col items-center text-center cursor-pointer group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <FaExternalLinkAlt size={11} className="text-white/40" />
    </div>
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <h3 className="font-sans text-sm font-semibold text-white mb-0.5 tracking-tight">{title}</h3>
    <p className="font-mono text-[10px] text-text-secondary tracking-widest uppercase">{handle}</p>
  </motion.a>
);

/* ─── Contact Form ────────────────────────────────────────────────────── */
const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

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
    setSending(true);
    // Mailto fallback — opens the user's email client
    const subject = encodeURIComponent(form.subject || `Portfolio Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.open(`mailto:${DEVELOPER_INFO.email}?subject=${subject}&body=${body}`, '_blank');
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  const inputClass = (field) =>
    `w-full bg-white/[0.04] border ${errors[field] ? 'border-red-400/60' : 'border-white/[0.08]'} rounded-xl px-4 py-3 text-text-primary font-sans text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/60 focus:bg-white/[0.06] transition-all duration-300`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className={inputClass('name')}
            aria-label="Name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className={inputClass('email')}
            aria-label="Email"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
        </div>
      </div>

      <input
        type="text"
        name="subject"
        placeholder="Subject (optional)"
        value={form.subject}
        onChange={handleChange}
        className={inputClass('subject')}
        aria-label="Subject"
      />

      <div>
        <textarea
          name="message"
          placeholder="Tell me about your project or just say hi..."
          value={form.message}
          onChange={handleChange}
          rows={5}
          className={`${inputClass('message')} resize-none`}
          aria-label="Message"
        />
        {errors.message && <p className="text-red-400 text-xs mt-1 ml-1">{errors.message}</p>}
      </div>

      <motion.button
        type="submit"
        disabled={sending || sent}
        whileHover={!sent ? { scale: 1.02 } : {}}
        whileTap={!sent ? { scale: 0.98 } : {}}
        className={`flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-sans font-semibold text-sm transition-all duration-300 ${
          sent
            ? 'bg-green-400/20 border border-green-400/40 text-green-400 cursor-default'
            : 'bg-white text-primary hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-white/90'
        } ${sending ? 'opacity-70 cursor-wait' : ''}`}
      >
        {sent ? (
          <>
            <FaCheck size={14} /> Message Sent — Email Client Opened
          </>
        ) : sending ? (
          <>
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <FaPaperPlane size={13} /> Send Message
          </>
        )}
      </motion.button>
    </form>
  );
};

/* ─── Contact Section ─────────────────────────────────────────────────── */
const Contact = () => {
  return (
    <motion.section
      className="w-full max-w-5xl mx-auto px-6 py-20 md:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-px bg-white/[0.06]" />
          <span className="font-mono text-accent-cyan text-sm tracking-widest">Get in touch</span>
          <div className="w-12 h-px bg-white/[0.06]" />
        </div>
        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
          Let's <span className="text-gradient">Connect</span>
        </h2>
        <p className="font-sans text-text-secondary text-base font-light max-w-lg mx-auto leading-relaxed">
          Have a project in mind or want to collaborate? I'd love to hear from you. Drop me a message and I'll get back to you soon.
        </p>
      </motion.div>

      {/* Resume + Certificate CTAs */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <a
          href={DEVELOPER_INFO.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-base shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <FaDownload size={15} />
          Download Resume
        </a>
        <a
          href={DEVELOPER_INFO.certificates}
          download
          className="btn-secondary text-base shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 px-6 py-4 rounded-full inline-flex items-center gap-2"
        >
          <FaCertificate size={15} />
          Download Certificate
        </a>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        {/* Contact form */}
        <motion.div variants={itemVariants} className="lg:col-span-3 glass-card rounded-3xl p-8">
          <h3 className="font-sans text-xl font-bold text-white mb-6 tracking-tight">Send a Message</h3>
          <ContactForm />
        </motion.div>

        {/* Info panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-7 flex flex-col gap-5">
            <h3 className="font-sans text-lg font-bold text-white tracking-tight">Contact Info</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaEnvelope size={14} className="text-accent-cyan" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">Email</div>
                  <a href={`mailto:${DEVELOPER_INFO.email}`} className="text-white text-sm hover:text-accent-cyan transition-colors break-all">
                    {DEVELOPER_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaGithub size={14} className="text-accent-purple" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">GitHub</div>
                  <a href={DEVELOPER_INFO.github} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-accent-purple transition-colors">
                    @abdulbhati07-a11y
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaLinkedin size={14} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-0.5">LinkedIn</div>
                  <a href={DEVELOPER_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-blue-400 transition-colors">
                    Muhammad Abdullah Bhatti
                  </a>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <span className="text-text-secondary text-xs font-sans">Available for freelance &amp; full-time roles</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Social links grid */}
      <motion.div variants={itemVariants}>
        <h3 className="font-mono text-xs text-text-secondary tracking-widest uppercase mb-5 text-center">Or find me on</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <LinkCard icon={FaGithub} title="GitHub" handle="Code & Repos" link={DEVELOPER_INFO.github} color="#ffffff" />
          <LinkCard icon={FaLinkedin} title="LinkedIn" handle="Professional" link={DEVELOPER_INFO.linkedin} color="#0A66C2" />
          <LinkCard icon={FaEnvelope} title="Email" handle="Direct Message" link={`mailto:${DEVELOPER_INFO.email}`} color="#00D9FF" />
          <LinkCard icon={FaCertificate} title="Certificates" handle="Achievements" link={DEVELOPER_INFO.certificates} color="#A855F7" download />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Contact;
