import React, { useEffect, useRef, useState } from 'react';

const books = [
  { id: 'futurepath', title: 'FuturePath AI', type: 'AI product', color: 'violet', year: '01', live: 'https://www.futurepathai.org/', embed: false, image: '/assets/screenshots/futurepathai.jpg', stack: ['React', 'TypeScript', 'Groq', 'PostgreSQL'], challenge: 'Big decisions are hard to compare when the tradeoffs stay abstract.', build: 'A guided interview turns a decision into best, likely, and worst-case scenarios with risks and assumptions visible alongside the output.', note: 'The scenarios are AI-generated possibilities, not forecasts.' },
  { id: 'pawfect', title: 'PawFect', type: 'Full-stack web', color: 'coral', year: '02', live: 'https://pawfect-petsitting.vercel.app/', github: 'https://github.com/abdulbhati07-a11y/Pawfect-Petsitting', image: '/assets/screenshots/pet-sitting.jpg', stack: ['React', 'Vite', 'Supabase', 'CSS'], challenge: 'A pet-sitting site needs to make services clear and booking approachable.', build: 'Responsive service pages, gallery, booking interface, and Supabase-backed account and contact flows.', note: 'The repository includes the application and database setup.' },
  { id: 'luna-wash', title: 'LÜNA WASH', type: 'Full-stack web', color: 'mint', year: '03', live: 'https://luna-washweb.vercel.app/', github: 'https://github.com/abdulbhati07-a11y/LunaWashweb', image: '/assets/screenshots/laundry.jpg', stack: ['React', 'Express', 'Supabase', 'Three.js'], challenge: 'Laundry services need an easy path from browsing to scheduling a pickup.', build: 'A responsive storefront with booking, plans, service catalog, Express routes, and Supabase data storage.', note: 'Includes an interactive Three.js hero and a service-focused interface.' },
  { id: 'summarizer', title: 'AI Summarizer', type: 'AI web app', color: 'blue', year: '04', live: 'https://ai-text-summarizer-z6yn.onrender.com/', github: 'https://github.com/abdulbhati07-a11y/AI-Text-Summarizer', image: '/assets/screenshots/ai-summarizer.jpg', stack: ['Flask', 'Python', 'HTML', 'JavaScript'], challenge: 'Long videos can be difficult to scan for the central ideas.', build: 'A Flask app accepts a YouTube URL, retrieves a transcript when available, and presents a structured AI summary in a responsive web interface.', note: 'Generated summaries should be checked against the source video.' },
  { id: 'vision-guard', title: 'VisionGuard', type: 'Computer vision', color: 'charcoal', year: '05', github: 'https://github.com/abdulbhati07-a11y/Vision_Guard', stack: ['Python', 'YOLO', 'Evaluation'], challenge: 'PPE detections are not automatically reliable safety decisions.', build: 'An image pipeline associates detected gear with people and reports safe, violation, or uncertain states. A local web demo explains each result.', note: 'A research prototype; evaluation shows it does not meet its recall floor.' },
  { id: 'ecommerce', title: 'E-Commerce Data', type: 'Data science', color: 'gold', year: '06', github: 'https://github.com/abdulbhati07-a11y/Ecommerce_DataScience', stack: ['Python', 'pandas', 'scikit-learn'], challenge: 'Understand customer behavior and what relates to satisfaction.', build: 'Cleaned data, explored spending patterns, engineered features, and compared three classification models.', note: 'The dataset appears synthetic, limiting real-world conclusions.' },
  { id: 'qr-generator', title: 'QR Generator', type: 'Python utility', color: 'rose', year: '07', github: 'https://github.com/abdulbhati07-a11y/QR-Code-Generator', stack: ['Python', 'qrcode'], challenge: 'Create a QR image quickly from a website URL.', build: 'A small command-line utility accepts a URL and filename, then saves a PNG QR code.', note: 'Focused Python scripting and file output.' },
  { id: 'water-reminder', title: 'Water Reminder', type: 'Python utility', color: 'teal', year: '08', github: 'https://github.com/abdulbhati07-a11y/Drink-water-Reminder', stack: ['Python', 'plyer'], challenge: 'Make a simple habit reminder available on the desktop.', build: 'A lightweight Python script runs periodic hydration notifications with an adjustable interval.', note: 'A compact automation project.' },
];

