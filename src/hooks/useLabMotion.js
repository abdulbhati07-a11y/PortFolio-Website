import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function useLabMotion(root) {
  useLayoutEffect(()=>{
    const media=gsap.matchMedia();
    const context=gsap.context(()=>{
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        gsap.to('.reading-progress i',{scaleX:1,ease:'none',scrollTrigger:{trigger:root.current,start:'top top',end:'bottom bottom',scrub:true}});
        const entryDelay=document.querySelector('.lab-boot') ? .6 : 0;
        gsap.from('.hero-v2-title>span',{yPercent:55,opacity:0,duration:.9,stagger:.1,ease:'power3.out',delay:entryDelay+.1});
        gsap.from('.sculpture-parallax',{scale:.94,opacity:0,duration:1.1,ease:'power3.out',delay:entryDelay+.12});
        gsap.to('.sculpture-parallax',{yPercent:9,rotate:3,ease:'none',scrollTrigger:{trigger:'.hero-v2',start:'top top',end:'bottom top',scrub:1}});
        gsap.to('.hero-v2-title',{yPercent:13,opacity:.35,ease:'none',scrollTrigger:{trigger:'.hero-v2',start:'top top',end:'bottom top',scrub:1}});
        gsap.to('.hero-runner>div',{xPercent:-20,ease:'none',scrollTrigger:{trigger:'.hero-v2',start:'top top',end:'bottom top',scrub:1.5}});
        gsap.utils.toArray('.chapter-door').forEach(door=>{
          const reveal=gsap.timeline({scrollTrigger:{trigger:door,start:'top top',end:'bottom bottom',scrub:.7}});
          reveal.fromTo(door,{'--door-angle':'0deg'},{'--door-angle':'83deg',ease:'none'},0)
            .fromTo(door.querySelector('.door-art'),{scale:1.08,rotation:-3,opacity:.08},{scale:1.5,rotation:0,opacity:.42,ease:'none'},0)
            .fromTo(door.querySelector('.door-title'),{scale:1,opacity:1},{scale:.82,opacity:0,duration:.38,ease:'none'},.04)
            .fromTo(door.querySelector('.door-reveal'),{y:22,opacity:0},{y:0,opacity:1,duration:.46,ease:'none'},.52)
            .fromTo(door.querySelector('.door-kicker'),{opacity:1},{opacity:.35,duration:.4,ease:'none'},.5);
        });
        gsap.utils.toArray('.lab-section > .section-kicker').forEach(kicker=>gsap.from(kicker,{x:-28,opacity:0,duration:.75,ease:'power2.out',scrollTrigger:{trigger:kicker,start:'top 92%',once:true}}));
        gsap.utils.toArray('.book-shelf').forEach((shelf,index)=>gsap.from(shelf,{y:32,opacity:0,duration:.8,delay:index*.08,ease:'power3.out',scrollTrigger:{trigger:shelf,start:'top 88%',once:true}}));
        gsap.utils.toArray('.identity-areas a,.resume-card,.credential-certificate,.notes-grid article').forEach((item,index)=>gsap.from(item,{y:42,opacity:0,duration:.85,delay:index%3*.08,ease:'power3.out',scrollTrigger:{trigger:item,start:'top 92%',once:true}}));
        gsap.utils.toArray('.showcase-art').forEach(scene=>{
          gsap.fromTo(scene,{scale:.9,clipPath:'inset(5% 3% round 24px)'},{scale:1,clipPath:'inset(0% 0% round 6px)',ease:'none',scrollTrigger:{trigger:scene.parentElement,start:'top 90%',end:'top 5%',scrub:1}});
        });
        gsap.utils.toArray('.showcase-watermark').forEach(title=>gsap.fromTo(title,{xPercent:8},{xPercent:-8,ease:'none',scrollTrigger:{trigger:title.parentElement,start:'top bottom',end:'bottom top',scrub:1.5}}));
        gsap.utils.toArray('.archive-row').forEach((row,i)=>gsap.from(row,{y:35,opacity:0,duration:.7,delay:i%3*.05,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:row,start:'top 94%',once:true}}));
        gsap.from('.lab-contact h2',{y:80,rotate:-2,opacity:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.lab-contact',start:'top 70%',once:true}});
      });
      media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{
        const sequence=gsap.timeline({scrollTrigger:{trigger:'.process-sequence',start:'top top',end:'bottom bottom',scrub:1}});
        sequence.to('.process-track',{xPercent:-66.6667,ease:'none'},0).fromTo('.process-progress i',{scaleX:0},{scaleX:1,ease:'none'},0);
        gsap.utils.toArray('.showcase-chapter').forEach(chapter=>{
          gsap.to(chapter.querySelector('.chapter-progress i'),{scaleY:1,ease:'none',scrollTrigger:{trigger:chapter,start:'top 100px',end:'bottom 80%',scrub:true}});
          gsap.to(chapter.querySelector('.showcase-object'),{yPercent:-8,rotate:-1.5,ease:'none',scrollTrigger:{trigger:chapter,start:'top bottom',end:'bottom top',scrub:1}});
        });
      });
    },root);
    const refresh=()=>ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return()=>{media.revert();context.revert();};
  },[root]);
}
