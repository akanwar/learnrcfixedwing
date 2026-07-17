/* learnrcfixedwing design calculator — MIT license */
(function(){
'use strict';
var RHO = 1.225, G = 9.81;

function compute(inp){
  var m = inp.m/1000, W = m*G, b = inp.b/1000;
  var S = b*b/inp.ar;                       // m²
  var c = S/b;                              // mean chord, m
  var wl = (inp.m) / (S*100);               // g/dm²  (S m² -> dm² = *100)
  var Vs = Math.sqrt(2*W/(RHO*S*inp.clmax));
  var Vapp = 1.3*Vs;
  var CL = 2*W/(RHO*inp.v*inp.v*S);
  var Cdi = CL*CL/(Math.PI*inp.ar*inp.e);
  var l = inp.lf*b;                         // tail arm, m
  var Sh = inp.vh*S*c/l, Sv = inp.vv*S*b/l; // m²
  var ARh = 4, ARv = 1.5;
  var bh = Math.sqrt(ARh*Sh), ch = Sh/bh;
  var hv = Math.sqrt(ARv*Sv), cv = Sv/hv;
  var P = inp.pd*m;                         // W
  var cells = P<=280 ? 3 : (P<=600 ? 4 : 6);
  var Vbatt = cells*3.7;
  var I = P/Vbatt;
  var esc = Math.ceil(I*1.35/5)*5;
  var prop = P<150 ? '9×6' : P<260 ? '10×6' : P<420 ? '11×7' : P<650 ? '12×8' : '13×10';
  var ReC = 68000*inp.v*c, ReL = 68000*Vapp*c;
  return {m:m, W:W, b:b, S:S, c:c, wl:wl, Vs:Vs, Vapp:Vapp, CL:CL, Cdi:Cdi, l:l,
          Sh:Sh, Sv:Sv, bh:bh, ch:ch, hv:hv, cv:cv, P:P, cells:cells, I:I, esc:esc,
          prop:prop, ReC:ReC, ReL:ReL,
          ail_c:0.20*c, ail_b:0.45*b/2, elev_c:0.30*ch, rud_c:0.35*cv, cg:0.25*c};
}

function warnings(r, inp){
  var out = [];
  function bad(t){ out.push(['w-bad',t]); } function note(t){ out.push(['w-note',t]); }
  function good(t){ out.push(['w-good',t]); }
  if (r.wl < 20) note('Wing loading ' + r.wl.toFixed(0) + ' g/dm² — a true floater. Dreamy in calm evening air, helpless in any wind. Fly early, fly gentle.');
  else if (r.wl <= 60) good('Wing loading ' + r.wl.toFixed(0) + ' g/dm² — inside the trainer/sport sweet spot. Landings should be unhurried.');
  else if (r.wl <= 80) note('Wing loading ' + r.wl.toFixed(0) + ' g/dm² — sporty. It will land fast and punish hesitation. Add span or shed grams if this is a first build.');
  else bad('Wing loading ' + r.wl.toFixed(0) + ' g/dm² — this lands hot and stalls hard. Add wing area or lose weight before anything else.');
  if (r.Vs > 9) bad('Stall speed ' + r.Vs.toFixed(1) + ' m/s — too fast for a comfortable first flight. Lower the loading or raise Cₗmax (flaps, better section).');
  else if (r.Vs > 7.5) note('Stall speed ' + r.Vs.toFixed(1) + ' m/s — manageable, but keep the maiden approaches long and flat.');
  else good('Stall speed ' + r.Vs.toFixed(1) + ' m/s — plenty of margin at walking-pace landings.');
  if (r.CL > 0.85) bad('Cruise Cₗ = ' + r.CL.toFixed(2) + ' — you are asking the wing to "cruise" nearly at stall. Fly faster or add wing area.');
  else if (r.CL > 0.6) note('Cruise Cₗ = ' + r.CL.toFixed(2) + ' — high. Efficient, but close to the buffet; induced drag is ' + (100*r.Cdi).toFixed(1) + '% of q·S.');
  else if (r.CL < 0.15) note('Cruise Cₗ = ' + r.CL.toFixed(2) + ' — the wing is barely working at this speed. Expect a twitchy, slippery ride; consider less span or more weight... or just enjoy the speed.');
  else good('Cruise Cₗ = ' + r.CL.toFixed(2) + ' — a relaxed operating point. Induced drag coefficient ' + r.Cdi.toFixed(3) + '.');
  if (r.ReC < 1.0e5) bad('Cruise Reynolds ' + (r.ReC/1000).toFixed(0) + 'k — inside the laminar-separation trouble zone. Pick a proven low-Re section (E387, S1223 class) and keep the LE accurate.');
  else if (r.ReC < 1.6e5) note('Cruise Reynolds ' + (r.ReC/1000).toFixed(0) + 'k — low-ish. Full-size airfoil data will flatter you; use UIUC low-speed data.');
  if (inp.ar > 8.5) note('AR ' + inp.ar.toFixed(1) + ' — glider-like efficiency, but the root bending moment grows with span. The spar is now a real engineering problem (chapter 6).');
  if (inp.ar < 5) note('AR ' + inp.ar.toFixed(1) + ' — stubby and tough, at the price of induced drag. Fine for a knock-about park flyer.');
  if (r.b > 1.8) note('Span ' + (r.b*1000).toFixed(0) + ' mm — check it fits the car, the door, and the building board before falling in love.');
  return out;
}

/* ---------- rendering ---------- */
function $(id){ return document.getElementById(id); }
var NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text){
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent.appendChild(e); return e;
}
var C = {navy:'#1d2534', blue:'#2a7de1', green:'#2f8f5b', orange:'#d96f24', red:'#c0392b',
         muted:'#5f687d', wing:'#e8f1fd', tail:'#eaf6ef', ail:'#fde8d2', fus:'#f4f7fc'};

function dim(svg, x1,y1,x2,y2,label,color,side,xoff){
  el('line', {x1:x1,y1:y1,x2:x2,y2:y2, stroke:color, 'stroke-width':1.5,
    'marker-start':'url(#a2)','marker-end':'url(#a1)'}, svg);
  var mx=(x1+x2)/2+(xoff||0), my=(y1+y2)/2;
  var t = el('text', {x:mx, y:my + (side==='below'?16:-7), fill:color, 'font-size':13,
    'font-weight':'bold', 'text-anchor':'middle',
    'paint-order':'stroke', stroke:'#fff', 'stroke-width':4}, svg, label);
  if (x1===x2){ t.setAttribute('x', x1 + (side==='left'?-8:8));
    t.setAttribute('y', my+4); t.setAttribute('text-anchor', side==='left'?'end':'start'); }
}

function drawPlane(r){
  var svg = $('threeview'); svg.innerHTML='';
  var defs = el('defs', {}, svg);
  ['a1','a2'].forEach(function(id,i){
    var mk = el('marker', {id:id, viewBox:'0 0 10 10', refX:i?1:9, refY:5,
      markerWidth:7, markerHeight:7, orient:'auto-start-reverse'}, defs);
    el('path', {d:'M0,0 L10,5 L0,10 z', fill:'currentColor'}, mk);
    mk.style.color = 'inherit';
  });
  var Wpx=760, Hpx=740, cx=390;
  var span=r.b*1000, chord=r.c*1000, arm=r.l*1000, bh=r.bh*1000, ch=r.ch*1000;
  var noseLen = 0.22*span < 180 ? 0.22*span : 180;
  var totalLen = noseLen + chord + arm + ch*0.6;
  var s = Math.min(500/span, 420/totalLen);
  var noseY=70, wleY=noseY+noseLen*s, wteY=wleY+chord*s;
  var tleY=wleY+0.25*chord*s+arm*s-0.25*ch*s, tteY=tleY+ch*s, tailEnd=tteY+6;
  // fuselage
  el('path', {d:'M'+(cx-7)+','+(noseY+12)+' L'+cx+','+noseY+' L'+(cx+7)+','+(noseY+12)+
     ' L'+(cx+9)+','+tailEnd+' L'+(cx-9)+','+tailEnd+' Z', fill:C.fus, stroke:C.navy,'stroke-width':2}, svg);
  el('line', {x1:cx-46,y1:noseY,x2:cx+46,y2:noseY, stroke:C.muted,'stroke-width':2.5}, svg);
  el('text', {x:cx+56,y:noseY+4, fill:C.muted,'font-size':12,'font-style':'italic'}, svg, 'prop');
  // wing + ailerons
  el('rect', {x:cx-span*s/2, y:wleY, width:span*s, height:chord*s, fill:C.wing, stroke:C.blue,'stroke-width':2}, svg);
  var ailB=r.ail_b*1000, ailC=r.ail_c*1000;
  [[-1],[1]].forEach(function(sg){
    var x0 = cx + sg[0]*span*s/2, xi = cx + sg[0]*(span/2-ailB)*s;
    el('rect', {x:Math.min(x0,xi), y:wteY-ailC*s, width:Math.abs(x0-xi), height:ailC*s,
      fill:C.ail, stroke:C.orange,'stroke-width':1.5}, svg);
  });
  // tail + elevator + fin sliver
  el('rect', {x:cx-bh*s/2, y:tleY, width:bh*s, height:ch*s, fill:C.tail, stroke:C.green,'stroke-width':2}, svg);
  el('rect', {x:cx-bh*s/2, y:tteY-r.elev_c*1000*s, width:bh*s, height:r.elev_c*1000*s,
    fill:'#d5ecdd', stroke:C.green,'stroke-width':1.5}, svg);
  var yf0=wteY+0.25*(tleY-wteY);
  el('path', {d:'M'+(cx-2)+','+yf0+' L'+(cx+2)+','+yf0+' L'+(cx+4)+','+tailEnd+' L'+(cx-4)+','+tailEnd+' Z',
    fill:C.tail, stroke:C.green,'stroke-width':1.5}, svg);
  // CG
  var cgY = wleY + 0.25*chord*s;
  el('circle', {cx:cx, cy:cgY, r:7, fill:C.red}, svg);
  el('text', {x:cx+14, y:cgY+4, fill:C.red,'font-size':13,'font-weight':'bold'}, svg,
    'CG — '+(r.cg*1000).toFixed(0)+' mm aft of LE');
  // dimensions
  var dg1 = el('g', {color:C.blue}, svg);
  dim(dg1, cx-span*s/2, wleY-24, cx+span*s/2, wleY-24, 'span '+span.toFixed(0), C.blue, null, -80);
  var dg2 = el('g', {color:C.blue}, svg);
  dim(dg2, cx+span*s/2+26, wleY, cx+span*s/2+26, wteY, 'chord '+chord.toFixed(0), C.blue, 'right');
  var dg3 = el('g', {color:C.green}, svg);
  dim(dg3, cx-span*s/2-30, cgY, cx-span*s/2-30, tleY+0.25*ch*s, 'tail arm '+arm.toFixed(0), C.green, 'left');
  var dg4 = el('g', {color:C.green}, svg);
  dim(dg4, cx-bh*s/2, tailEnd+20, cx+bh*s/2, tailEnd+20, 'tail span '+bh.toFixed(0), C.green, 'below');
  el('text', {x:cx+bh*s/2+12, y:tleY+ch*s/2+4, fill:C.muted,'font-size':11.5}, svg,
    'elevator '+(r.elev_c*1000).toFixed(0)+' mm');
  el('text', {x:cx+span*s/2-ailB*s, y:wteY+16, fill:C.muted,'font-size':11.5}, svg,
    'aileron '+(r.ail_c*1000).toFixed(0)+' × '+ailB.toFixed(0));

  // ---- side + front views ----
  var secTop=572, yb=secTop+95;
  el('line', {x1:30,y1:secTop-14,x2:730,y2:secTop-14, stroke:'#e2e8f2','stroke-width':1.5}, svg);
  el('line', {x1:390,y1:secTop,x2:390,y2:secTop+160, stroke:'#e2e8f2','stroke-width':1.5}, svg);
  el('text', {x:40,y:secTop+10, fill:C.muted,'font-size':11,'font-weight':'bold','letter-spacing':1}, svg, 'SIDE VIEW');
  el('text', {x:412,y:secTop+10, fill:C.muted,'font-size':11,'font-weight':'bold','letter-spacing':1}, svg, 'FRONT VIEW');
  // side view: true length proportions
  var hv=r.hv*1000, cv=r.cv*1000;
  var s2=Math.min(300/totalLen, 70/hv);
  var xn=50, xt=xn+totalLen*s2;
  el('path', {d:'M'+xn+','+(yb-10)+' L'+xt+','+(yb-7)+' L'+xt+','+(yb+5)+
     ' L'+(xn+0.2*totalLen*s2)+','+(yb+11)+' L'+xn+','+(yb+7)+' Z',
     fill:C.fus, stroke:C.navy,'stroke-width':2}, svg);
  el('line', {x1:xn-8,y1:yb-26,x2:xn-8,y2:yb+26, stroke:C.muted,'stroke-width':2.5}, svg);
  var xw0=xn+noseLen*s2, xw1=xw0+chord*s2, xwm=(xw0+xw1)/2;
  el('path', {d:'M'+xw0+','+(yb-8)+' Q'+xwm+','+(yb-10-Math.max(14,0.16*chord*s2))+' '+(xw1-6)+','+(yb-9)+
     ' Q'+xwm+','+(yb-1)+' '+xw0+','+(yb-8)+' Z', fill:C.wing, stroke:C.blue,'stroke-width':2}, svg);
  el('rect', {x:xt-ch*s2, y:yb-12, width:ch*s2, height:5, fill:C.tail, stroke:C.green,'stroke-width':1.5}, svg);
  el('path', {d:'M'+(xt-1.55*cv*s2)+','+(yb-12)+' L'+(xt-0.95*cv*s2)+','+(yb-12-hv*s2)+
     ' L'+(xt-0.3*cv*s2)+','+(yb-12-hv*s2)+' L'+(xt-0.05*cv*s2)+','+(yb-12)+' Z',
     fill:C.tail, stroke:C.green,'stroke-width':2}, svg);
  el('circle', {cx:xw0+0.25*chord*s2, cy:yb-5, r:5, fill:C.red}, svg);
  var dg5 = el('g', {color:C.green}, svg);
  dim(dg5, xt+14, yb-12-hv*s2, xt+14, yb-12, '', C.green);
  el('text', {x:xt-0.8*cv*s2, y:yb+30, fill:C.green,'font-size':11.5,'font-weight':'bold','text-anchor':'middle'}, svg,
    'fin '+hv.toFixed(0)+' tall × '+cv.toFixed(0));
  // front view: dihedral exaggerated ~2.5x for clarity
  var xcf=570, s3=300/span, hs=span*s3/2, rise=Math.tan(3*Math.PI/180)*(span/2)*s3*2.5;
  var tipmm=(Math.tan(3*Math.PI/180)*span/2).toFixed(0);
  el('path', {d:'M'+(xcf-12)+','+(yb-3)+' L'+(xcf-hs)+','+(yb-3-rise)+' L'+(xcf-hs)+','+(yb+3-rise)+
     ' L'+(xcf-12)+','+(yb+3)+' Z', fill:C.wing, stroke:C.blue,'stroke-width':1.8}, svg);
  el('path', {d:'M'+(xcf+12)+','+(yb-3)+' L'+(xcf+hs)+','+(yb-3-rise)+' L'+(xcf+hs)+','+(yb+3-rise)+
     ' L'+(xcf+12)+','+(yb+3)+' Z', fill:C.wing, stroke:C.blue,'stroke-width':1.8}, svg);
  el('path', {d:'M'+(xcf-4)+','+(yb-13)+' L'+xcf+','+(yb-13-Math.max(24,hv*s3))+' L'+(xcf+4)+','+(yb-13)+' Z',
     fill:C.tail, stroke:C.green,'stroke-width':2}, svg);
  el('circle', {cx:xcf, cy:yb, r:12, fill:C.fus, stroke:C.navy,'stroke-width':2.5}, svg);
  el('text', {x:xcf, y:yb+44, fill:C.muted,'font-size':11,'font-style':'italic','text-anchor':'middle'}, svg,
    'dihedral ≈ 3° — tips ≈'+tipmm+' mm above roots (exaggerated here)');
}

function drawCurve(r, inp){
  var svg=$('curve'); svg.innerHTML='';
  var x0=70,x1=720,y0=250,y1=30;
  function X(wl){ return x0+(wl-10)/(95-10)*(x1-x0); }
  function Y(v){ return y0-(v-2)/(14-2)*(y0-y1); }
  el('rect',{x:X(25),y:y1,width:X(60)-X(25),height:y0-y1,fill:'#eef7f1'},svg);
  el('text',{x:(X(25)+X(60))/2,y:y1+16,fill:'#2f8f5b','font-size':11,'text-anchor':'middle'},svg,'trainer territory');
  el('line',{x1:x0,y1:y0,x2:x1+14,y2:y0,stroke:'#1d2534','stroke-width':1.5},svg);
  el('line',{x1:x0,y1:y0,x2:x0,y2:y1-8,stroke:'#1d2534','stroke-width':1.5},svg);
  for(var wl=20; wl<=90; wl+=20){ el('text',{x:X(wl),y:y0+18,fill:'#5f687d','font-size':11,'text-anchor':'middle'},svg,wl); }
  for(var v=4; v<=12; v+=4){ el('text',{x:x0-8,y:Y(v)+4,fill:'#5f687d','font-size':11,'text-anchor':'end'},svg,v);
    el('line',{x1:x0,y1:Y(v),x2:x1,y2:Y(v),stroke:'#e2e8f2'},svg); }
  el('text',{x:(x0+x1)/2,y:y0+36,fill:'#1d2534','font-size':12,'text-anchor':'middle'},svg,'wing loading, g/dm²');
  el('text',{x:x0-46,y:(y0+y1)/2,fill:'#1d2534','font-size':12,transform:'rotate(-90 '+(x0-46)+' '+((y0+y1)/2)+')','text-anchor':'middle'},svg,'stall speed, m/s');
  var d='';
  for(var w=12; w<=92; w+=2){
    var vs=Math.sqrt(2*(w*0.1*9.81)/(1.225*inp.clmax));
    d += (d?' L':'M')+X(w)+','+Y(vs);
  }
  el('path',{d:d,fill:'none',stroke:'#2a7de1','stroke-width':2.5},svg);
  el('circle',{cx:X(r.wl),cy:Y(r.Vs),r:8,fill:'#c0392b',stroke:'#fff','stroke-width':2},svg);
  el('text',{x:X(r.wl)+12,y:Y(r.Vs)-8,fill:'#c0392b','font-size':12,'font-weight':'bold'},svg,'your design');
}

function num(l,v,u){ return '<div class="num"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="u">'+u+'</div></div>'; }

function render(){
  var inp = {
    m:+$('in_m').value, v:+$('in_v').value, b:+$('in_b').value, ar:+$('in_ar').value,
    clmax:+$('in_clmax').value, lf:+$('in_lf').value, vh:+$('in_vh').value,
    vv:+$('in_vv').value, pd:+$('in_pd').value, e:+$('in_e').value };
  $('v_m').textContent=inp.m; $('v_v').textContent=inp.v; $('v_b').textContent=inp.b;
  $('v_ar').textContent=inp.ar.toFixed(1); $('v_clmax').textContent=inp.clmax.toFixed(2);
  $('v_lf').textContent=inp.lf.toFixed(2); $('v_vh').textContent=inp.vh.toFixed(2);
  $('v_vv').textContent=inp.vv.toFixed(3); $('v_pd').textContent=inp.pd; $('v_e').textContent=inp.e.toFixed(2);
  var r = compute(inp);
  drawPlane(r); drawCurve(r, inp);
  $('numbers').innerHTML =
    num('Wing area', (r.S*100).toFixed(1), 'dm² ('+r.S.toFixed(3)+' m²)') +
    num('Wing loading', r.wl.toFixed(1), 'g/dm²') +
    num('Mean chord', (r.c*1000).toFixed(0), 'mm') +
    num('Stall / approach', r.Vs.toFixed(1)+' / '+r.Vapp.toFixed(1), 'm/s') +
    num('Cruise Cₗ', r.CL.toFixed(2), 'Cₗmax '+inp.clmax.toFixed(2)) +
    num('Induced drag C_D,i', r.Cdi.toFixed(4), 'at cruise Cₗ') +
    num('Tail arm', (r.l*1000).toFixed(0), 'mm, CG → tail ¼-chord') +
    num('H-tail', (r.Sh*1e4).toFixed(0)+' cm²', (r.bh*1000).toFixed(0)+' × '+(r.ch*1000).toFixed(0)+' mm') +
    num('Fin + rudder', (r.Sv*1e4).toFixed(0)+' cm²', (r.hv*1000).toFixed(0)+' tall × '+(r.cv*1000).toFixed(0)+' mm') +
    num('Ailerons', (r.ail_c*1000).toFixed(0)+' × '+(r.ail_b*1000).toFixed(0), 'mm each, outer half-span') +
    num('Elevator / rudder', (r.elev_c*1000).toFixed(0)+' / '+(r.rud_c*1000).toFixed(0), 'mm chord') +
    num('Power', r.P.toFixed(0)+' W', inp.pd+' W/kg') +
    num('Battery / ESC', r.cells+'S · '+r.esc+' A ESC', '≈'+r.I.toFixed(1)+' A at full throttle') +
    num('Prop class', r.prop, 'verify with a wattmeter') +
    num('Reynolds', (r.ReC/1000).toFixed(0)+'k / '+(r.ReL/1000).toFixed(0)+'k', 'cruise / approach') +
    num('Maiden CG', (r.cg*1000).toFixed(0)+' mm', 'aft of LE (25% chord)');
  $('warnings').innerHTML = warnings(r, inp).map(function(w){
    return '<div class="warnbox '+w[0]+'">'+w[1]+'</div>'; }).join('');
}

['in_m','in_v','in_b','in_ar','in_clmax','in_lf','in_vh','in_vv','in_pd','in_e']
  .forEach(function(id){ $(id).addEventListener('input', render); });
document.querySelectorAll('.presets button').forEach(function(btn){
  btn.addEventListener('click', function(){
    var p = btn.dataset.p.split(',');
    $('in_m').value=p[0]; $('in_v').value=p[1]; $('in_b').value=p[2]; render();
  });
});
render();
if (typeof module !== 'undefined') module.exports = {compute:compute};
})();
