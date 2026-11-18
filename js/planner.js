App.pages.planner = function () {
  const A = App, S = A.state, days = A.weekDates(A.ui.date), today = A.today();
  const lab = d => A.pd(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  let h = `<div class="card wkbar">
    <button class="btn ghost" data-act="weekShift" data-arg="-7">‹</button>
    <div class="grow">${lab(days[0])} – ${lab(days[6])}</div>
    <button class="btn ghost" data-act="weekShift" data-arg="7">›</button></div>`;

  days.forEach(s => {
    const P = S.plan[s] || {};
    const t = A.SLOTS.reduce((a, sl) => P[sl] ? {c: a.c + P[sl].c, p: a.p + P[sl].p} : a, {c: 0, p: 0});
    const title = A.pd(s).toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'});
    h += `<div class="sec">${title}${s === today ? ' · Today' : ''}</div><div class="card pad">`;
    A.SLOTS.forEach(sl => {
      const sel = P[sl] ? A.RECIPES.findIndex(r => r.n === P[sl].n) : -1;
      h += `<div class="meal"><span>${sl}</span>
        <select data-act="setSlot" data-arg="${s}|${sl}">
          <option value="-1">None</option>
          ${A.RECIPES.map((r, j) => `<option value="${j}" ${j === sel ? 'selected' : ''}>${A.esc(r.n)} · ${r.c} cal</option>`).join('')}
        </select></div>`;
    });
    h += `<div class="foot"><div class="mut">${t.c} cal · ${t.p}g protein</div>
      <button class="btn ghost" data-act="logPlan" data-arg="${s}">Log to calories</button></div></div>`;
  });
  return h;
};

App.actions.weekShift = el => {
  const A = App;
  A.ui.date = A.addDays(A.ui.date, +el.dataset.arg);
  A.render();
};
App.actions.setSlot = el => {
  const A = App, S = A.state, [date, slot] = el.dataset.arg.split('|'), idx = +el.value;
  S.plan[date] = S.plan[date] || {};
  if (idx < 0) delete S.plan[date][slot];
  else {
    const r = A.RECIPES[idx];
    S.plan[date][slot] = {n: r.n, c: r.c, p: r.p};
  }
  A.save();
  A.render();
};
App.actions.logPlan = el => {
  const A = App, S = A.state, date = el.dataset.arg, P = S.plan[date] || {};
  const slots = A.SLOTS.filter(sl => P[sl]);
  if (!slots.length) return A.toast('Plan some meals first');
  S.logs[date] = S.logs[date] || [];
  slots.forEach(sl => S.logs[date].push({n: P[sl].n, c: P[sl].c, p: P[sl].p}));
  A.save();
  A.toast('Logged ' + slots.length + ' meals');
  A.render();
};
