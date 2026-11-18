App.pages.workout = function () {
  const A = App, S = A.state, date = A.ui.date;
  let h = A.strip(A.weekDates(date), false), done = 0, total = 0;
  A.dayKeys(date).forEach(k => {
    h += `<div class="sec">${A.esc(A.PLAN[k].name)}</div><div class="card">`;
    A.PLAN[k].ex.forEach(([name, sets]) => {
      const key = date + '|' + k + '|' + name, on = !!S.done[key];
      total++;
      if (on) done++;
      h += `<div class="row">
        <button class="cb ${on ? 'on' : ''}" data-act="toggle" data-arg="${A.esc(key)}">${on ? '✓' : ''}</button>
        <div class="grow"><div class="name">${A.esc(name)}</div><div class="mut">${A.esc(sets)}</div></div>
      </div>`;
    });
    h += '</div>';
  });
  h += `<div class="mut center">${done} of ${total} done</div>`;
  h += '<button class="ref-btn" data-act="go" data-arg="refs">Workout References</button>';
  return h;
};

App.actions.toggle = el => {
  const S = App.state, k = el.dataset.arg;
  if (S.done[k]) delete S.done[k]; else S.done[k] = 1;
  App.save();
  App.render();
};
