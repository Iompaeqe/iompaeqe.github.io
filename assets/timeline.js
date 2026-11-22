/* Interactive ability timeline. Needs abilities.js (ABILITIES, MODULE_INFO). */
(function(){
  const root = document.getElementById('timeline');
  if(!root || typeof ABILITIES === 'undefined') return;

  const PRE = 22; // % of the track used for the "until Confirm" phase
  const COLORS = {input:'--c-input',precast:'--c-precast',cast:'--c-cast',anim:'--c-anim',vfx:'--c-vfx',
    action:'--c-action',move:'--c-move',group:'--c-group',cost:'--c-cost',cd:'--c-cd',tags:'--c-tags',
    int:'--c-int',chan:'--c-chan',eff:'--c-eff'};
  const el = (tag, cls, txt) => { const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; };

  const tabs = el('div','tl-tabs');
  const box = el('div','tl');
  root.append(tabs, box);

  ABILITIES.forEach((ab,i)=>{
    const b = el('button', i===0?'on':'', ab.name);
    b.type='button';
    b.onclick = ()=>{ [...tabs.children].forEach(x=>x.classList.remove('on')); b.classList.add('on'); render(ab); };
    tabs.append(b);
  });

  function step(span){ return span<=1 ? 0.1 : span<=2 ? 0.25 : span<=4 ? 0.5 : span<=8 ? 1 : 5; }

  function render(ab){
    box.innerHTML='';
    const hasPre = ab.rows.some(r=>r.items.some(it=>(it.a!=null&&it.a<0)||(it.p!=null&&it.p<0)));
    const x = t => t<0 ? PRE*(1+t) : (hasPre?PRE:0) + Math.min(t,ab.span)/ab.span*(hasPre?100-PRE:100);

    /* module list */
    const mods = el('div','tl-mods');
    const modBtns = {};
    const addGroup = (title, prefix, names) => {
      mods.append(el('h4',null,title));
      names.forEach(n=>{
        const key = prefix+':'+n;
        const b = el('button','mod'); b.type='button';
        b.innerHTML = n + (prefix==='B' ? '' : '');
        b.dataset.key = key;
        modBtns[key]=b; mods.append(b);
      });
    };
    addGroup('Action','A',[ab.modules.action]);
    addGroup('Data','D',ab.modules.data);
    addGroup('Control','C',ab.modules.control);
    addGroup('Base class: '+ab.base,'B',['Settings']);

    /* timeline */
    const main = el('div','tl-main');
    const head = el('div','tl-head');
    head.append(el('h3',null,ab.name), el('span','base','Parent class: '+ab.base+' · hover a module or a row'));
    const grid = el('div','tl-grid');

    // ruler
    const ruler = el('div','tl-row tl-ruler'); ruler.append(el('div','lab',''));
    const rt = el('div','track');
    if(hasPre){
      const p = el('div','phase', ab.preLabel||'until Confirm'); p.style.left='0'; p.style.top='2px'; rt.append(p);
      if(ab.preStart){ const ps=el('div','phase',ab.preStart); ps.style.left='0'; rt.append(ps); }
      else { const ps=el('div','phase','Activated'); ps.style.left='0'; rt.append(ps); }
    }
    const s = step(ab.span);
    for(let t=0; t<=ab.span+1e-6; t+=s){
      if(t===0 && hasPre) continue;
      const tk = el('div','tick', (Math.round(t*100)/100)+'s'); tk.style.left=x(t)+'%'; rt.append(tk);
    }
    ab.phases.forEach(([t,label])=>{ const ph=el('div','phase',label); ph.style.left=x(t)+'%'; rt.append(ph); });
    ruler.append(rt); grid.append(ruler);

    // vertical lines
    const lines = el('div'); lines.style.cssText='position:absolute;left:110px;right:0;top:0;bottom:0;pointer-events:none';
    if(hasPre){ const pre=el('div','pre'); pre.style.width=PRE+'%'; lines.append(pre); }
    ab.phases.forEach(([t])=>{ const v=el('div','vline'); v.style.left=x(t)+'%'; lines.append(v); });
    if(ab.end!=null){ const v=el('div','vline end'); v.style.left=x(ab.end)+'%'; v.title='ability ends'; lines.append(v); }
    grid.append(lines);

    const rowEls = [];
    let lastLabel='';
    ab.rows.forEach(r=>{
      if(r.l) lastLabel=r.l; r.full = r.l || lastLabel;
      const row = el('div','tl-row'); row.dataset.m = r.m.join('|');
      row.append(el('div','lab',r.l));
      const tr = el('div','track');
      const col = `var(${COLORS[r.c]||'--c-input'})`;
      r.items.forEach(it=>{
        if(it.p!=null){
          const d=el('div','pt'); d.style.left=x(it.p)+'%'; d.style.background=col; tr.append(d);
          if(it.t){ const l=el('div','pt-lab',it.t); l.style.left=x(it.p)+'%'; tr.append(l); }
        } else {
          const b=el('div','bar'+(it.fade?' fade':'')+(it.b>=99?' open':''), it.t);
          const L=x(it.a), R=it.b>=99?100:x(it.b);
          b.style.left=L+'%'; b.style.width=Math.max(R-L,0.8)+'%'; b.style.background=col; b.title=it.t||r.l;
          tr.append(b);
        }
      });
      row.append(tr); grid.append(row); rowEls.push({row, r});
    });
    main.append(head, grid);

    const info = el('div','tl-info');
    const idle = 'Each row is driven by one or more modules. Hover a module to see which rows it controls, or hover a row to see which modules drive it.';
    info.textContent = idle;
    main.append(info);
    box.append(mods, main);

    /* interaction */
    const clear = ()=>{ grid.classList.remove('dim'); rowEls.forEach(o=>o.row.classList.remove('hl')); Object.values(modBtns).forEach(b=>b.classList.remove('hl')); info.textContent=idle; };
    const name = k => k.slice(2) + (k.startsWith('B') ? ' (base class)' : '');
    Object.entries(modBtns).forEach(([key,b])=>{
      const on = ()=>{ clear(); b.classList.add('hl'); grid.classList.add('dim');
        let n=0; rowEls.forEach(o=>{ if(o.r.m.includes(key)){ o.row.classList.add('hl'); n++; } });
        info.innerHTML = `<b>${name(key)}</b> — ${MODULE_INFO[key]||''}${n?'':' <i>(no rows in this ability)</i>'}`; };
      b.addEventListener('mouseenter',on); b.addEventListener('focus',on); b.addEventListener('click',on);
      b.addEventListener('mouseleave',clear); b.addEventListener('blur',clear);
    });
    rowEls.forEach(({row,r})=>{
      row.addEventListener('mouseenter',()=>{ clear(); row.classList.add('hl'); grid.classList.add('dim');
        r.m.forEach(k=>modBtns[k]&&modBtns[k].classList.add('hl'));
        const label = r.full;
        info.innerHTML = `<b>${label}</b> is driven by ${r.m.map(name).join(', ')}.`; });
      row.addEventListener('mouseleave',clear);
    });
  }
  render(ABILITIES[0]);
})();
