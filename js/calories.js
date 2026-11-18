App.pages.calories = function () {
  const A = App, S = A.state, date = A.ui.date, L = S.logs[date] || [], t = A.totals(date);
  const days = Array.from({length: 45}, (_, i) => A.addDays(A.today(), i - 30));
  let h = A.strip(days, true);
  h += `<div class="card pad"><div class="lbl">${A.esc(A.dayLabel(date))}</div>
    <div class="val">${t.c}<span class="mut"> / ${S.cal} cal</span></div>
    ${A.bar(t.c, S.cal)}
    <div class="mut" style="margin-top:8px">${Math.max(0, S.cal - t.c)} left · ${t.p} / ${S.pro}g protein</div></div>`;
  h += `<div class="sec">Add meal</div><div class="card pad">
    <input id="mn" placeholder="What did you eat?" class="gap">
    <div class="frm">
      <label>Calories<input id="mc" type="number" inputmode="numeric"></label>
      <label>Protein g<input id="mp" type="number" inputmode="numeric"></label>
      <button class="btn full" data-act="addMeal">Add meal</button>
    </div></div>`;
  h += '<div class="sec">Quick add</div><div class="strip">' +
    A.RECIPES.map((r, i) => `<button class="chipbtn" data-act="logRecipe" data-arg="${i}">${A.esc(r.n)}<span>${r.c}</span></button>`).join('') +
    '</div>';
  h += '<div class="sec">Meals</div><div class="card">';
  if (!L.length) h += '<div class="empty">No meals logged for this day.</div>';
  L.forEach((x, i) => h += `<div class="row"><div class="grow"><div class="name">${A.esc(x.n)}</div><div class="mut">${x.p}g protein</div></div>
    <b>${x.c}</b><button class="x" data-act="delMeal" data-arg="${i}">✕</button></div>`);
  return h + '</div>';
};

App.actions.addMeal = () => {
  const A = App, c = +A.val('mc');
  if (!c) return A.toast('Enter calories first');
  A.addLog(A.val('mn').trim() || 'Meal', c, +A.val('mp') || 0);
  A.render();
};
App.actions.delMeal = el => {
  const A = App;
  A.state.logs[A.ui.date].splice(+el.dataset.arg, 1);
  A.save();
  A.render();
};
App.actions.logRecipe = el => {
  const A = App, r = A.RECIPES[+el.dataset.arg];
  A.addLog(r.n, r.c, r.p);
  A.toast('Added ' + r.n);
  A.render();
};
