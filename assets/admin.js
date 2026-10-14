'use strict';
(() => {
  const mode=document.getElementById('mode'), period=document.getElementById('period');
  const names={service_open:'Открыли услугу',case_open:'Открыли кейс',contact_click:'Перешли к контакту',draft_ready:'Подготовили черновик',draft_copy:'Скопировали черновик',email_open:'Открыли почтовый черновик'};
  let rows=[];
  const dayKey=date=>{const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const demoDay=i=>({page_view:70+(i*37%111),service_open:15+(i*13%42),case_open:4+(i*7%19),contact_click:9+(i*11%31),draft_ready:2+(i*3%8),draft_copy:1+(i*3%4),email_open:1+(i*5%3)});
  const sum=key=>rows.reduce((n,row)=>n+(row.events[key]||0),0);
  const number=n=>n.toLocaleString('ru-RU');
  const svg=(name,attrs)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
  const draw=()=>{
    const group=document.getElementById('chart-content');group.replaceChildren();
    const max=Math.max(1,...rows.map(x=>x.events.page_view||0)), gap=660/rows.length;
    for(let i=0;i<4;i++){const y=15+i*55;group.append(svg('line',{x1:40,y1:y,x2:710,y2:y,stroke:'#30372b'}));const t=svg('text',{x:0,y:y+4,fill:'#a7a7a7','font-size':10});t.textContent=String(Math.round(max*(1-i/3)));group.append(t);}
    rows.forEach((row,i)=>{const v=row.events.page_view||0,h=165*v/max;group.append(svg('rect',{x:45+i*gap,y:180-h,width:Math.max(4,gap-6),height:h,rx:3,fill:'#abf826'}));if(rows.length===7||i%5===0){const t=svg('text',{x:45+i*gap,y:205,fill:'#a7a7a7','font-size':10});t.textContent=row.day.slice(8)+'.'+row.day.slice(5,7);group.append(t);}});
    document.getElementById('chart-desc').textContent=`${mode.value==='demo'?'Учебные данные':'Только этот браузер'}. Просмотры за ${rows.length} дней: ${sum('page_view')}. Таблица значений расположена ниже.`;
  };
  const render=()=>{
    const local=window.evStats?.read()?.days||{}, length=Number(period.value);
    rows=Array.from({length},(_,i)=>{const day=dayKey(Date.now()-(length-1-i)*86400000);return {day,events:mode.value==='demo'?demoDay(Number(day.slice(-2))+Number(day.slice(5,7))*31):local[day]||{}};});
    document.getElementById('views').textContent=number(sum('page_view'));
    document.getElementById('cards').textContent=number(sum('service_open')+sum('case_open'));
    document.getElementById('contacts').textContent=number(sum('contact_click'));
    document.getElementById('drafts').textContent=number(sum('draft_ready'));
    document.getElementById('data-note').textContent=mode.value==='demo'?'Учебные данные. Это пример интерфейса, а не посещаемость сайта.':`Счётчики только этого браузера. Это не статистика всех посетителей. Сбор тестов ${window.evStats?.enabled()?'разрешён':'выключен'} в настройках.`;
    document.getElementById('date-range').textContent=`${rows[0].day} — ${rows.at(-1).day}`;
    const table=document.getElementById('daily-table');table.replaceChildren();
    rows.forEach(row=>{const tr=document.createElement('tr');for(const v of [row.day,row.events.page_view||0,row.events.draft_ready||0]){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}table.append(tr);});
    const list=document.getElementById('events-list');list.replaceChildren();const max=Math.max(1,...Object.keys(names).map(sum));
    for(const [key,label]of Object.entries(names)){const n=sum(key),row=document.createElement('div');row.className='event-row';const title=document.createElement('div'),text=document.createElement('span'),value=document.createElement('b');text.textContent=label;value.textContent=number(n);title.append(text,value);const bar=document.createElement('div');bar.className='event-bar';bar.setAttribute('aria-hidden','true');const fill=document.createElement('span');fill.style.width=`${n/max*100}%`;bar.append(fill);row.append(title,bar);list.append(row);}
    draw();
  };
  mode.addEventListener('change',render);period.addEventListener('change',render);
  window.addEventListener('ev-consent-change',render);window.addEventListener('storage',render);
  document.getElementById('clear-stats').addEventListener('click',()=>{window.evStats?.clear();mode.value='local';render();document.getElementById('admin-status').textContent='Счётчики этого браузера очищены. Учебный пример остаётся доступен.';});
  document.getElementById('export-stats').addEventListener('click',()=>{
    const label=mode.value==='demo'?'DEMO_NOT_REAL_TRAFFIC':'THIS_BROWSER_ONLY';
    const keys=['page_view',...Object.keys(names)];const csv='\ufeff'+[['source','date',...keys].join(';'),...rows.map(r=>[label,r.day,...keys.map(k=>r.events[k]||0)].join(';'))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`evstratov-${mode.value}-${period.value}days.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('admin-status').textContent='CSV подготовлен. Источник данных обозначен в каждой строке.';
  });render();
})();
