'use strict';
(()=>{
 const en=document.documentElement.lang==='en',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const globe=document.getElementById('globe');
 if(globe){
 document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{const active=b.getAttribute('aria-pressed')!=='true';document.querySelectorAll('[data-route]').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed',String(active));globe.dataset.route=active?b.dataset.route:'';}));
 const pause=document.getElementById('globe-pause');pause.addEventListener('click',()=>{const value=pause.getAttribute('aria-pressed')!=='true';pause.setAttribute('aria-pressed',String(value));document.documentElement.classList.toggle('motion-paused',value);pause.textContent=value?(en?'Resume globe':'Включить глобус'):(en?'Pause globe':'Пауза глобуса');});
 }
 // Text remains visible without JS and when reduced motion is requested.
 if(!reduced){
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('text-visible');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
 document.querySelectorAll('main h1,main h2,main .hero-lead,main .subpage-intro p,main .founder-story blockquote').forEach(el=>{if(el.closest('.contact'))return;el.classList.add('text-arrive');io.observe(el);});
 }
 // Flight animation now lives only on the dedicated air freight page.
 if(document.querySelector('.flight-section')&&!document.getElementById('loading-progress')&&window.gsap&&window.ScrollTrigger&&!reduced){gsap.registerPlugin(ScrollTrigger);gsap.fromTo('.plane-wrap',{x:-180,y:35,rotation:-3},{x:240,y:-35,rotation:-8,ease:'none',scrollTrigger:{trigger:'.flight-section',start:'top 90%',end:'bottom 15%',scrub:1}});}
 const form=document.getElementById('estimate-form');if(!form)return;
 const volume=form.elements.volume,weight=form.elements.weight,capacity=document.getElementById('container-capacity'),slider=document.getElementById('volume-slider');
 const boxes=[...document.querySelectorAll('.cargo-boxes span')],summary=document.getElementById('cargo-summary'),percent=document.getElementById('cargo-percent'),meter=document.querySelector('.cargo-meter span'),model=document.querySelector('.cargo-container');
 if(!capacity||!slider)return;
 function update(source){
 const cap=Number(capacity.value);
 if(source===slider)volume.value=slider.value;
 let v=Number(volume.value);if(!Number.isFinite(v)||v<0)v=0;
 slider.max=String(cap);slider.value=String(Math.min(cap,Math.max(.01,v)));
 const fraction=Math.min(1,v/cap),n=Math.ceil(fraction*boxes.length),count=Math.ceil(v/cap);
 boxes.forEach((b,i)=>{b.style.gridRow=String(4-Math.floor(i/8));b.style.gridColumn=String(i%8+1);b.classList.toggle('filled',i<n);b.style.transitionDelay=(document.querySelector('.cargo-model').classList.contains('live-loading')?i*50:(i%8)*18)+'ms';});
 meter.style.width=(fraction*100)+'%';percent.textContent=Math.round(fraction*100)+'%';
 const fmt=x=>x.toLocaleString(en?'en-US':'ru-RU',{maximumFractionDigits:2});
 summary.textContent=fmt(v)+(en?' m³ of ':' м³ из ')+fmt(cap)+(en?' m³':' м³')+(count>1?(en?' · equivalent of ':' · эквивалент ')+count+(en?' units':' ед.'): '');
 model.setAttribute('aria-label',(en?'Container fill ':'Заполнение контейнера ')+Math.round(fraction*100)+'%');
 const density=document.getElementById('cargo-density');if(density)density.textContent=v>0?fmt(Number(weight.value)/v)+(en?' kg/m³':' кг/м³'):'—';
 }
 slider.addEventListener('input',()=>update(slider));volume.addEventListener('input',()=>update(volume));weight.addEventListener('input',()=>update(weight));capacity.addEventListener('change',()=>update(capacity));update(volume);
 form.addEventListener('submit',()=>{if(form.checkValidity()){document.querySelector('.estimate-side').classList.remove('calculated');requestAnimationFrame(()=>document.querySelector('.estimate-side').classList.add('calculated'));}});
})();
(()=>{const model=document.querySelector('.cargo-model');if(!model)return;document.querySelectorAll('[data-cargo-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-cargo-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));model.classList.toggle('live-loading',b.dataset.cargoView==='live');}));})();
(()=>{const replay=document.getElementById('replay-cargo');if(!replay)return;replay.addEventListener('click',()=>{const boxes=[...document.querySelectorAll('.cargo-boxes .filled')];boxes.forEach(b=>{b.style.transitionDelay='0ms';b.classList.remove('filled');});setTimeout(()=>boxes.forEach((b,i)=>{b.style.transitionDelay=i*50+'ms';b.classList.add('filled');}),80);});})();
