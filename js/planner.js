App.dayPlan = function (s) {
  const v = App.state.plan[s];
  return Array.isArray(v) ? v : [];
};

App.pages.planner = function () {
  const A = App, days = A.weekDates(A.ui.date), today = A.today(), sel = A.ui.date;
  const lab = d => A.pd(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  const title = A.pd(sel).toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'});

  let h = `<div class="card wkbar">
    <button class="btn ghost" data-act="weekShift" data-arg="-7">‹</button>
    <div class="grow">${lab(days[0])} – ${lab(days[6])}</div>
    <button class="btn ghost" data-act="weekShift" data-arg="7">›</button></div>`;

  h += '<div class="cal">' + days.map((s, i) => {
    const x = A.pd(s);
    const chips = A.dayPlan(s).map(t => `<span>${A.esc(t)}</span>`).join('');
    return `<button class="colday ${s === sel ? 'sel' : ''} ${s === today ? 'today' : ''}" data-act="day" data-arg="${s}">
      <small>${A.DOW[x.getDay()]}</small><b>${x.getDate()}</b><div class="chips">${chips}</div></button>`;
  }).join('') + '</div>';

  h += `<div class="sec">${title}${sel === today ? ' · Today' : ''}</div><div class="card pad">`;
  A.dayPlan(sel).forEach((t, i) => h += `<div class="row">
    <div class="grow name">${A.esc(t)}</div>
    <button class="x" data-act="planDel" data-arg="${sel}|${i}">✕</button></div>`);
  h += `<div class="frm" style="margin-top:${A.dayPlan(sel).length ? 6 : 0}px">
    <input id="pi-${sel}" placeholder="Add meal" style="flex:1;width:auto">
    <button class="btn" data-act="planAdd" data-arg="${sel}">Add</button></div></div>`;
  return h;
};

App.actions.weekShift = el => {
  const A = App;
  A.ui.date = A.addDays(A.ui.date, +el.dataset.arg);
  A.render();
};
App.actions.planAdd = el => {
  const A = App, s = el.dataset.arg, t = A.val('pi-' + s).trim();
  if (!t) return;
  const list = A.dayPlan(s);
  list.push(t);
  A.state.plan[s] = list;
  A.save();
  A.render();
};
App.actions.planDel = el => {
  const A = App, [s, i] = el.dataset.arg.split('|');
  const list = A.dayPlan(s);
  list.splice(+i, 1);
  A.state.plan[s] = list;
  A.save();
  A.render();
};
