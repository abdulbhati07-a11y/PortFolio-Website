import React from 'react';

const resumes = [
  { title: 'Data Science resume', focus: 'Machine learning · computer vision · Python', pdf: '/assets/resumes/abdullah-data-science-resume.pdf', docx: '/assets/resumes/abdullah-data-science-resume.docx' },
  { title: 'Web Developer resume', focus: 'React · full-stack applications · web design', pdf: '/assets/resumes/abdullah-web-developer-resume.pdf', docx: '/assets/resumes/abdullah-web-developer-resume.docx' },
];
const certificates = [
  { title: 'The Ultimate Job Ready Data Science Course', issuer: 'CodeWithHarry · January 2026', image: '/assets/certificates/cert-data-science.jpg', pdf: '/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf' },
  { title: 'Complete 2025 Python Bootcamp', issuer: 'CodeWithHarry · September 2025', image: '/assets/certificates/cert-python.jpg', pdf: '/[English]_Complete_2025_Python_Bootcamp__Learn_Python_from_Scratch_Certificate.pdf' },
];
export default function Credentials() {
  return <section className="lab-section credentials-section" id="credentials" aria-labelledby="credentials-title">
    <div className="section-kicker"><span className="micro">06 / THE READING ROOM</span><span className="micro">RESUMES & CERTIFICATES</span></div>
    <div className="credentials-intro"><div><span className="micro accent">BEYOND THE PROJECTS</span><h2 id="credentials-title">The work,<br /><em>on paper.</em></h2></div><p>Two ways to read my experience, followed by the courses behind my Python and data science foundation.</p></div>
    <div className="resume-cards">{resumes.map((resume, i) => <article className="resume-card" key={resume.title}><span className="micro">RESUME / 0{i+1}</span><div className="resume-paper" aria-hidden="true"><i /><i /><i /><i /></div><h3>{resume.title}</h3><p>{resume.focus}</p><div><a href={resume.pdf} target="_blank" rel="noreferrer" data-magnetic="button">View PDF ↗</a><a href={resume.docx} download data-magnetic="button">Download Word ↓</a></div></article>)}</div>
    <div className="certificate-head"><span className="micro">CERTIFIED LEARNING</span><h3>Courses completed</h3></div>
    <div className="credential-certificates">{certificates.map(cert => <a key={cert.title} href={encodeURI(cert.pdf)} target="_blank" rel="noreferrer" className="credential-certificate"><img src={cert.image} alt="" loading="lazy" /><div><span className="micro">VIEW CERTIFICATE ↗</span><h4>{cert.title}</h4><p>{cert.issuer}</p></div></a>)}</div>
  </section>;
}
