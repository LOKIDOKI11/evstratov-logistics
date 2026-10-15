'use strict';
(() => {
  const CONSENT='ev-consent-v1', STATS='ev-test-stats-v1';
  const duration=180*86400000, retention=30*86400000;
  const allowed=['page_view','service_open','case_open','contact_click','draft_ready','draft_copy','email_open'];
  const read=k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}};
  let choice=read(CONSENT);
  if(!choice||choice.version!==1||!Number.isFinite(choice.at)||Date.now()-choice.at>duration)choice=null;
  const clean=()=>{
    const raw=read(STATS), days={};
    if(raw?.version===1&&raw.days&&typeof raw.days==='object'){
      for(const [day,events] of Object.entries(raw.days)){
        const date=Date.parse(day+'T00:00:00Z');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(date)||Date.now()-date>retention||date>Date.now()+86400000)continue;
        days[day]={};
        for(const key of allowed){const n=events?.[key];if(Number.isSafeInteger(n)&&n>0)days[day][key]=Math.min(n,100000);}
      }
    }
    return {version:1,days};
  };
  const track=event=>{
    if(!choice?.analytics||Date.now()-choice.at>duration||!allowed.includes(event)||location.pathname.includes('admin'))return;
    const data=clean(), day=new Date().toLocaleDateString('en-CA');
    const safeDay=/^\d{4}-\d{2}-\d{2}$/.test(day)?day:new Date().toISOString().slice(0,10);
    data.days[safeDay]??={};data.days[safeDay][event]=(data.days[safeDay][event]||0)+1;
    write(STATS,data);window.dispatchEvent(new Event('ev-stats-change'));
  };
  window.evStats={track,read:clean,enabled:()=>Boolean(choice?.analytics),clear:()=>{try{localStorage.removeItem(STATS);}catch{}}};
  // No external trackers, identifiers, form values or network requests.
  const banner=document.createElement('section');
  banner.className='cookie-banner';banner.hidden=true;banner.setAttribute('role','dialog');banner.setAttribute('aria-labelledby','cookie-title');
  banner.innerHTML='<div><h2 id="cookie-title">Ваш выбор — ваши данные</h2><p>Сохраним настройки в браузере. Тестовая статистика считает действия только на этом устройстве и не отправляет их на сервер. Внешняя аналитика не подключена. <a href="cookies.html">Подробнее</a></p></div><div class="cookie-actions"><button type="button" class="button button-outline" data-choice="necessary">Только необходимые</button><button type="button" class="button" data-choice="analytics">Разрешить тестовую статистику</button></div><p class="cookie-storage" role="status" hidden></p>';
  document.body.append(banner);
  let opener=null;
  const show=focus=>{banner.hidden=false;if(focus)banner.querySelector('button').focus();};
  const hide=()=>{banner.hidden=true;opener?.focus();};
  banner.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
    const analytics=button.dataset.choice==='analytics';
    choice={version:1,at:Date.now(),analytics};
    write(CONSENT,choice);
    if(!analytics)window.evStats.clear();
    hide();if(analytics)track('page_view');
    window.dispatchEvent(new Event('ev-consent-change'));
  }));
  document.querySelectorAll('.cookie-settings').forEach(button=>button.addEventListener('click',()=>{opener=button;show(true);}));
  banner.addEventListener('keydown',e=>{if(e.key==='Escape'&&choice)hide();});
  if(!choice){window.evStats.clear();show(false);}else{track('page_view');if(choice.analytics)write(STATS,clean());else window.evStats.clear();}
  document.addEventListener('click',e=>{
    const target=e.target.closest('a,button');if(!target)return;
    if(target.dataset.detail)track(target.dataset.detail.startsWith('case')?'case_open':'service_open');
    if(target.id==='email-request')track('email_open');
    else if(target.matches('a[href="#contact"],a[href^="tel:"],a[href^="https://t.me/"],a[href^="https://wa.me/"]'))track('contact_click');
  });
})();
