'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню'); };
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.header')) closeMenu(); });
  matchMedia('(min-width: 851px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible'); observer.unobserve(e.target);
  }), { threshold: .08 });
  if (!reduced) document.querySelectorAll('.reveal').forEach(el => { el.classList.add('ready'); observer.observe(el); });
  const counterObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el=e.target, target=Number(el.dataset.count), decimals=Number(el.dataset.decimals||0);
    counterObserver.unobserve(el);
    if (reduced) return;
    const start=performance.now();
    const tick=now=>{const p=Math.min(1,(now-start)/1000);el.textContent=(target*(1-Math.pow(1-p,3))).toLocaleString('ru-RU',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});if(p<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick);
  }),{threshold:.9});
  document.querySelectorAll('[data-count]').forEach(el=>counterObserver.observe(el));

  if(document.getElementById('loading-progress')){
  let loadingTimeline=null, loadingScroll=null, flightScroll=null, flightTween=null;
  let paused=reduced;
  const pauseButton=document.querySelector('.motion-toggle');
  const progress=document.getElementById('loading-progress');
  const loadingLabel=document.getElementById('loading-label');
  const labels=['Подготовка к погрузке','Подъём груза','Перемещение на платформу','Фиксация груза','Груз в пути'];
  const setMotionUI=()=>{
    root.classList.toggle('motion-paused',paused);
    pauseButton.setAttribute('aria-pressed',String(paused));
    pauseButton.querySelector('.motion-label').textContent=paused?'Включить анимации':'Пауза анимаций';
    pauseButton.querySelector('.motion-icon').innerHTML=paused?'<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7z"/></svg>':'<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14"/></svg>';
    if(!paused){loadingTimeline?.progress(loadingScroll?.progress||0);flightTween?.progress(flightScroll?.progress||0);}
  };
  if(window.gsap){
    loadingTimeline=gsap.timeline({paused:true,onUpdate(){const p=this.progress();progress.value=String(Math.round(p*100));loadingLabel.textContent=labels[Math.min(4,Math.floor(p*5))];}});
    loadingTimeline.fromTo('#spreader',{y:-480},{y:0,duration:1,ease:'none'})
      .to(['#spreader','#box'],{y:-155,duration:1,ease:'power1.inOut'})
      .to(['#spreader','#box'],{x:600,duration:1.6,ease:'power1.inOut'})
      .to(['#spreader','#box'],{y:56,duration:1,ease:'power1.inOut'})
      .to('#spreader',{y:-480,duration:1,ease:'power1.in'})
      .to(['#truck','#box'],{x:'+=1150',duration:2.4,ease:'power2.in'},'-=.3')
      .to('.wheel',{rotation:2160,transformOrigin:'50% 50%',duration:2.4,ease:'power2.in'},'<');
    if(window.ScrollTrigger&&!reduced){
      gsap.registerPlugin(ScrollTrigger);
      root.classList.add('scroll-scenes');
      const pinTop=()=>document.querySelector('.header').offsetHeight+12;
      loadingScroll=ScrollTrigger.create({trigger:'.loading-section',start:()=>`top ${pinTop()}px`,end:()=>`+=${innerHeight*.75}`,pin:true,invalidateOnRefresh:true,onUpdate:self=>{if(!paused)loadingTimeline.progress(self.progress);}});
      if(document.querySelector('.flight-section')){
      flightTween=gsap.fromTo('.plane-wrap',{x:()=>-innerWidth*.45,y:65,rotation:-3},{x:()=>innerWidth*.62,y:-75,rotation:-9,ease:'none',paused:true});
      flightScroll=ScrollTrigger.create({trigger:'.flight-section',start:()=>`top ${pinTop()}px`,end:()=>`+=${innerHeight*.55}`,pin:true,invalidateOnRefresh:true,onRefresh:()=>flightTween.invalidate(),onUpdate:self=>{if(!paused)flightTween.progress(self.progress);}});
      }
      document.fonts.ready.then(()=>ScrollTrigger.refresh());
      window.addEventListener('load',()=>ScrollTrigger.refresh());
    }else{loadingTimeline.progress(.68);}
  }else{loadingLabel.textContent='Схема погрузки';progress.disabled=true;document.getElementById('replay').disabled=true;}
  pauseButton.addEventListener('click',()=>{paused=!paused;setMotionUI();});
  setMotionUI();
  document.getElementById('replay').addEventListener('click',()=>{
    if(!loadingTimeline)return;
    paused=false;setMotionUI();
    if(loadingScroll)window.scrollTo({top:loadingScroll.start,behavior:'smooth'});
    else loadingTimeline.progress(0).play();
  });
  progress.addEventListener('input',()=>{
    if(!loadingTimeline)return;
    const p=Number(progress.value)/100;
    paused=false;setMotionUI();
    if(loadingScroll)window.scrollTo({top:loadingScroll.start+p*(loadingScroll.end-loadingScroll.start),behavior:'instant'});
    loadingTimeline.progress(p).pause();
  });

  }
  const details=JSON.parse(document.getElementById('detail-data').textContent);
  const detailDialog=document.getElementById('detail-dialog');
  const requestDialog=document.getElementById('request-dialog');
  let activeTopic='';
  document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
    const data=details.find(x=>x.id===button.dataset.detail);if(!data)return;
    activeTopic=data.title;
    document.getElementById('detail-kicker').textContent=data.code?`${data.code} / ${data.eta}`:data.lead;
    document.getElementById('detail-title').textContent=data.title;
    document.getElementById('detail-copy').textContent=data.detail;
    detailDialog.showModal();
  }));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  });
  function setTopic(topic){const message=document.getElementById('message');if(message&&!message.value)message.value=`Интересует: ${topic}.\nМаршрут: \nГруз, вес или объём: \nЖелаемый срок: `;}
  document.getElementById('detail-contact').addEventListener('click',()=>{setTopic(activeTopic);detailDialog.close();});
  document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>setTopic(a.dataset.topic)));
  const requestForm=document.getElementById('request-form');
  if(requestForm){
  const formError=document.getElementById('form-error');
  const validateField=field=>{
    const value=field.value.trim();let error='';
    if(field.name==='name'&&(value.length<2||value.length>80))error='Укажите имя: от 2 до 80 символов.';
    if(field.name==='reply'){
      const telegram=/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value);
      const digits=value.replace(/\D/g,'');
      const phone=/^\+?[0-9 ()-]+$/.test(value)&&digits.length>=10&&digits.length<=15;
      if(!telegram&&!phone)error='Укажите телефон с кодом страны или Telegram в формате @username (5–32 символа).';
    }
    if(field.name==='message'&&(value.length<10||value.length>2000))error='Опишите груз и маршрут: от 10 до 2000 символов.';
    field.setCustomValidity(error);return !error;
  };
  requestForm.querySelectorAll('input:not([type="checkbox"]),textarea').forEach(field=>{
    field.addEventListener('input',()=>{field.setCustomValidity('');formError.hidden=true;});
    field.addEventListener('blur',()=>validateField(field));
  });
  requestForm.addEventListener('invalid',e=>{formError.textContent=e.target.id==='data-consent'?'Отметьте отдельное согласие, если хотите подготовить обращение.':e.target.validationMessage;formError.hidden=false;},true);
  document.getElementById('request-form').addEventListener('submit',e=>{
    e.preventDefault();const form=e.currentTarget;
    [...form.querySelectorAll('input:not([type="checkbox"]),textarea')].forEach(validateField);
    if(!form.reportValidity())return;
    const name=form.elements.name.value.trim(),reply=form.elements.reply.value.trim(),msg=form.elements.message.value.trim();
    if(!name||!reply||!msg){return;}
    formError.hidden=true;
    const body=`Здравствуйте, Сергей!\n\nХочу обсудить перевозку.\n\nИмя: ${name}\nКонтакт: ${reply}\n\n${msg}\n\nЗаявка подготовлена на демонстрационном сайте Евстратова.\n\nДаю согласие ИП Евстратову Сергею Сергеевичу на обработку данных для ответа на обращение по отдельному документу: ${location.origin}/evstratov-logistics/consent.html (редакция 12.10.2026).`;
    document.getElementById('request-preview').value=body;
    document.getElementById('email-request').href=`mailto:evstratovcargo@gmail.com?subject=${encodeURIComponent('Расчёт международной доставки')}&body=${encodeURIComponent(body)}`;
    document.getElementById('request-status').textContent='Кнопка email откроет почтовое приложение. Заявка пока не отправлена.';
    document.getElementById('copy-request').textContent='Скопировать текст';
    window.evStats?.track('draft_ready');
    requestDialog.showModal();
  });
  document.getElementById('copy-request').addEventListener('click',async()=>{
    const field=document.getElementById('request-preview');const status=document.getElementById('request-status');
    try{await navigator.clipboard.writeText(field.value);window.evStats?.track('draft_copy');status.textContent='Текст скопирован. Вставьте его в Telegram или WhatsApp и отправьте Сергею.';document.getElementById('copy-request').textContent='Скопировано';}
    catch{field.focus();field.select();status.textContent='Выделили текст заявки. Скопируйте его сочетанием Ctrl+C или ⌘C.';}
  });
  }
})();
