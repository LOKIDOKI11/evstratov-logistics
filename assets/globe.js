(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ГЛОБУС ---------- */
  var cv = document.getElementById('globe'); if(!cv)return; var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var W, H, R, CX, CY, pts = [], land = null;
  function size() {
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var mob = W < 700;
    R = Math.min(W * 0.43, H * 0.43);
    CX = W * 0.5; CY = H * 0.5;
  }
  function fib(n) {
    var a = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) { var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i;
      a.push([Math.asin(y) * 180 / Math.PI, Math.atan2(Math.sin(t) * r, Math.cos(t) * r) * 180 / Math.PI]); }
    return a;
  }
  var all = fib(9000);
  function buildLand(geo) {
    var c = document.createElement('canvas'); c.width = 720; c.height = 360; var x = c.getContext('2d');
    x.fillStyle = '#000';
    geo.features.forEach(function (f) {
      var polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      polys.forEach(function (p) { x.beginPath(); p[0].forEach(function (q, i) { var px = (q[0] + 180) * 2, py = (90 - q[1]) * 2; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.fill(); });
    });
    var d = x.getImageData(0, 0, 720, 360).data;
    pts = all.filter(function (p) { var px = Math.floor((p[1] + 180) * 2) % 720, py = Math.min(359, Math.floor((90 - p[0]) * 2)); return d[(py * 720 + px) * 4 + 3] > 0; }).map(function (p) { return v3(p[0], p[1]); });
    land = true;
  }
  pts = all.filter(function (_, i) { return i % 3 === 0; }).map(function (p) { return v3(p[0], p[1]); });
  function loadLand() { if (!window.topojson) return;
    fetch(document.documentElement.lang==='en'?'../assets/land.json':'assets/land.json').then(function (r) { return r.json(); })
      .then(function (t) { setTimeout(function () { buildLand(topojson.feature(t, t.objects.land)); }, 50); }).catch(function () {});
  }
  window.addEventListener('load', function () { setTimeout(loadLand, 600); });
  // Only published case routes; country coordinates are illustrative, not claimed hubs.
  var CITIES={msk:[55.75,37.62,'МОСКВА'],szx:[22.54,114.06,'ШЭНЬЧЖЭНЬ'],ist:[41.01,28.98,'СТАМБУЛ'],waw:[52.23,21.01,'ВАРШАВА'],de:[51.16,10.45,'ГЕРМАНИЯ'],kz:[48.02,66.92,'КАЗАХСТАН'],uae:[24.45,54.37,'ОАЭ']};
  var ARCS=[['szx','waw'],['ist','msk'],['de','kz']];
  var rotLon = 65, rotLat = 38, t0 = performance.now();
  function v3(lat, lon) { var la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]; }
  function proj(v) {
    var lo = -rotLon * Math.PI / 180 + Math.PI / 2, la = rotLat * Math.PI / 180;
    var x = v[0] * Math.cos(lo) - v[2] * Math.sin(lo), z = v[0] * Math.sin(lo) + v[2] * Math.cos(lo), y = v[1];
    var y2 = y * Math.cos(la) - z * Math.sin(la), z2 = y * Math.sin(la) + z * Math.cos(la);
    return [CX + x * R, CY - y2 * R, z2];
  }
  function slerp(a, b, t) {
    var d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), s = Math.sin(d);
    var k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s, h = 1 + Math.sin(Math.PI * t) * 0.18;
    return [(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h];
  }
  function draw(now) {
    var t = (now - t0) / 1000;
    rotLon = 64 + Math.sin(t * 0.08) * 16;
    ctx.clearRect(0, 0, W, H);
    // свечение края
    var g = ctx.createRadialGradient(CX, CY, R * 0.86, CX, CY, R * 1.25);
    g.addColorStop(0, 'rgba(171,248,38,0)'); g.addColorStop(0.12, 'rgba(171,248,38,.12)'); g.addColorStop(0.2, 'rgba(171,248,38,.06)'); g.addColorStop(1, 'rgba(5,5,7,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R * 1.25, 0, 7); ctx.fill();
    var core = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.4, R * 0.1, CX, CY, R);
    core.addColorStop(0, '#1a2117'); core.addColorStop(1, '#080b08');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(171,248,38,.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke();
    // точки суши
    for (var i = 0; i < pts.length; i++) {
      var p = proj(pts[i]); if (p[2] < 0) continue;
      ctx.fillStyle = 'rgba(200,212,189,' + (0.15 + p[2] * 0.75) + ')';
      ctx.fillRect(p[0], p[1], 1.6, 1.6);
    }
    // дуги
    ARCS.forEach(function (a, k) {
      var A = v3(CITIES[a[0]][0], CITIES[a[0]][1]), B = v3(CITIES[a[1]][0], CITIES[a[1]][1]);
      var ph = ((t * 0.25 + k * 0.17) % 1.4);
      ctx.lineWidth = cv.dataset.route===a.join('-') ? 2.7 : 1.6;
      for (var s = 0; s < 60; s++) {
        var u = s / 60, p1 = proj(slerp(A, B, u)), p2 = proj(slerp(A, B, u + 1 / 60));
        if (p1[2] < -0.1) continue;
        var lit = Math.max(0, 1 - Math.abs(u - ph + 0.2) * 5);
        ctx.strokeStyle = 'rgba(171,248,38,' + ((cv.dataset.route&&cv.dataset.route!==a.join('-')?.1:.35) + lit * .65) + ')';
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      }
    });
    // города
    if(document.documentElement.lang==='en'){CITIES.msk[2]='MOSCOW';CITIES.szx[2]='SHENZHEN';CITIES.ist[2]='ISTANBUL';CITIES.waw[2]='WARSAW';CITIES.de[2]='GERMANY';CITIES.kz[2]='KAZAKHSTAN';}
    ctx.font = '600 10px JetBrains Mono, monospace';
    var labelRects=[];
    ['szx','msk','ist','de','waw','kz'].forEach(function (c) {
      var p = proj(v3(CITIES[c][0], CITIES[c][1])); if (p[2] < 0.05) return;
      ctx.fillStyle = '#abf826'; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(171,248,38,.4)'; ctx.beginPath(); ctx.arc(p[0], p[1], 7 + Math.sin(t * 3) * 2, 0, 7); ctx.stroke();
      var w=ctx.measureText(CITIES[c][2]).width+12, options=[[10,-9],[-w-10,-9],[10,15],[-w-10,15],[10,-33]], label=null;
      options.some(function(o){var r=[p[0]+o[0],p[1]+o[1],w,18];if(r[0]<2||r[1]<2||r[0]+w>W-2||r[1]+18>H-2)return false;if(labelRects.some(function(q){return r[0]<q[0]+q[2]+4&&r[0]+r[2]+4>q[0]&&r[1]<q[1]+q[3]+4&&r[1]+r[3]+4>q[1];}))return false;label=r;return true;});
      if(!label)return;labelRects.push(label);
      ctx.fillStyle='rgba(5,5,7,.85)';ctx.fillRect(label[0],label[1],w,18);
      ctx.strokeStyle='rgba(255,255,255,.25)';ctx.strokeRect(label[0],label[1],w,18);
      ctx.fillStyle='#f3f3f1';ctx.fillText(CITIES[c][2],label[0]+6,label[1]+13);
    });
  }
  var visible = true, last = 0;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
  function loop(now) { if (visible && !document.hidden && !document.documentElement.classList.contains('motion-paused') && now - last > 33) { last = now; draw(now); } requestAnimationFrame(loop); }
  size(); window.addEventListener('resize', size); draw(performance.now()); if (!reduce) requestAnimationFrame(loop);


})();