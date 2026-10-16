'use strict';
(()=>{
const en=document.documentElement.lang==='en';
const form=document.getElementById('estimate-form'),result=document.getElementById('estimate-result');
if(!form)return;
form.addEventListener('submit',e=>{
e.preventDefault();if(!form.reportValidity())return;
const d=new FormData(form),w=Number(d.get('weight')),v=Number(d.get('volume')),origin=d.get('origin'),dest=d.get('destination'),priority=d.get('priority');
const show=(title,copy)=>{result.replaceChildren();const h=document.createElement('h2'),p=document.createElement('p');h.textContent=title;p.textContent=copy;result.append(h,p);};
if(!Number.isFinite(w)||!Number.isFinite(v)||w<1||w>100000||v<.01||v>500){show(en?'Check the values':'Проверьте параметры',en?'Weight: 1–100,000 kg; volume: 0.01–500 m³.':'Вес: 1–100 000 кг; объём: 0,01–500 м³.');return;}
if(origin===dest){show(en?'Choose different locations':'Выберите разные направления',en?'The origin and destination must be different.':'Пункт отправления и назначения должны отличаться.');return;}
if(d.has('special')){show(en?'An expert review is required':'Нужен индивидуальный расчёт',en?'Dangerous, temperature-sensitive or oversized cargo requires cargo specifications, permits and individual carrier approval. No automatic price is shown.':'Для опасного, температурного или негабаритного груза нужны характеристики, разрешения и индивидуальное согласование. Автоматическую цену не показываем.');return;}
const mode=priority==='fast'?'air':priority==='budget'?'sea':origin==='CN'?'rail':'road';
const rates={air:[166.7,7,55000],road:[250,2.4,35000],rail:[333,1.8,45000],sea:[1000,0.7,65000]};
const [factor,rate,fixed]=rates[mode],charged=Math.max(w,v*factor),routeFactor={CN:1,TR:.8,EU:1.1,AE:1.2,US:1.8}[origin]*(dest==='KZ'?.95:dest==='EU'?1.15:1),estimate=(fixed+charged*rate*100)*routeFactor;
const low=Math.round(estimate*.8/1000)*1000,high=Math.round(estimate*1.25/1000)*1000;
const names=en?{air:'Air',road:'Road',rail:'Rail',sea:'Sea + road / rail'}:{air:'Авиа',road:'Авто',rail:'ЖД',sea:'Море + авто / ЖД'};
show(en?'Illustrative scenario':'Условный сценарий',en?'Demonstration values only. These are invented coefficients, not EVSTRATOV rates or live carrier quotes.':'Только демонстрация. Использованы вымышленные коэффициенты, а не тарифы Евстратова или предложения перевозчиков.');
const price=document.createElement('p');price.className='estimate-price';price.textContent=low.toLocaleString(en?'en-US':'ru-RU')+' – '+high.toLocaleString(en?'en-US':'ru-RU')+' RUB';
const note=document.createElement('p');note.textContent=(en?'Mode: ':'Способ: ')+names[mode]+(en?'. Illustrative chargeable weight: ':'. Условный расчётный вес: ')+Math.ceil(charged)+(en?' kg.':' кг.');
const exclusions=document.createElement('small');exclusions.textContent=en?'Duties, VAT, customs clearance, insurance, special handling and final-mile delivery are excluded. Availability and feasibility have not been checked. No AI model is connected. A specialist must confirm the actual route and price.':'Не включены пошлины, НДС, таможня, страхование, специальные условия и последняя миля. Доступность и реализуемость маршрута не проверены. AI-модель не подключена. Реальную схему и стоимость подтверждает специалист.';
const link=document.createElement('a');link.className='button';link.href='index.html#contact';link.textContent=en?'Request an actual quote':'Запросить настоящий расчёт';result.append(price,note,exclusions,link);
});
})();