function OpenBook({ book, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.book-close')?.focus();
    return () => { document.body.style.overflow = overflow; dialog.close(); previous?.focus?.(); };
  }, []);
  return <dialog ref={ref} className="open-book" onCancel={e => { e.preventDefault(); onClose(); }} aria-label={`${book.title} project showcase and case study`}>
    <div className="open-book-top"><span className="micro">THE ABDULLAH LIBRARY / VOLUME {book.year}</span><button className="book-close" onClick={onClose} aria-label="Close project book">Close <span>×</span></button></div>
    <div className="open-book-pages">
      <div className="open-book-preview">
        <div className="page-heading"><span className="micro">LEFT PAGE / THE WORK</span><h3>{book.title}</h3></div>
        <div className="preview-frame">
          {book.image && book.embed !== false && <img src={book.image} alt={`${book.title} website preview`} />}
          {book.embed === false && <div className="future-static"><span className="micro">FUTUREPATH AI / PROJECT OVERVIEW</span><h4>One decision.<br /><em>Three paths.</em></h4><div><span>BEST CASE ↗</span><span>LIKELY CASE →</span><span>WORST CASE ↘</span></div></div>}
          {book.live && book.embed !== false ? <iframe src={book.live} title={`${book.title} live website preview`} loading="eager" /> : !book.image ? <div className="preview-quiet"><span>PROJECT<br />ARCHIVE</span><p>Explore the implementation in its repository.</p></div> : null}
          {book.live && book.embed === false && <span className="preview-external micro">LIVE EXPERIENCE OPENS IN A NEW TAB ↗</span>}
        </div>
        <div className="preview-actions">{book.live && <a href={book.live} target="_blank" rel="noreferrer" data-magnetic="button">Open live site ↗</a>}{book.github && <a href={book.github} target="_blank" rel="noreferrer" data-magnetic="button">View repository ↗</a>}</div>
      </div>
      <div className="open-book-study">
        <span className="micro">RIGHT PAGE / CASE STUDY</span><p className="book-type">{book.type}</p><h2>{book.title}</h2>
        <div className="book-study-block"><span className="micro">01 / THE CHALLENGE</span><p>{book.challenge}</p></div>
        <div className="book-study-block"><span className="micro">02 / THE BUILD</span><p>{book.build}</p></div>
        <div className="book-study-block"><span className="micro">03 / WHAT TO KNOW</span><p>{book.note}</p></div>
        <div className="book-study-evidence"><span className="micro">EXPLORE THE EVIDENCE</span><p>{book.live ? 'Open the working site to experience the interface.' : 'Read the source to see the implementation.'}{book.github ? ' The repository shows the code and project setup.' : ''}</p></div>
        <div className="book-stack">{book.stack.map(item => <span key={item}>{item}</span>)}</div>
      </div>
    </div>
  </dialog>;
}

export default function Bookshelf() {
  const [selected, setSelected] = useState(null);
  return <section className="lab-section bookshelf-section" id="projects" aria-labelledby="bookshelf-title">
    <div className="section-kicker"><span className="micro">02 / THE PROJECT LIBRARY</span><span className="micro">PULL A BOOK / OPEN A STORY</span></div>
    <div className="bookshelf-intro"><div><span className="micro accent">THE SHELF IS OPEN</span><h2 id="bookshelf-title">Every build<br /><em>has a story.</em></h2></div><p>Choose a spine to open the work. The left page shows the project; the right page tells you what I made and why.</p></div>
    <div className="bookcase" aria-label="Project bookshelf">{[books.slice(0,4), books.slice(4)].map((row, shelf) => <div className="book-shelf" key={shelf}>
      <div className="book-row" role="group" aria-label={`Project shelf ${shelf + 1}; swipe to explore on mobile`}>{row.map(book => <button id={book.id} key={book.id} className={`book-spine book-${book.color}`} onClick={() => setSelected(book)} aria-label={`Open ${book.title} project book`} data-cursor="OPEN BOOK" data-magnetic="book">{book.image && <img className="book-cover-image" src={book.image} alt="" loading="lazy" />}<span className="book-index">{book.year} / 08</span><strong>{book.title}</strong><span className="book-category">{book.type}</span><span className="book-arrow">↗</span></button>)}</div><div className="shelf-ledge" aria-hidden="true" />
    </div>)}</div>
    <p className="bookshelf-hint micro">SELECT A PROJECT TO OPEN ITS SHOWCASE AND CASE STUDY <span className="mobile-shelf-tip">· SWIPE FOR MORE ↔</span></p>
    {selected && <OpenBook key={selected.id} book={selected} onClose={() => setSelected(null)} />}
  </section>;
}
